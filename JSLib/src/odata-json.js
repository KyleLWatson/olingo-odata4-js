﻿// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation 
// files (the "Software"), to deal  in the Software without restriction, including without limitation the rights  to use, copy,
// modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the 
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// odata-json.js

(function (window, undefined) {

    var datajs = window.odatajs || {};
    var odata = window.odatajs.oData || {};

    // Imports 

    var defined = odatajs.defined;
    var extend = odatajs.extend;
    var isArray = odatajs.isArray;
    var isDate = odatajs.isDate;
    var normalizeURI = odatajs.normalizeURI;
    var parseInt10 = odatajs.parseInt10;

    var contentType = odata.contentType;
    var jsonLightReadPayload = odata.jsonLightReadPayload;
    var formatDateTimeOffset = odata.formatDateTimeOffset;
    var formatDuration = odata.formatDuration;
    var formatJsonLight = odata.formatJsonLight;
    var formatNumberWidth = odata.formatNumberWidth;
    var getCanonicalTimezone = odata.getCanonicalTimezone;
    var handler = odata.handler;
    var isComplex = odata.isComplex;
    var lookupComplexType = odata.lookupComplexType;
    var lookupEntityType = odata.lookupEntityType;
    var MAX_DATA_SERVICE_VERSION = odata.MAX_DATA_SERVICE_VERSION;
    var maxVersion = odata.maxVersion;
    var parseDateTime = odata.parseDateTime;
    var parseDuration = odata.parseDuration;
    var parseTimezone = odata.parseTimezone;
    var payloadTypeOf = odata.payloadTypeOf;
    var traverse = odata.traverse;
    var formatJsonLightRequestPayload = odata.formatJsonLightRequestPayload;

    // CONTENT START

    var jsonMediaType = "application/json";
    var jsonContentType = contentType(jsonMediaType);

    var jsonReadAdvertisedActionsOrFunctions = function (value) {
        /// <summary>Reads and object containing action or function metadata and maps them into a single array of objects.</summary>
        /// <param name="value" type="Object">Object containing action or function metadata.</param>
        /// <returns type="Array">Array of objects containing metadata for the actions or functions specified in value.</returns>

        var result = [];
        for (var name in value) {
            var i, len;
            for (i = 0, len = value[name].length; i < len; i++) {
                result.push(extend({ metadata: name }, value[name][i]));
            }
        }
        return result;
    };

    var jsonApplyMetadata = function (value, metadata, dateParser, recognizeDates) {
        /// <summary>Applies metadata coming from both the payload and the metadata object to the value.</summary>
        /// <param name="value" type="Object">Data on which the metada is going to be applied.</param>
        /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
        /// <param name="dateParser" type="function">Function used for parsing datetime values.</param>
        /// <param name="recognizeDates" type="Boolean">
        ///     True if strings formatted as datetime values should be treated as datetime values. False otherwise.
        /// </param>
        /// <returns type="Object">Transformed data.</returns>

        if (value && typeof value === "object") {
            var dataTypeName;
            var valueMetadata = value.__metadata;

            if (valueMetadata) {
                if (valueMetadata.actions) {
                    valueMetadata.actions = jsonReadAdvertisedActionsOrFunctions(valueMetadata.actions);
                }
                if (valueMetadata.functions) {
                    valueMetadata.functions = jsonReadAdvertisedActionsOrFunctions(valueMetadata.functions);
                }
                dataTypeName = valueMetadata && valueMetadata.type;
            }

            var dataType = lookupEntityType(dataTypeName, metadata) || lookupComplexType(dataTypeName, metadata);
            var propertyValue;
            if (dataType) {
                var properties = dataType.property;
                if (properties) {
                    var i, len;
                    for (i = 0, len = properties.length; i < len; i++) {
                        var property = properties[i];
                        var propertyName = property.name;
                        propertyValue = value[propertyName];

                        if (property.type === "Edm.DateTime" || property.type === "Edm.DateTimeOffset") {
                            if (propertyValue) {
                                propertyValue = dateParser(propertyValue);
                                if (!propertyValue) {
                                    throw { message: "Invalid date/time value" };
                                }
                                value[propertyName] = propertyValue;
                            }
                        } else if (property.type === "Edm.Time") {
                            value[propertyName] = parseDuration(propertyValue);
                        }
                    }
                }
            } else if (recognizeDates) {
                for (var name in value) {
                    propertyValue = value[name];
                    if (typeof propertyValue === "string") {
                        value[name] = dateParser(propertyValue) || propertyValue;
                    }
                }
            }
        }
        return value;
    };

    var isJsonLight = function (contentType) {
        /// <summary>Tests where the content type indicates a json light payload.</summary>
        /// <param name="contentType">Object with media type and properties dictionary.</param>
        /// <returns type="Boolean">True is the content type indicates a json light payload. False otherwise.</returns>

        if (contentType) {
            var odata = contentType.properties["odata.metadata"];
            return odata === "none" || odata === "minimal" || odata === "full";
        }

        return false;
    };

    var normalizeServiceDocument = function (data, baseURI) {
        /// <summary>Normalizes a JSON service document to look like an ATOM service document.</summary>
        /// <param name="data" type="Object">Object representation of service documents as deserialized.</param>
        /// <param name="baseURI" type="String">Base URI to resolve relative URIs.</param>
        /// <returns type="Object">An object representation of the service document.</returns>
        var workspace = { collections: [] };

        var i, len;
        for (i = 0, len = data.EntitySets.length; i < len; i++) {
            var title = data.EntitySets[i];
            var collection = {
                title: title,
                href: normalizeURI(title, baseURI)
            };

            workspace.collections.push(collection);
        }

        return { workspaces: [workspace] };
    };

    // The regular expression corresponds to something like this:
    // /Date(123+60)/
    //
    // This first number is date ticks, the + may be a - and is optional,
    // with the second number indicating a timezone offset in minutes.
    //
    // On the wire, the leading and trailing forward slashes are
    // escaped without being required to so the chance of collisions is reduced;
    // however, by the time we see the objects, the characters already
    // look like regular forward slashes.
    var jsonDateRE = /^\/Date\((-?\d+)(\+|-)?(\d+)?\)\/$/;

    var minutesToOffset = function (minutes) {
        /// <summary>Formats the given minutes into (+/-)hh:mm format.</summary>
        /// <param name="minutes" type="Number">Number of minutes to format.</param>
        /// <returns type="String">The minutes in (+/-)hh:mm format.</returns>

        var sign;
        if (minutes < 0) {
            sign = "-";
            minutes = -minutes;
        } else {
            sign = "+";
        }

        var hours = Math.floor(minutes / 60);
        minutes = minutes - (60 * hours);

        return sign + formatNumberWidth(hours, 2) + ":" + formatNumberWidth(minutes, 2);
    };

    var parseJsonDateString = function (value) {
        /// <summary>Parses the JSON Date representation into a Date object.</summary>
        /// <param name="value" type="String">String value.</param>
        /// <returns type="Date">A Date object if the value matches one; falsy otherwise.</returns>

        var arr = value && jsonDateRE.exec(value);
        if (arr) {
            // 0 - complete results; 1 - ticks; 2 - sign; 3 - minutes
            var result = new Date(parseInt10(arr[1]));
            if (arr[2]) {
                var mins = parseInt10(arr[3]);
                if (arr[2] === "-") {
                    mins = -mins;
                }

                // The offset is reversed to get back the UTC date, which is
                // what the API will eventually have.
                var current = result.getUTCMinutes();
                result.setUTCMinutes(current - mins);
                result.__edmType = "Edm.DateTimeOffset";
                result.__offset = minutesToOffset(mins);
            }
            if (!isNaN(result.valueOf())) {
                return result;
            }
        }

        // Allow undefined to be returned.
    };

    // Some JSON implementations cannot produce the character sequence \/
    // which is needed to format DateTime and DateTimeOffset into the
    // JSON string representation defined by the OData protocol.
    // See the history of this file for a candidate implementation of
    // a 'formatJsonDateString' function.

    var jsonParser = function (handler, text, context) {
        /// <summary>Parses a JSON OData payload.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text">Payload text (this parser also handles pre-parsed objects).</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>An object representation of the OData payload.</returns>

        var dataServiceVersion = context.dataServiceVersion;
        var json = (typeof text === "string") ? window.JSON.parse(text) : text;

        if ((maxVersion("4.0", dataServiceVersion) === dataServiceVersion)) {
            return json;
        }

        return undefined;
    };

    var jsonToString = function (data) {
        /// <summary>Converts the data into a JSON string.</summary>
        /// <param name="data">Data to serialize.</param>
        /// <returns type="String">The JSON string representation of data.</returns>

        var result; // = undefined;
        // Save the current date.toJSON function
        var dateToJSON = Date.prototype.toJSON;
        try {
            // Set our own date.toJSON function
            Date.prototype.toJSON = function () {
                return formatDateTimeOffset(this);
            };
            result = window.JSON.stringify(data, jsonReplacer);
        } finally {
            // Restore the original toJSON function
            Date.prototype.toJSON = dateToJSON;
        }
        return result;
    };

    var jsonSerializer = function (handler, data, context) {
        /// <summary>Serializes the data by returning its string representation.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="data">Data to serialize.</param>
        /// <param name="context" type="Object">Object with serialization context.</param>
        /// <returns type="String">The string representation of data.</returns>

        var dataServiceVersion = context.dataServiceVersion || "4.0";
        var cType = context.contentType = context.contentType || jsonContentType;

        if (cType && cType.mediaType === jsonContentType.mediaType) {
            context.dataServiceVersion = maxVersion(dataServiceVersion, "4.0");
            var newdata = formatJsonLightRequestPayload(data);
            if (newdata) {
                return window.JSON.stringify(newdata);
            }
        }

        return undefined;
    };

    var jsonReplacer = function (_, value) {
        /// <summary>JSON replacer function for converting a value to its JSON representation.</summary>
        /// <param value type="Object">Value to convert.</param>
        /// <returns type="String">JSON representation of the input value.</returns>
        /// <remarks>
        ///   This method is used during JSON serialization and invoked only by the JSON.stringify function.
        ///   It should never be called directly.
        /// </remarks>

        if (value && value.__edmType === "Edm.Time") {
            return formatDuration(value);
        } else {
            return value;
        }
    };

    var jsonNormalizeData = function (data, baseURI) {
        /// <summary>
        /// Normalizes the specified data into an intermediate representation.
        /// like the latest supported version.
        /// </summary>
        /// <param name="data" optional="false">Data to update.</param>
        /// <param name="baseURI" optional="false">URI to use as the base for normalizing references.</param>

        var isSvcDoc = isComplex(data) && !data.__metadata && isArray(data.EntitySets);
        return isSvcDoc ? normalizeServiceDocument(data, baseURI) : data;
    };

    var jsonHandler = handler(jsonParser, jsonSerializer, jsonMediaType, MAX_DATA_SERVICE_VERSION);
    jsonHandler.recognizeDates = false;

    odata.jsonHandler = jsonHandler;



    // DATAJS INTERNAL START
    odata.jsonParser = jsonParser;
    odata.jsonSerializer = jsonSerializer;
    odata.jsonNormalizeData = jsonNormalizeData;
    odata.normalizeServiceDocument = normalizeServiceDocument;
    odata.parseJsonDateString = parseJsonDateString;
    // DATAJS INTERNAL END

    // CONTENT END
})(this);





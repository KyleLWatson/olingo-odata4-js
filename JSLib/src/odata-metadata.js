// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.
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

// odata-metadata.js

(function (window, undefined) {

    var datajs = window.odatajs || {};
    var odata = window.OData || {};

    // imports 

    var contains = odatajs.contains;
    var normalizeURI = odatajs.normalizeURI;
    var xmlAttributes = odatajs.xmlAttributes;
    var xmlChildElements = odatajs.xmlChildElements;
    var xmlFirstChildElement = odatajs.xmlFirstChildElement;
    var xmlInnerText = odatajs.xmlInnerText;
    var xmlLocalName = odatajs.xmlLocalName;
    var xmlNamespaceURI = odatajs.xmlNamespaceURI;
    var xmlNS = odatajs.xmlNS;
    var xmlnsNS = odatajs.xmlnsNS;
    var xmlParse = odatajs.xmlParse;

    var edmxNs = odata.edmxNs;
    var edmNs1 = odata.edmNs1;
    var handler = odata.handler;
    var MAX_DATA_SERVICE_VERSION = odata.MAX_DATA_SERVICE_VERSION;
    var odataMetaXmlNs = odata.odataMetaXmlNs;


    var xmlMediaType = "application/xml";

    // CONTENT START

    var schemaElement = function (attributes, elements, text, ns) {
        /// <summary>Creates an object that describes an element in an schema.</summary>
        /// <param name="attributes" type="Array">List containing the names of the attributes allowed for this element.</param>
        /// <param name="elements" type="Array">List containing the names of the child elements allowed for this element.</param>
        /// <param name="text" type="Boolean">Flag indicating if the element's text value is of interest or not.</param>
        /// <param name="ns" type="String">Namespace to which the element belongs to.</param>
        /// <remarks>
        ///    If a child element name ends with * then it is understood by the schema that that child element can appear 0 or more times.
        /// </remarks>
        /// <returns type="Object">Object with attributes, elements, text, and ns fields.</returns>

        return {
            attributes: attributes,
            elements: elements,
            text: text || false,
            ns: ns
        };
    };

    // It's assumed that all elements may have Documentation children and Annotation elements.
    // See http://docs.oasis-open.org/odata/odata/v4.0/cs01/part3-csdl/odata-v4.0-cs01-part3-csdl.html for a CSDL reference.
    var schema = {
        elements: {
            Action: schemaElement(
            /*attributes*/["Name", "IsBound", "EntitySetPath"],
            /*elements*/["ReturnType", "Parameter*", "Annotation*"]
            ),
            ActionImport: schemaElement(
            /*attributes*/["Name", "Action", "EntitySet", "Annotation*"]
            ),
            Annotation: schemaElement(
            /*attributes*/["Term", "Qualifier", "Binary", "Bool", "Date", "DateTimeOffset", "Decimal", "Duration", "EnumMember", "Float", "Guid", "Int", "String", "TimeOfDay", "AnnotationPath", "NavigationPropertyPath", "Path", "PropertyPath", "UrlRef"],
            /*elements*/["Binary*", "Bool*", "Date*", "DateTimeOffset*", "Decimal*", "Duration*", "EnumMember*", "Float*", "Guid*", "Int*", "String*", "TimeOfDay*", "And*", "Or*", "Not*", "Eq*", "Ne*", "Gt*", "Ge*", "Lt*", "Le*", "AnnotationPath*", "Apply*", "Cast*", "Collection*", "If*", "IsOf*", "LabeledElement*", "LabeledElementReference*", "Null*", "NavigationPropertyPath*", "Path*", "PropertyPath*", "Record*", "UrlRef*", "Annotation*"]
            ),
            AnnotationPath: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Annotations: schemaElement(
            /*attributes*/["Target", "Qualifier"],
            /*elements*/["Annotation*"]
            ),
            Apply: schemaElement(
            /*attributes*/["Function"],
            /*elements*/["String*", "Path*", "LabeledElement*", "Annotation*"]
            ),
            And: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Or: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Not: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Eq: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Ne: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Gt: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Ge: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Lt: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Le: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Binary: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Bool: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Cast: schemaElement(
            /*attributes*/["Type"],
            /*elements*/["Path*", "Annotation*"]
            ),
            Collection: schemaElement(
            /*attributes*/null,
            /*elements*/["Binary*", "Bool*", "Date*", "DateTimeOffset*", "Decimal*", "Duration*", "EnumMember*", "Float*", "Guid*", "Int*", "String*", "TimeOfDay*", "And*", "Or*", "Not*", "Eq*", "Ne*", "Gt*", "Ge*", "Lt*", "Le*", "AnnotationPath*", "Apply*", "Cast*", "Collection*", "If*", "IsOf*", "LabeledElement*", "LabeledElementReference*", "Null*", "NavigationPropertyPath*", "Path*", "PropertyPath*", "Record*", "UrlRef*"]
            ),
            ComplexType: schemaElement(
            /*attributes*/["Name", "BaseType", "Abstract", "OpenType"],
            /*elements*/["Property*", "NavigationProperty*", "Annotation*"]
            ),
            Date: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            DateTimeOffset: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Decimal: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Duration: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            EntityContainer: schemaElement(
            /*attributes*/["Name", "Extends"],
            /*elements*/["EntitySet*", "Singleton*", "ActionImport*", "FunctionImport*", "Annotation*"]
            ),
            EntitySet: schemaElement(
            /*attributes*/["Name", "EntityType", "IncludeInServiceDocument"],
            /*elements*/["NavigationPropertyBinding*", "Annotation*"]
            ),
            EntityType: schemaElement(
            /*attributes*/["Name", "BaseType", "Abstract", "OpenType", "HasStream"],
            /*elements*/["Key*", "Property*", "NavigationProperty*", "Annotation*"]
            ),
            EnumMember: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            EnumType: schemaElement(
            /*attributes*/["Name", "UnderlyingType", "IsFlags"],
            /*elements*/["Member*"]
            ),
            Float: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Function: schemaElement(
            /*attributes*/["Name", "IsBound", "IsComposable", "EntitySetPath"],
            /*elements*/["ReturnType", "Parameter*", "Annotation*"]
            ),
            FunctionImport: schemaElement(
            /*attributes*/["Name", "Function", "EntitySet", "IncludeInServiceDocument", "Annotation*"]
            ),
            Guid: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            If: schemaElement(
            /*attributes*/null,
            /*elements*/["Path*", "String*", "Annotation*"]
            ),
            Int: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            IsOf: schemaElement(
            /*attributes*/["Type", "MaxLength", "Precision", "Scale", "Unicode", "SRID", "DefaultValue", "Annotation*"],
            /*elements*/["Path*"]
            ),
            Key: schemaElement(
            /*attributes*/null,
            /*elements*/["PropertyRef*"]
            ),
            LabeledElement: schemaElement(
            /*attributes*/["Name"],
            /*elements*/["Binary*", "Bool*", "Date*", "DateTimeOffset*", "Decimal*", "Duration*", "EnumMember*", "Float*", "Guid*", "Int*", "String*", "TimeOfDay*", "And*", "Or*", "Not*", "Eq*", "Ne*", "Gt*", "Ge*", "Lt*", "Le*", "AnnotationPath*", "Apply*", "Cast*", "Collection*", "If*", "IsOf*", "LabeledElement*", "LabeledElementReference*", "Null*", "NavigationPropertyPath*", "Path*", "PropertyPath*", "Record*", "UrlRef*", "Annotation*"]
            ),
            LabeledElementReference: schemaElement(
            /*attributes*/["Term"],
            /*elements*/["Binary*", "Bool*", "Date*", "DateTimeOffset*", "Decimal*", "Duration*", "EnumMember*", "Float*", "Guid*", "Int*", "String*", "TimeOfDay*", "And*", "Or*", "Not*", "Eq*", "Ne*", "Gt*", "Ge*", "Lt*", "Le*", "AnnotationPath*", "Apply*", "Cast*", "Collection*", "If*", "IsOf*", "LabeledElement*", "LabeledElementReference*", "Null*", "NavigationPropertyPath*", "Path*", "PropertyPath*", "Record*", "UrlRef*"]
            ),
            Member: schemaElement(
            /*attributes*/["Name", "Value"],
            /*element*/["Annotation*"]
            ),
            NavigationProperty: schemaElement(
            /*attributes*/["Name", "Type", "Nullable", "Partner", "ContainsTarget"],
            /*elements*/["ReferentialConstraint*", "OnDelete*", "Annotation*"]
            ),
            NavigationPropertyBinding: schemaElement(
            /*attributes*/["Path", "Target"]
            ),
            NavigationPropertyPath: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Null: schemaElement(
            /*attributes*/null,
            /*elements*/["Annotation*"]
            ),
            OnDelete: schemaElement(
            /*attributes*/["Action"],
            /*elements*/["Annotation*"]
            ),
            Path: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Parameter: schemaElement(
            /*attributes*/["Name", "Type", "Nullable", "MaxLength", "Precision", "Scale", "SRID"],
            /*elements*/["Annotation*"]
            ),
            Property: schemaElement(
            /*attributes*/["Name", "Type", "Nullable", "MaxLength", "Precision", "Scale", "Unicode", "SRID", "DefaultValue"],
            /*elements*/["Annotation*"]
            ),
            PropertyPath: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            PropertyRef: schemaElement(
            /*attributes*/["Name", "Alias"]
            ),
            PropertyValue: schemaElement(
            /*attributes*/["Property", "Path"],
            /*elements*/["Binary*", "Bool*", "Date*", "DateTimeOffset*", "Decimal*", "Duration*", "EnumMember*", "Float*", "Guid*", "Int*", "String*", "TimeOfDay*", "And*", "Or*", "Not*", "Eq*", "Ne*", "Gt*", "Ge*", "Lt*", "Le*", "AnnotationPath*", "Apply*", "Cast*", "Collection*", "If*", "IsOf*", "LabeledElement*", "LabeledElementReference*", "Null*", "NavigationPropertyPath*", "Path*", "PropertyPath*", "Record*", "UrlRef*", "Annotation*"]
            ),
            Record: schemaElement(
            /*attributes*/null,
            /*Elements*/["PropertyValue*", "Property*", "Annotation*"]
            ),
            ReferentialConstraint: schemaElement(
            /*attributes*/["Property", "ReferencedProperty", "Annotation*"]
            ),
            ReturnType: schemaElement(
            /*attributes*/["Type", "Nullable", "MaxLength", "Precision", "Scale", "SRID"]
            ),
            String: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            Schema: schemaElement(
            /*attributes*/["Namespace", "Alias"],
            /*elements*/["Action*", "Annotations*", "Annotation*", "ComplexType*", "EntityContainer", "EntityType*", "EnumType*", "Function*", "Term*", "TypeDefinition*", "Annotation*"]
            ),
            Singleton: schemaElement(
            /*attributes*/["Name", "Type"],
            /*elements*/["NavigationPropertyBinding*", "Annotation*"]
            ),
            Term: schemaElement(
            /*attributes*/["Name", "Type", "BaseTerm", "DefaultValue ", "AppliesTo", "Nullable", "MaxLength", "Precision", "Scale", "SRID"],
            /*elements*/["Annotation*"]
            ),
            TimeOfDay: schemaElement(
            /*attributes*/null,
            /*elements*/null,
            /*text*/true
            ),
            TypeDefinition: schemaElement(
            /*attributes*/["Name", "UnderlyingType", "MaxLength", "Unicode", "Precision", "Scale", "SRID"],
            /*elements*/["Annotation*"]
            ),
            UrlRef: schemaElement(
            /*attributes*/null,
            /*elements*/["Binary*", "Bool*", "Date*", "DateTimeOffset*", "Decimal*", "Duration*", "EnumMember*", "Float*", "Guid*", "Int*", "String*", "TimeOfDay*", "And*", "Or*", "Not*", "Eq*", "Ne*", "Gt*", "Ge*", "Lt*", "Le*", "AnnotationPath*", "Apply*", "Cast*", "Collection*", "If*", "IsOf*", "LabeledElement*", "LabeledElementReference*", "Null*", "NavigationPropertyPath*", "Path*", "PropertyPath*", "Record*", "UrlRef*", "Annotation*"]
            ),

            // See http://msdn.microsoft.com/en-us/library/dd541238(v=prot.10) for an EDMX reference.
            Edmx: schemaElement(
            /*attributes*/["Version"],
            /*elements*/["DataServices", "Reference*"],
            /*text*/false,
            /*ns*/edmxNs
            ),
            DataServices: schemaElement(
            /*attributes*/["m:MaxDataServiceVersion", "m:DataServiceVersion"],
            /*elements*/["Schema*"],
            /*text*/false,
            /*ns*/edmxNs
            ),
            Reference: schemaElement(
            /*attributes*/["Uri"],
            /*elements*/["Include*", "IncludeAnnotations*", "Annotation*"]
            ),
            Include: schemaElement(
            /*attributes*/["Namespace", "Alias"]
            ),
            IncludeAnnotations: schemaElement(
            /*attributes*/["TermNamespace", "Qualifier", "TargetNamespace"]
            )
        }
    };

    var scriptCase = function (text) {
        /// <summary>Converts a Pascal-case identifier into a camel-case identifier.</summary>
        /// <param name="text" type="String">Text to convert.</param>
        /// <returns type="String">Converted text.</returns>
        /// <remarks>If the text starts with multiple uppercase characters, it is left as-is.</remarks>

        if (!text) {
            return text;
        }

        if (text.length > 1) {
            var firstTwo = text.substr(0, 2);
            if (firstTwo === firstTwo.toUpperCase()) {
                return text;
            }

            return text.charAt(0).toLowerCase() + text.substr(1);
        }

        return text.charAt(0).toLowerCase();
    };

    var getChildSchema = function (parentSchema, candidateName) {
        /// <summary>Gets the schema node for the specified element.</summary>
        /// <param name="parentSchema" type="Object">Schema of the parent XML node of 'element'.</param>
        /// <param name="candidateName">XML element name to consider.</param>
        /// <returns type="Object">The schema that describes the specified element; null if not found.</returns>

        var elements = parentSchema.elements;
        if (!elements) {
            return null;
        }

        var i, len;
        for (i = 0, len = elements.length; i < len; i++) {
            var elementName = elements[i];
            var multipleElements = false;
            if (elementName.charAt(elementName.length - 1) === "*") {
                multipleElements = true;
                elementName = elementName.substr(0, elementName.length - 1);
            }

            if (candidateName === elementName) {
                var propertyName = scriptCase(elementName);
                return { isArray: multipleElements, propertyName: propertyName };
            }
        }

        return null;
    };

    var isEdmNamespace = function (nsUri) {
        /// <summary>Checks whether the specifies namespace URI is one of the known CSDL namespace URIs.</summary>
        /// <param name="nsUri" type="String">Namespace URI to check.</param>
        /// <returns type="Boolean">true if nsURI is a known CSDL namespace; false otherwise.</returns>

        return nsUri === edmNs1;
    };

    var parseConceptualModelElement = function (element) {
        /// <summary>Parses a CSDL document.</summary>
        /// <param name="element">DOM element to parse.</param>
        /// <returns type="Object">An object describing the parsed element.</returns>

        var localName = xmlLocalName(element);
        var nsURI = xmlNamespaceURI(element);
        var elementSchema = schema.elements[localName];
        if (!elementSchema) {
            return null;
        }

        if (elementSchema.ns) {
            if (nsURI !== elementSchema.ns) {
                return null;
            }
        } else if (!isEdmNamespace(nsURI)) {
            return null;
        }

        var item = {};
        var attributes = elementSchema.attributes || [];
        xmlAttributes(element, function (attribute) {

            var localName = xmlLocalName(attribute);
            var nsURI = xmlNamespaceURI(attribute);
            var value = attribute.value;

            // Don't do anything with xmlns attributes.
            if (nsURI === xmlnsNS) {
                return;
            }

            // Currently, only m: for metadata is supported as a prefix in the internal schema table,
            // un-prefixed element names imply one a CSDL element.
            var schemaName = null;
            var handled = false;
            if (isEdmNamespace(nsURI) || nsURI === null) {
                schemaName = "";
            } else if (nsURI === odataMetaXmlNs) {
                schemaName = "m:";
            }

            if (schemaName !== null) {
                schemaName += localName;

                if (contains(attributes, schemaName)) {
                    item[scriptCase(localName)] = value;
                }
            }
        });

        xmlChildElements(element, function (child) {
            var localName = xmlLocalName(child);
            var childSchema = getChildSchema(elementSchema, localName);
            if (childSchema) {
                if (childSchema.isArray) {
                    var arr = item[childSchema.propertyName];
                    if (!arr) {
                        arr = [];
                        item[childSchema.propertyName] = arr;
                    }
                    arr.push(parseConceptualModelElement(child));
                } else {
                    item[childSchema.propertyName] = parseConceptualModelElement(child);
                }
            }
        });

        if (elementSchema.text) {
            item.text = xmlInnerText(element);
        }

        return item;
    };

    var metadataParser = function (handler, text) {
        /// <summary>Parses a metadata document.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text" type="String">Metadata text.</param>
        /// <returns>An object representation of the conceptual model.</returns>

        var doc = xmlParse(text);
        var root = xmlFirstChildElement(doc);
        return parseConceptualModelElement(root) || undefined;
    };

    odata.metadataHandler = handler(metadataParser, null, xmlMediaType, MAX_DATA_SERVICE_VERSION);

    // DATAJS INTERNAL START
    odata.schema = schema;
    odata.scriptCase = scriptCase;
    odata.getChildSchema = getChildSchema;
    odata.parseConceptualModelElement = parseConceptualModelElement;
    odata.metadataParser = metadataParser;
    // DATAJS INTERNAL END

    // CONTENT END
})(this);
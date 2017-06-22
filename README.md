[![Build Status](https://travis-ci.org/advanced-rest-client/raml-json-enhance.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/raml-json-enhance)  

# raml-json-enhance

The `<raml-json-enhance>` enhaces the JSON output from the RAML parser so it can
be used in the ARC elements (which expects enhanced data structure).

The work is asynchronous. After the `json` property is set/changed it will call the
worker automatically and report the result via the `raml-json-enhance-ready` event.

Polymer application can bind to the `result` property which will notify the change.

### Example
```
<raml-json-enhance json="{...}"></raml-json-enhance>
window.addEventListener('raml-json-enhance-ready', function(e) {
  console.log(e.detail.json);
  // equals to
  console.log(e.target.result);
});
```

*Note** This element MUST be used to enhance parser JSON output in order to use
any RAML related ARC element. Enhancer creates common data structure and
expands RAML types. Element expects the JSON object to contain complete data
about method / endpoint / type / security scheme and so on. It will not look for
the data in the root of raml definition. Thanks to this, you can push just a part
of the JSON object to a specific element to make it work.

For example, the `<raml-docs-method-viewer>` viewer expects the `raml` propety to
be a method definition only (without of the rest of the RAML structure). If
enhanced with the library, the JSON object describing the method will contain
all required information to render the view.

The element contains a set of Polyfills so it will work in IE11+ browsers.

### Biuld process
This element uses web workers to expand JSON result (normalize it).
The element will attempty to load following scitps from the same location where
this script resides:
- polyfills.js
- browser/index.js
- raml2object.js
Build scripts should ensure that this resources are included in the final build.

## Affected properties
- `types`, `traits`, `resourceTypes`, `annotationTypes`, `securitySchemes` - Becomes an object instead of array, keys are object name (with library variable name if applicable)
- `responses`, `body`, `queryParameters`, `headers`, `properties`, `baseUriParameters`, `annotations`, `uriParameters` are recusively transformed into the arrays
- types/{object} - Expanded form for a RAML type and a canonical form with computed inheritance and pushed unions to the top level of the type structure. See documantaion for the [expansion library](https://github.com/raml-org/raml-parser-toolbelt/tree/master/tools/datatype-expansion).
- resource/parentUrl - a full URL of the parent resource
- resource/allUriParameters - list of all URI parameters that apply to this resource (computed from the root down to current resource)
- resource/securedBy - Replaces security schema name with schema's definition.
- method/allUriParameters - The same as for a resource but applied to a method that is direct child of the resource.
- method/absoluteUri - Full, absolute URL to the method containg URI parametes in their RAML's form, eg `/{fileId}`
- method/securedBy - The same as for the resource
- method/*/headers - Full list of all possible headers compured from traits, security schemes etc
- method/*/queryParameters - Full list of all possible queryParameters compured from traits, security schemes etc
- method/responses - Full list of all possible response compured from traits, security schemes etc
- type/properties/items - replaces type name with type definition
- */example(s) - always produces `examples` as an array of example contents
- */structuredExample - content is moved to the *.example array

## Developing this element

Unlike other web components this component has to be build. Make any
changes to the `raml-json-enhance-template.html`. After making a change call
`npm run build`. It will concatenate all required files
and insert generated web worker contentnt into the element's body.

The `raml-json-enhance.html` will be regenerated each time you call build
script.


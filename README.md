# httpyac-plugin-jq

A [HttpYac plugin](https://httpyac.github.io) to easily apply [jq](https://stedolan.github.io/jq/) commands to the response output. Based on [node-jq](https://github.com/sanack/node-jq).

[![build](https://github.com/rngtng/httpyac-plugin-jq/actions/workflows/main.yml/badge.svg)](https://github.com/rngtng/httpyac-plugin-jq/actions/workflows/main.yml)

## Installation

```
npm install httpyac-plugin-jq --save
```

## Usage

Plugin adds support for JSON response processing with jq on the returned payload. This is usefull when e.g. explorative testing an API, but only focus on certain attributes. It's enabled via meta data instruction `# @jq <command>`. See [jq](https://stedolan.github.io/jq/) and [node-jq](https://github.com/sanack/node-jq) what commands can be applied.

If response doesn't have content-type `application/json` set, the meta data instruction will be ignored.

If jq command fails, the response stays untouched and a warning is shown.

### Example

Following example filters the json response to show just `title` attribute of each object in `slideshow.slides` array list:

```
# @name example
# @jq .slideshow.slides | map({title})
GET https://httpbin.org/json

```

Results in:


```json
[
  {
    "title": "Wake up to WonderWidgets!"
  },
  {
    "title": "Overview"
  }
]
```

### Note

The result is for display only and doesn't alter the actual response body value. So in any following requests
access to the response data remains as usual (for the given example above):

```
...

### next request
# @ref example
GET https://httpbin.org/anything?author={example.slideshow.author}

```


## TODO

- [ ] use https://github.com/FGRibreau/jq.node instead?

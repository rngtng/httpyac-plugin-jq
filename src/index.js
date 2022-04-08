module.exports = (api) => {
  api.hooks.responseLogging.addHook("applyJqCommand", async (response, context) => {
    const jq = require("node-jq"),
      options = {
        input: 'json',
        output: 'json'
      },
      filter = context.httpRegion.metaData.jq;

    if (filter && api.utils.getHeader(response.headers, "Content-Type") == 'application/json') {
      await jq.run(filter, response.parsedBody, options).then((output) => {
        if (api.sessionStore.sessionChangedListener.length > 0) {
          delete response.rawBody;
          response.body = output;
        }
        else {
          delete response.prettyPrintBody;
          response.body = JSON.stringify(output, null, 2);
        }
      });
    }
  });
};
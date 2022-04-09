module.exports = (api) => {
  api.hooks.responseLogging.addHook('applyJqCommand', async (response, context) => {
    const jq = require('node-jq')
    const options = {
      input: 'json',
      output: 'pretty'
    }
    const filter = context.httpRegion.metaData.jq

    if (filter && api.utils.getHeader(response.headers, 'Content-Type') === 'application/json') {
      await jq.run(filter, response.parsedBody, options).then(output => {
        delete response.rawBody
        delete response.prettyPrintBody
        response.body = output
      }).catch(error => {
        api.userInteractionProvider.showWarnMessage?.(error.message)
        api.log.warn(error.message)
      })
    }
  })
}

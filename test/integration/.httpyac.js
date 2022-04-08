const plugin = require("../../src/index");

module.exports = {
  configureHooks: function (api) {
    plugin(api);
	},
  environments: {
    $default: {
      host: "http://localhost:8080",
    }
  }
}
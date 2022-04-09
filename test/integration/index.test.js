const httpyac = require("httpyac"),
    mockServer = require("mockttp").getLocal(),
    jsonResponse = {
      slideshow: {
        author: "Yours Truly",
        date: "date of publication",
        slides: [
          {
            title: "Wake up to WonderWidgets!",
            type: "all"
          },
          {
            items: [
              "Why <em>WonderWidgets</em> are great",
              "Who <em>buys</em> WonderWidgets"
            ],
            title: "Overview",
            type: "all"
          }
        ],
        title: "Sample Slide Show"
      }
    };

function initFileProvider() {
    const fileProvider = httpyac.io.fileProvider,
        {join, isAbsolute, dirname, extname} = require("path"),
        fs = require("fs/promises");

    fileProvider.isAbsolute = async (fileName) => isAbsolute(fileProvider.toString(fileName));
    fileProvider.dirname = (fileName) => dirname(fileProvider.toString(fileName));
    fileProvider.hasExtension = (fileName, ...extensions) => extensions.indexOf(extname(fileProvider.toString(fileName))) >= 0;
    fileProvider.joinPath = (fileName, path) => join(fileProvider.toString(fileName), path);
    fileProvider.exists = async (fileName) => {
        try {
            return Boolean(await fs.stat(fileProvider.toString(fileName)));
        } catch (err) {
            return false;
        }
    };
    fileProvider.readdir = async (dirname) => fs.readdir(fileProvider.toString(dirname));
}

describe("httpyac-plugin-jq", () => {
  beforeAll(initFileProvider);
  beforeEach(() => mockServer.start(8080));
  afterEach(() => mockServer.stop());

  async function exec(code, responseBody) {
    const httpFile = await new httpyac.store.HttpFileStore().getOrCreate(
        `any.http`,
        async () => Promise.resolve(code),
        0,
        {
            workingDir: __dirname,
        }
    );
    httpFile.hooks.responseLogging.addHook('test', response => {
      expect(response.body).toBe(responseBody);
    });

    return httpyac.send({
        httpFile,
    });
  }

  it("executes jq command to filter title from response", async () => {
    await mockServer.forGet("/json").thenJson(200, jsonResponse);

    await exec(`
# @jq .slideshow.slides | map({title})
GET /json
      `, `[
  {
    "title": "Wake up to WonderWidgets!"
  },
  {
    "title": "Overview"
  }
]`);
  });

  describe('when no @jq given', function() {
    it("returns original value", async () => {
      await mockServer.forGet("/json").thenJson(200, jsonResponse);

      await exec(`
GET /json
      `, JSON.stringify(jsonResponse));
    });
  });

  describe('when no header returned', function() {
    it("returns original value", async () => {
      await mockServer.forGet("/json").thenReply(200, JSON.stringify(jsonResponse));

      await exec(`
# @jq .slideshow.slides | map({title})
GET /json
      `, JSON.stringify(jsonResponse));
    });
  });

  describe('when jq fails', function() {
    jest.spyOn(httpyac.io.log, 'warn').mockImplementation();

    it("returns original value", async () => {
      await mockServer.forGet("/json").thenJson(200, []);

      await exec(`
  # @jq .slideshow.slides | map({title})
  GET /json
      `, `[]`);
    });
  });
});
/// <reference path="./.sst/platform/config.d.ts" />

const isProd = $app.stage.startsWith("prod");

export default $config({
  app(input) {
    if (isProd) {
      return {
        name: "prod-env",
        removal: "retain",
        home: "aws",
      };
    }

    return {
      name: "dev-env",
      removal: "remove",
      home: "aws",
    };
  },
  async run() {
    new sst.aws.Nextjs("App", {
      domain: {
        name: isProd ? "nwordle.com" : "dev.nwordle.com",
      },
    });
  },
});

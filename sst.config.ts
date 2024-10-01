/// <reference path="./.sst/platform/config.d.ts" />

const isProd = (stage: string) => stage.startsWith("prod");

export default $config({
  app(input) {
    if (isProd(input.stage)) {
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
    new sst.aws.Nextjs("OpenNext", {
      domain: {
        name: isProd($app.stage) ? "nwordle.com" : "dev.nwordle.com",
      },
    });
  },
});

/// <reference path="./.sst/platform/config.d.ts" />

const isProd = (stage: string) => stage.startsWith("prod");

export default $config({
  app(input) {
    return {
      name: "aws-nextjs",
      removal: isProd(input.stage) ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    new sst.aws.Nextjs("OpenNext", {
      domain: {
        name: `${$app.stage}.nwordle.com`,
      },
    });
  },
});

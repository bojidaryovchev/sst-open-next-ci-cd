/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "aws-nextjs",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    if ($app.stage === "prod") {
      new sst.aws.Nextjs("Production", {
        domain: {
          name: "nwordle.com",
        },
      });

      return;
    }

    new sst.aws.Nextjs("Development", {
      domain: {
        name: "dev.nwordle.com",
      },
    });
  },
});

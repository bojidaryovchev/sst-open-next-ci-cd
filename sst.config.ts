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
        name: isProd($app.stage) ? "justpurrrfect.com" : `${$app.stage}.justpurrrfect.com`,
      },
      environment: {
        AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID!,
        AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET!,
        AUTH_SECRET: process.env.AUTH_SECRET!,
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST!,
        DATABASE_URL: process.env.DATABASE_URL!,
      },
    });
  },
});

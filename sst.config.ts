// eslint-disable-next-line @typescript-eslint/triple-slash-reference
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
    const domainName = isProd($app.stage) ? "justpurrrfect.com" : `${$app.stage}.justpurrrfect.com`;

    const email = new sst.aws.Email("OpenNextEmail", {
      sender: domainName,
      dmarc: "v=DMARC1; p=quarantine; adkim=s; aspf=s;",
    });

    new sst.aws.Nextjs("OpenNext", {
      domain: {
        name: domainName,
      },
      environment: {
        AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID!,
        AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET!,
        AUTH_SECRET: process.env.AUTH_SECRET!,
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST!,
        DATABASE_URL: process.env.DATABASE_URL!,
      },
      link: [email],
    });
  },
});

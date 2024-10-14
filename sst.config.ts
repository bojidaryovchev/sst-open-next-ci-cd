// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

import * as pulumi from "@pulumi/pulumi";

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

    const email = new sst.aws.Email("MyEmail", {
      sender: `noreply@${domainName}`,
    });

    // Use pulumi.all to wait for both outputs
    pulumi
      .all([email.nodes.identity.arn, email.nodes.identity.configurationSetName])
      .apply(([SES_IDENTITY_ARN, SES_CONFIGURATION_SET_NAME]) => {
        // Now, create the Next.js app with the resolved values
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
            SES_IDENTITY_ARN: SES_IDENTITY_ARN,
            SES_CONFIGURATION_SET_NAME: SES_CONFIGURATION_SET_NAME!,
            AWS_REGION: process.env.AWS_REGION!,
          },
          link: [email],
        });
      });
  },
});

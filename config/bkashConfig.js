export const bkashConfig = {
  appKey: process.env.BKASH_APP_KEY,
  appSecret: process.env.BKASH_APP_SECRET,
  username: process.env.BKASH_USERNAME,
  password: process.env.BKASH_PASSWORD,
  baseUrl:
    process.env.BKASH_BASE_URL ||
    "https://tokenized.sandbox.bka.sh/v1.2.0-beta",
  callbackUrl: process.env.BKASH_CALLBACK_URL,
};

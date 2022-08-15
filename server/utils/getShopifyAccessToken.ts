import fetch from 'node-fetch';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;

export default async (
  shop: string,
  code: string,
  apiKey = '',
  apiSecret = ''
): Promise<object> => {
  try {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      /* eslint-disable @typescript-eslint/camelcase */
      body: JSON.stringify({
        client_id: apiKey || SHOPIFY_API_KEY,
        client_secret: apiSecret || SHOPIFY_API_SECRET,
        code,
      }),
    });
    const json = await response.json();
    return json;
  } catch (e) {
    throw e;
  }
};

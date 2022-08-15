import * as crypto from 'crypto';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOPIFY_NONCE = process.env.SHOPIFY_NONCE;

export default (request = {}, nonce = null, shopifyApiSecret = ''): boolean => {
  if (nonce && nonce !== SHOPIFY_NONCE) return false;
  const hmac = request['hmac'];
  if (!hmac) return false;

  const parameters = Object.keys(request).reduce((acc, curr) => {
    return curr !== 'hmac' ? [...acc, `${curr}=${request[curr]}`] : acc;
  }, []);

  const message = parameters.sort().join(hmac ? '&' : '');
  const digest = crypto
    .createHmac('SHA256', shopifyApiSecret || SHOPIFY_API_SECRET)
    .update(message)
    .digest('hex');

  return digest === hmac;
};

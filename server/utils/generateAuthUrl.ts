const SHOPIFY_NONCE = process.env.SHOPIFY_NONCE;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const APP_ADMIN_URL = process.env.APP_ADMIN_URL;

export default (
  shop: string,
  apiKey = '',
  scopes = ['read_products', 'read_product_listings']
): string => {
  const redirectUrl = `${APP_ADMIN_URL}install`;
  return `https://${shop}/admin/oauth/authorize?client_id=${
    apiKey || SHOPIFY_API_KEY
  }&scope=${scopes.join(
    ','
  )}&redirect_uri=${redirectUrl}&state=${SHOPIFY_NONCE}`;
};

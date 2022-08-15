export default (shop: string): boolean => {
  const valid = /[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com[/]?/;
  return valid.test(shop);
};

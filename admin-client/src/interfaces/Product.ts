export interface Product {
  id: string;
  sku?: string;
  type: 'Product' | 'ProductVariant';
}

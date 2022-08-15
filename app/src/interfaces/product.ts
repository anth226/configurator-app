import type { ProductType } from './product-type';

export interface Product {
  id: string;
  type: ProductType;
  sku?: string;
  price?: string;
  metafield?: any;
  productType?: string;
  title?: string;
  baseProductTitle?: string;
}

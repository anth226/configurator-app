import { Metafield } from '../shopify-api/interfaces';

export interface ConfigurationProduct {
  id: string;
  title: string;
  handle: string;
  type?: string;
  sku?: string;
  price?: string;
  image?: string;
  productType?: string;
  tags?: string[];
  metafield?: Metafield;
  baseProductTitle?: string;
}

export interface PromiseObject {
  resolve?: (payload: any) => void;
  reject?: (payload: any) => void;
}

export interface Metafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  valueType: string;
}

interface ProductImageNode {
  node: {
    originalSrc: string;
  };
}

export interface Product {
  id: string;
  handle: string;
  hasOnlyDefaultVariant: boolean;
  title: string;
  productType: string;
  totalVariants: number;
  images: {
    edges: ProductImageNode[];
  };
  metafield?: Metafield;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  sku?: string;
  tags?: string[];
  product: {
    id: string;
  };
  image: {
    originalSrc: string;
  };
  productType: string;
  metafield: Metafield;
  baseProductTitle?: string;
}

interface Collection {
  id: string;
  title: string;
  image?: {
    originalSrc: string;
  };
}

export interface ProductResult {
  cursor: string;
  node: Product;
}

export interface CollectionResult {
  cursor: string;
  node: Collection;
}

export interface ProductVariantResult {
  cursor: string;
  node: ProductVariant;
}

interface Action {
  id: string;
  type?: "filter" | "discard" | "count";
  filteredProductType?: string;
  filteredProductFeatures?: string[];
  count?: string;
}

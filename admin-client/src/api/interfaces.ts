export interface IPromiseObject {
  resolve?: (payload: any) => void;
  reject?: (payload: any) => void;
}

export interface IMetafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  valueType: string;
}

export interface IProductImageNode {
  node: {
    originalSrc: string;
  };
}

export interface IProduct {
  id: string;
  handle: string;
  hasOnlyDefaultVariant: boolean;
  title: string;
  sku: string;
  productType: string;
  totalVariants: number;
  images: {
    edges: IProductImageNode[];
  };
  tags: string[];
}

export interface IOption {
  id: string;
  name: string;
  photo?: string;
  sayduckIds?: {[key: string]: string[]};
  actions: IAction[] | [];
}

export interface ISection {
  id: string;
  name?: string;
  photo?: string;
  options?: IOption[];
  optionOrder?: string[];
}

export interface iCollectionPayload {
  id: string;
}
export interface IConfigurationPayload {
  name?: string;
  products?: IProductPayload[];
  photo?: string;
  collections?: iCollectionPayload[];
  sectionOrder?: string[];
  bundleProductId?: string;
  productType?: string;
  savedConfigurationId?: string;
  sayduckProductId?: string;
}

export interface IImagePayload {
  filename: string;
  contentType: string;
}

export interface ISectionPayload {
  id?: string;
  name?: string;
  photo?: string;
  optionOrder?: string[];
}

export interface IAction {
  id: string;
  type?: 'filter' | 'discard' | 'count';
  filteredProductType?: string;
  filteredProductFeatures?: string[];
  count?: string;
}

export interface IOptionPayload {
  id?: string;
  sectionId: string;
  name?: string;
  sayduckIds?: {[key: string]: string[]};
  photo?: string | undefined;
  actions?: IAction[];
}

export interface IProductPayload {
  id: string;
  sku: string;
  type: string;
}

export interface IProductVariant {
  id: string;
  title: string;
  price: string;
  sku: string;
  product: {
    id: string;
  };
  image: {
    originalSrc: string;
  };
  productType: string;
}
export interface IProductResult {
  cursor: string;
  image: string;
  node: IProduct;
  variants: IProductVariantResult[];
}

export interface IPagedProducts {
  pageInfo: {
    previousPage: string | undefined;
    nextPage: string | undefined;
  };
  products: IProductResult[];
}

export interface IProductVariantResult {
  cursor: string;
  node: IProductVariant;
}

export interface IConfiguration {
  id?: string;
  meta?: string;
  name?: string;
  bundleProductId?: string;
  productType?: string;
  savedConfigurationId?: string;
  sayduckProductId?: string;
  products?: IProduct[];
  collections?: string[];
  sections?: ISection[];
  sectionOrder?: string[];
  photo?: string;
  status?: string;
  created?: Date;
  done?: boolean;
}

export interface IConfigurationProduct {
  id: string;
  title: string;
  handle: string;
  type?: string;
  sku?: string;
  image?: string;
}

export interface ICollection {
  id: string;
  title?: string;
  image?: {
    originalSrc: string;
  };
}

export interface ICollectionResult {
  cursor: string;
  node: ICollection;
}

export interface IPagedCollections {
  pageInfo: {
    previousPage: string | undefined;
    nextPage: string | undefined;
  };
  collections: ICollectionResult[];
}

export interface IProducTypeResult {
  edges: {
    node: string;
  }[];
}

import { Product } from './Product';

export interface Configuration {
  id: string;
  meta: string;
  name: string;
  photo?: string;
  products: Product[];
}

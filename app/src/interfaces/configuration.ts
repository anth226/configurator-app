import type { Product } from './product';
import type { Section } from './section';
import type { SavedConfiguration } from './saved-configuration'

export interface Configuration {
  done: boolean;
  id: string;
  meta: string;
  name: string;
  photo?: string;
  products?: Product[];
  sections?: Section[];
  saved?: SavedConfiguration;
  sectionOrder: string[];
  bundleProductId?: string;
  sayduckProductId?: string;
  savedConfigurationId?: string;
  productType?: string;
}

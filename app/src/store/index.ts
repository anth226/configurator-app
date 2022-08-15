import { writable, get, derived } from 'svelte/store';
import { Action } from '../interfaces/action';
import type { Bundle } from '../interfaces/bundle';
import type { Configuration } from '../interfaces/configuration';
import type { Option } from '../interfaces/option';
import type { SelectedOptions } from '../interfaces/selected-options';
import type { Product } from '../interfaces/product';
import type { IkeaProductGroup } from '../interfaces/ikea-product';

const configuration = writable<Configuration>(undefined);
const configurationProductType = writable<string>(undefined)
const configurationProductIds = writable<{ productType: string; id: string }[]>(undefined);
const configurationProductIdsGroupedByProductType = writable<{ [key: string]: { products: string[]; count: number } }>(undefined);
const bundleProductId = writable<string>(undefined);
const sayDuckProductId = writable<string>(undefined);
const filteredProductGroup = writable<{ [key: string]: { products: string[]; count: number } }>(undefined);
const selectedProductSummary = writable<{ [key: string]: { productId: string; count: number; price: number } }>(undefined);
const selectedIkeaProductSummary = writable<{ [key: string]: IkeaProductGroup[] }>(undefined);
const selectedSayDuckOptions = writable<{ [key: string]: string }>({})
const shop = writable<string>(undefined);
const shopCurrency = writable<{[key: string]: string, }>({currency: 'EUR', symbol: '€'});
const meta = writable<string>(undefined);
const saved = writable<string>(undefined);
const lang = writable<string>('fi');
const newSavedConfigurationId = writable<string>(undefined);
const savedConfigurationPhoto = writable<string | null>(null);
const selectedSection = writable<string | null>(null);
const selectedOptions = createSelectedOptions();
const savedOptions = writable<any>(undefined);
const selectedDetails = writable<{
  model: string;
  width: string;
  height: string;
  depth: string;
  style: string;
  color: string;
  worktops: string;
  handles: string;
  legs: string;
  colorImage: string;
  handlesImage: string;
  heightImage: string;
  legsImage: string;
  modelImage: string;
  styleImage: string;
  widthImage: string;
  worktopsImage: string;
  totalShopifyPrice: number;
  totalIkeaPrice: number;
  hasLegs: boolean;
  hasSpacerPanels: boolean;
  ikeaProductList: {[key: string]: string | number}[] | [];
  shopifyProductList: {[key: string]: string | number}[] | [];
  frame: string;
}>({
  model: '',
  width: '',
  height: '',
  depth: '',
  style: '',
  color: '',
  worktops: '',
  handles: '',
  legs: '',
  colorImage: '',
  handlesImage: '',
  heightImage: '',
  legsImage: '',
  modelImage: '', 
  styleImage: '',
  widthImage: '',
  worktopsImage: '',
  totalShopifyPrice: 0,
  totalIkeaPrice: 0,
  hasLegs: false,
  hasSpacerPanels: false,
  ikeaProductList: [],
  shopifyProductList: [],
  frame: ''
});
const loading = writable(true);
const loadingProductActions = writable(false);
const sayDuckModelLoading = writable<boolean>(true);
const sayDuckPhotoLoading = writable<boolean>(false);
const toggleFormSuccess = writable<boolean>(false);
const togglePopup = writable<{show: boolean, content: string}>({show: false, content: ''})
const toast = writable<{ show: boolean; content: string; specialCaseContent?: string; duration: number }>({
  show: false,
  content: '',
  specialCaseContent: '',
  duration: 1000
});
const shouldPerformScroll = writable<boolean>(false);
const slideAnimation = writable<{shouldAnimate: boolean, type: string, duration: number}>({shouldAnimate: false, type: '', duration: 400})
const bundle = derived(selectedOptions, ($selectedOptions) => {
  const keys = Object.keys($selectedOptions);
  if (keys.length) {
    // Calculate new byndle
    console.log('Calculating new bundle !!');
  }

  return {} as Bundle;
});
const hasSpecialCase = writable<boolean>(false);

function createSelectedOptions() {
  const { subscribe, update, set } = writable<SelectedOptions>({});
  return {
    subscribe,
    selectOption(sectionId: string, optionId: Option) {
      return update((curr) => ({ ...curr, [sectionId]: optionId }));
    },
    init(options: SelectedOptions) {
      set(options);
    },
  };
}

const action = writable(Action.INFO);

export {
  lang,
  configuration,
  selectedOptions,
  selectedSection,
  bundle,
  loading,
  sayDuckModelLoading,
  sayDuckPhotoLoading,
  action,
  shop,
  shopCurrency,
  meta,
  saved,
  savedOptions,
  newSavedConfigurationId,
  savedConfigurationPhoto,
  toggleFormSuccess,
  toast,
  shouldPerformScroll,
  filteredProductGroup,
  selectedProductSummary,
  selectedIkeaProductSummary,
  configurationProductIds,
  configurationProductIdsGroupedByProductType,
  loadingProductActions,
  selectedDetails,
  selectedSayDuckOptions,
  slideAnimation,
  configurationProductType,
  togglePopup,
  hasSpecialCase
};

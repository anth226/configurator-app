export interface IkeaProduct {
  name_en: string,
    name_fi: string,
    name_sv: string,
    sku: string,
    price_eur: string,
    price_sek: string,
    productType: string
    handle?: string;
}

export interface IkeaProductGroup extends IkeaProduct {
  count: number
}
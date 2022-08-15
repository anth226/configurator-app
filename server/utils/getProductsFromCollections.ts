import { resolveCollectionProducts } from 'shopify-api/collections';
import { isExistingShop } from 'utils';

export default async (shop: string, collectionIds: string[]) => {
  try {
    const existingShop = await isExistingShop(shop);
    if (!existingShop) throw new Error('No shop found.');
    const collectionProducts = await resolveCollectionProducts(
      shop,
      existingShop.accessToken,
      collectionIds
    );
    if (!collectionProducts) return [];
    return collectionProducts;
  } catch (e) {
    throw e;
  }
};

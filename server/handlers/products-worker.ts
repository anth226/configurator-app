import getProductsFromCollections from 'utils/getProductsFromCollections';
import db from '../dynamodb';
const { APP_TABLE } = process.env;
import { v4 as uuid } from 'uuid';

const CHUNK_SIZE = 500

export const handler = async (
  event: Record<string, unknown>
): Promise<boolean> => {
  const { shop, id, meta, collections, existingProducts = [] } = event;

  const oldProductReferences = existingProducts as {
    id: string;
    meta: string;
  }[];

  const products = await getProductsFromCollections(
    shop as string,
    collections as string[]
  );

  const productsId = `${shop}-products`;
  let productsReference = [];

  const saveToDb = async (
    products: Record<string, unknown>[],
    references: Record<string, unknown>[]
  ): Promise<Record<string, unknown>[]> => {
    const nextId = uuid();
    const p = {
      TableName: APP_TABLE,
      Item: db.buildData(
        { products: products, meta: nextId, id: productsId },
        'ConfigurationProducts'
      ),
    };
    await db.put(p);
    return [...references, { id: productsId, meta: nextId }];
  };

  if (products.length > CHUNK_SIZE) {
    const chunks = products.reduce(
      (acc, _, i) => (i % CHUNK_SIZE ? acc : [...acc, products.slice(i, i + CHUNK_SIZE)]),
      []
    );

    productsReference = await chunks.reduce(async (promise, next) => {
      const ref = await promise;
      return await saveToDb(next, ref);
    }, Promise.resolve([]));
  } else {
    const metaId = uuid();
    const productParams = {
      TableName: APP_TABLE,
      Item: db.buildData(
        { products, meta: metaId, id: productsId },
        'ConfigurationProducts'
      ),
    };
    productsReference.push({ id: productsId, meta: metaId });
    await db.put(productParams);
  }

  // Delete old product references
  if (oldProductReferences.length) {
    await oldProductReferences.reduce(async (p, curr) => {
      await p;
      const { id, meta } = curr;
      return (await db.delete({
        TableName: APP_TABLE,
        Key: {
          id,
          meta,
        },
      })) as Promise<any>;
    }, Promise.resolve());
  }
  const params = {
    TableName: APP_TABLE,
    ...db.buildData(
      { payload: { products: productsReference, done: true }, meta, id },
      'ConfigurationUpdate'
    ),
  };
  await db.update(params);
  return;
};

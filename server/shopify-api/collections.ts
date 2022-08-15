import { CollectionResult, ProductVariant, PromiseObject } from './interfaces';

import { GraphQLClient } from 'graphql-request';
import { ConfigurationProduct } from 'interfaces';
import { throttle } from 'utils';
const HOST = process.env.HOST;

type GetCollectionParams = {
  shop: string;
  accessToken: string;
  cursor: string;
  limit: number | null;
  search: string;
};

export const getCollections = async ({ shop, accessToken, cursor, limit, search }: GetCollectionParams) => {
  const clientUrl = `https://${shop}/admin/api/2020-01/graphql.json`;
  const client = new GraphQLClient(clientUrl, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  });

  type PaginatedResult = {
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    collections: CollectionResult[];
  };

  type PaginatedFinalResult = {
    pageInfo: {
      nextPage: null | string;
      previousPage: null | string;
    };
    collections: CollectionResult[];
  };

  async function getReversedCollectionCursor(cursor: string, limit: number) {
    const query = `query($limit: Int, $cursor: String) {
      collections(last: $limit, before: $cursor) {
        edges {
          cursor
        }
      }
    }`;
    try {
      const results = await client.request(query, { limit, cursor });
      if (results.collections.edges.length < limit) return `${HOST}collections?limit=${limit}`;
      return `${HOST}collections?limit=${limit}&cursor=${results.collections.edges[0].cursor}`;
    } catch (e) {
      // console.error('getReversedCollectionCursor error: ', e.message);
      return null;
    }
  }

  const getPaginatedCollections = async (
    paginatedResults = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      collections: [],
    } as PaginatedResult,
    cursor = '',
    limit,
    search,
    promise = {} as PromiseObject
  ): Promise<PaginatedFinalResult> => {
    const query = `
    query($limit: Int, $cursor: String) {
      collections(first: $limit, after: $cursor) {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        edges {
          cursor
          node {
            id
            title
            image {
            originalSrc
          }
          }
        }
      }
    }
    `;

    const searchQuery = `
    query($limit: Int, $cursor: String, $search: String) {
      collections(first: $limit, after: $cursor, query: $search) {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        edges {
          cursor
          node {
            id
            title
            image {
            originalSrc
          }
          }
        }
      }
    }
    `;
    return new Promise(async (resolve, reject) => {
      resolve = promise.resolve || resolve;
      reject = promise.reject || reject;
      try {
        const params: any = { limit: 30 };
        if (cursor) params.cursor = cursor;
        if (limit) params.limit = limit;
        if (search) params.search = `title:${search}*`;

        const results = await client.request(search ? searchQuery : query, Object.keys(params).length ? params : null);

        if (
          (!limit && results.collections.pageInfo.hasNextPage) ||
          (results.collections.pageInfo.hasNextPage && results.collections.edges.length < limit)
        ) {
          return getPaginatedCollections(
            {
              pageInfo: results.collections.pageInfo,
              collections: [...paginatedResults.collections, ...results.collections.edges],
            },
            results.collections.edges[results.collections.edges.length - 1].cursor,
            limit,
            search,
            { resolve, reject }
          );
        }

        let previousCursor: string;
        if (results.collections.pageInfo.hasPreviousPage) {
          previousCursor = await getReversedCollectionCursor(cursor, limit);
        }
        return resolve({
          pageInfo: {
            previousPage: previousCursor || null,
            nextPage: results.collections.pageInfo.hasNextPage
              ? `${HOST}collections?limit=${limit}&cursor=${results.collections.edges[results.collections.edges.length - 1].cursor}`
              : null,
          },
          collections: [...paginatedResults.collections, ...results.collections.edges],
        } as PaginatedFinalResult);
      } catch (e) {
        return;
      }
    });
  };

  const collections = await getPaginatedCollections(
    {
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      collections: [],
    },
    cursor,
    limit,
    search
  );

  return collections;
};

export const resolveCollectionProducts = async (shop: string, accessToken: string, collectionIds: string[]) => {
  const clientUrl = `https://${shop}/admin/api/2020-01/graphql.json`;
  const client = new GraphQLClient(clientUrl, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  });

  async function getPaginatedProductVariants(
    productIds: string[],
    productTypes: string[],
    tags: string[][],
    edges = [],
    promise = {} as PromiseObject
  ): Promise<ProductVariant[]> {
    const query = `
      query($id: ID!) {
        product(id: $id) {
          title
          hasOnlyDefaultVariant
          variants(first: 50) {
            edges {
              cursor
              node {
                id
                title
                price
                sku
                product {
                  id
                }
                image {
                  originalSrc
                }
                metafield(namespace: "configurator-app", key: "configurator-sayduck-uuid") {
                  id
                  namespace
                  key
                  value
                  valueType
                }
              }
            }
          }
        }
      }
    `;
    return new Promise(async (resolve, reject) => {
      resolve = promise.resolve || resolve;
      reject = promise.reject || reject;
      try {
        if (!productIds.length) return resolve(edges);
        const pId = productIds.shift();
        const pType = productTypes.shift();
        const tag = tags.shift();
        const result = await client.request(query, { id: pId });

        return getPaginatedProductVariants(
          productIds,
          productTypes,
          tags,
          [
            ...edges,
            ...result.product.variants.edges.map((e) => ({
              ...e.node,
              productType: pType,
              tags: tag,
              baseProductTitle: result.product.title,
            })),
          ],
          { resolve, reject }
        );
      } catch (e) {
        return reject(e);
      }
    });
  }

  const getCollectionProducts = async (
    collections: string[] = [],
    currentCollectionId = '',
    cursor = '',
    products: Set<ConfigurationProduct> = new Set(),
    promise = {} as PromiseObject
  ): Promise<Set<ConfigurationProduct>> =>
    new Promise(async (resolve, reject) => {
      resolve = promise.resolve || resolve;
      reject = promise.reject || reject;
      if (!currentCollectionId && !collections.length) {
        return resolve(products);
      }
      if (!currentCollectionId) {
        currentCollectionId = collections.shift();
      }

      const query = `
    query($id: ID!, $cursor: String){
      collection(id: $id) {
        title
        products(first: 20, after: $cursor) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              productType
              tags
            }
          }
        }
      }
    }
    `;
      let currentCursor = '';
      try {
        const params: Record<string, unknown> = {
          id: currentCollectionId,
        };

        if (cursor) {
          params.cursor = cursor;
        }
        const results = await client.request(query, params);
        if (results.collection.products.edges.length) {
          currentCursor =
            results.collection.products.edges[
              results.collection.products.edges.length - 1
            ].cursor;
          const productIds = results.collection.products.edges.map(
            (e) => e.node.id
          );
          const productTypes = results.collection.products.edges.map(
            (e) => e.node.productType
          );
          const productTags = results.collection.products.edges.map(
            (e) => e.node.tags
          );
          const variants = await getPaginatedProductVariants(
            productIds,
            productTypes,
            productTags
          );
          if (variants.length) {
            variants.forEach((v: ProductVariant) => {
              const {
                id,
                title,
                image,
                productType,
                sku,
                price,
                metafield,
                tags,
                baseProductTitle
              } = v;
              products.add({
                id,
                title,
                handle: null,
                sku,
                price,
                productType,
                tags,
                image: image ? image.originalSrc : null,
                metafield,
                baseProductTitle
              });
            });
          }
        }
        if (results.collection.products.pageInfo.hasNextPage) {
          return getCollectionProducts(collections, currentCollectionId, currentCursor, products, { resolve, reject });
        }
        return getCollectionProducts(collections, '', '', products, {
          resolve,
          reject,
        });
      } catch (e) {
        if (e.message.includes('Throttled: ')) {
          const json = JSON.parse(e.message.replace('Throttled: ', ''));
          const minWait = 20;
          console.log('Throttled: ', JSON.stringify(json.response.extensions));
          await throttle(minWait);
          return getCollectionProducts(
            collections,
            currentCollectionId,
            cursor,
            products,
            { resolve, reject }
          );
        } else {
          return reject(e);
        }
      }
    });

  const products = await getCollectionProducts(collectionIds);

  return Array.from(products);
};

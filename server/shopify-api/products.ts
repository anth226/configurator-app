import { ProductResult, ProductVariant, PromiseObject } from './interfaces';

import { GraphQLClient } from 'graphql-request';
import { ConfigurationProduct } from 'interfaces';
const HOST = process.env.HOST;

type GetProductParams = {
  shop: string;
  accessToken: string;
  cursor: string;
  limit: number | null;
  search: string;
};

function isProductVariant(id: string) {
  return id.includes('Variant');
}

async function getTags(
  p: ConfigurationProduct,
  arr: ConfigurationProduct[],
  client: any
): Promise<ConfigurationProduct[]> {
  const variantQuery = `
    query($id: ID!) {
      productVariant(id: $id) {
        product {
          tags
        }
      }
    }
    `;
  const productQuery = `
    query($id: ID!) {
      product(id: $id) {
        tags
      }
    }
  `;
  const variant = isProductVariant(p.id);
  const result = await client.request(
    variant ? variantQuery : productQuery,
    {
      id: p.id,
    }
  );

  return variant
    ? [...arr, { ...p, tags: result.productVariant.product.tags }]
    : [...arr, { ...p, tags: result.product.tags }];
}


export const getProducts = async ({
  shop,
  accessToken,
  cursor,
  search,
  limit,
}: GetProductParams) => {
  const clientUrl = `https://${shop}/admin/api/2020-01/graphql.json`;
  const client = new GraphQLClient(clientUrl, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  });

  function getMediumSizeImage(url) {
    const parts = url.split('?v=');
    const version = parts[1];
    const asset = parts[0];
    const tmp = asset.split('.');
    const extension = tmp[tmp.length - 1];
    const mediumImg = `${tmp
      .join('.')
      .replace(`.${extension}`, '')}_medium.${extension}`;
    return `${mediumImg}?v=${version}`;
  }

  type PaginatedResult = {
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    products: ProductResult[];
  };

  type PaginatedFinalResult = {
    pageInfo: {
      nextPage: null | string;
      previousPage: null | string;
    };
    products: ProductResult[];
  };

  async function getReversedProductCursor(cursor: string, limit: number) {
    const query = `query($limit: Int, $cursor: String) {
      products(last: $limit, before: $cursor) {
        edges {
          cursor
        }
      }
    }`;

    try {
      const results = await client.request(query, { limit, cursor });
      if (results.products.edges.length < limit)
        return `${HOST}products?limit=${limit}`;
      return `${HOST}products?limit=${limit}&cursor=${results.products.edges[0].cursor}`;
    } catch (e) {
      // console.error('getReversedProductCursor error: ', e.message);
      return null;
    }
  }

  async function getPaginatedProducts(
    paginatedResults = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      products: [],
    } as PaginatedResult,
    cursor = '',
    search = '',
    limit,
    promise = {} as PromiseObject
  ): Promise<PaginatedResult | PaginatedFinalResult> {
    const query = `query($limit: Int, $cursor: String) {
        products(first: $limit, after: $cursor) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            cursor
            node {
              id
              handle
              hasOnlyDefaultVariant
              title
              productType
              totalVariants
              images(first: 1) {
                edges {
                  node {
                    originalSrc
                  }
                }
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
    `;

    const searchQuery = `query($limit: Int, $cursor: String, $search: String) {
      products(first: $limit, after: $cursor, query: $search) {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        edges {
          cursor
          node {
            id
            handle
            hasOnlyDefaultVariant
            title
            productType
            totalVariants
            images(first: 1) {
              edges {
                node {
                  originalSrc
                }
              }
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
  `;

    return new Promise(async (resolve, reject) => {
      resolve = promise.resolve || resolve;
      reject = promise.reject || reject;
      try {
        const params: any = { limit: 30 };
        if (cursor) params.cursor = cursor;
        if (limit) params.limit = limit;
        if (search) params.search = `title: '${search}'`;
        const results = await client.request(
          search ? searchQuery : query,
          Object.keys(params).length ? params : null
        );

        if (
          (!limit && results.products.pageInfo.hasNextPage) ||
          (results.products.pageInfo.hasNextPage &&
            results.products.edges.length < limit)
        ) {
          return getPaginatedProducts(
            {
              pageInfo: results.products.pageInfo,
              products: [
                ...paginatedResults.products,
                ...results.products.edges,
              ],
            },
            results.products.edges[results.products.edges.length - 1].cursor,
            limit,
            search,
            { resolve, reject }
          );
        }
        let previousCursor: string;
        if (results.products.pageInfo.hasPreviousPage) {
          previousCursor = await getReversedProductCursor(cursor, limit);
        }
        return resolve({
          pageInfo: {
            previousPage: previousCursor || null,
            nextPage: results.products.pageInfo.hasNextPage
              ? `${HOST}products?limit=${limit}&cursor=${
                  results.products.edges[results.products.edges.length - 1]
                    .cursor
                }`
              : null,
          },
          products: [...paginatedResults.products, ...results.products.edges],
        } as PaginatedFinalResult);
      } catch (e) {
        return reject(e);
      }
    });
  }

  async function getPaginatedProductVariants(
    productIds: string[],
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
        const result = await client.request(query, { id: pId });

        return getPaginatedProductVariants(
          productIds,
          [
            ...edges,
            ...result.product.variants.edges.map((e) => ({ ...e.node })),
          ],
          { resolve, reject }
        );
      } catch (e) {
        return reject(e);
      }
    });
  }

  const products = await getPaginatedProducts(
    { pageInfo: { hasNextPage: false, hasPreviousPage: false }, products: [] },
    cursor,
    search,
    limit
  );

  const productIds =
    (products.products.length && products.products.map((p) => p.node.id)) || [];

  const variants: ProductVariant[] = await getPaginatedProductVariants(
    productIds
  );

  // map correct product variants to original products
  const paginatedProducts = {
    pageInfo: products.pageInfo,
    products: products.products.map((p) => {
      const image = p.node.images.edges.length
        ? getMediumSizeImage(p.node.images.edges[0].node.originalSrc)
        : null;

      const productVariants = variants
        .filter((v) => v.product.id === p.node.id)
        .map((v) => ({
          ...v,
          image: v.image ? getMediumSizeImage(v.image.originalSrc) : null,
        }));
      if (productVariants.length)
        return { ...p, image, variants: productVariants };
      return { ...p, image, variants: [] };
    }),
  };

  return paginatedProducts || [];
};

export const getProductTags = async (
  shop: string,
  accessToken: string,
  products: ConfigurationProduct[]
) => {
  const clientUrl = `https://${shop}/admin/api/2020-01/graphql.json`;
  const client = new GraphQLClient(clientUrl, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  });

  try {


    const productsWithTags = await products.reduce(
      async (prevPromise, curr) => {
        const productWithTag = await prevPromise;
        return getTags(curr, productWithTag, client);
      },
      Promise.resolve([] as ConfigurationProduct[])
    );

    // dupe removal with Set
    return Array.from(new Set(productsWithTags));
  } catch (e) {
    throw e;
  }
};
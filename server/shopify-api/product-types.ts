import { PromiseObject } from './interfaces';

import { GraphQLClient } from 'graphql-request';

type GetProductParams = {
  shop: string;
  accessToken: string;
};

type ProductTypesResult = {
  shop: {
    productTypes: string;
  };
};

export const getProductTypes = async ({
  shop,
  accessToken
}: GetProductParams) => {
  const clientUrl = `https://${shop}/admin/api/2020-01/graphql.json`;
  const client = new GraphQLClient(clientUrl, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  });

  const getProductTypes = async (promise = {} as PromiseObject): Promise<ProductTypesResult> => {
    const query = `query {
      shop {
        productTypes (first: 200) {
          edges {
            node
          }
        }
      }
    }
    `;

    return new Promise(async (resolve, reject) => {
      resolve = promise.resolve || resolve;
      reject = promise.reject || reject;
      try {
        const results = await client.request(
          query
        );

        return resolve(results.shop.productTypes);
      } catch (e) {
        return reject(e);
      }
    });
  }

  const productTypes = await getProductTypes()

  return { ...productTypes }
  
};

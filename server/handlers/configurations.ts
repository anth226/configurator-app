import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import invoke from 'aws/invoke';
import { ConfigurationProduct } from 'interfaces';
import {
  createResponse,
  isNotAllowedMethod,
  removePhotos,
  verifyToken,
} from 'utils';
import { v4 as uuid } from 'uuid';
import db from '../dynamodb';
const { APP_TABLE, PRODUCTS_WORKER } = process.env;

const handleRequest = {
  GET: async (
    evt: APIGatewayEvent,
    shop: string
  ): Promise<APIGatewayProxyResult> => {
    try {
      if (evt.pathParameters && evt.pathParameters.meta) {
        const { meta } = evt.pathParameters;
        const result = await db.get({
          TableName: APP_TABLE,
          Key: {
            id: `${shop}-configuration`,
            meta,
          },
        });

        if (!result.Item)
          return createResponse(404, { message: 'Configuration not found.' });

        const getProductReference = async (
          { id, meta },
          products: ConfigurationProduct[]
        ): Promise<ConfigurationProduct[]> => {
          const doc = await db.get({
            TableName: APP_TABLE,
            Key: {
              id,
              meta,
            },
          });

          return [...products, ...doc.Item.products];
        };

        const productDocs = await result.Item.products.reduce(
          async (acc, curr) => {
            const parts = await acc;
            return await getProductReference(curr, parts);
          },
          Promise.resolve([])
        );

        const sortedSections = {
          ...result.Item,
          products: productDocs || [],
          sections: result.Item.sections
            ? result.Item.sections.slice().sort((a, b) => {
                return (
                  result.Item.sectionOrder.indexOf(a.id) -
                  result.Item.sectionOrder.indexOf(b.id)
                );
              })
            : [],
        };
        return createResponse(200, sortedSections);
      }
      const results = await db.query({
        TableName: APP_TABLE,
        KeyConditionExpression: 'id = :value',
        ExpressionAttributeValues: {
          ':value': `${shop}-configuration`,
        },
      });
      const itemsWithSortedSections = results.Items
        ? results.Items.map((item) => ({
            ...item,
            sections: item.sections
              ? item.sections.slice().sort((a, b) => {
                  return (
                    item.sectionOrder.indexOf(a.id) -
                    item.sectionOrder.indexOf(b.id)
                  );
                })
              : [],
          }))
        : [];
      return createResponse(200, itemsWithSortedSections);
    } catch (e) {
      return createResponse(500, { message: e.message });
    }
  },
  POST: async (
    evt: APIGatewayEvent,
    shop: string
  ): Promise<APIGatewayProxyResult> => {
    try {
      const payload = JSON.parse(evt.body);
      const {
        name,
        bundleProductId,
        productType,
        sayduckProductId,
        collections = [],
      } = payload || {
        name: `my-configuration-${Date.now()}`,
      };

      const id = `${shop}-configuration`;
      const meta = uuid();
      const collectionIds = collections.map((c) => c.id);
      const params = {
        TableName: APP_TABLE,
        Item: db.buildData(
          {
            id,
            name,
            bundleProductId,
            productType,
            sayduckProductId,
            meta,
            products: [],
            collections: collectionIds,
            done: false,
          },
          'Configuration'
        ),
      };
      await db.put(params);

      // handle products creation from passed in collection
      if (collections.length) {
        await invoke(PRODUCTS_WORKER, {
          shop,
          id,
          meta,
          collections: collectionIds,
        });
      }
      return createResponse(200, {
        ...params.Item,
      });
    } catch (e) {
      if (e.message === 'Invalid data format.') {
        return createResponse(400, { message: e.message });
      }
      return createResponse(500, { message: e.message });
    }
  },
  PUT: async (
    evt: APIGatewayEvent,
    shop: string
  ): Promise<APIGatewayProxyResult> => {
    try {
      const payload = JSON.parse(evt.body);
      const { meta } = evt.pathParameters;
      const id = `${shop}-configuration`;
      const params = {
        TableName: APP_TABLE,
        ...db.buildData({ payload, meta, id }, 'ConfigurationUpdate'),
      };
      await db.update(params);

      return createResponse(200, {
        message: 'Ok',
      });
    } catch (e) {
      return createResponse(500, { message: e.message });
    }
  },
  DELETE: async (
    evt: APIGatewayEvent,
    shop: string
  ): Promise<APIGatewayProxyResult> => {
    if (!evt.pathParameters || !evt.pathParameters.meta)
      return createResponse(400, {
        message: 'Bad request. Target configuration id not specified.',
      });

    const { meta } = evt.pathParameters;
    try {
      const result = await db.get({
        TableName: APP_TABLE,
        Key: {
          id: `${shop}-configuration`,
          meta,
        },
      });

      if (!result.Item) return createResponse(200, { message: 'Ok' });
      if (result.Item.photo) {
        await removePhotos(result.Item.photo);
      }

      const removeProductReference = async (
        { id, meta },
        prev: boolean
      ): Promise<boolean> => {
        await db.delete({
          TableName: APP_TABLE,
          Key: {
            id,
            meta,
          },
        });
        return prev;
      };

      // remove the root object
      await result.Item.products.reduce(async (acc, curr) => {
        const done = await acc;
        return await removeProductReference(curr, done);
      }, Promise.resolve(true));

      await db.delete({
        TableName: APP_TABLE,
        Key: {
          id: `${shop}-configuration`,
          meta,
        },
      });

      return createResponse(200, { message: 'Ok' });
    } catch (e) {
      return createResponse(500, { message: e.message });
    }
    return;
  },
};

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (isNotAllowedMethod(event.httpMethod, ['POST', 'DELETE', 'PUT', 'GET'])) {
    return createResponse(405, { message: 'Method not allowed' });
  }

  const authToken = event.headers['Authorization'];
  if (!authToken || !authToken.length)
    return createResponse(401, {
      message: 'Unauthorized. No Authentication token present.',
    });

  const decoded = verifyToken(authToken);
  if (decoded.error) {
    return createResponse(401, {
      message: decoded.message,
    });
  }
  const shop = decoded.shop || '';
  return handleRequest[event.httpMethod](event, shop);
};

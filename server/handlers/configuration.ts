import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConfigurationProduct } from 'interfaces';
import { createResponse, isNotAllowedMethod } from 'utils';
import { v4 as uuid } from 'uuid';
import db from '../dynamodb';
const APP_TABLE = process.env.APP_TABLE;

const handleRequest = {
  GET: async (
    evt: APIGatewayEvent,
    shop: string
  ): Promise<APIGatewayProxyResult> => {
    try {
      if (evt.pathParameters && evt.pathParameters.meta) {
        const { meta } = evt.pathParameters;
        const { saved: savedId } = evt.queryStringParameters;
        const result = await db.get({
          TableName: APP_TABLE,
          Key: {
            id: `${shop}-configuration`,
            meta,
          },
        });

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

        const saved = await db.get({
          TableName: APP_TABLE,
          Key: {
            id: `${shop}-saved-configuration`,
            meta: savedId,
          },
        });

        if (!result.Item)
          return createResponse(404, { message: 'Configuration not found.' });
        const sortedSections = {
          ...result.Item,
          products: productDocs,
          saved: saved.Item || {},
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
      // const results = await db.query({
      //   TableName: APP_TABLE,
      //   KeyConditionExpression: 'id = :value',
      //   ExpressionAttributeValues: {
      //     ':value': `${shop}-configuration`,
      //   },
      // });
      // const itemsWithSortedSections = results.Items
      //   ? results.Items.map((item) => ({
      //       ...item,
      //       sections: item.sections
      //         ? item.sections.slice().sort((a, b) => {
      //             return (
      //               item.sectionOrder.indexOf(a.id) -
      //               item.sectionOrder.indexOf(b.id)
      //             );
      //           })
      //         : [],
      //     }))
      //   : [];
      // return createResponse(200, itemsWithSortedSections);
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
      const { name } = payload || {
        name: `my-configuration-${Date.now()}`,
      };
      const id = `${shop}-saved-configuration`;
      //create new configuration record
      const params = {
        TableName: APP_TABLE,
        Item: db.buildData({ id, name, meta: uuid() }, 'Configuration'),
      };
      await db.put(params);

      //update record with selectedOptions
      const updateParams = {
        TableName: APP_TABLE,
        ...db.buildData(
          { payload, meta: params.Item.meta, id },
          'ConfigurationUpdate'
        ),
      };
      await db.update(updateParams);

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
};

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (isNotAllowedMethod(event.httpMethod, ['POST', 'GET'])) {
    return createResponse(405, { message: 'Method not allowed' });
  }

  if (!event.queryStringParameters || !event.queryStringParameters.shop) {
    return createResponse(404, { message: 'No shop found' });
  }

  const shop = event.queryStringParameters.shop;

  return handleRequest[event.httpMethod](event, shop);
};

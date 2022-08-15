import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import invoke from 'aws/invoke';
import { createResponse, isNotAllowedMethod, verifyToken } from 'utils';
import db from '../dynamodb';
const { APP_TABLE, PRODUCTS_WORKER } = process.env;

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (isNotAllowedMethod(event.httpMethod, ['POST'])) {
    return createResponse(405, { message: 'Method not allowed' });
  }

  const meta = (event.pathParameters && event.pathParameters.meta) || '';

  if (!meta)
    return createResponse(400, {
      message: 'Bad request. Missing path parameter [meta].',
    });

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
  const id = `${shop}-configuration`;

  const result = await db.get({
    TableName: APP_TABLE,
    Key: {
      id,
      meta,
    },
  });

  if (!result.Item)
    return createResponse(404, { message: 'Configuration not found.' });

  const configuration = result.Item;
  const { collections, products } = configuration;

  const params = {
    TableName: APP_TABLE,
    ...db.buildData(
      { payload: { done: false }, meta, id },
      'ConfigurationUpdate'
    ),
  };
  await db.update(params);
  await invoke(PRODUCTS_WORKER, {
    shop,
    id,
    meta,
    collections,
    existingProducts: products,
  });

  return createResponse(200, { ...result.Item, done: false });
};

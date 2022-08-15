import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  createResponse,
  isExistingShop,
  isNotAllowedMethod,
  verifyToken,
} from 'utils';
import { getProducts } from '../shopify-api';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (isNotAllowedMethod(event.httpMethod, ['GET'])) {
    return createResponse(405, { message: 'Method not allowed' });
  }

  const authToken = event.headers['Authorization'];
  if (!authToken || !authToken.length)
    return createResponse(401, {
      message: 'Unauthorized. No Authentication token present.',
    });

  const decoded = verifyToken(authToken);
  if (decoded.error || !decoded.shop) {
    return createResponse(401, {
      message: decoded.message,
    });
  }
  const shop = decoded.shop;

  try {
    const existingShop = await isExistingShop(shop);
    if (!existingShop) {
      return createResponse(404, {
        message: 'Not found. Shop for requested data not found.',
      });
    }

    const cursor: string =
      (event.queryStringParameters && event.queryStringParameters.cursor) || '';

    const limit: number =
      parseInt(
        event.queryStringParameters && event.queryStringParameters.limit
      ) || 30;

    const search: string =
      (event.queryStringParameters && event.queryStringParameters.search) || '';

    const products = await getProducts({
      shop,
      accessToken: existingShop.accessToken,
      cursor,
      limit: limit > 30 || limit < 1 ? 30 : limit,
      search,
    });
    return createResponse(200, { products });
  } catch (e) {
    return createResponse(500, { message: e.message });
  }
};

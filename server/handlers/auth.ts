import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import db from 'dynamodb';
import {
  createResponse,
  createToken,
  generateAuthUrl,
  getShopifyAccessToken,
  isExistingShop,
  isNotAllowedMethod,
  isValidRequest,
  isValidShopDomain,
} from '../utils';

const APP_TABLE = process.env.APP_TABLE;

const handleRequest = {
  install: async (evt: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
      const payload = JSON.parse(evt.body);
      const isValidInstallRequest =
        payload.shop && payload.code && payload.state;
      const existingShop = await isExistingShop(payload.shop);

      const isUnauthorisedRequest =
        !isValidInstallRequest ||
        !isValidRequest(
          payload,
          payload.state,
          existingShop && existingShop.shopifyApiSecret
            ? existingShop.shopifyApiSecret
            : ''
        ) ||
        !isValidShopDomain(payload.shop);

      if (isUnauthorisedRequest) {
        createResponse(401, { message: 'Unauthorized' });
      }

      const accessKeyData = await getShopifyAccessToken(
        payload.shop,
        payload.code,
        existingShop && existingShop.shopifyApiKey
          ? existingShop.shopifyApiKey
          : '',
        existingShop && existingShop.shopifyApiSecret
          ? existingShop.shopifyApiSecret
          : ''
      );

      if (!accessKeyData['access_token']) {
        return createResponse(400, {
          message: 'Bad request. Unable to get Shopify access token',
        });
      }

      const accessToken = accessKeyData['access_token'];

      const timestamp = Date.now();
      const params = {
        TableName: APP_TABLE,
        Key: { id: payload.shop, meta: 'installed' },
        UpdateExpression:
          'set #accessToken = :accessToken, #installed = :installed, #createdAt = :createdAt',
        ExpressionAttributeNames: {
          '#accessToken': 'accessToken',
          '#installed': 'installed',
          '#createdAt': 'createdAt',
        },
        ExpressionAttributeValues: {
          ':accessToken': accessToken,
          ':installed': true,
          ':createdAt': timestamp,
        },
      };
      await db.update(params);
      return createResponse(200);
    } catch (e) {
      console.log('ÖÖG: ', e.message);
      return createResponse(500, { message: e.message });
    }
  },
  auth: async (evt: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    try {
      const payload = JSON.parse(evt.body);
      if (!payload.shop) {
        return createResponse(401, { message: 'Unauthorized.' });
      }

      const existingShop = await isExistingShop(payload.shop);

      if (
        !isValidRequest(
          payload,
          null,
          existingShop && existingShop.shopifyApiSecret
            ? existingShop.shopifyApiSecret
            : ''
        )
      ) {
        return createResponse(401, { message: 'Unauthorized.' });
      }

      if (!existingShop || !existingShop.installed) {
        const apiKey = existingShop ? existingShop.shopifyApiKey : '';
        return createResponse(200, {
          authUrl: generateAuthUrl(payload.shop, apiKey),
        });
      }
      const token = createToken({ shop: payload.shop });
      return createResponse(200, { token });
    } catch (e) {
      return createResponse(500, { message: e.message });
    }
  },
};

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (isNotAllowedMethod(event.httpMethod, ['POST'])) {
    return createResponse(405, { message: 'Method not allowed' });
  }

  const isInstallRequest = event.path.includes('/install');
  if (isInstallRequest) return handleRequest['install'](event);
  return handleRequest['auth'](event);
};

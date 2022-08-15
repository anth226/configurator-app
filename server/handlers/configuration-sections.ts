import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import db from '../dynamodb';
import {
  createResponse,
  isNotAllowedMethod,
  removePhotos,
  verifyToken,
} from 'utils';
const APP_TABLE = process.env.APP_TABLE;

const handleRequest = {
  POST: async (
    evt: APIGatewayEvent,
    shop: string
  ): Promise<APIGatewayProxyResult> => {
    try {
      const { meta } = evt.pathParameters;
      if (!meta)
        return createResponse(400, {
          message: 'Bad request. Missing configuration meta marameter.',
        });
      const payload = JSON.parse(evt.body) || { name: null, photo: null };
      const { name, photo } = payload;
      const configurationId = `${shop}-configuration`;
      const params = {
        TableName: APP_TABLE,
        ...db.buildData(
          {
            id: configurationId,
            meta,
            payload: {
              id: uuid(),
              name: name || `section-${Date.now()}`,
              photo: photo || null,
            },
          },
          'ConfigurationSection'
        ),
      };
      await db.update(params);
      return createResponse(200, {
        message: 'Ok',
      });
    } catch (e) {
      return createResponse(500, { message: e.message });
    }
  },
  PUT: async (
    evt: APIGatewayEvent,
    shop: string
  ): Promise<APIGatewayProxyResult> => {
    try {
      const payload = JSON.parse(evt.body);
      const { meta, sectionId } = evt.pathParameters;
      const id = `${shop}-configuration`;

      const result = await db.get({
        TableName: APP_TABLE,
        Key: {
          id,
          meta,
        },
      });

      if (!result.Item)
        return createResponse(404, {
          message: `Not found. Configuration with meta ${meta} cannot be found.`,
        });

      const index =
        result.Item.sections &&
        result.Item.sections.findIndex((section) => section.id === sectionId);

      if (~index) {
        const params = {
          TableName: APP_TABLE,
          ...db.buildData(
            { payload, meta, id, index },
            'ConfigurationSectionUpdate'
          ),
        };
        await db.update(params);

        return createResponse(200, {
          message: 'Ok',
        });
      }

      return createResponse(404, {
        message: `Not found. Section with id ${sectionId} not found.`,
      });
    } catch (e) {
      return createResponse(500, { message: e.message });
    }
  },
  DELETE: async (
    evt: APIGatewayEvent,
    shop: string
  ): Promise<APIGatewayProxyResult> => {
    try {
      const { meta, sectionId } = evt.pathParameters;
      const id = `${shop}-configuration`;

      const result = await db.get({
        TableName: APP_TABLE,
        Key: {
          id,
          meta,
        },
      });

      if (!result.Item) return createResponse(200, { message: 'Ok' });

      const index =
        result.Item.sections &&
        result.Item.sections.findIndex((section) => section.id === sectionId);

      const orderIndex =
        result.Item.sectionOrder &&
        result.Item.sectionOrder.findIndex((id) => id === sectionId);

      if (~index) {
        if (result.Item.sections[index].photo) {
          await removePhotos(result.Item.sections[index].photo);
        }

        const params = {
          TableName: APP_TABLE,
          ...db.buildData(
            { meta, id, index, orderIndex },
            'ConfigurationSectionDelete'
          ),
        };
        await db.update(params);
      }

      return createResponse(200, {
        message: 'Ok',
      });
    } catch (e) {
      return createResponse(500, { message: e.message });
    }
  },
};

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (isNotAllowedMethod(event.httpMethod, ['POST', 'DELETE', 'PUT'])) {
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
  return handleRequest[event.httpMethod](event, shop);
};

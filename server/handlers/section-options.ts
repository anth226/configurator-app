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
      const { meta, sectionId } = evt.pathParameters;
      if (!meta || !sectionId)
        return createResponse(400, {
          message:
            'Bad request. Missing configuration meta or sectionId parameter.',
        });
      const payload = JSON.parse(evt.body) || { name: null, photo: null, sayduckIDs: null };
      const { name, photo, sayduckIds } = payload;

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
            {
              payload: {
                id: uuid(),
                name: name || `option-${Date.now()}`,
                photo: photo || null,
                actions: null,
                sayduckIds: sayduckIds || null,
              },
              meta,
              id,
              index,
            },
            'SectionOption'
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
  PUT: async (
    evt: APIGatewayEvent,
    shop: string
  ): Promise<APIGatewayProxyResult> => {
    try {
      const { meta, sectionId, optionId } = evt.pathParameters;
      if (!meta || !sectionId || !optionId)
        return createResponse(400, {
          message:
            'Bad request. Missing configuration meta, sectionId or optionId parameter.',
        });
      const payload = JSON.parse(evt.body);
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
        const optionIndex =
          result.Item.sections[index].options &&
          result.Item.sections[index].options.findIndex(
            (option) => option.id === optionId
          );

        if (~optionIndex) {
          const params = {
            TableName: APP_TABLE,
            ...db.buildData(
              {
                payload,
                meta,
                id,
                index,
                optionIndex,
              },
              'SectionOptionUpdate'
            ),
          };
          await db.update(params);

          return createResponse(200, {
            message: 'Ok',
          });
        }
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
      const { meta, sectionId, optionId } = evt.pathParameters;
      const id = `${shop}-configuration`;

      if (!meta || !sectionId || !optionId)
        return createResponse(400, {
          message:
            'Bad request. Missing required marameters. Request should have "meta", "sectionId" and "optionId" parameters.',
        });

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

      if (~index) {
        const optionIndex =
          result.Item.sections[index].options &&
          result.Item.sections[index].options.findIndex(
            (option) => option.id === optionId
          );
        const optionOrderIndex =
          result.Item.sections[index].optionOrder &&
          result.Item.sections[index].optionOrder.findIndex(
            (o) => o === optionId
          );

        if (~optionIndex) {
          if (result.Item.sections[index].options[optionIndex].photo) {
            await removePhotos(
              result.Item.sections[index].options[optionIndex].photo
            );
          }
          const params = {
            TableName: APP_TABLE,
            ...db.buildData(
              { meta, id, index, optionIndex, optionOrderIndex },
              'SectionOptionDelete'
            ),
          };
          await db.update(params);
        }
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

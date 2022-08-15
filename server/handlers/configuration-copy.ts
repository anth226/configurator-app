import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, isNotAllowedMethod, verifyToken } from 'utils';
import copyPhoto from 'utils/copyPhoto';
import getFileExtension from 'utils/getFileExtension';
import { v4 as uuid } from 'uuid';
import db from '../dynamodb';
const { APP_TABLE } = process.env;

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

  const copyMeta = uuid();

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

  const result = await db.get({
    TableName: APP_TABLE,
    Key: {
      id: `${shop}-configuration`,
      meta,
    },
  });

  if (!result.Item)
    return createResponse(404, { message: 'Configuration not found.' });

  const configuration = result.Item;
  if (configuration.photo) {
    const extension = getFileExtension(configuration.photo);
    const newPhoto = `${copyMeta}.${extension}`;

    await copyPhoto(configuration.photo, newPhoto);
    configuration.photo = newPhoto;
  }

  if (configuration.sections) {
    configuration.sections = await configuration.sections.reduce(
      async (promise, next) => {
        const acc = await promise;
        if (next.photo) {
          const fileExtension = getFileExtension(next.photo);
          const copyFileName = `${uuid()}.${fileExtension}`;
          await copyPhoto(next.photo, copyFileName);
          next.photo = copyFileName;
        }

        if (next.options) {
          next.options = await next.options.reduce(
            async (promiseObj, current) => {
              const final = await promiseObj;
              if (current.photo) {
                const fileExt = getFileExtension(current.photo);
                const copyName = `${uuid()}.${fileExt}`;
                await copyPhoto(current.photo, copyName);
                current.photo = copyName;
              }

              return Promise.resolve([...final, current]);
            },
            Promise.resolve([])
          );
        }

        return Promise.resolve([...acc, next]);
      },
      Promise.resolve([])
    );
  }

  if (configuration.products) {
    configuration.products = await configuration.products.reduce(
      async (prom, product) => {
        const all = await prom;
        if (product.meta) {
          const { id, meta } = product;
          const ref = await db.get({
            TableName: APP_TABLE,
            Key: {
              id,
              meta,
            },
          });

          if (ref.Item) {
            const newRef = uuid();
            await db.put({
              TableName: APP_TABLE,
              Item: { ...ref.Item, meta: newRef },
            });

            product.meta = newRef;
          }
        }

        return Promise.resolve([...all, product]);
      },
      Promise.resolve([])
    );
  }

  const Item = {
    ...configuration,
    name: `${configuration.name} copy`,
    meta: copyMeta,
  };
  await db.put({
    TableName: APP_TABLE,
    Item,
  });

  return createResponse(200, Item);
};

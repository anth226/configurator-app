import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { createResponse, isNotAllowedMethod } from 'utils';

const s3 = new S3({ signatureVersion: 'v4' });
export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (isNotAllowedMethod(event.httpMethod, ['POST'])) {
      return createResponse(405, { message: 'Method not allowed' });
    }

    // const authToken = event.headers['Authorization'];
    // if (!authToken || !authToken.length)
    //   return createResponse(401, {
    //     message: 'Unauthorized. No Authentication token present.',
    //   });

    // const decoded = verifyToken(authToken);
    // if (decoded.error || !decoded.shop) {
    //   return createResponse(401, {
    //     message: decoded.message,
    //   });
    // }

    // if (!event.queryStringParameters || !event.queryStringParameters.shop) {
    //   return createResponse(404, { message: "No shop found" });
    // }

    // const shop = event.queryStringParameters.shop;

    // if (!event.queryStringParameters || !event.queryStringParameters.saved) {
    //   return createResponse(404, { message: "No saved configuration id found" });
    // }

    // let id: string | null = null;
    // support image upload also for section and section options
    // if (event.path.includes('sections') || event.path.includes('options')) {
    //   id = uuid();
    // }

    // if (event.queryStringParameters.saved) {
    //   id = event.queryStringParameters.saved;
    // }

    if (!event.pathParameters || !event.pathParameters.meta) {
      return createResponse(400, {
        message: 'Bad request. Target configuration id not specified.',
      });
    }
    const { meta } = event.pathParameters;

    const payload = JSON.parse(event.body || '{}');
    if (!payload.filename || !payload.contentType) {
      return createResponse(400, {
        message:
          'Bad request. Payload should include filename and contentType properties.',
      });
    }

    const { filename, contentType } = payload;

    const file = filename.split('.');
    const fileExtension = file[file.length - 1];

    const req: S3.Types.PutObjectRequest = {
      Bucket: process.env.S3_BUCKET,
      Key: `${meta}.${fileExtension}`,
      ContentType: contentType,
    };

    // get the signed url from S3
    const signedUrl = await s3.getSignedUrlPromise('putObject', req);
    return createResponse(200, {
      signedUrl,
      meta,
      file: `${meta}.${fileExtension}`,
    });
  } catch (e) {
    return createResponse(500, { message: e.message });
  }
};

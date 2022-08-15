import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { createResponse } from 'utils';
import sharp from 'sharp';
import * as stream from 'stream';

const s3 = new S3({ signatureVersion: 'v4' });
export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const URL = `https://${process.env.S3_BUCKET}.s3.${process.env.REGION}.amazonaws.com`;
    const sizeMap = {
      thumbnail: 96,
      medium: 250,
    };

    const size =
      (event.queryStringParameters && event.queryStringParameters.size) ||
      'thumbnail';

    if (!['thumbnail', 'medium', 'original'].includes(size)) {
      return createResponse(400, {
        message:
          'Bad request. Alowed size parameters are: "thumbnail", "medium" and "original".',
      });
    }

    if (!event.pathParameters || !event.pathParameters.image) {
      return createResponse(400, {
        message: 'Bad request. Specify an image to get.',
      });
    }
    const { image } = event.pathParameters;

    if (size === 'original') {
      return createResponse(301, {}, { location: `${URL}/${image}` });
    }

    const resize = sharp()
      .resize(sizeMap[size], sizeMap[size], { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFormat('png');

    const readStream = s3
      .getObject({ Bucket: process.env.S3_BUCKET, Key: image })
      .createReadStream();

    const writeStream = new stream.PassThrough();
    readStream.pipe(resize).pipe(writeStream);

    const fileName = [...image.split('.')];
    fileName.length = fileName.length - 1;

    await s3
      .upload({
        ContentType: 'image/png',
        Body: writeStream,
        Bucket: process.env.S3_BUCKET,
        Key: `${sizeMap[size]}/${fileName.join('.')}.png`,
      })
      .promise();

    return createResponse(
      301,
      {},
      { location: `${URL}/${sizeMap[size]}/${fileName.join('.')}.png` }
    );
  } catch (e) {
    return createResponse(500, { message: e.message });
  }
};

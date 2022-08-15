import { S3 } from 'aws-sdk';

const s3 = new S3({ signatureVersion: 'v4' });
export default async (image: string) => {
  try {
    const fileName = [...image.split('.')];
    fileName.length = fileName.length - 1;
    return await Promise.all([
      s3
        .deleteObject({
          Bucket: process.env.S3_BUCKET,
          Key: `96/${fileName.join('.')}.png`,
        })
        .promise(),
      s3
        .deleteObject({
          Bucket: process.env.S3_BUCKET,
          Key: `250/${fileName.join('.')}.png`,
        })
        .promise(),
      s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: image }).promise(),
    ]);
  } catch (e) {
    // console.log('ERR: ', e);
    return;
  }
};

import { S3 } from 'aws-sdk';
const s3 = new S3({ signatureVersion: 'v4' });

export default async (image: string, imageCopy: string) => {
  try {
    return await s3
      .copyObject({
        Bucket: process.env.S3_BUCKET,
        CopySource: `/${process.env.S3_BUCKET}/${image}`,
        Key: imageCopy,
      })
      .promise();
  } catch (e) {
    // console.log('ERR: ', e);
    return e;
  }
};

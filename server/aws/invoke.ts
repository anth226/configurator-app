import * as AWS from 'aws-sdk';
const IS_OFFLINE = process.env.IS_OFFLINE;
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

if (IS_OFFLINE) {
  AWS.config.update({
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });
}
const lambda = IS_OFFLINE
  ? new AWS.Lambda({ endpoint: 'http://localhost:3002' })
  : new AWS.Lambda();

export default (
  name: string,
  payload: Record<string, unknown>
): Promise<void> => {
  return new Promise((resolve) => {
    const params = {
      FunctionName: name,
      InvocationType: 'Event',
      LogType: 'Tail',
      Payload: JSON.stringify(payload),
    };

    lambda.invoke(params, function (err) {
      if (err) {
        console.log('INVOKE ERR: ', err);
        throw err;
      }
      return resolve();
    });
  });
};

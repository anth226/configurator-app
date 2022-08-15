import * as AWS from 'aws-sdk';
import { dataBuilder } from './data-builder';
// This is provided by the serverless-offline plugin
const IS_OFFLINE = process.env.IS_OFFLINE;

let dynamoDb;
if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8001',
  });
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

const get = async (
  params: object
): Promise<AWS.DynamoDB.DocumentClient.GetItemOutput> => {
  try {
    return await dynamoDb.get(params).promise();
  } catch (e) {
    throw e;
  }
};

const put = async (
  params: object
): Promise<AWS.DynamoDB.DocumentClient.PutItemOutput> => {
  try {
    return await dynamoDb.put(params).promise();
  } catch (e) {
    throw e;
  }
};

const query = async (
  params: object
): Promise<AWS.DynamoDB.DocumentClient.QueryOutput> => {
  try {
    return await dynamoDb.query(params).promise();
  } catch (e) {
    throw e;
  }
};

const update = async (
  params: object
): Promise<AWS.DynamoDB.DocumentClient.UpdateItemOutput> => {
  try {
    return await dynamoDb.update(params).promise();
  } catch (e) {
    throw e;
  }
};

const del = async (
  params: object
): Promise<AWS.DynamoDB.DocumentClient.DeleteItemOutput> => {
  try {
    return await dynamoDb.delete(params).promise();
  } catch (e) {
    throw e;
  }
};

export default { get, put, query, update, delete: del, buildData: dataBuilder };

import { APIGatewayProxyResult } from 'aws-lambda';

export default async (
  statusCode: number,
  body = {},
  headers = {}
): Promise<APIGatewayProxyResult> => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    ...headers,
  },
  body: JSON.stringify(body),
});

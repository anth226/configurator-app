import db from '../dynamodb';
const APP_TABLE = process.env.APP_TABLE;

export interface Shop {
  id: string;
  meta: 'installed';
  accessToken: string;
  createdAt: number;
  installed: boolean;
  shopifyApiKey?: string;
  shopifyApiSecret?: string;
}

export default async (shop: string): Promise<Shop | null> => {
  const result = await db.get({
    TableName: APP_TABLE,
    Key: {
      id: shop,
      meta: 'installed',
    },
  });
  return (result.Item as Shop) || null;
};

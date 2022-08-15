import * as jwt from 'jsonwebtoken';
const APP_TOKEN_SECRET = process.env.APP_TOKEN_SECRET;

interface TokenPayload {
  error?: boolean;
  message?: string;
  shop?: string;
}

export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, APP_TOKEN_SECRET) as TokenPayload;
    return decoded;
  } catch (e) {
    return { error: true, message: e.message };
  }
};

export const createToken = (payload): string =>
  jwt.sign(
    {
      ...payload,
    },
    APP_TOKEN_SECRET
  );

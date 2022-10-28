export const decodeJwtPayload = (token: string) => {
  const payload = token.split('.')[1];
  const decoded = Buffer.from(payload, 'base64').toString('utf-8');

  return JSON.parse(decoded);
};

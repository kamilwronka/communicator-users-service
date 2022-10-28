export const formatUserId = (userId: string): string => {
  return userId.replace('auth0|', '');
};

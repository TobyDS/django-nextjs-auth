const parseCookieExpiry = (cookies: string | null): string | null => {
  const match = cookies?.match(/access_token=[^;]+;\s*expires=([^;]+)/);
  if (!match) return null;

  const expiryDate = new Date(match[1]);
  if (isNaN(expiryDate.getTime())) return null;

  return expiryDate.toISOString();
};
export default parseCookieExpiry;

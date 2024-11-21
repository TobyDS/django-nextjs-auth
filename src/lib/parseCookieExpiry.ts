const parseCookieExpiry = (cookies: string | null): string | null => {
  const match = cookies?.match(/access_token=[^;]+;\s*expires=([^;]+)/);
  if (!match) return null;

  const expiryDate = match[1] ? new Date(match[1]) : new Date(NaN);
  if (isNaN(expiryDate.getTime())) return null;

  return expiryDate.toISOString();
};
export default parseCookieExpiry;

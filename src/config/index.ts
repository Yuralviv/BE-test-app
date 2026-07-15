export default () => {
  const redisUrl = process.env.REDIS_URL;
  let host = process.env.REDIS_HOST;
  let port = process.env.REDIS_PORT;
  let username = process.env.REDIS_USERNAME;
  let password = process.env.REDIS_PASSWORD;

  if (redisUrl) {
    try {
      const url = new URL(redisUrl);
      host = url.hostname;
      port = url.port || '6379';
      username = url.username || '';
      password = url.password || '';
    } catch {
      // ignore invalid REDIS_URL
    }
  }

  return {
    environment: process.env.NODE_ENV || `development`,
    jwt: {
      secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    },
    redis: {
      host,
      port,
      username,
      password,
      useRedis: Boolean(redisUrl),
    },
  };
};

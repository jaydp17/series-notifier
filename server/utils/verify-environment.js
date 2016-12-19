
export default function validate() {
  const sentryUrl = process.env.SENTRY_URL;
  if (!sentryUrl) {
    throw new Error('SENTRY_URL not found in env vars');
  }

  const pageToken = process.env.FB_PAGE_TOKEN;
  if (!pageToken) {
    throw new Error('FB_PAGE_TOKEN not found in env vars');
  }

  const verifyToken = process.env.FB_VERIFY_TOKEN;
  if (!verifyToken) {
    throw new Error('FB_VERIFY_TOKEN not found in env vars');
  }

  const tvdbApiKey = process.env.TVDB_API_KEY;
  if (!tvdbApiKey) {
    throw new Error('TVDB_API_KEY not found in env vars');
  }

  const traktApiKey = process.env.TRAKT_API_KEY;
  if (!traktApiKey) {
    throw new Error('TRAKT_API_KEY not found in env vars');
  }

  if (process.env.NODE_ENV === 'production') {
    const mongoURL = process.env.MONGO_URL;
    if (!mongoURL) {
      throw new Error('MONGO_URL not found in env vars');
    }
  }
}

export default () => ({
  host: process.env.APP_HOST || 'http://localhost',
  port: parseInt(process.env.PORT, 10) || 8080,
  productBaseURL: process.env.PRODUCT_BASEURL || '',
  version: process.env.APP_VERSION || '1.0.0',
  jwt: {
    secret: process.env.JWT_SECRET_KEY || '',
    expiresIn: process.env.JWT_EXPIRES || '1d',
  },
  database: process.env.MONGODB_URI || '',
  google: {
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  },
  facebook: {
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    FACEBOOK_REDIRECT_URI: process.env.FACEBOOK_REDIRECT_URI,
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX_NAME,
  },
});

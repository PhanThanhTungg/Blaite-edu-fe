// Environment configuration
export const config = {
  // App Configuration
  app: {
    name: 'AStudy',
    version: '1.0.0',
  },
  
  // Development Configuration
  development: {
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  },
} as const; 
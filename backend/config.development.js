// Development Configuration
export const developmentConfig = {
  // Server Configuration
  port: process.env.PORT || 3001,
  host: '0.0.0.0',
  
  // CORS Configuration
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  },
  
  // Database Configuration
  database: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true
  },
  
  // Logging
  logging: {
    level: 'info'
  }
}; 
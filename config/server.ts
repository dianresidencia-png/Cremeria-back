export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),       
  port: env.int('PORT', 1337),       
  url: env('STRAPI_ADMIN_BACKEND_URL', 'https://cremeria-back.onrender.com'), // URL pública
  admin: {
    serveAdminPanel: true,
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    url: env('ADMIN_PATH', '/admin'), 
  },
  app: {
    keys: env.array('APP_KEYS'),      
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },

  proxy: true,
  cron: {
    enabled: true,
  },
});


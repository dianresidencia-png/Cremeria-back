'use strict';

const strapi = require('@strapi/strapi');

async function migrateImages() {
  await strapi().load();

  const cloudinaryBase = 'https://res.cloudinary.com/TU_CLOUD_NAME/image/upload/';


  const products = await strapi.db.query('api::producto.producto').findMany();

  for (const product of products) {
    if (product.imagenes) {
      product.imagenes = product.imagenes.map(img => {
        // reemplaza 'http://localhost:1337' con tu URL de Cloudinary
        return img.replace('http://localhost:1337', cloudinaryBase);
      });

      await strapi.db.query('api::producto.producto').update({
        where: { id: product.id },
        data: { imagenes: product.imagenes },
      });
    }
  }

  console.log('Migración de imágenes completada ✅');
  process.exit(0);
}

migrateImages().catch(err => {
  console.error(err);
  process.exit(1);
});

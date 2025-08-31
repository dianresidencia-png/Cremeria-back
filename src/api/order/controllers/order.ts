/**
 * order controller
 */
import { factories } from "@strapi/strapi"
import { Producto } from "../../../../types/generated/producto"


if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está configurada en las variables de entorno');
}

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default factories.createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { productos } = ctx.request.body

    // Validación de entrada
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return ctx.throw(400, "La solicitud debe incluir un array de productos no vacío")
    }

    try {
      const lineItems = await Promise.all(
        productos.map(async (producto) => {
          // Validar que cada producto tenga un ID
          if (!producto.id) {
            throw new Error("Cada producto debe tener un ID")
          }

          // Obtener el producto con las relaciones populadas
          const item = await strapi.entityService.findOne(
            "api::producto.producto", 
            producto.id,
            {
              populate: {
                imagenes: {
                  fields: ['url', 'name', 'alternativeText']
                },
                categoria: {
                  fields: ['categoriaName', 'slug']
                }
              }
            }
          ) as Producto

          // Validar que el producto exista en la base de datos
          if (!item) {
            throw new Error(`Producto con ID ${producto.id} no encontrado`)
          }

          // Validar que el producto tenga un precio válido
          if (typeof item.precio !== "number" || item.precio <= 0) {
            throw new Error(`Precio inválido para el producto ${item.productoNombre}`)
          }

          const STRAPI_PUBLIC_URL = process.env.STRAPI_PUBLIC_URL || "http://localhost:1337";

          let imageUrl = "";
          if (item.imagenes && item.imagenes.length > 0) {
            const primeraImagen = item.imagenes[0];
            if (primeraImagen.url && primeraImagen.url.startsWith("/")) {
              imageUrl = `${STRAPI_PUBLIC_URL}${primeraImagen.url}`;
            } else if (primeraImagen.url && primeraImagen.url.startsWith("http")) {
              imageUrl = primeraImagen.url;
            }
          }


          return {
            price_data: {
              currency: "MXN",
              product_data: {
                name: item.productoNombre,
                description: item.descripcion || "",
                images: imageUrl ? [imageUrl] : [],
              },
              unit_amount: Math.round(parseFloat(item.precio.toString()) * 100), // Convertir a string primero
            },
            quantity: producto.cantidad || 1,
          }
        })
      )

      const session = await stripe.checkout.sessions.create({
        shipping_address_collection: {
          allowed_countries: ["MX"],
        },
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/success`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/successFalse`,
        line_items: lineItems,
        metadata: {
          order_created_at: new Date().toISOString(),
          total_items: productos.length.toString()
        }
      })

      // Crear la orden en la base de datos
      await strapi.service("api::order.order").create({
        data: {
          productos,
          stripeId: session.id,
          status: 'pending',
          total: lineItems.reduce((total, item) => 
            total + (item.price_data.unit_amount * (item.quantity || 1)), 0) / 100,
        },
      })

      ctx.send({ stripeSession: session })
    } catch (error) {
      console.error("Error al crear la orden:", error)
      
      if (error.message.includes("Producto con ID")) {
        ctx.throw(404, error.message)
      } else if (error.message.includes("Precio inválido") || error.message.includes("debe tener un ID")) {
        ctx.throw(400, error.message)
      } else {
        ctx.throw(500, "No se pudo crear la sesión de pago: " + error.message)
      }
    }
   
  },
}))
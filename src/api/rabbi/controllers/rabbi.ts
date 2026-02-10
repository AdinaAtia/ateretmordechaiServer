
import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::rabbi.rabbi',
  ({ strapi }) => ({

    // שליפה של רשומות שפורסמו + מיון לפי ID
    async find(ctx) {
      try {
        const entities = await strapi.db
          .query('api::rabbi.rabbi')
          .findMany({
            where: {
              publishedAt: { $notNull: true }, // רק רשומות שפורסמו
            },
            populate: {
              photo_url: true, // כולל מדיה
            },
            orderBy: {
              id: 'asc', // 🔹 מיון לפי ID מהקטן לגדול
            },
          });

        return { data: entities };
      } catch (err) {
        console.error('Error fetching published rabbis:', err);
        return ctx.internalServerError('Failed to fetch published rabbis');
      }
    },

    // פרסום רשומה
    async publish(ctx) {
      const { id } = ctx.params;

      if (!id) {
        return ctx.badRequest('Missing id parameter');
      }

      try {
        const updated = await strapi.db
          .query('api::rabbi.rabbi')
          .update({
            where: { id: Number(id) },
            data: { publishedAt: new Date().toISOString() },
          });

        return { data: updated };
      } catch (err) {
        console.error(err);
        return ctx.internalServerError('Failed to publish');
      }
    },
  })
);

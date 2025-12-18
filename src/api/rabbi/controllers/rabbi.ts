import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::rabbi.rabbi', ({ strapi }) => ({
  async find(ctx) {
    const entities = await strapi.db
      .query('api::rabbi.rabbi')
      .findMany({
        populate: { '*': true },
      });

    return { data: entities }; // כאן התיקון
  },
}));

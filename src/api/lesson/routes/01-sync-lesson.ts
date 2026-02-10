// src/api/lesson/routes/01-sync-lesson.ts
export default {
  routes: [
    {
      method: 'POST',
      path: '/lessons/sync',
      handler: 'api::lesson.lesson.sync', 
      config: {
        auth: false,
      },
    },
  ],
};
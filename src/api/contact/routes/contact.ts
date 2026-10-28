export default {
  routes: [
    {
      method: 'POST',
      path: '/contact/send',
      handler: 'contact.send',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/contact/lesson-feedback',
      handler: 'contact.lessonFeedback',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/contact/lesson-dedication',
      handler: 'contact.lessonDedication',
      config: { auth: false },
    },
  ],
};

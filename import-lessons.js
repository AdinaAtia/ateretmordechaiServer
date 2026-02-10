module.exports = {
  async bootstrap({ strapi }) {
    const fs = require('fs');
    
    // 1. טעינת קובץ ה-JSON (וודאי שהנתיב נכון)
    const rawData = JSON.parse(fs.readFileSync('./lessons.json', 'utf8'));

    // 2. סינון: רק השיעורים של הרב הספציפי (למשל ר' יואל חקון)
    // אם את רוצה את כולם, אפשר להוריד את ה-filter
    const filteredLessons = rawData.filter(item => item.rabi === "ר' יואל חקון");

    // 3. מיון מהישן לחדש (לפי התאריך הלועזי שבתוך השדה)
    const sortedLessons = filteredLessons.sort((a, b) => {
      const dateA = a.lessonDateTime.match(/\d{2}\.\d{2}\.\d{4}/)[0].split('.').reverse().join('-');
      const dateB = b.lessonDateTime.match(/\d{2}\.\d{2}\.\d{4}/)[0].split('.').reverse().join('-');
      return new Date(dateA) - new Date(dateB);
    });

    console.log(`Starting to import ${sortedLessons.length} lessons...`);

    // 4. לולאת הכנסה לטבלת ה-Lesson
    for (const item of sortedLessons) {
      try {
        const datePart = item.lessonDateTime.match(/\d{2}\.\d{2}\.\d{4}/)[0].split('.').reverse().join('-');
        
        await strapi.entityService.create('api::lesson.lesson', {
          data: {
            title: item.lessonName,
            lesson_date_gregorian: datePart,
            lesson_date_hebrew: item.lessonDateTime.split(/\d{2}\./)[0].trim(),
            duration: item.lessonDuration,
            views: parseInt(item.views) || 0,
            youtube_id: item.lessonId, // משתמש ב-ID מהקובץ
            publishedAt: new Date(),
          },
        });
      } catch (err) {
        console.error(`Failed to import: ${item.lessonName}`, err.message);
      }
    }
    console.log('Import finished successfully!');
  },
};
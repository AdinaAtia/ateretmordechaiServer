// // const axios = require('axios');
// // const { parseStringPromise } = require('xml2js');
// // const hebcal = require('hebcal');

// // const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjCwvHzEeN0dGO4eaaQi6KQ';

// // module.exports = {
// //   async bootstrap({ strapi }) {
// //     try {
// //       console.log('--- מתחיל סנכרון נתונים מהסוף להתחלה ---');

// //       const response = await axios.get(RSS_URL);
// //       const rssResult = await parseStringPromise(response.data);
// //       const entries = rssResult.feed.entry || [];

// //       // הופכים את הרשימה כדי לעבד קודם את הישנים יותר ולהגיע לחדשים בסוף, 
// //       // או פשוט רצים בלולאה הפוכה כדי שהחדש ביותר יוכנס אחרון.
// //       // הגישה הכי בטוחה: לעבור מהישן לחדש (מבחינת ה-RSS) כדי שהחדשים יקבלו ID גבוה יותר ב-DB
// //       for (let i = entries.length - 1; i >= 0; i--) {
// //         const entry = entries[i];
// //         const videoId = entry['yt:videoId'][0];

// //         // 1. בדיקה האם קיים לפי מזהה יוטיוב ייחודי
// //         const existingLessons = await strapi.documents('api::lesson.lesson').findMany({
// //           filters: { youtube_id: videoId },
// //         });

// //         if (existingLessons.length > 0) {
// //           // אם קיים, פשוט ממשיכים לבא בתור (לא עוצרים עם break כדי לא לפספס)
// //           continue; 
// //         }

// //         const rawTitle = entry.title[0];
// //         const gregorianDate = entry.published[0].split('T')[0];
// //         const hdate = new hebcal.HDate(new Date(gregorianDate));
// //         const hebrewDate = hdate.toString('h');

// //         const parts = rawTitle.split(' - ');
// //         const rabbiName = parts[0].trim();
// //         const cleanTitle = parts.length > 1 ? parts.slice(1).join(' - ').trim() : rawTitle;

// //         const rabbiRecords = await strapi.documents('api::rabbi.rabbi').findMany({
// //           filters: { name: rabbiName },
// //         });
// //         const rabbiRecord = rabbiRecords[0];

// //         // 2. הכנסה ל-DB
// //         await strapi.documents('api::lesson.lesson').create({
// //           data: {
// //             title: cleanTitle,
// //             lesson_date_gregorian: gregorianDate,
// //             lesson_date_hebrew: hebrewDate,
// //             youtube_id: videoId,
// //             rabbi: rabbiRecord ? rabbiRecord.id : null,
// //             locale: 'en',
// //             publishedAt: new Date(), // מבטיח שזמן הפרסום יהיה עכשיו
// //           },
// //           status: 'published',
// //         });

// //         console.log(`🌟 נוסף שיעור חדש: ${cleanTitle}`);
// //       }

// //       console.log('--- הסנכרון הסתיים בהצלחה ---');
// //     } catch (err) {
// //       console.error('שגיאה בסנכרון:', err.message);
// //     }
// //   },
// // };
'use strict';

const path = require('path');

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
    // בניית נתיב מוחלט לקובץ
    const scriptPath = path.join(process.cwd(), 'import-script.js');
    
    console.log('🚀 מנסה לטעון את הסקריפט מתוך:', scriptPath);

    try {
      const importer = require(scriptPath);
await importer({ strapi }); // מעביר את האובייקט של סטרפי לתוך הסקריפט      console.log('✅ הייבוא הסתיים בהצלחה!');
    } catch (err) {
      console.error('❌ שגיאה בתהליך הייבוא:');
      console.error(err.message);
    }
  },
};
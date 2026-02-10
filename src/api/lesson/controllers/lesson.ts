// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import { parseStringPromise } from 'xml2js';
// import hebcal from 'hebcal';

// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk';
// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';
// const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjCwvHzEeN0dGO4eaaQi6KQ';

// const HEADERS_CONFIG = {
//   headers: {
//     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//   }
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     const axiosConfig = {
//       headers: { 'User-Agent': 'Mozilla/5.0' }
//     };

//     try {
//       // צילום image_744589.png
//       console.log('🔵...בודק שלב 1: פרטי ערוץ');
//       const channelRes = await axios.get(
//         `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`,
//         axiosConfig
//       );

//       const uploadsPlaylistId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;
//       console.log('✅ שלב 1 עבר! פלייליסט:', uploadsPlaylistId);

//       // צילום image_744572.png
//       console.log('🔵...בודק שלב 2: רשימת סרטונים');
//       const playlistRes = await axios.get(
//         `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=30&key=${YOUTUBE_API_KEY}`,
//         axiosConfig
//       );

//       // צילום image_74494c.png
//       console.log('✅ שלב 2 עבר! נמצאו סרטונים.');
      
//       // צילום image_694cc9.png
//       console.log('🚀...מתחיל סנכרון עם הגדרות עקיפה');
//       const response = await axios.get(RSS_URL, HEADERS_CONFIG);
//       const rssResult = await parseStringPromise(response.data);
//       const entries = rssResult.feed.entry || [];
//       let newCount = 0;

//       // צילום image_68fa6d.png
//       for (let i = entries.length - 1; i >= 0; i--) {
//         const entry = entries[i];
//         const videoId = entry['yt:videoId'][0];
//         const rawTitle = entry.title[0];

//         const existing = await strapi.documents('api::lesson.lesson').findMany({
//           filters: { youtube_id: videoId },
//         });

//         if (existing.length === 0) {
//           const parts = rawTitle.split(' - ');
//           const rabbiName = parts[0].trim();
//           const cleanTitle = parts.length > 1 ? parts.slice(1).join(' - ').trim() : rawTitle;

//           const rabbiRecords = await strapi.documents('api::rabbi.rabbi').findMany({
//             filters: { name: rabbiName },
//           });

//           const publishedDate = entry.published[0];

//           await strapi.documents('api::lesson.lesson').create({
//             data: {
//               title: cleanTitle,
//               youtube_id: videoId,
//               duration: "00:00",
//               lesson_date_gregorian: publishedDate.split('T')[0],
//               lesson_date_hebrew: new hebcal.HDate(new Date(publishedDate)).toString('h'),
//               rabbi: rabbiRecords[0] ? (rabbiRecords[0] as any).id : null,
//               publishedAt: new Date(),
//               locale: 'en'
//             },
//             status: 'published',
//           });
          
//           newCount++;
//         }
//       }

//       return { message: `סנכרון הושלם. נוספו ${newCount} שיעורים.` };

//     } catch (err: any) {
//       // צילום image_744572.png - Catch Block
//       const failedUrl = err.config?.url;
//       console.error('❌ נחסם בכתובת:', failedUrl);

//       if (err.response?.data?.blockByNetFree) {
//         return ctx.badRequest(`NetFree Blocked this URL: ${failedUrl}`);
//       }
      
//       return ctx.badRequest('Error: ' + err.message);
//     }
//   },
// }));

import { factories } from '@strapi/strapi';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import hebcal from 'hebcal';

const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjCwvHzEeN0dGO4eaaQi6KQ';
const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk'; 

// הוצאת הפונקציה החוצה - מבטיח שהיא זמינה תמיד ולא מפריעה לאתחול משתנים
const formatDuration = (pt) => {
    if (!pt) return "00:00";
    const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "00:00";
    const h = parseInt(match[1] || 0);
    const m = parseInt(match[2] || 0);
    const s = parseInt(match[3] || 0);
    return h > 0 
        ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
        : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
  async sync(ctx) {
    try {
      console.log('--- התחלת תהליך סנכרון ---');

      // שלב 1: משיכת ה-RSS
      let rssResponse = await axios.get(RSS_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });

      // שלב 2: פירוח ה-XML
      const rssResult = await parseStringPromise(rssResponse.data);
      const entries = rssResult.feed.entry || [];
      if (entries.length === 0) return { message: "אין סרטונים לסנכרון" };

      const videoIds = entries.map(e => e['yt:videoId'][0]);

      // שלב 3: YouTube API למשך זמן
      let videoDetailsMap = {};
      const videoDetailsRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`);
      videoDetailsRes.data.items.forEach(item => {
        videoDetailsMap[item.id] = item.contentDetails.duration;
      });

      // שלב 4: שליפת רבנים מסטראפי (קורה לפני הלולאה!)
      const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
      console.log(`✅ נשלפו ${allRabbis.length} רבנים.`);

      // שלב 5: לולאת עיבוד ויצירה
      let newCount = 0;

      for (const entry of entries) {
        const videoId = entry['yt:videoId'][0];
        const rawTitle = entry.title[0];

        try {
          const existing = await strapi.db.query('api::lesson.lesson').findOne({
            where: { youtube_id: videoId }
          });

          if (!existing) {
            console.log(`   - יוצר שיעור חדש: ${rawTitle}`);
            
            const duration = videoDetailsMap[videoId] ? formatDuration(videoDetailsMap[videoId]) : "00:00";
            const publishedDate = entry.published[0];
            
            // שיפור זיהוי הרב: הסרת "הרב" מהשם בסטראפי לצורך השוואה גמישה
            const foundRabbi = allRabbis.find(r => {
                const cleanName = r.name.replace('הרב', '').trim();
                return rawTitle.includes(cleanName);
            });

            const parts = rawTitle.split(' - ');
            const cleanTitle = parts.length > 1 ? parts.slice(1).join(' - ').trim() : rawTitle;

            await strapi.documents('api::lesson.lesson').create({
              data: {
                title: cleanTitle,
                youtube_id: videoId,
                duration: duration,
                lesson_date_gregorian: publishedDate.split('T')[0],
                lesson_date_hebrew: new hebcal.HDate(new Date(publishedDate)).toString('h'),
                rabbi: foundRabbi ? foundRabbi.id : null,
                publishedAt: new Date(),
                locale: 'en'
              },
              status: 'published',
            });
            newCount++;
          }
        } catch (innerError) {
          console.error(`   ❌ שגיאה בעיבוד סרטון ${videoId}:`, innerError.message);
        }
      }

      return { message: `הסנכרון הושלם. נוספו ${newCount} שיעורים.` };

    } catch (err) {
      console.error('🔥 שגיאה קריטית בתהליך:', err.message);
      return ctx.badRequest(err.message);
    }
  },
}));
//50 שיעורים אחרונים???????????????????????????????????????????????????????????????????????????????????????????????????????????.
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import { parseStringPromise } from 'xml2js';
// import hebcal from 'hebcal';

// const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjCwvHzEeN0dGO4eaaQi6KQ';

// const HEADERS_CONFIG = {
//   headers: {
//     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//   }
// };

// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkvlyfjChuPRiPfwvK5N-Lk'; // נלקח מהקוד שלך

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('🚀...מתחיל סנכרון 50 שיעורים אחרונים');
      
//       // שלב 1: קבלת מזהה ה-Playlist של ההעלאות (Uploads)
//       const channelRes = await axios.get(
//         `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=UCjCwvHzEeN0dGO4eaaQi6KQ&key=${YOUTUBE_API_KEY}`,
//         HEADERS_CONFIG
//       );
      
//       const uploadsPlaylistId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

//       // שלב 2: משיכת 50 סרטונים (שינוי maxResults ל-50)
//       const playlistRes = await axios.get(
//         `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`,
//         HEADERS_CONFIG
//       );

//       const items = playlistRes.data.items;
//       console.log(`✅ נמצאו ${items.length} סרטונים! מתחיל עיבוד...`);
      
//       // שליפת כל הרבנים מראש כדי למנוע קריאות מרובות בתוך הלולאה
//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
      
//       let newCount = 0;

//       for (let i = items.length - 1; i >= 0; i--) {
//         const item = items[i];
//         const videoId = item.snippet.resourceId.videoId;
//         const rawTitle = item.snippet.title;

//         const existing = await strapi.documents('api::lesson.lesson').findMany({
//           filters: { youtube_id: videoId },
//         });

//         if (existing.length === 0) {
//           // --- חילוץ משך זמן (Scraping שעוקף חסימת נטפרי) ---
//           let duration = "00:00";
//           try {
//             const videoPage = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, HEADERS_CONFIG);
//             const match = videoPage.data.match(/"approxDurationMs":"(\d+)"/);
            
//             if (match) {
//               const ms = parseInt(match[1]);
//               const totalSeconds = Math.floor(ms / 1000);
//               const h = Math.floor(totalSeconds / 3600);
//               const m = Math.floor((totalSeconds % 3600) / 60);
//               const s = totalSeconds % 60;
//               duration = h > 0 
//                 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
//                 : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//             }
//           } catch (e) {
//             console.log(`⚠️ שגיאה בשליפת זמן לוידאו ${videoId}`);
//           }

//           // --- עיבוד כותרת וזיהוי רב (לפי הבקשה שלך) ---
//           const parts = rawTitle.split(' - ');
//           const cleanTitle = parts.length > 1 ? parts.slice(1).join(' - ').trim() : rawTitle;

//           // חיפוש שם הרב בתוך הכותרת הגולמית (פותר את בעיית המקפים והרווחים)
//           const foundRabbi = allRabbis.find(r => rawTitle.includes(r.name));

//           const publishedDate = item.snippet.publishedAt;

//           await strapi.documents('api::lesson.lesson').create({
//             data: {
//               title: cleanTitle,
//               youtube_id: videoId,
//               duration: duration, 
//               lesson_date_gregorian: publishedDate.split('T')[0],
//               lesson_date_hebrew: new hebcal.HDate(new Date(publishedDate)).toString('h'),
//               rabbi: foundRabbi ? (foundRabbi as any).id : null,
//               publishedAt: new Date(),
//               locale: 'en'
//             },
//             status: 'published',
//           });
          
//           console.log(`✅ נוסף: ${cleanTitle} | זמן: ${duration}`);
//           newCount++;
//         }
//       }

//       return { message: `סנכרון הושלם. נוספו ${newCount} שיעורים.` };

//     } catch (err: any) {
//       console.error('❌ שגיאה בסנכרון:', err.message);
//       return ctx.badRequest('Sync failed: ' + err.message);
//     }
//   },
// }));



////הכי טוב!! כולל תארי
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import { parseStringPromise } from 'xml2js';
// import hebcal from 'hebcal';

// const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjCwvHzEeN0dGO4eaaQi6KQ';

// const HEADERS_CONFIG = {
//   headers: {
//     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//   }
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('🚀...מתחיל סנכרון RSS (עם תיקון תאריך עברי מדויק)');
      
//       const response = await axios.get(RSS_URL, HEADERS_CONFIG);
//       const rssResult = await parseStringPromise(response.data);
//       const entries = rssResult.feed.entry || [];
      
//       let newCount = 0;

//       for (let i = entries.length - 1; i >= 0; i--) {
//         const entry = entries[i];
//         const videoId = entry['yt:videoId'][0];
//         const rawTitle = entry.title[0];

//         const existing = await strapi.documents('api::lesson.lesson').findMany({
//           filters: { youtube_id: videoId },
//         });

//         if (existing.length === 0) {
//           // --- חילוץ משך זמן (Scraping) ---
//           let duration = "00:00";
//           try {
//             const videoPage = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, HEADERS_CONFIG);
//             const match = videoPage.data.match(/"approxDurationMs":"(\d+)"/);
//             if (match) {
//               const ms = parseInt(match[1]);
//               const totalSeconds = Math.floor(ms / 1000);
//               const h = Math.floor(totalSeconds / 3600);
//               const m = Math.floor((totalSeconds % 3600) / 60);
//               const s = totalSeconds % 60;
//               duration = h > 0 
//                 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
//                 : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//             }
//           } catch (e) {
//             console.log(`⚠️ לא ניתן היה לשלוף זמן לוידאו ${videoId}`);
//           }

//           // --- עיבוד כותרת ורב ---
//           const parts = rawTitle.split(' - ');
//           const cleanTitle = parts.length > 1 ? parts.slice(1).join(' - ').trim() : rawTitle;
//           const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//           const foundRabbi = allRabbis.find(r => rawTitle.includes(r.name));

//           // --- תיקון התאריך העברי ---
//           // לוקחים רק את התאריך (YYYY-MM-DD) ללא השעה מה-RSS
//           const dateOnlyStr = entry.published[0].split('T')[0]; 
//           const [year, month, day] = dateOnlyStr.split('-').map(Number);
          
//           // יצירת אובייקט תאריך "נקי" בחצות כדי ש-hebcal לא יקפוץ ליום הבא
//           const cleanDate = new Date(year, month - 1, day);
//           const hebrewDateStr = new hebcal.HDate(cleanDate).toString('h');

//           await strapi.documents('api::lesson.lesson').create({
//             data: {
//               title: cleanTitle,
//               youtube_id: videoId,
//               duration: duration, 
//               lesson_date_gregorian: dateOnlyStr,
//               lesson_date_hebrew: hebrewDateStr,
//               rabbi: foundRabbi ? (foundRabbi as any).id : null,
//               publishedAt: new Date(),
//               locale: 'en'
//             },
//             status: 'published',
//           });
          
//           console.log(`✅ נוסף: ${cleanTitle} | לועזי: ${dateOnlyStr} | עברי: ${hebrewDateStr}`);
//           newCount++;
//         }
//       }

//       return { message: `סנכרון הושלם. נוספו ${newCount} שיעורים.` };

//     } catch (err: any) {
//       console.error('❌ שגיאה בסנכרון:', err.message);
//       return ctx.badRequest('Sync failed: ' + err.message);
//     }
//   },
// }));







//עובד
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import hebcal from 'hebcal';

// // הגדרות יוטיוב
// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk'; 
// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';

// const HEADERS_CONFIG = {
//   headers: {
//     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//   }
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('🚀...מתחיל סנכרון 50 שיעורים דרך API Key (עם תיקון תאריך עברי)');

//       // 1. קבלת ה-ID של פלייליסט ה-"העלאות" של הערוץ
//       const channelRes = await axios.get(
//         `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
//       );
      
//       if (!channelRes.data.items || channelRes.data.items.length === 0) {
//         throw new Error('Channel not found');
//       }
      
//       const uploadsPlaylistId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

//       // 2. משיכת 50 סרטונים אחרונים מהפלייליסט
//       const playlistRes = await axios.get(
//         `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
//       );

//       const items = playlistRes.data.items || [];
//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       let newCount = 0;

//       // ריצה מהסוף להתחלה כדי לשמור על סדר כרונולוגי בסטרפי
//       for (let i = items.length - 1; i >= 0; i--) {
//         const item = items[i];
//         const videoId = item.snippet.resourceId.videoId;
//         const rawTitle = item.snippet.title;
//         const publishedAt = item.snippet.publishedAt; // פורמט: 2025-12-25T22:52:52Z

//         // בדיקה אם השיעור כבר קיים במערכת
//         const existing = await strapi.documents('api::lesson.lesson').findMany({
//           filters: { youtube_id: videoId },
//         });

//         if (existing.length === 0) {
//           // --- חילוץ משך זמן (Scraping) ---
//           let duration = "00:00";
//           try {
//             const videoPage = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, HEADERS_CONFIG);
//             const match = videoPage.data.match(/"approxDurationMs":"(\d+)"/);
//             if (match) {
//               const ms = parseInt(match[1]);
//               const totalSeconds = Math.floor(ms / 1000);
//               const h = Math.floor(totalSeconds / 3600);
//               const m = Math.floor((totalSeconds % 3600) / 60);
//               const s = totalSeconds % 60;
//               duration = h > 0 
//                 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
//                 : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//             }
//           } catch (e) {
//             console.log(`⚠️ לא ניתן לשלוף משך זמן ל-${videoId}`);
//           }

//           // --- עיבוד כותרת וזיהוי רב ---
//           const parts = rawTitle.split(' - ');
//           const cleanTitle = parts.length > 1 ? parts.slice(1).join(' - ').trim() : rawTitle;
//           const foundRabbi = allRabbis.find(r => rawTitle.includes(r.name));

//           // --- תיקון תאריך עברי (השיטה הבטוחה) ---
//           // חילוץ התאריך הלועזי בלבד (למשל: 2025-12-25)
//           const dateOnlyStr = publishedAt.split('T')[0]; 
//           const [year, month, day] = dateOnlyStr.split('-').map(Number);
          
//           // יצירת אובייקט Date בחצות כדי למנוע מ-hebcal להקפיץ יום בגלל השעה
//           const cleanDate = new Date(year, month - 1, day);
//           const hebrewDateStr = new hebcal.HDate(cleanDate).toString('h');

//           // יצירת הרשומה בסטרפי
//           await strapi.documents('api::lesson.lesson').create({
//             data: {
//               title: cleanTitle,
//               youtube_id: videoId,
//               duration: duration, 
//               lesson_date_gregorian: dateOnlyStr,
//               lesson_date_hebrew: hebrewDateStr,
//               rabbi: foundRabbi ? (foundRabbi as any).id : null,
//               publishedAt: new Date(),
//               locale: 'en'
//             },
//             status: 'published',
//           });
          
//           console.log(`✅ נוסף: ${cleanTitle} | לועזי: ${dateOnlyStr} | עברי: ${hebrewDateStr}`);
//           newCount++;
//         }
//       }

//       return { message: `סנכרון הושלם. נוספו ${newCount} שיעורים מתוך 50 שנסרקו.` };

//     } catch (err) {
//       console.error('❌ שגיאה בסנכרון:', err.response?.data || err.message);
//       return ctx.badRequest('Sync failed: ' + (err.response?.data?.error?.message || err.message));
//     }
//   },
// }));
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import hebcal from 'hebcal';

// // הגדרות יוטיוב
// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk'; 
// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';

// const HEADERS_CONFIG = {
//   headers: {
//     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//   }
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('🚀...מתחיל סנכרון 100 שיעורים (50 + 50) דרך API Key');

//       // 1. קבלת ה-ID של פלייליסט ה-"העלאות"
//       const channelRes = await axios.get(
//         `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
//       );
      
//       if (!channelRes.data.items || channelRes.data.items.length === 0) {
//         throw new Error('Channel not found');
//       }
      
//       const uploadsPlaylistId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

//       // 2. משיכת 50 סרטונים ראשונים
//       const res1 = await axios.get(
//         `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
//       );

//       let items = res1.data.items || [];

//       // משיכת 50 סרטונים נוספים (כדי להגיע ל-100 סך הכל)
//       if (res1.data.nextPageToken) {
//         const res2 = await axios.get(
//           `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&pageToken=${res1.data.nextPageToken}&key=${YOUTUBE_API_KEY}`
//         );
//         items = items.concat(res2.data.items || []);
//       }

//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       let newCount = 0;

//       // ריצה מהסוף להתחלה (מהישן לחדש מתוך ה-100)
//       for (let i = items.length - 1; i >= 0; i--) {
//         const item = items[i];
//         const videoId = item.snippet.resourceId.videoId;
//         const rawTitle = item.snippet.title;
//         const publishedAt = item.snippet.publishedAt;

//         const existing = await strapi.documents('api::lesson.lesson').findMany({
//           filters: { youtube_id: videoId },
//         });

//         if (existing.length === 0) {
//           // --- חילוץ משך זמן (Scraping) ---
//           let duration = "00:00";
//           try {
//             const videoPage = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, HEADERS_CONFIG);
//             const match = videoPage.data.match(/"approxDurationMs":"(\d+)"/);
//             if (match) {
//               const ms = parseInt(match[1]);
//               const totalSeconds = Math.floor(ms / 1000);
//               const h = Math.floor(totalSeconds / 3600);
//               const m = Math.floor((totalSeconds % 3600) / 60);
//               const s = totalSeconds % 60;
//               duration = h > 0 
//                 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
//                 : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//             }
//           } catch (e) {
//             console.log(`⚠️ לא ניתן לשלוף משך זמן ל-${videoId}`);
//           }

//           const parts = rawTitle.split(' - ');
//           const cleanTitle = parts.length > 1 ? parts.slice(1).join(' - ').trim() : rawTitle;
//           const foundRabbi = allRabbis.find(r => rawTitle.includes(r.name));

//           const dateOnlyStr = publishedAt.split('T')[0]; 
//           const [year, month, day] = dateOnlyStr.split('-').map(Number);
//           const cleanDate = new Date(year, month - 1, day);
//           const hebrewDateStr = new hebcal.HDate(cleanDate).toString('h');

//           await strapi.documents('api::lesson.lesson').create({
//             data: {
//               title: cleanTitle,
//               youtube_id: videoId,
//               duration: duration, 
//               lesson_date_gregorian: dateOnlyStr,
//               lesson_date_hebrew: hebrewDateStr,
//               rabbi: foundRabbi ? (foundRabbi as any).id : null,
//               publishedAt: new Date(),
//               locale: 'en'
//             },
//             status: 'published',
//           });
          
//           console.log(`✅ נוסף: ${cleanTitle}`);
//           newCount++;
//         }
//       }

//       return { message: `סנכרון הושלם. נסרקו 100, נוספו ${newCount} חדשים.` };

//     } catch (err) {
//       console.error('❌ שגיאה בסנכרון:', err.response?.data || err.message);
//       return ctx.badRequest('Sync failed: ' + (err.response?.data?.error?.message || err.message));
//     }
//   },
// }));
//הקוד שנשלח לנטפרי
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import hebcal from 'hebcal';

// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk'; 
// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';

// // פונקציה שממירה את הזמן של גוגל לפורמט שלך (HH:MM:SS)
// function parseISO8601(duration) {
//   const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//   const h = parseInt(match[1] || 0);
//   const m = parseInt(match[2] || 0);
//   const s = parseInt(match[3] || 0);
//   return (h > 0 ? `${String(h).padStart(2, '0')}:` : "") + 
//          `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// }

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('🚀 סנכרון 60 שיעורים - גרסת ה-API הנקייה (ללא חסימות 418)');

//       // 1. קבלת הפלייליסט
//       const channelRes = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
//       const uploadsId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

//       // 2. משיכת 60 סרטונים (50 + 10)
//       const res1 = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsId}&maxResults=50&key=${YOUTUBE_API_KEY}`);
//       let items = res1.data.items || [];
      
//       if (res1.data.nextPageToken) {
//         const res2 = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsId}&maxResults=10&pageToken=${res1.data.nextPageToken}&key=${YOUTUBE_API_KEY}`);
//         items = items.concat(res2.data.items || []);
//       }

//       // 3. שליפת כל ה-Durations בבקשה אחת (זה מונע את שגיאת 418!)
//       const videoIds = items.map(i => i.contentDetails.videoId).join(',');
//       const videoDetails = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=contentDetails&key=${YOUTUBE_API_KEY}`);
      
//       const durations = {};
//       videoDetails.data.items.forEach(v => {
//         durations[v.id] = parseISO8601(v.contentDetails.duration);
//       });

//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       let newCount = 0;

//       for (const item of items) {
//         const videoId = item.contentDetails.videoId;
//         const rawTitle = item.snippet.title;
        
//         const existing = await strapi.documents('api::lesson.lesson').findMany({ filters: { youtube_id: videoId } });

//         if (existing.length === 0) {
//           const publishedAt = item.snippet.publishedAt;
//           const dateOnly = publishedAt.split('T')[0];
//           const [y, m, d] = dateOnly.split('-').map(Number);
//           const hebrewDateStr = new hebcal.HDate(new Date(y, m - 1, d)).toString('h');

//           await strapi.documents('api::lesson.lesson').create({
//             data: {
//               title: rawTitle.split(' - ').slice(1).join(' - ').trim() || rawTitle,
//               youtube_id: videoId,
//               duration: durations[videoId] || "00:00",
//               lesson_date_gregorian: dateOnly,
//               lesson_date_hebrew: hebrewDateStr,
//               rabbi: allRabbis.find(r => rawTitle.includes(r.name))?.id || null,
//               publishedAt: new Date(),
//               locale: 'en'
//             },
//             status: 'published',
//           });
//           newCount++;
//         }
//       }
//       return { message: `הסנכרון הצליח! נוספו ${newCount} שיעורים.` };
//     } catch (err) {
//       console.error('❌ שגיאה:', err.response?.data || err.message);
//       return ctx.badRequest('שגיאה בסנכרון: נטפרי חוסם את הבקשה. יש לוודא שה-API Key מופעל.');
//     }
//   }
// }));
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import hebcal from 'hebcal';

// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk'; 
// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';

// // פונקציה להמרת פורמט הזמן של יוטיוב ל-HH:MM:SS
// function parseDuration(duration) {
//   if (!duration) return "00:00";
//   const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//   const h = parseInt(match[1] || 0);
//   const m = parseInt(match[2] || 0);
//   const s = parseInt(match[3] || 0);
//   if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//   return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// }

// // פונקציה לחילוץ תאריך עברי מהתיאור
// function extractHebrewDate(description) {
//   if (!description) return null;
//   const dateRegex = /([א-ת"׳]+\s+(תשרי|חשון|חשוון|כסלו|טבת|שבט|אדר|ניסן|אייר|סיון|סיוון|תמוז|אב|אלול)\s+תש[א-ת"׳]+)/;
//   const match = description.match(dateRegex);
//   return match ? match[1] : null;
// }

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('🚀 Starting sync: Bypassing 418 blocking...');

//       // הגדרות למניעת חסימה
//       const config = {
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
//         }
//       };

//       // 1. קבלת פלייליסט ההעלאות
//       const channelRes = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`, config);
//       const uploadsPlaylistId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

//       // 2. משיכת רשימת סרטונים
//       let playlistItems = [];
//       const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`;
      
//       const res1 = await axios.get(playlistUrl, config);
//       playlistItems = res1.data.items;

//       // 3. שליפת נתונים מורחבים (Duration + Description)
//       const videoIds = playlistItems.map(i => i.contentDetails.videoId).join(',');
//       const videoRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=snippet,contentDetails&key=${YOUTUBE_API_KEY}`, config);
      
//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       let newCount = 0;

//       for (const video of videoRes.data.items) {
//         const videoId = video.id;
//         const existing = await strapi.documents('api::lesson.lesson').findMany({
//           filters: { youtube_id: videoId },
//         });

//         if (existing.length === 0) {
//           const description = video.snippet.description;
//           const rawTitle = video.snippet.title;
//           const publishedAt = video.snippet.publishedAt;
//           const duration = parseDuration(video.contentDetails.duration);

//           // חילוץ תאריך
//           const dateFromDesc = extractHebrewDate(description);
//           const dateOnlyStr = publishedAt.split('T')[0];

//           let finalHebrewDate;
//           if (dateFromDesc) {
//             finalHebrewDate = dateFromDesc;
//             console.log(`📅 Found date in description for "${rawTitle}": ${finalHebrewDate}`);
//           } else {
//             const [year, month, day] = dateOnlyStr.split('-').map(Number);
//             finalHebrewDate = new hebcal.HDate(new Date(year, month - 1, day)).toString('h');
//           }

//           const foundRabbi = allRabbis.find(r => rawTitle.includes(r.name));

//           await strapi.documents('api::lesson.lesson').create({
//             data: {
//               title: rawTitle.split(' - ').slice(1).join(' - ').trim() || rawTitle,
//               youtube_id: videoId,
//               duration: duration,
//               lesson_date_gregorian: dateOnlyStr,
//               lesson_date_hebrew: finalHebrewDate,
//               rabbi: foundRabbi ? foundRabbi.id : null,
//               publishedAt: new Date(),
//               locale: 'en'
//             },
//             status: 'published',
//           });
//           newCount++;
//         }
//       }

//       return { message: `Successfully synced ${newCount} lessons.` };

//     } catch (err) {
//       console.error('❌ Sync Error Details:', err.response?.data || err.message);
//       return ctx.badRequest(`Sync failed: ${err.message}`);
//     }
//   },
// }));


///עובד אבל מושך לפי הזמן שנוצר
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import hebcal from 'hebcal';

// // הגדרות יוטיוב
// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk'; 
// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';

// const HEADERS_CONFIG = {
//   headers: {
//     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//   }
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('🚀...מתחיל סנכרון 100 שיעורים (50 + 50) דרך API Key');

//       // 1. קבלת ה-ID של פלייליסט ה-"העלאות"
//       const channelRes = await axios.get(
//         `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
//       );
      
//       if (!channelRes.data.items || channelRes.data.items.length === 0) {
//         throw new Error('Channel not found');
//       }
      
//       const uploadsPlaylistId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

//       // 2. משיכת 50 סרטונים ראשונים
//       const res1 = await axios.get(
//         `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
//       );

//       let items = res1.data.items || [];

//       // משיכת 50 סרטונים נוספים (כדי להגיע ל-100 סך הכל)
//       if (res1.data.nextPageToken) {
//         const res2 = await axios.get(
//           `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&pageToken=${res1.data.nextPageToken}&key=${YOUTUBE_API_KEY}`
//         );
//         items = items.concat(res2.data.items || []);
//       }

//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       let newCount = 0;

//       // ריצה מהסוף להתחלה (מהישן לחדש מתוך ה-100)
//       for (let i = items.length - 1; i >= 0; i--) {
//         const item = items[i];
//         const videoId = item.snippet.resourceId.videoId;
//         const rawTitle = item.snippet.title;
//         const publishedAt = item.snippet.publishedAt;

//         const existing = await strapi.documents('api::lesson.lesson').findMany({
//           filters: { youtube_id: videoId },
//         });

//         if (existing.length === 0) {
//           // --- חילוץ משך זמן (Scraping) ---
//           let duration = "00:00";
//           try {
//             const videoPage = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, HEADERS_CONFIG);
//             const match = videoPage.data.match(/"approxDurationMs":"(\d+)"/);
//             if (match) {
//               const ms = parseInt(match[1]);
//               const totalSeconds = Math.floor(ms / 1000);
//               const h = Math.floor(totalSeconds / 3600);
//               const m = Math.floor((totalSeconds % 3600) / 60);
//               const s = totalSeconds % 60;
//               duration = h > 0 
//                 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
//                 : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//             }
//           } catch (e) {
//             console.log(`⚠️ לא ניתן לשלוף משך זמן ל-${videoId}`);
//           }

//           const parts = rawTitle.split(' - ');
//           const cleanTitle = parts.length > 1 ? parts.slice(1).join(' - ').trim() : rawTitle;
//           const foundRabbi = allRabbis.find(r => rawTitle.includes(r.name));

//           const dateOnlyStr = publishedAt.split('T')[0]; 
//           const [year, month, day] = dateOnlyStr.split('-').map(Number);
//           const cleanDate = new Date(year, month - 1, day);
//           const hebrewDateStr = new hebcal.HDate(cleanDate).toString('h');

//           await strapi.documents('api::lesson.lesson').create({
//             data: {
//               title: cleanTitle,
//               youtube_id: videoId,
//               duration: duration, 
//               lesson_date_gregorian: dateOnlyStr,
//               lesson_date_hebrew: hebrewDateStr,
//               rabbi: foundRabbi ? (foundRabbi as any).id : null,
//               publishedAt: new Date(),
//               locale: 'en'
//             },
//             status: 'published',
//           });
          
//           console.log(`✅ נוסף: ${cleanTitle}`);
//           newCount++;
//         }
//       }

//       return { message: `סנכרון הושלם. נסרקו 100, נוספו ${newCount} חדשים.` };

//     } catch (err) {
//       console.error('❌ שגיאה בסנכרון:', err.response?.data || err.message);
//       return ctx.badRequest('Sync failed: ' + (err.response?.data?.error?.message || err.message));
//     }
//   },
// }));
///נסיון האחרון ועובד אבל מביא רק 50
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import hebcal from 'hebcal';

// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk'; 
// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';

// // פונקציה להמרת פורמט הזמן של יוטיוב (כמו PT1H5M) לפורמט קריא (01:05:00)
// function parseDuration(duration) {
//   if (!duration) return "00:00";
//   const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//   const h = parseInt(match[1] || 0);
//   const m = parseInt(match[2] || 0);
//   const s = parseInt(match[3] || 0);
//   if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//   return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// }

// // פונקציה לחילוץ תאריך עברי מתוך הטקסט של התיאור
// function extractHebrewDate(description) {
//   if (!description) return null;
//   const dateRegex = /([א-ת"׳]+\s+(תשרי|חשון|חשוון|כסלו|טבת|שבט|אדר|ניסן|אייר|סיון|סיוון|תמוז|אב|אלול)\s+תש[א-ת"׳]+)/;
//   const match = description.match(dateRegex);
//   return match ? match[1] : null;
// }

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('🚀 Starting Clean Sync: Fetching Duration and Description via Official API');

//       // 1. קבלת ID של פלייליסט ההעלאות
//       const channelRes = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
//         params: { part: 'contentDetails', id: CHANNEL_ID, key: YOUTUBE_API_KEY }
//       });
//       const uploadsPlaylistId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

//       // 2. משיכת רשימת ה-ID של 50 הסרטונים האחרונים (כדי למנוע עומס ושגיאת 418)
//       const playlistRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
//         params: { part: 'contentDetails', playlistId: uploadsPlaylistId, maxResults: 50, key: YOUTUBE_API_KEY }
//       });
      
//       const videoIds = playlistRes.data.items.map(i => i.contentDetails.videoId).join(',');

//       // 3. שליפת הנתונים המלאים (גם אורך וגם תיאור) באותה בקשה רשמית
//       const videoDetailsRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
//         params: { part: 'snippet,contentDetails', id: videoIds, key: YOUTUBE_API_KEY }
//       });

//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       let newCount = 0;

//       for (const video of videoDetailsRes.data.items) {
//         const videoId = video.id;

//         // בדיקה אם השיעור כבר קיים בבסיס הנתונים
//         const existing = await strapi.documents('api::lesson.lesson').findMany({
//           filters: { youtube_id: videoId },
//         });

//         if (existing.length === 0) {
//           const rawTitle = video.snippet.title;
//           const description = video.snippet.description; // התיאור נשלף כאן באותה צורה של האורך
//           const publishedAt = video.snippet.publishedAt;
//           const duration = parseDuration(video.contentDetails.duration); // האורך נשלף כאן

//           // חילוץ התאריך מהתיאור (אם קיים)
//           const dateFromDesc = extractHebrewDate(description);
//           const dateOnlyStr = publishedAt.split('T')[0];

//           let finalHebrewDate;
//           if (dateFromDesc) {
//             finalHebrewDate = dateFromDesc;
//           } else {
//             // אם אין תאריך בתיאור, נמיר את תאריך ההעלאה
//             const [year, month, day] = dateOnlyStr.split('-').map(Number);
//             finalHebrewDate = new hebcal.HDate(new Date(year, month - 1, day)).toString('h');
//           }

//           const foundRabbi = allRabbis.find(r => rawTitle.includes(r.name));

//           // שמירה לסטראפי
//           await strapi.documents('api::lesson.lesson').create({
//             data: {
//               title: rawTitle.split(' - ').slice(1).join(' - ').trim() || rawTitle,
//               youtube_id: videoId,
//               duration: duration,
//               lesson_date_gregorian: dateOnlyStr,
//               lesson_date_hebrew: finalHebrewDate,
//               rabbi: foundRabbi ? foundRabbi.id : null,
//               publishedAt: new Date(),
//               locale: 'en'
//             },
//             status: 'published',
//           });
//           newCount++;
//         }
//       }

//       return { message: `Successfully synced ${newCount} lessons.` };

//     } catch (err) {
//       console.error('❌ Sync Error:', err.response?.status, err.message);
//       return ctx.badRequest(`Sync failed: ${err.message}`);
//     }
//   },
// }));
// זה קוד שמביא 100 שיעורים ואת האתריך הוא מוציא מהתיאור ולמי שאין הוא לא מכניס אותו
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import hebcal from 'hebcal';

// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk'; 
// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';

// function parseDuration(duration) {
//   if (!duration) return "00:00";
//   const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//   const h = parseInt(match[1] || 0);
//   const m = parseInt(match[2] || 0);
//   const s = parseInt(match[3] || 0);
//   if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//   return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// }

// /**
//  * פונקציה חכמה לעיבוד תאריך:
//  * מנסה לחלץ תאריך עברי, ואם לא מוצאת - מחזירה את תאריך הפרסום של יוטיוב כגיבוי.
//  */
// function processLessonDate(description, youtubePublishedDate) {
//   const fallbackDate = youtubePublishedDate ? youtubePublishedDate.split('T')[0] : null;
  
//   if (!description) return { hebrew: null, gregorian: fallbackDate };

//   // Regex משופר שתופס פורמטים שונים של תאריך עברי
//   const dateRegex = /([א-ת"׳']+\s+(תשרי|חשון|חשוון|כסלו|טבת|שבט|אדר|ניסן|אייר|סיון|סיוון|תמוז|אב|אלול)\s+תש[א-ת"׳']+)/;
//   const match = description.match(dateRegex);
  
//   if (match) {
//     const hebrewDateStr = match[1].trim();
//     try {
//       const hDate = new hebcal.HDate(hebrewDateStr);
//       return {
//         hebrew: hebrewDateStr,
//         gregorian: hDate.gregorian().toISOString().split('T')[0]
//       };
//     } catch (e) {
//       // אם נמצא טקסט עברי אך ההמרה נכשלה, נשמור את הטקסט ונשתמש בתאריך יוטיוב ללועזי
//       return { hebrew: hebrewDateStr, gregorian: fallbackDate };
//     }
//   }

//   // ברירת מחדל כשלא נמצא תאריך בתיאור
//   return { hebrew: null, gregorian: fallbackDate };
// }

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('--------------------------------------------');
//       console.log('🚀 התחלת סנכרון מורחב: יעד 100 סרטונים');

//       const channelRes = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
//       const uploadsId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

//       let allVideoIds = [];
//       let currentToken = null;

//       // איסוף מזהים (עד 100)
//       for (let page = 1; page <= 2; page++) {
//         console.log(`📡 אוסף דף ${page} מיוטיוב...`);
//         const playlistRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
//           params: {
//             part: 'contentDetails',
//             playlistId: uploadsId,
//             maxResults: 50,
//             pageToken: currentToken,
//             key: YOUTUBE_API_KEY
//           }
//         });

//         const ids = playlistRes.data.items.map(item => item.contentDetails.videoId);
//         allVideoIds = [...allVideoIds, ...ids];
        
//         currentToken = playlistRes.data.nextPageToken;
//         if (!currentToken) break;
//       }

//       console.log(`📊 סך הכל מזהים לעיבוד: ${allVideoIds.length}`);

//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       let newCount = 0;
//       let existingCount = 0;

//       // עיבוד הנגלות
//       for (let i = 0; i < allVideoIds.length; i += 50) {
//         const batch = allVideoIds.slice(i, i + 50).join(',');
//         const videoRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
//           params: {
//             part: 'snippet,contentDetails',
//             id: batch,
//             key: YOUTUBE_API_KEY
//           }
//         });

//         for (const video of videoRes.data.items) {
//           const existing = await strapi.documents('api::lesson.lesson').findMany({
//             filters: { youtube_id: video.id },
//           });

//           if (existing.length === 0) {
//             // שימוש בפונקציה החדשה - תמיד מחזירה תאריך כלשהו
//             const dateInfo = processLessonDate(video.snippet.description, video.snippet.publishedAt);

//             const rawTitle = video.snippet.title;
//             const foundRabbi = allRabbis.find(r => rawTitle.includes(r.name));

//             await strapi.documents('api::lesson.lesson').create({
//               data: {
//                 title: rawTitle.split(' - ').slice(1).join(' - ').trim() || rawTitle,
//                 youtube_id: video.id,
//                 duration: parseDuration(video.contentDetails.duration),
//                 lesson_date_hebrew: dateInfo.hebrew,
//                 lesson_date_gregorian: dateInfo.gregorian,
//                 rabbi: foundRabbi ? (foundRabbi as any).id : null,
//                 publishedAt: new Date(),
//                 locale: 'en'
//               },
//               status: 'published',
//             });
//             newCount++;
//           } else {
//             existingCount++;
//           }
//         }
//       }

//       console.log(`🏁 סיום: נוספו ${newCount}, היו קיימים ${existingCount}`);
//       console.log('--------------------------------------------');

//       return { 
//         message: `Success. Processed ${allVideoIds.length} videos. Added: ${newCount}, Existing: ${existingCount}` 
//       };

//     } catch (err) {
//       console.error('❌ שגיאה בסנכרון:', err.message);
//       return ctx.badRequest(`Sync failed: ${err.message}`);
//     }
//   },
// }));





// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import hebcal from 'hebcal';

// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk'; 
// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';
// const TARGET_RABBI_NAME = 'מרדכי עטייה'; 

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// function parseDuration(duration) {
//   if (!duration) return "00:00";
//   const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//   const h = parseInt(match[1] || 0);
//   const m = parseInt(match[2] || 0);
//   const s = parseInt(match[3] || 0);
//   if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//   return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// }

// function processLessonDate(description, youtubePublishedDate) {
//   const gregorianUploadDate = youtubePublishedDate ? youtubePublishedDate.split('T')[0] : null;

//   const gregorianRegex = /(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/;
//   const gregMatch = description?.match(gregorianRegex);

//   if (gregMatch) {
//     const day = parseInt(gregMatch[1]);
//     const month = parseInt(gregMatch[2]) - 1; 
//     const year = parseInt(gregMatch[3]);
//     const foundDate = new Date(year, month, day);

//     if (!isNaN(foundDate.getTime())) {
//       const hDate = new hebcal.HDate(foundDate);
//       return {
//         hebrew: hDate.toString('h'),
//         gregorian: foundDate.toISOString().split('T')[0]
//       };
//     }
//   }

//   const hebrewDateRegex = /([א-ת"׳']+\s+(תשרי|חשון|חשוון|כסלו|טבת|שבט|אדר|ניסן|אייר|סיון|סיוון|תמוז|אב|אלול)\s+תש[א-ת"׳']+)/;
//   const hebMatch = description?.match(hebrewDateRegex);

//   if (hebMatch) {
//     const hebrewDateStr = hebMatch[1].trim();
//     try {
//       const hDate = new hebcal.HDate(hebrewDateStr);
//       return {
//         hebrew: hebrewDateStr,
//         gregorian: hDate.gregorian().toISOString().split('T')[0]
//       };
//     } catch (e) {
//       return { hebrew: hebrewDateStr, gregorian: gregorianUploadDate };
//     }
//   }

//   let calculatedHebrew = null;
//   if (gregorianUploadDate) {
//     try {
//       const hDate = new hebcal.HDate(new Date(gregorianUploadDate));
//       calculatedHebrew = hDate.toString('h');
//     } catch (e) {
//       calculatedHebrew = null;
//     }
//   }
//   return { hebrew: calculatedHebrew, gregorian: gregorianUploadDate };
// }

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     // הגדרת זמן ריצה ארוך יותר למניעת Timeout (300 שניות)
//     ctx.request.socket.setTimeout(300000);

//     try {
//       console.log('--------------------------------------------');
//       console.log(`⚠️ מתחיל סנכרון מאסיבי: סורק עד 2000 סרטונים עבור: ${TARGET_RABBI_NAME}`);

//       const channelRes = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
//       const uploadsId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

//       let currentToken = null;
//       let newCount = 0;
//       let totalVideosScanned = 0;
//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();

//       // לולאה ל-40 דפים (40 * 50 = 2000)
//       for (let page = 1; page <= 40; page++) {
//         console.log(`⏳ דף ${page}/40... (נסרקו ${totalVideosScanned} סרטונים)`);

//         const playlistRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
//           params: { 
//             part: 'contentDetails', 
//             playlistId: uploadsId, 
//             maxResults: 50, 
//             pageToken: currentToken, 
//             key: YOUTUBE_API_KEY 
//           }
//         });

//         const ids = playlistRes.data.items.map(item => item.contentDetails.videoId);
//         const videoRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
//           params: { part: 'snippet,contentDetails', id: ids.join(','), key: YOUTUBE_API_KEY }
//         });

//         for (const video of videoRes.data.items) {
//           totalVideosScanned++;
//           const rawTitle = video.snippet.title;
          
//           if (!rawTitle.includes(TARGET_RABBI_NAME)) continue;

//           // בדיקת כפילות
//           const existing = await strapi.documents('api::lesson.lesson').findMany({
//             filters: { youtube_id: video.id },
//           });

//           if (existing.length === 0) {
//             const dateInfo = processLessonDate(video.snippet.description, video.snippet.publishedAt);
            
//             const titleParts = rawTitle.split(' - ');
//             let finalTitle = titleParts.length > 1 ? titleParts.slice(1).join(' - ').trim() : rawTitle;
//             if (!finalTitle || finalTitle.toLowerCase() === 'nan') finalTitle = rawTitle;

//             const foundRabbi = allRabbis.find(r => rawTitle.includes(r.name));

//             await strapi.documents('api::lesson.lesson').create({
//               data: {
//                 title: finalTitle,
//                 youtube_id: video.id,
//                 duration: parseDuration(video.contentDetails.duration),
//                 lesson_date_hebrew: dateInfo.hebrew,
//                 lesson_date_gregorian: dateInfo.gregorian,
//                 rabbi: foundRabbi ? (foundRabbi as any).id : null,
//                 publishedAt: new Date(),
//                 locale: 'en'
//               },
//               status: 'published',
//             });
//             newCount++;
//           }
//         }

//         currentToken = playlistRes.data.nextPageToken;
//         if (!currentToken) {
//           console.log("ℹ️ אין יותר סרטונים בערוץ.");
//           break;
//         }

//         // השהיה למניעת חסימת API
//         await sleep(700); 
//       }

//       console.log(`🏁 סנכרון מאסיבי הסתיים! הוספנו ${newCount} שיעורים.`);
//       return { message: `Massive sync success. Added ${newCount} lessons.` };

//     } catch (err) {
//       console.error('❌ שגיאה בסנכרון מאסיבי:', err.message);
//       return ctx.badRequest(`Massive sync failed: ${err.message}`);
//     }
//   },
// }));
// הוסיפי את הפונקציה הזו בתוך ה-export default factories.createCoreController, מתחת ל-sync(ctx)
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import hebcal from 'hebcal';

// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk'; 
// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';
// const TARGET_RABBI_NAME = 'מרדכי עטייה'; 

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // פונקציות העזר נשארות כפי שהיו (parseDuration, processLessonDate)
// function parseDuration(duration) {
//   if (!duration) return "00:00";
//   const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//   const h = parseInt(match[1] || 0);
//   const m = parseInt(match[2] || 0);
//   const s = parseInt(match[3] || 0);
//   if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//   return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// }

// function processLessonDate(description, youtubePublishedAt) {
//   const gregorianUploadDate = youtubePublishedAt ? youtubePublishedAt.split('T')[0] : null;
//   const gregorianRegex = /(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/;
//   const gregMatch = description?.match(gregorianRegex);

//   if (gregMatch) {
//     const day = parseInt(gregMatch[1]);
//     const month = parseInt(gregMatch[2]) - 1; 
//     const year = parseInt(gregMatch[3]);
//     const foundDate = new Date(year, month, day);
//     if (!isNaN(foundDate.getTime())) {
//       const hDate = new hebcal.HDate(foundDate);
//       return { hebrew: hDate.toString('h'), gregorian: foundDate.toISOString().split('T')[0] };
//     }
//   }
//   let calculatedHebrew = null;
//   if (gregorianUploadDate) {
//     try {
//       const hDate = new hebcal.HDate(new Date(gregorianUploadDate));
//       calculatedHebrew = hDate.toString('h');
//     } catch (e) { calculatedHebrew = null; }
//   }
//   return { hebrew: calculatedHebrew, gregorian: gregorianUploadDate };
// }

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
  
//   async deleteAll(ctx) {
//     try {
//       console.log('🗑️ מוחק את כל השיעורים במהירות...');
//       // מחיקה מאסיבית במכה אחת (דורש Strapi 5)
//       const deleted = await strapi.db.query('api::lesson.lesson').deleteMany({});
//       return { message: `Deleted all lessons.`, count: deleted.count };
//     } catch (err) {
//       return ctx.badRequest(`Delete failed: ${err.message}`);
//     }
//   },

//   async sync(ctx) {
//     // הגדרת טיימאאוט קיצוני
//     ctx.request.socket.setTimeout(900000); 

//     try {
//       const searchName = TARGET_RABBI_NAME.replace('הרב ', '').replace('רב ', '').trim();
//       const channelRes = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
//       const uploadsId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

//       let currentToken = null;
//       let newCount = 0;
//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       const foundRabbi = allRabbis.find(r => r.name.includes(searchName));

//       // הורדנו ל-20 דפים כדי למנוע קריסה. אם תצטרכי עוד, פשוט הריצי שוב.
//       for (let page = 1; page <= 20; page++) {
//         console.log(`⏳ מעבד דף ${page}/20...`);

//         const playlistRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
//           params: { part: 'contentDetails', playlistId: uploadsId, maxResults: 50, pageToken: currentToken, key: YOUTUBE_API_KEY }
//         });

//         const ids = playlistRes.data.items.map(item => item.contentDetails.videoId);
//         const videoRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
//           params: { part: 'snippet,contentDetails', id: ids.join(','), key: YOUTUBE_API_KEY }
//         });

//         for (const video of videoRes.data.items) {
//           const rawTitle = video.snippet.title;
//           if (!rawTitle.includes(searchName)) continue;

//           // בדיקת כפילות מהירה
//           const existing = await strapi.db.query('api::lesson.lesson').findOne({
//             where: { youtube_id: video.id }
//           });

//           if (!existing) {
//             const dateInfo = processLessonDate(video.snippet.description, video.snippet.publishedAt);
            
//             let cleanTitle = rawTitle;
//             const rabbiPattern = new RegExp(`(הרב|רב)?\\s*${searchName}\\s*(-|\\|)?`, 'g');
//             cleanTitle = cleanTitle.replace(rabbiPattern, '');
//             const yearPattern = /תש[א-ת"׳']{2,3}/g;
//             cleanTitle = cleanTitle.replace(yearPattern, '');
//             cleanTitle = cleanTitle.replace(/-{2,}/g, '-').replace(/^\s*-\s*|\s*-\s*$/g, '').trim();

//             if (!cleanTitle) cleanTitle = rawTitle;

//             await strapi.documents('api::lesson.lesson').create({
//               data: {
//                 title: cleanTitle,
//                 youtube_id: video.id,
//                 duration: parseDuration(video.contentDetails.duration),
//                 lesson_date_hebrew: dateInfo.hebrew,
//                 lesson_date_gregorian: dateInfo.gregorian,
//                 rabbi: foundRabbi ? (foundRabbi as any).id : null,
//                 publishedAt: new Date(),
//                 locale: 'en'
//               },
//               status: 'published',
//             });
//             newCount++;
//           }
//         }
//         currentToken = playlistRes.data.nextPageToken;
//         if (!currentToken) break;
//         // השהיה קצרה יותר כדי לרוץ מהר לפני שהסוקט יסגר
//         await sleep(300); 
//       }

//       console.log(`🏁 סיים בהצלחה! הוספנו ${newCount} שיעורים.`);
//       return { message: `Successfully added ${newCount} lessons.` };

//     } catch (err) {
//       console.error('❌ שגיאה:', err.message);
//       return ctx.badRequest(`Sync failed: ${err.message}`);
//     }
//   },
// }));







//הקוד הטוב
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import hebcal from 'hebcal';
// import fs from 'fs';
// import path from 'path';

// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk'; 
// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';
// const TARGET_RABBI_NAME = 'מרדכי עטייה'; 

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // פונקציית ניקוי להשוואה מדויקת בין ה-JSON ליוטיוב (מטפל בגרשיים וסימנים)
// const normalizeText = (text) => {
//   if (!text) return '';
//   return text.replace(/[^\u0590-\u05FFa-zA-Z0-9]/g, '').trim();
// };

// function parseDuration(duration) {
//   if (!duration) return "00:00";
//   const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//   const h = parseInt(match[1] || 0);
//   const m = parseInt(match[2] || 0);
//   const s = parseInt(match[3] || 0);
//   if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//   return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// }

// function processLessonDate(description, youtubePublishedAt) {
//   const gregorianUploadDate = youtubePublishedAt ? youtubePublishedAt.split('T')[0] : null;
//   const gregorianRegex = /(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/;
//   const gregMatch = description?.match(gregorianRegex);

//   if (gregMatch) {
//     const day = parseInt(gregMatch[1]);
//     const month = parseInt(gregMatch[2]) - 1; 
//     const year = parseInt(gregMatch[3]);
//     const foundDate = new Date(year, month, day);
//     if (!isNaN(foundDate.getTime())) {
//       const hDate = new hebcal.HDate(foundDate);
//       return { hebrew: hDate.toString('h'), gregorian: foundDate.toISOString().split('T')[0] };
//     }
//   }
//   let calculatedHebrew = null;
//   if (gregorianUploadDate) {
//     try {
//       const hDate = new hebcal.HDate(new Date(gregorianUploadDate));
//       calculatedHebrew = hDate.toString('h');
//     } catch (e) { calculatedHebrew = null; }
//   }
//   return { hebrew: calculatedHebrew, gregorian: gregorianUploadDate };
// }

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
  
//   async sync(ctx) {
//     // טיימאאוט של 30 דקות
//     ctx.request.socket.setTimeout(1800000); 

//     try {
//       const filePath = path.join(process.cwd(), 'LessonList.json');
//       let localData = [];
//       if (fs.existsSync(filePath)) {
//         localData = JSON.parse(fs.readFileSync(filePath, 'utf8').trim().replace(/^\uFEFF/, ''));
//       }

//       const searchName = TARGET_RABBI_NAME.replace('הרב ', '').replace('רב ', '').trim();
      
//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       const foundRabbi = allRabbis.find(r => r.name.includes(searchName));

//       const channelRes = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
//       const uploadsId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

//       let currentToken = null;
//       let newCount = 0;

//       console.log(`🚀 מריץ סנכרון (60 דפים) עבור הרב ${searchName}...`);

//       for (let page = 1; page <= 60; page++) {
//         console.log(`⏳ מעבד דף ${page}/60...`);
        
//         try {
//           const playlistRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
//             params: { part: 'contentDetails', playlistId: uploadsId, maxResults: 50, pageToken: currentToken, key: YOUTUBE_API_KEY },
//             timeout: 60000
//           });

//           const ids = playlistRes.data.items.map(item => item.contentDetails.videoId);
//           const videoRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
//             params: { part: 'snippet,contentDetails', id: ids.join(','), key: YOUTUBE_API_KEY }
//           });

//           for (const video of videoRes.data.items) {
//             const rawTitle = video.snippet.title;
//             if (!rawTitle.includes(searchName)) continue;

//             // מניעת כפילויות
//             const existing = await strapi.db.query('api::lesson.lesson').findOne({
//               where: { youtube_id: video.id }
//             });

//             if (!existing) {
//               // הצלבה מול ה-JSON למשיכת צפיות וקטגוריה
//               const normYoutube = normalizeText(rawTitle);
//               const jsonMatch = localData.find(ld => {
//                 const normJSON = normalizeText(ld.lessonName);
//                 return normYoutube.includes(normJSON) || normJSON.includes(normYoutube);
//               });

//               const viewsCount = jsonMatch ? parseInt(jsonMatch.views) : 0;
//               const jsonCategoryName = jsonMatch ? jsonMatch.category : "כללי";

//               // שליפת ה-ID של הקטגוריה המפורסמת
//               const categoryObj = await strapi.documents('api::categories-main.categories-main').findFirst({
//                 filters: { name: jsonCategoryName }
//               });

//               const dateInfo = processLessonDate(video.snippet.description, video.snippet.publishedAt);
              
//               // ניקוי כותרת
//               let cleanTitle = rawTitle.replace(new RegExp(`(הרב|רב)?\\s*${searchName}\\s*(-|\\|)?`, 'g'), '')
//                                       .replace(/תש[א-ת"׳'״]{2,3}/g, '')
//                                       .replace(/-{2,}/g, '-').replace(/^\s*-\s*|\s*-\s*$/g, '').trim();

//               await strapi.documents('api::lesson.lesson').create({
//                 data: {
//                   title: cleanTitle || rawTitle,
//                   youtube_id: video.id,
//                   duration: parseDuration(video.contentDetails.duration),
//                   lesson_date_hebrew: dateInfo.hebrew,
//                   lesson_date_gregorian: dateInfo.gregorian,
//                   views: viewsCount, 
//                   main_category: categoryObj ? categoryObj.id : null,
//                   rabbi: foundRabbi ? foundRabbi.id : null,
//                   publishedAt: new Date(), // הופך ל-Published
//                   locale: 'en'
//                 },
//                 status: 'published' // מבטיח סטטוס ירוק
//               });
//               newCount++;
//             }
//           }

//           currentToken = playlistRes.data.nextPageToken;
//           if (!currentToken) break; 
//           await sleep(400); 

//         } catch (innerErr) {
//           console.error(`⚠️ שגיאה בדף ${page}: ${innerErr.message}`);
//           continue; 
//         }
//       }

//       console.log(`🏁 סיים! נוספו ${newCount} שיעורים חדשים.`);
//       return { message: `Successfully added ${newCount} lessons.` };

//     } catch (err) {
//       console.error('❌ שגיאה כללית:', err.message);
//       return ctx.badRequest(`Sync failed: ${err.message}`);
//     }
//   },
// }));






///תדמית הישיבה
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import hebcal from 'hebcal';
// import fs from 'fs';
// import path from 'path';

// const YOUTUBE_API_KEY = 'AIzaSyA6wmJrBdaDZkv1yfjChuPRiPfwvK5N-Lk'; 
// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';
// const TARGET_PHRASE = 'תדמית הישיבה'; 

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // --- פונקציית עזר לסידור פורמט זמן (Duration) ---
// function parseDuration(duration) {
//   if (!duration) return "00:00";
//   const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//   if (!match) return "00:00";
//   const h = parseInt(match[1] || 0);
//   const m = parseInt(match[2] || 0);
//   const s = parseInt(match[3] || 0);
  
//   if (h > 0) {
//     return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//   }
//   return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// }

// const normalizeText = (text) => {
//   if (!text) return '';
//   return text.replace(/[^\u0590-\u05FFa-zA-Z0-9]/g, '').trim();
// };

// function parseJsonDate(dateTimeStr) {
//   if (!dateTimeStr) return null;
//   const dateMatch = dateTimeStr.match(/(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{4})/);
//   if (dateMatch) {
//     const day = parseInt(dateMatch[1]);
//     const month = parseInt(dateMatch[2]) - 1;
//     const year = parseInt(dateMatch[3]);
//     const dateObj = new Date(year, month, day);
//     if (!isNaN(dateObj.getTime())) {
//       const hDate = new hebcal.HDate(dateObj);
//       return {
//         gregorian: dateObj.toISOString().split('T')[0],
//         hebrew: hDate.toString('h')
//       };
//     }
//   }
//   return null;
// }

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     ctx.request.socket.setTimeout(3600000); // שעה של זמן ריצה

//     try {
//       console.log(`🚀 מסנכרן "תדמית הישיבה" עם פורמט זמן מתוקן...`);

//       const filePath = path.join(process.cwd(), 'LessonList.json');
//       let localData = [];
//       if (fs.existsSync(filePath)) {
//         localData = JSON.parse(fs.readFileSync(filePath, 'utf8').trim().replace(/^\uFEFF/, ''));
//       }

//       const categoryObj = await strapi.documents('api::categories-main.categories-main').findFirst({
//         filters: { name: TARGET_PHRASE }
//       });

//       const channelRes = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
//       const uploadsId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

//       let currentToken = null;
//       let newCount = 0;

//       for (let page = 1; page <= 60; page++) {
//         console.log(`⏳ סורק דף ${page}/60...`);
        
//         try {
//           const playlistRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
//             params: { part: 'contentDetails', playlistId: uploadsId, maxResults: 50, pageToken: currentToken, key: YOUTUBE_API_KEY },
//             timeout: 90000 
//           });

//           const ids = playlistRes.data.items.map(item => item.contentDetails.videoId);
//           const videoRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
//             params: { part: 'snippet,contentDetails', id: ids.join(','), key: YOUTUBE_API_KEY }
//           });

//           for (const video of videoRes.data.items) {
//             const rawTitle = video.snippet.title;
//             if (!rawTitle.includes(TARGET_PHRASE)) continue;

//             const existing = await strapi.db.query('api::lesson.lesson').findOne({
//               where: { youtube_id: video.id }
//             });

//             // אם הקיים נמצא אבל ה-duration שלו נראה כמו PT... נעדכן אותו. אם לא קיים, ניצור.
//             if (!existing) {
//               const normYoutube = normalizeText(rawTitle);
//               const jsonMatch = localData.find(ld => {
//                 const normJSON = normalizeText(ld.lessonName);
//                 return normYoutube.includes(normJSON) || normJSON.includes(normYoutube);
//               });

//               let finalDate = { hebrew: null, gregorian: video.snippet.publishedAt.split('T')[0] };

//               if (jsonMatch && jsonMatch.lessonDateTime) {
//                 const extractedDate = parseJsonDate(jsonMatch.lessonDateTime);
//                 if (extractedDate) finalDate = extractedDate;
//               }
              
//               if (!finalDate.hebrew) {
//                 try {
//                   finalDate.hebrew = new hebcal.HDate(new Date(finalDate.gregorian)).toString('h');
//                 } catch (e) { finalDate.hebrew = "תאריך לא ידוע"; }
//               }

//               await strapi.documents('api::lesson.lesson').create({
//                 data: {
//                   title: rawTitle.trim(),
//                   youtube_id: video.id,
//                   // --- שימוש בפונקציית הפירסום כאן ---
//                   duration: parseDuration(video.contentDetails.duration), 
//                   lesson_date_hebrew: finalDate.hebrew,
//                   lesson_date_gregorian: finalDate.gregorian,
//                   views: jsonMatch ? parseInt(jsonMatch.views) : 0,
//                   main_category: categoryObj ? categoryObj.id : null,
//                   rabbi: null,
//                   publishedAt: new Date(),
//                   locale: 'en'
//                 },
//                 status: 'published'
//               });
//               console.log(`✨ שמרתי שיעור: ${rawTitle} (${parseDuration(video.contentDetails.duration)})`);
//               newCount++;
//             }
//           }

//           currentToken = playlistRes.data.nextPageToken;
//           if (!currentToken) break; 
//           await sleep(1000); 

//         } catch (pageError) {
//           console.error(`⚠️ שגיאה בדף ${page}:`, pageError.message);
//           await sleep(5000);
//           continue; 
//         }
//       }

//       return { message: `Completed! Added ${newCount} new videos.` };

//     } catch (err) {
//       console.error('❌ שגיאה קריטית:', err.message);
//       return ctx.badRequest(`Sync failed: ${err.message}`);
//     }
//   },
// }));
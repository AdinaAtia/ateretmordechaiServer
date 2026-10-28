
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import { parseStringPromise } from 'xml2js';
// import hebcal from 'hebcal';

// const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjCwvHzEeN0dGO4eaaQi6KQ';

// // הוצאת הפונקציה החוצה - מבטיח שהיא זמינה תמיד ולא מפריעה לאתחול משתנים
// const formatDuration = (pt) => {
//     if (!pt) return "00:00";
//     const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//     if (!match) return "00:00";
//     const h = parseInt(match[1] || 0);
//     const m = parseInt(match[2] || 0);
//     const s = parseInt(match[3] || 0);
//     return h > 0 
//         ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
//         : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('--- התחלת תהליך סנכרון ---');

//       // שלב 1: משיכת ה-RSS
//       let rssResponse = await axios.get(RSS_URL, {
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//         }
//       });

//       // שלב 2: פירוח ה-XML
//       const rssResult = await parseStringPromise(rssResponse.data);
//       const entries = rssResult.feed.entry || [];
//       if (entries.length === 0) return { message: "אין סרטונים לסנכרון" };

//       const videoIds = entries.map(e => e['yt:videoId'][0]);

//       // שלב 3: YouTube API למשך זמן
//       let videoDetailsMap = {};
//       const videoDetailsRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`);
//       videoDetailsRes.data.items.forEach(item => {
//         videoDetailsMap[item.id] = item.contentDetails.duration;
//       });

//       // שלב 4: שליפת רבנים מסטראפי (קורה לפני הלולאה!)
//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       console.log(`✅ נשלפו ${allRabbis.length} רבנים.`);

//       // שלב 5: לולאת עיבוד ויצירה
//       let newCount = 0;

//       for (const entry of entries) {
//         const videoId = entry['yt:videoId'][0];
//         const rawTitle = entry.title[0];

//         try {
//           const existing = await strapi.db.query('api::lesson.lesson').findOne({
//             where: { youtube_id: videoId }
//           });

//           if (!existing) {
//             console.log(`   - יוצר שיעור חדש: ${rawTitle}`);
            
//             const duration = videoDetailsMap[videoId] ? formatDuration(videoDetailsMap[videoId]) : "00:00";
//             const publishedDate = entry.published[0];
            
//             // שיפור זיהוי הרב: הסרת "הרב" מהשם בסטראפי לצורך השוואה גמישה
//             const foundRabbi = allRabbis.find(r => {
//                 const cleanName = r.name.replace('הרב', '').trim();
//                 return rawTitle.includes(cleanName);
//             });

//             const parts = rawTitle.split(' - ');
//             const cleanTitle = parts.length > 1 ? parts.slice(1).join(' - ').trim() : rawTitle;

//             await strapi.documents('api::lesson.lesson').create({
//               data: {
//                 title: cleanTitle,
//                 youtube_id: videoId,
//                 duration: duration,
//                 lesson_date_gregorian: publishedDate.split('T')[0],
//                 lesson_date_hebrew: new hebcal.HDate(new Date(publishedDate)).toString('h'),
//                 rabbi: foundRabbi ? foundRabbi.id : null,
//                 publishedAt: new Date(),
//                 locale: 'en'
//               },
//               status: 'published',
//             });
//             newCount++;
//           }
//         } catch (innerError) {
//           console.error(`   ❌ שגיאה בעיבוד סרטון ${videoId}:`, innerError.message);
//         }
//       }

//       return { message: `הסנכרון הושלם. נוספו ${newCount} שיעורים.` };

//     } catch (err) {
//       console.error('🔥 שגיאה קריטית בתהליך:', err.message);
//       return ctx.badRequest(err.message);
//     }
//   },
// }));
//הכי טוב!!!!!
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import { parseStringPromise } from 'xml2js';
// import hebcal from 'hebcal';

// const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjCwvHzEeN0dGO4eaaQi6KQ';

// const formatDuration = (pt) => {
//     if (!pt) return "00:00";
//     const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//     if (!match) return "00:00";
//     const h = parseInt(match[1] || 0);
//     const m = parseInt(match[2] || 0);
//     const s = parseInt(match[3] || 0);
//     return h > 0 
//         ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
//         : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('--- [סנכרון] מתחיל השלמת פערים (יצירה חדשה בלבד) ---');

//       // 1. משיכת ה-RSS
//       let rssResponse = await axios.get(RSS_URL, {
//         headers: { 'User-Agent': 'Mozilla/5.0' }
//       });
//       const rssResult = await parseStringPromise(rssResponse.data);
//       const entries = rssResult.feed.entry || [];
//       const videoIds = entries.map(e => e['yt:videoId'][0]);

//       // 2. YouTube API - אורך סרטון בלבד (עובד בנטפרי)
//       const videoDetailsRes = await axios.get(
//         `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
//       );
      
//       let videoDetailsMap = {};
//       videoDetailsRes.data.items.forEach(item => {
//         videoDetailsMap[item.id] = item.contentDetails.duration;
//       });

//       // 3. שליפת רבנים
//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       let newCount = 0;

//       // 4. לולאת בדיקה ויצירה
//       for (const entry of entries) {
//         const videoId = entry['yt:videoId'][0];
//         const rawTitle = entry.title[0];

//         // בדיקה אם הסרטון כבר קיים במסד הנתונים
//         const existing = await strapi.db.query('api::lesson.lesson').findOne({
//           where: { youtube_id: videoId }
//         });

//         // אם הוא לא קיים - רק אז יוצרים
//         if (!existing) {
//           console.log(`🆕 נמצא שיעור חדש להוספה: ${rawTitle}`);
          
//           const duration = videoDetailsMap[videoId] ? formatDuration(videoDetailsMap[videoId]) : "00:00";
//           const publishedDate = entry.published[0];
          
//           // חילוץ צפיות מה-RSS
//           let rssViews = 0;
//           try {
//             if (entry['media:group'] && entry['media:group'][0]['media:community']) {
//               rssViews = parseInt(entry['media:group'][0]['media:community'][0]['media:statistics'][0].$.views || 0);
//             }
//           } catch (e) { rssViews = 0; }

//           // זיהוי הרב
//           const foundRabbi = allRabbis.find(r => rawTitle.includes(r.name.replace('הרב', '').trim()));
          
//           // ניקוי כותרת
//           const cleanTitle = rawTitle.split(' - ').length > 1 
//             ? rawTitle.split(' - ').slice(1).join(' - ').trim() 
//             : rawTitle;

//           // יצירה בסטראפי 5
//           await strapi.documents('api::lesson.lesson').create({
//             data: {
//               title: cleanTitle,
//               youtube_id: videoId,
//               duration: duration,
//               views: rssViews,
//               lesson_date_gregorian: publishedDate.split('T')[0],
//               lesson_date_hebrew: new hebcal.HDate(new Date(publishedDate)).toString('h'),
//               rabbi: foundRabbi ? foundRabbi.id : null,
//               publishedAt: new Date(),
//               locale: 'en'
//             },
//             status: 'published',
//           });
//           newCount++;
//         }
//       }

//       return { message: "סנכרון הושלם", added: newCount };

//     } catch (err) {
//       console.error('--- [X] שגיאה ---', err.message);
//       return ctx.badRequest(err.message);
//     }
//   },
// }));
///בדיקה של כמות הצפיות במסד נתונים להומת יוטיוב
// import { factories } from '@strapi/strapi';
// import axios from 'axios';

// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       const startDate = "2026-01-14T00:00:00Z";
//       console.log(`--- [דו"ח סריקה מלאה מורחב] מתחיל סריקה מה-14/01/2026 ---`);

//       let allItems = [];
//       let nextPageToken = "";
//       let totalRequests = 0;

//       // 1. איסוף כל הסרטונים מיוטיוב בנגלות (Pagination)
//       do {
//         totalRequests++;
//         const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
//           params: {
//             part: 'snippet',
//             channelId: CHANNEL_ID,
//             publishedAfter: startDate,
//             maxResults: 50,
//             order: 'date',
//             type: 'video',
//             pageToken: nextPageToken,
//             key: YOUTUBE_API_KEY
//           }
//         });

//         allItems = allItems.concat(response.data.items || []);
//         nextPageToken = response.data.nextPageToken;

//       } while (nextPageToken);

//       console.log(`סיום איסוף: נמצאו ${allItems.length} סרטונים ביוטיוב.`);
//       console.log('------------------------------------------------------------');

//       // 2. עיבוד בנגלות של 50 לצורך סטטיסטיקות
//       for (let i = 0; i < allItems.length; i += 50) {
//         const batch = allItems.slice(i, i + 50);
//         const videoIds = batch.map(item => item.id.videoId).join(',');

//         const statsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
//           params: {
//             part: 'statistics',
//             id: videoIds,
//             key: YOUTUBE_API_KEY
//           }
//         });

//         const statsMap = {};
//         statsRes.data.items.forEach(v => {
//           statsMap[v.id] = parseInt(v.statistics.viewCount || 0);
//         });

//         // 3. הצלבה מול האתר כולל בדיקת סטטוס (Draft/Published)
//         for (const item of batch) {
//           const vId = item.id.videoId;
//           const title = item.snippet.title;
//           const ytViews = statsMap[vId] || 0;

//           // חיפוש ב-Strapi כולל טיוטות
//           const existing = await strapi.documents('api::lesson.lesson').findMany({
//             filters: { youtube_id: vId },
//             status: 'draft', // מאפשר למצוא גם את אלו שלא פורסמו
//             fields: ['views', 'title', 'publishedAt'] 
//           });

//           if (existing.length === 0) {
//             console.log(`❌ חסר באתר: "${title}"`);
//             console.log(`   🆔 מזהה יוטיוב: ${vId} | 📺 ביוטיוב: ${ytViews} צפיות`);
//           } else {
//             const lesson = existing[0];
//             const status = lesson.publishedAt ? '✅ מפורסם (Published)' : '📝 טיוטה (Draft)';
//             const dbViews = lesson.views || 0;
            
//             console.log(`${status}: "${title}"`);
//             console.log(`   🆔 מזהה יוטיוב: ${vId}`);
            
//             if (dbViews !== ytViews) {
//               console.log(`   ⚠️ פער צפיות - באתר: ${dbViews} | ביוטיוב: ${ytViews} (הפרש: ${ytViews - dbViews})`);
//             }
//           }
//           console.log('   ---');
//         }
//         console.log(`--- הושלמה בדיקת ${Math.min(i + 50, allItems.length)} מתוך ${allItems.length} ---`);
//       }

//       return { 
//         message: "Full detailed report completed", 
//         total_youtube: allItems.length 
//       };

//     } catch (err) {
//       console.error('שגיאה:', err.message);
//       return ctx.badRequest(err.message);
//     }
//   },
// }));


//הקוד שנטפרי פתחו יום רבעי

// import { factories } from '@strapi/strapi';
// import axios from 'axios';

// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('--- מנסה לפנות ליוטיוב ---');

//       const searchRes = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=id&channelId=${CHANNEL_ID}&maxResults=50&order=date&type=video&key=${YOUTUBE_API_KEY}`);
      
//       // אם הגענו לכאן, החיפוש הצליח
//       const videoIds = searchRes.data.items.map(item => item.id.videoId);
      
//       const statsRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`);
//       const videoItems = statsRes.data.items || [];

//       let updatedCount = 0;
//       for (const ytVideo of videoItems) {
//         const youtubeId = ytVideo.id;
//         const ytViews = parseInt(ytVideo.statistics?.viewCount || '0');

//         const existing = await strapi.documents('api::lesson.lesson').findMany({
//           filters: { youtube_id: youtubeId }
//         });

//         if (existing.length > 0) {
//           const lesson = existing[0];
//           const dbViews = Number(lesson.views) || 0;

//           if (ytViews > dbViews) {
//             await strapi.documents('api::lesson.lesson').update({
//               documentId: lesson.documentId,
//               data: { views: ytViews }
//             });
//             updatedCount++;
//           }
//         }
//       }

//       return { success: true, updated: updatedCount };

//     } catch (err) {
//       // כאן הקוד ידפיס לך את הסיבה האמיתית בטרמינל
//       console.log('--- איתור תקלה ---');
//       if (err.response) {
//         // מדפיס את השגיאה המפורטת שחזרה מהשרת (גוגל או נטפרי)
//         console.log('סטטוס שגיאה:', err.response.status);
//         console.log('פירוט מהשרת:', JSON.stringify(err.response.data, null, 2));
//       } else {
//         console.log('שגיאת תקשורת:', err.message);
//       }
      
//       return ctx.badRequest(`התהליך נכשל. פרטים בטרמינל.`);
//     }
//   },
// }));
// import { factories } from '@strapi/strapi';
// import axios from 'axios';

// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';
// const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace('UC', 'UU'); 

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('--- מתחיל סריקה מול יוטיוב ---');

//       const response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
//         params: {
//           part: 'snippet,contentDetails',
//           playlistId: UPLOADS_PLAYLIST_ID,
//           maxResults: 50,
//           key: YOUTUBE_API_KEY
//         }
//       });

//       const items = response.data.items || [];
//       let foundList = [];
//       let missingList = [];

//       for (const item of items) {
//         const youtubeId = item.contentDetails.videoId;
//         const youtubeTitle = item.snippet.title;

//         // חיפוש ב-DB
//         const existing = await strapi.documents('api::lesson.lesson').findMany({
//           filters: { youtube_id: youtubeId },
//           status: 'draft',
//           select: ['id', 'title']
//         });

//         if (existing.length > 0) {
//           foundList.push({ id: youtubeId, title: existing[0].title });
//         } else {
//           missingList.push({ id: youtubeId, title: youtubeTitle });
//         }
//       }

//       // הדפסת הרשימה של מה שקיים
//       console.log('\n✅ --- סרטונים שקיימים ב-DB ---');
//       foundList.forEach(vid => {
//         console.log(`[${vid.id}] - ${vid.title}`);
//       });

//       // הדפסת הרשימה של מה שחסר
//       console.log('\n❌ --- סרטונים שחסרים ב-DB ---');
//       missingList.forEach(vid => {
//         console.log(`[${vid.id}] - ${vid.title}`);
//       });

//       console.log('\n--------------------------');
//       console.log(`סיכום: ${foundList.length} נמצאו, ${missingList.length} חסרים.`);

//       return { 
//         success: true, 
//         found: foundList,
//         missing: missingList 
//       };

//     } catch (err) {
//       console.error('שגיאה:', err.message);
//       return ctx.badRequest('תקלה בסנכרון.');
//     }
//   },
// }));
// }));
//הקוד שנשלח לנטפרי 
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import hebcal from 'hebcal';

// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';

// // פונקציה לחישוב אורך סרטון מפורמט יוטיוב
// const formatDuration = (pt) => {
//     if (!pt) return "00:00";
//     const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//     if (!match) return "00:00";
//     const h = parseInt(match[1] || 0);
//     const m = parseInt(match[2] || 0);
//     const s = parseInt(match[3] || 0);
//     return h > 0 
//         ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
//         : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('--- [סנכרון] מתחיל תהליך השלמת 50 שיעורים אחרונים ---');

//       // 1. שליפת רשימת 50 הסרטונים האחרונים (חיפוש לפי תאריך)
//       const searchRes = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
//         params: {
//           part: 'snippet',
//           channelId: CHANNEL_ID,
//           maxResults: 50,
//           order: 'date',
//           type: 'video',
//           key: YOUTUBE_API_KEY
//         }
//       });

//       const items = searchRes.data.items || [];
//       const videoIds = items.map(item => item.id.videoId);

//       // 2. שליפת נתונים טכניים (אורך וצפיות) עבור כל הסרטונים שנמצאו
//       const detailsRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
//         params: {
//           part: 'contentDetails,statistics',
//           id: videoIds.join(','),
//           key: YOUTUBE_API_KEY
//         }
//       });

//       const detailsMap = {};
//       detailsRes.data.items.forEach(v => {
//         detailsMap[v.id] = {
//           duration: formatDuration(v.contentDetails.duration),
//           views: parseInt(v.statistics.viewCount || 0)
//         };
//       });

//       // 3. הכנת נתוני עזר מה-DB (רבנים)
//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       let newCount = 0;
//       let updatedCount = 0;

//       for (const item of items) {
//         const videoId = item.id.videoId;
//         const rawTitle = item.snippet.title;
//         const publishedAt = item.snippet.publishedAt;

//         // בדיקה האם השיעור קיים ב-Strapi
//         const existing = await strapi.documents('api::lesson.lesson').findMany({
//           filters: { youtube_id: videoId },
//           status: 'draft'
//         });

//         if (existing.length === 0) {
//           // --- יצירת שיעור חדש ---
//           console.log(`🆕 מוסיף שיעור חסר למסד הנתונים: ${rawTitle}`);
          
//           const foundRabbi = allRabbis.find(r => rawTitle.includes(r.name.replace('הרב', '').trim()));
//           const cleanTitle = rawTitle.split(' - ').length > 1 
//             ? rawTitle.split(' - ').slice(1).join(' - ').trim() 
//             : rawTitle;

//           await strapi.documents('api::lesson.lesson').create({
//             data: {
//               title: cleanTitle,
//               youtube_id: videoId,
//               duration: detailsMap[videoId]?.duration || "00:00",
//               views: detailsMap[videoId]?.views || 0,
//               lesson_date_gregorian: publishedAt.split('T')[0],
//               lesson_date_hebrew: new hebcal.HDate(new Date(publishedAt)).toString('h'),
//               rabbi: foundRabbi ? foundRabbi.id : null,
//               publishedAt: new Date(),
//               locale: 'en'
//             },
//             status: 'published'
//           });
//           newCount++;
//         } else {
//           // --- עדכון שיעור קיים ---
//           const lesson = existing[0];
//           await strapi.documents('api::lesson.lesson').update({
//             documentId: lesson.documentId,
//             data: { views: detailsMap[videoId]?.views || 0 }
//           });
//           // וודוא פרסום (מעביר מ-Modified ל-Published)
//           await strapi.documents('api::lesson.lesson').publish({
//             documentId: lesson.documentId
//           });
//           updatedCount++;
//         }
//       }

//       return { success: true, message: `הסנכרון הסתיים: ${newCount} שיעורים נוספו, ${updatedCount} עודכנו.` };

//     } catch (err) {
//       console.error('שגיאה בסנכרון:', err.message);
//       return ctx.badRequest(`שגיאת תקשורת: ${err.message}`);
//     }
//   },
// }));





///משלים לי אם לא נכנסו כל המשך שיעור
// import { factories } from '@strapi/strapi';
// import axios from 'axios';


// function parseDuration(ytDuration: string) {
//   const match = ytDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//   if (!match) return "00:00";
//   const hours = (parseInt(match[1]) || 0);
//   const minutes = (parseInt(match[2]) || 0);
//   const seconds = (parseInt(match[3]) || 0);
//   const parts = [];
//   if (hours > 0) parts.push(hours.toString().padStart(2, '0'));
//   parts.push(minutes.toString().padStart(2, '0'));
//   parts.push(seconds.toString().padStart(2, '0'));
//   return parts.join(':');
// }

// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('--- [סנכרון השלמות] מחפש שיעורים ללא משך זמן ---');

//       // שימוש ב-any כאן מרגיע את TypeScript לגבי מבנה ה-fields וה-filters
//       const lessonsToUpdate = await (strapi as any).documents('api::lesson.lesson').findMany({
//         filters: {
//           $or: [
//             { duration: { $null: true } },
//             { duration: '00:00' },
//             { duration: '' }
//           ]
//         },
//         fields: ['youtube_id', 'title', 'documentId'],
//         limit: 400 
//       });

//       console.log(`נמצאו ${lessonsToUpdate.length} שיעורים להשלמה בסבב זה.`);

//       if (lessonsToUpdate.length === 0) {
//         return { message: "הכל מעודכן! לא נמצאו שיעורים ללא זמן." };
//       }

//       let successCount = 0;

//       for (const lesson of lessonsToUpdate) {
//         try {
//           const res = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
//             params: {
//               part: 'contentDetails',
//               id: lesson.youtube_id,
//               key: YOUTUBE_API_KEY
//             }
//           });

//           if (res.data.items?.length > 0) {
//             const rawDuration = res.data.items[0].contentDetails.duration;
//             const formattedDuration = parseDuration(rawDuration);
            
//             await strapi.documents('api::lesson.lesson').update({
//               documentId: lesson.documentId,
//               data: { duration: formattedDuration } as any
//             });
//             await strapi.documents('api::lesson.lesson').publish({ documentId: lesson.documentId });

//             successCount++;
//             if (successCount % 10 === 0) {
//                 console.log(`[${successCount}] עודכן: ${lesson.title} -> ${formattedDuration}`);
//             }
//           }

//           await sleep(300);

//         } catch (err: any) {
//           if (err.response?.status === 418) {
//             console.error("!!! חסימת קומקום מיוטיוב !!!");
//             break;
//           }
//         }
//       }

//       return { success: true, updated: successCount };

//     } catch (err: any) {
//       console.error('שגיאה:', err.message);
//       return ctx.badRequest(err.message);
//     }
//   }
// }));
////הקוד שבודק את הפאר ביון כמות הצפיות ביוטיוב לבין כמות הצפיות באתר

// import { factories } from '@strapi/strapi';
// import axios from 'axios';

// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('--- [בדיקת פערים מקיפה] סריקה של כל השיעורים באתר ---');

//       // משיכת כל השיעורים הקיימים (עד 5000 כדי לוודא ששום דבר לא מתפספס)
//       const lessons = await (strapi as any).documents('api::lesson.lesson').findMany({
//         fields: ['youtube_id', 'title', 'views'],
//         limit: 5000 
//       });

//       console.log(`מתחיל בדיקה עבור ${lessons.length} שיעורים. זה עשוי לקחת כמה דקות...`);
//       console.log('--------------------------------------------------');

//       let gapCount = 0;
//       let totalNewViews = 0;

//       for (const lesson of lessons) {
//         try {
//           if (!lesson.youtube_id) continue; // דילוג על שיעורים ללא מזהה יוטיוב

//           const res = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
//             params: {
//               part: 'statistics',
//               id: lesson.youtube_id,
//               key: YOUTUBE_API_KEY
//             }
//           });

//           if (res.data.items?.length > 0) {
//             const viewsInYouTube = parseInt(res.data.items[0].statistics.viewCount) || 0;
//             const viewsInDB = lesson.views || 0;

//             if (viewsInYouTube !== viewsInDB) {
//               gapCount++;
//               const diff = viewsInYouTube - viewsInDB;
//               totalNewViews += (diff > 0 ? diff : 0);

//               console.log(`[!] פער בשיעור: "${lesson.title}"`);
//               console.log(`    ב-DB: ${viewsInDB} | ביוטיוב: ${viewsInYouTube} (הפרש: ${diff})`);
//             }
//           }

//           // השהיה קצרה של 200 מילישניות כדי לשמור על יציבות ולא להיחסם
//           await sleep(200);

//           // הדפסת התקדמות כל 50 שיעורים כדי שנדע שהקוד עדיין רץ
//           if ((lessons.indexOf(lesson) + 1) % 50 === 0) {
//              console.log(`--- נבדקו ${lessons.indexOf(lesson) + 1} שיעורים עד כה... ---`);
//           }

//         } catch (err: any) {
//           if (err.response?.status === 418) {
//             console.error("!!! חסימת קומקום מיוטיוב - עוצר סריקה כדי להגן על ה-IP !!!");
//             break;
//           }
//         }
//       }

//       console.log('--------------------------------------------------');
//       console.log(`סיום סריקה כללית!`);
//       console.log(`נמצאו ${gapCount} שיעורים שזקוקים לעדכון.`);
//       console.log(`סה"כ צפיות חדשות שנצברו ביוטיוב וטרם עודכנו: ${totalNewViews}`);
      
//       return { 
//         message: "סריקה מקיפה הסתיימה", 
//         total_checked: lessons.length,
//         gaps_found: gapCount,
//         potential_views_to_add: totalNewViews
//       };

//     } catch (err: any) {
//       console.error('שגיאה כללית:', err.message);
//       return ctx.badRequest(err.message);
//     }
//   }
// }));



///הקוד שניסתי שיביא גם את הקטגוריות!
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import { parseStringPromise } from 'xml2js';
// import hebcal from 'hebcal';

// const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjCwvHzEeN0dGO4eaaQi6KQ';

// // פונקציה חכמה לניקוי טקסט לצורך השוואה
// const cleanForMatch = (str) => {
//   if (!str) return "";
//   return str.replace(/[''"״׳\.]/g, '') // מסיר גרשיים ונקודות
//             .replace(/\bתשפ[א-ת]\b/g, '') // מסיר שנה (תשפ"ו, תשפ"ה וכו')
//             .replace(/\s+/g, ' ') // מנקה רווחים כפולים
//             .trim();
// };

// const formatDuration = (pt) => {
//     if (!pt) return "00:00";
//     const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//     if (!match) return "00:00";
//     const h = parseInt(match[1] || 0);
//     const m = parseInt(match[2] || 0);
//     const s = parseInt(match[3] || 0);
//     return h > 0 
//         ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
//         : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async sync(ctx) {
//     try {
//       console.log('--- [סנכרון] מתחיל - מצב חיפוש חכם (פורים/תשפ"ו) ---');

//       // 1. קבלת נתונים מיוטיוב
//       let rssResponse = await axios.get(RSS_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
//       const rssResult = await parseStringPromise(rssResponse.data);
//       const entries = rssResult.feed.entry || [];
//       const videoIds = entries.map(e => e['yt:videoId'][0]);

//       const videoDetailsRes = await axios.get(
//         `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
//       );
//       let videoDetailsMap = {};
//       videoDetailsRes.data.items.forEach(item => { videoDetailsMap[item.id] = item.contentDetails.duration; });

//       // 2. שליפת רבנים וקטגוריות מהמסד
//       const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//       const mains = await strapi.documents('api::categories-main.categories-main').findMany();
//       const subs = await strapi.documents('api::categories-sub.categories-sub').findMany();
      
//       let newCount = 0;

//       for (const entry of entries) {
//         const videoId = entry['yt:videoId'][0];
//         const rawTitle = entry.title[0];

//         // בדיקה אם קיים כבר ב-DB
//         const existing = await strapi.db.query('api::lesson.lesson').findOne({
//           where: { youtube_id: videoId }
//         });

//         if (!existing) {
//           const parts = rawTitle.split(' - ').map(p => p.trim());
//           const foundRabbi = allRabbis.find(r => rawTitle.includes((r.name || "").replace('הרב', '').trim()));

//           let finalMainId = null;
//           let finalSubId = null;
//           let logTarget = "ללא שיוך";

//           // לוגיקת זיהוי קטגוריה
//           for (let i = 1; i < parts.length - 1; i++) {
//             const part = parts[i];
//             const cleanPart = cleanForMatch(part); // הופך למשל "פורים תשפ"ו" ל-"פורים"
            
//             if (cleanPart.length < 2 || cleanPart.includes("שיעור")) continue;

//             // בדיקה ב-Sub Categories
//             const matchedSub = subs.find(s => {
//               const sName = cleanForMatch(s.name);
//               return sName && (cleanPart.includes(sName) || sName.includes(cleanPart));
//             });

//             if (matchedSub) {
//               finalSubId = matchedSub.id;
//               logTarget = `Sub: ${matchedSub.name}`;
//               break;
//             }

//             // בדיקה ב-Main Categories
//             const matchedMain = mains.find(m => {
//               const mName = cleanForMatch(m.name);
//               return mName && (cleanPart.includes(mName) || mName.includes(cleanPart));
//             });

//             if (matchedMain) {
//               finalMainId = matchedMain.id;
//               logTarget = `Main: ${matchedMain.name}`;
//               break;
//             }
//           }

//           const cleanTitle = parts[parts.length - 1];
//           const publishedDate = entry.published[0];

//           console.log(`📝 יוצר טיוטה: [${cleanTitle}] | שיוך שנמצא: [${logTarget}]`);

//           // 3. שמירה בסטראפי (Draft)
//           await strapi.documents('api::lesson.lesson').create({
//             data: {
//               title: cleanTitle,
//               youtube_id: videoId,
//               duration: videoDetailsMap[videoId] ? formatDuration(videoDetailsMap[videoId]) : "00:00",
//               lesson_date_gregorian: publishedDate.split('T')[0],
//               lesson_date_hebrew: new hebcal.HDate(new Date(publishedDate)).toString('h'),
//               rabbi: foundRabbi ? foundRabbi.id : null,
//               main_category: finalMainId,
//               sub_category: finalSubId,
//               publishedAt: null, // חשוב: נשמר כטיוטה
//               locale: 'en'
//             },
//             status: 'draft',
//           });
//           newCount++;
//         }
//       }

//       return { message: "סנכרון הושלם בהצלחה", added: newCount };
//     } catch (err) {
//       console.error('--- [X] שגיאה ---', err.message);
//       return ctx.badRequest(err.message);
//     }
//   },
// }));



// import { factories } from '@strapi/strapi';
// import axios from 'axios';

// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';
// const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace('UC', 'UU'); 

// const decodeHtml = (str) => {
//     return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//     async sync(ctx) {
//         try {
//             console.log('--- [סנכרון מורחב] מושך 100 סרטונים אחרונים (2 נגלות) ---');

//             let allItems = [];
//             let nextPageToken = '';

//             // ביצוע 2 נגלות של 50
//             for (let i = 0; i < 2; i++) {
//                 const playlistRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
//                     params: {
//                         part: 'snippet,contentDetails',
//                         playlistId: UPLOADS_PLAYLIST_ID,
//                         maxResults: 50,
//                         pageToken: nextPageToken, // המפתח לנגלה הבאה
//                         key: YOUTUBE_API_KEY
//                     }
//                 });

//                 allItems = allItems.concat(playlistRes.data.items || []);
//                 nextPageToken = playlistRes.data.nextPageToken;

//                 if (!nextPageToken) break; // אם אין יותר סרטונים בערוץ
//             }

//             console.log(`נמצאו ${allItems.length} סרטונים ביוטיוב לעיבוד.`);

//             const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//             let processCount = 0;
//             let updatedCount = 0;

//             for (const item of allItems) {
//                 processCount++;
//                 const videoId = item.contentDetails.videoId;
//                 const youtubeTitle = decodeHtml(item.snippet.title);

//                 // לוגיקת ניקוי שם הרב בלבד
//                 let cleanTitle = youtubeTitle;
//                 for (const r of allRabbis) {
//                     const rabbiName = r.name.replace('הרב', '').trim();
//                     if (youtubeTitle.includes(rabbiName)) {
//                         const regex = new RegExp(`(הרב\\s+)?${rabbiName}`, 'g');
//                         cleanTitle = cleanTitle.replace(regex, '');
//                         break;
//                     }
//                 }
//                 cleanTitle = cleanTitle.replace(/^[\s\-\|.:]+/, '').trim();

//                 // חיפוש ב-DB ועדכון
//                 const existing = await strapi.documents('api::lesson.lesson').findMany({
//                     filters: { youtube_id: videoId }
//                 });

//                 if (existing.length > 0) {
//                     await strapi.documents('api::lesson.lesson').update({
//                         documentId: existing[0].documentId,
//                         data: { title: cleanTitle },
//                         status: 'published'
//                     });
//                     updatedCount++;
//                     console.log(`[${processCount}] ✅ עודכן ב-DB: ${cleanTitle}`);
//                 } else {
//                     console.log(`[${processCount}] ⚪ סרטון לא קיים באתר: ${cleanTitle}`);
//                 }
//             }

//             return { 
//                 success: true, 
//                 message: `נסרקו ${allItems.length} סרטונים, מתוכם ${updatedCount} עודכנו באתר.` 
//             };

//         } catch (err) {
//             console.error('❌ שגיאה:', err.message);
//             return ctx.badRequest(err.message);
//         }
//     },
// }));
//קוד שמסדר את השמותש ל 100 האחרומניים בלי שם הרב
// import { factories } from '@strapi/strapi';
// import axios from 'axios';

// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';
// const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace('UC', 'UU'); 

// const decodeHtml = (str) => {
//     return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//     async sync(ctx) {
//         try {
//             console.log('--- [סנכרון מורחב] מושך 100 סרטונים אחרונים (2 נגלות) ---');

//             let allItems = [];
//             let nextPageToken = '';

//             // ביצוע 2 נגלות של 50
//             for (let i = 0; i < 2; i++) {
//                 const playlistRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
//                     params: {
//                         part: 'snippet,contentDetails',
//                         playlistId: UPLOADS_PLAYLIST_ID,
//                         maxResults: 50,
//                         pageToken: nextPageToken, // המפתח לנגלה הבאה
//                         key: YOUTUBE_API_KEY
//                     }
//                 });

//                 allItems = allItems.concat(playlistRes.data.items || []);
//                 nextPageToken = playlistRes.data.nextPageToken;

//                 if (!nextPageToken) break; // אם אין יותר סרטונים בערוץ
//             }

//             console.log(`נמצאו ${allItems.length} סרטונים ביוטיוב לעיבוד.`);

//             const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//             let processCount = 0;
//             let updatedCount = 0;

//             for (const item of allItems) {
//                 processCount++;
//                 const videoId = item.contentDetails.videoId;
//                 const youtubeTitle = decodeHtml(item.snippet.title);

//                 // לוגיקת ניקוי שם הרב בלבד
//                 let cleanTitle = youtubeTitle;
//                 for (const r of allRabbis) {
//                     const rabbiName = r.name.replace('הרב', '').trim();
//                     if (youtubeTitle.includes(rabbiName)) {
//                         const regex = new RegExp(`(הרב\\s+)?${rabbiName}`, 'g');
//                         cleanTitle = cleanTitle.replace(regex, '');
//                         break;
//                     }
//                 }
//                 cleanTitle = cleanTitle.replace(/^[\s\-\|.:]+/, '').trim();

//                 // חיפוש ב-DB ועדכון
//                 const existing = await strapi.documents('api::lesson.lesson').findMany({
//                     filters: { youtube_id: videoId }
//                 });

//                 if (existing.length > 0) {
//                     await strapi.documents('api::lesson.lesson').update({
//                         documentId: existing[0].documentId,
//                         data: { title: cleanTitle },
//                         status: 'published'
//                     });
//                     updatedCount++;
//                     console.log(`[${processCount}] ✅ עודכן ב-DB: ${cleanTitle}`);
//                 } else {
//                     console.log(`[${processCount}] ⚪ סרטון לא קיים באתר: ${cleanTitle}`);
//                 }
//             }

//             return { 
//                 success: true, 
//                 message: `נסרקו ${allItems.length} סרטונים, מתוכם ${updatedCount} עודכנו באתר.` 
//             };

//         } catch (err) {
//             console.error('❌ שגיאה:', err.message);
//             return ctx.badRequest(err.message);
//         }
//     },
// }));



//מעדכן את הצפיות מהתאריך שמשכתי את השיעורים

// import { factories } from '@strapi/strapi';
// import axios from 'axios';

// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';
// const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace('UC', 'UU'); 

// // הגדרת תאריך הסף - סנכרון רק מ-14 בינואר 2026 ואילך
// const CUTOFF_DATE = new Date('2026-01-14T00:00:00Z');

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//     async sync(ctx) {
//         try {
//             console.log(`--- [סנכרון צפיות בלבד] בדיקה מיום: ${CUTOFF_DATE.toLocaleDateString('he-IL')} ---`);

//             let allItems: any[] = [];
//             let nextPageToken = '';
//             let updatedCount = 0;
//             let checkedCount = 0;

//             // 1. משיכת רשימת הסרטונים האחרונים מיוטיוב
//             for (let i = 0; i < 2; i++) {
//                 const playlistRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
//                     params: {
//                         part: 'snippet,contentDetails',
//                         playlistId: UPLOADS_PLAYLIST_ID,
//                         maxResults: 50,
//                         pageToken: nextPageToken,
//                         key: YOUTUBE_API_KEY
//                     }
//                 });
//                 allItems = allItems.concat(playlistRes.data.items || []);
//                 nextPageToken = playlistRes.data.nextPageToken;
//                 if (!nextPageToken) break;
//             }

//             // 2. מעבר על כל סרטון ועדכון צפיות בלבד
//             for (const item of allItems) {
//                 const videoId = item.contentDetails.videoId;
//                 const publishedAt = new Date(item.snippet.publishedAt);
//                 const youtubeTitle = item.snippet.title; // לצורך הדפסה בלוג בלבד

//                 // סינון לפי תאריך
//                 if (publishedAt < CUTOFF_DATE) {
//                     continue; 
//                 }

//                 checkedCount++;

//                 // קבלת נתוני צפיות מיוטיוב
//                 const videoData = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
//                     params: {
//                         part: 'statistics',
//                         id: videoId,
//                         key: YOUTUBE_API_KEY
//                     }
//                 });

//                 const youtubeViews = parseInt(videoData.data.items[0]?.statistics?.viewCount || '0');

//                 // חיפוש השיעור בבסיס הנתונים לפי youtube_id
//                 const existing: any = await strapi.documents('api::lesson.lesson' as any).findMany({
//                     filters: { youtube_id: videoId } as any,
//                     fields: ['views', 'documentId'] as any // מביאים רק את הצפיות וה-ID
//                 });

//                 if (existing && existing.length > 0) {
//                     const lesson = existing[0];
//                     const dbViews = lesson.views || 0;

                 

//                     // עדכון רק אם ביוטיוב יש יותר צפיות
//                     if (youtubeViews > dbViews) {
//                         await strapi.documents('api::lesson.lesson' as any).update({
//                             documentId: lesson.documentId,
//                             data: { 
//                                 views: youtubeViews 
//                                 // שים לב: לא נכנס כאן שום שדה אחר, השם לא משתנה!
//                             } as any,
//                             status: 'published'
//                         });
                        
//                         updatedCount++;
//                     }
//                 }
//             }

          

//             return { 
//                 success: true, 
//                 message: `סנכרון צפיות הושלם. נבדקו ${checkedCount} שיעורים מ-14/01, עודכנו ${updatedCount}.`,
//             };

//         } catch (err: any) {
//             console.error('❌ שגיאה בסנכרון:', err.message);
//             return ctx.badRequest(err.message);
//         }
//     },
// }));

/// מושך 15 אחרונים בצורה נכונה!!!
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import { parseStringPromise } from 'xml2js';
// import hebcal from 'hebcal';

// const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjCwvHzEeN0dGO4eaaQi6KQ';

// // פונקציית עזר להפיכת אורך סרטון לפורמט קריא
// const formatDuration = (pt) => {
//     if (!pt) return "00:00";
//     const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//     if (!match) return "00:00";
//     const h = parseInt(match[1] || 0);
//     const m = parseInt(match[2] || 0);
//     const s = parseInt(match[3] || 0);
//     return h > 0 
//         ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
//         : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//     async sync(ctx) {
//         try {
           

//             // 1. משיכת הנתונים מיוטיוב
//             let rssResponse = await axios.get(RSS_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
//             const rssResult = await parseStringPromise(rssResponse.data);
//             const entries = rssResult.feed.entry || [];
//             const videoIds = entries.map(e => e['yt:videoId'][0]);

//             // 2. משיכת פרטים נוספים (משך השיעור) מה-API
//             const videoDetailsRes = await axios.get(
//                 `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
//             );
            
//             let videoDetailsMap = {};
//             videoDetailsRes.data.items.forEach(item => {
//                 videoDetailsMap[item.id] = item.contentDetails.duration;
//             });

//             // 3. טעינת רבנים מהמערכת
//             const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//             let addedCount = 0;
//             let skippedCount = 0;

//             for (const entry of entries) {
//                 const videoId = entry['yt:videoId'][0];
//                 const rawTitle = entry.title[0];

//                 // בדיקה אם קיים
//                 const existing = await strapi.documents('api::lesson.lesson').findMany({
//                     filters: { youtube_id: videoId }
//                 });

//                 if (existing.length === 0) {
//                     const duration = videoDetailsMap[videoId] ? formatDuration(videoDetailsMap[videoId]) : "00:00";
//                     const publishedDate = entry.published[0];
//                     const hDate = new hebcal.HDate(new Date(publishedDate));

//                     // --- ניקוי שם הרב מהכותרת ---
//                     let cleanTitle = rawTitle;
//                     let foundRabbiName = "לא זוהה";
//                     let foundRabbiId = null;

//                     for (const r of allRabbis) {
//                         const baseName = r.name.replace('הרב', '').trim();
//                         if (rawTitle.includes(baseName)) {
//                             foundRabbiId = r.id;
//                             foundRabbiName = r.name;
//                             const nameRegex = new RegExp(`(הרב\\s+)?${baseName}`, 'g');
//                             cleanTitle = cleanTitle.replace(nameRegex, '');
//                             break; 
//                         }
//                     }
//                     cleanTitle = cleanTitle.replace(/^[\s\-\|.:]+/, '').trim();

//                     // --- חילוץ צפיות ---
//                     let rssViews = 0;
//                     try {
//                         rssViews = parseInt(entry['media:group'][0]['media:community'][0]['media:statistics'][0].$.views || 0);
//                     } catch (e) { rssViews = 0; }

//                     // שמירה ל-Strapi
//                     await strapi.documents('api::lesson.lesson').create({
//                         data: {
//                             title: cleanTitle,
//                             youtube_id: videoId,
//                             duration: duration,
//                             views: rssViews,
//                             lesson_date_gregorian: publishedDate.split('T')[0],
//                             lesson_date_hebrew: hDate.toString('h'),
//                             rabbi: foundRabbiId,
//                             locale: 'en',
//                             publishedAt: new Date(),
//                         },
//                         status: 'published',
//                     });

                                       
//                     addedCount++;
//                 } else {
//                     skippedCount++;
//                 }
//             }
         

//             return { 
//                 success: true, 
//                 added: addedCount, 
//                 skipped: skippedCount 
//             };

//         } catch (err) {
//             console.error('❌ שגיאה במהלך הסנכרון:', err.message);
//             return ctx.badRequest(err.message);
//         }
//     },
// }));
import { factories } from '@strapi/strapi';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import hebcal from 'hebcal';
import { syncYoutubeViews } from '../utils/sync-views';

const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjCwvHzEeN0dGO4eaaQi6KQ';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
// שרת המדיה — שם רצות ההורדה מיוטיוב וההמרה ל-MP3
const MEDIA_BASE = process.env.MEDIA_BASE_URL || 'https://ateretmordechaifiles.com';

// פונקציית עזר להפיכת אורך סרטון לפורמט קריא
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

// רשימת ה-PDF של תיקייה משרת המדיה. list-pdfs.php הישן החזיר שמות בלבד;
// הגרסה החדשה מחזירה אובייקטים עם תאריך — תומכים בשתיהן.
type PdfEntry = { fileName: string; date: string };
const fetchPdfList = async (audioDir: string): Promise<PdfEntry[]> => {
    const url = `${MEDIA_BASE}/list-pdfs.php?key=ATERET_SCAN_2026&dir=${encodeURIComponent(audioDir)}`;
    const response = await axios.get(url);
    const raw = Array.isArray(response.data) ? response.data : [];
    return raw
        .map((item: any) => typeof item === 'string'
            ? { fileName: item, date: '' }
            : { fileName: item?.fileName || item?.name || '', date: item?.date || '' })
        .filter((f: PdfEntry) => f.fileName);
};

export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
    async unpublish(ctx) {
    const { documentId } = ctx.params;
    await strapi.documents('api::lesson.lesson').unpublish({ documentId });
    ctx.body = { success: true };
},

    async publishOne(ctx) {
    const { documentId } = ctx.params;
    await strapi.documents('api::lesson.lesson').publish({ documentId });
    ctx.body = { success: true };
},

    async findDrafts(ctx) {
        try {
            const page = parseInt(ctx.query.page as string) || 1;
            const pageSize = parseInt(ctx.query.pageSize as string) || 30;
            const offset = (page - 1) * pageSize;

            const dataQuery = `
                SELECT 
                    l.id,
                    l.document_id AS "documentId",
                    l.title,
                    l.lesson_date_hebrew,
                    l.lesson_date_gregorian,
                    l.duration,
                    l.views,
                    l.youtube_id,
                    l.audio_dir AS "AudioDir",
                    l.audio_file_name AS "AudioFileName",
                    r.name AS "rabbiName"
                FROM lessons l
                LEFT JOIN lessons_rabbi_lnk lrl ON l.id = lrl.lesson_id
                LEFT JOIN rabbis r ON lrl.rabbi_id = r.id
                WHERE l.published_at IS NULL
                AND NOT EXISTS (
                    SELECT 1 FROM lessons l2 
                    WHERE l2.document_id = l.document_id 
                    AND l2.published_at IS NOT NULL
                )
                ORDER BY l.id DESC
                LIMIT ${pageSize} OFFSET ${offset};
            `;

            const countQuery = `
                SELECT COUNT(*) FROM lessons l
                WHERE l.published_at IS NULL
                AND NOT EXISTS (
                    SELECT 1 FROM lessons l2 
                    WHERE l2.document_id = l.document_id 
                    AND l2.published_at IS NOT NULL
                );
            `;

            const [dataRes, countRes] = await Promise.all([
                strapi.db.connection.raw(dataQuery),
                strapi.db.connection.raw(countQuery)
            ]);

            const rows = dataRes.rows;
            const total = parseInt(countRes.rows[0].count || 0);

            ctx.body = {
                data: rows,
                meta: { pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total } }
            };
        } catch (err) {
            ctx.badRequest("SQL Error: " + err.message);
        }
    },

    // --- הפונקציה לשליפה מהירה ב-SQL עם תמיכה בדפדוף ---
   async findFast(ctx) {
    try {
        const page = parseInt(ctx.query.page as string) || 1;
        const pageSize = parseInt(ctx.query.pageSize as string) || 30;
        const offset = (page - 1) * pageSize;
        const rawSearch = (ctx.query.search as string) || '';
        const search = rawSearch.trim();
        const rabbiDocId = (ctx.query.rabbiDocId as string) || '';
        const rabbiId = (ctx.query.rabbiId as string) || '';
        const mainCategoryId = (ctx.query.mainCategoryId as string) || '';
        const subCategoryId = (ctx.query.subCategoryId as string) || '';
        // exact=1 — התאמה מדויקת לקטגוריה בלבד (בלי צאצאים/אבות), לכפתור "לכל הסדרה"
        const exactCategory = (ctx.query.exact as string) === '1';

        // מיון — רשימה סגורה של שדות (לא מוזרק קלט גולמי ל-SQL)
        const sortDir = (ctx.query.sortDir as string) === 'asc' ? 'ASC' : 'DESC';
        const durationSecs = `(CASE
            WHEN l.duration ~ '^\\d{1,4}:\\d{1,3}:\\d{1,3}$' THEN split_part(l.duration, ':', 1)::int * 3600 + split_part(l.duration, ':', 2)::int * 60 + split_part(l.duration, ':', 3)::int
            WHEN l.duration ~ '^\\d{1,5}:\\d{1,3}$' THEN split_part(l.duration, ':', 1)::int * 60 + split_part(l.duration, ':', 2)::int
            ELSE NULL END)`;
        // מפתח מיון לשם: בלי ניקוד, גרש/גרשיים ותווים מובילים שאינם אות/ספרה
        // + רווחים/שורות חדשות מכווצים לרווח אחד, ומספרים מרופדים באפסים (כך ש-39 לפני 100)
        const cleanTitle = `regexp_replace(regexp_replace(regexp_replace(l.title, '[\\u0591-\\u05C7\\u05F3\\u05F4"''״׳]', '', 'g'), '\\s+', ' ', 'g'), '^[^א-תA-Za-z0-9]+', '')`;
        // (\\? = סימן שאלה ליטרלי — knex מפרש ? גולמי כ-binding)
        const titleKey = `regexp_replace(regexp_replace(regexp_replace(${cleanTitle}, '(\\?<!\\d)(\\d)(\\?!\\d)', '000\\1', 'g'), '(\\?<!\\d)(\\d{2})(\\?!\\d)', '00\\1', 'g'), '(\\?<!\\d)(\\d{3})(\\?!\\d)', '0\\1', 'g')`;
        const sortExpressions: Record<string, string> = {
            // שיעורים בלי תאריך עברי הם עם תאריך ברירת מחדל מזויף (1999-11-30) — תמיד בסוף
            date: `(l.lesson_date_hebrew IS NULL OR btrim(l.lesson_date_hebrew) = '') ASC, l.lesson_date_gregorian ${sortDir} NULLS LAST, split_part(regexp_replace(${titleKey}, '^[0-9]+[.\\s-]*', ''), ' - ', 1) ASC, (substring(${titleKey} from '^[0-9]+'))::int ASC NULLS LAST, ${titleKey} ASC, l.id ${sortDir}`,
            // שמות עם מספר בהתחלה ("014. אוצרות חיים...") ממוינים לפי שם הסדרה, ובתוכה לפי המספר
            title: `(l.title IS NULL OR btrim(l.title) = '') ASC, split_part(regexp_replace(${titleKey}, '^[0-9]+[.\\s-]*', ''), ' - ', 1) ${sortDir}, (substring(${titleKey} from '^[0-9]+'))::int ${sortDir} NULLS LAST, ${titleKey} ${sortDir}, l.id DESC`,
            duration: `${durationSecs} ${sortDir} NULLS LAST, l.id DESC`,
            topic: `mc.name ${sortDir} NULLS LAST, sc.name ${sortDir} NULLS LAST, l.id DESC`,
            rabbi: `r.name ${sortDir} NULLS LAST, l.lesson_date_gregorian DESC, l.id DESC`,
            views: `l.views ${sortDir} NULLS LAST, l.id DESC`,
        };
        const orderBy = sortExpressions[(ctx.query.sortBy as string) || 'date']
            || 'l.lesson_date_gregorian DESC, l.id DESC';

        let conditions = 'l.published_at IS NOT NULL';
        const dataBindings: any[] = [];
        const countBindings: any[] = [];

        if (rabbiDocId) {
            conditions += ` AND r.document_id = ?`;
            dataBindings.push(rabbiDocId);
            countBindings.push(rabbiDocId);
        } else if (rabbiId) {
            const rabbiIds = rabbiId.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (rabbiIds.length === 1) {
                conditions += ` AND lrl.rabbi_id = ?`;
                dataBindings.push(rabbiIds[0]);
                countBindings.push(rabbiIds[0]);
            } else if (rabbiIds.length > 1) {
                const placeholders = rabbiIds.map(() => '?').join(',');
                conditions += ` AND lrl.rabbi_id IN (${placeholders})`;
                dataBindings.push(...rabbiIds);
                countBindings.push(...rabbiIds);
            }
        }

        if (mainCategoryId && exactCategory) {
            const mainId = parseInt(mainCategoryId);
            if (!isNaN(mainId)) {
                conditions += ` AND lmcl.categories_main_id = ? AND lscl.categories_sub_id IS NULL`;
                dataBindings.push(mainId);
                countBindings.push(mainId);
            }
        } else if (mainCategoryId) {
            const mainIds = mainCategoryId.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (mainIds.length === 1) {
                conditions += ` AND (lmcl.categories_main_id = ? OR csmcl.categories_main_id = ?)`;
                dataBindings.push(mainIds[0], mainIds[0]);
                countBindings.push(mainIds[0], mainIds[0]);
            } else if (mainIds.length > 1) {
                const placeholders = mainIds.map(() => '?').join(',');
                conditions += ` AND (lmcl.categories_main_id IN (${placeholders}) OR csmcl.categories_main_id IN (${placeholders}))`;
                dataBindings.push(...mainIds, ...mainIds);
                countBindings.push(...mainIds, ...mainIds);
            }
        }

        let subCtePrefix = '';
        if (subCategoryId && exactCategory) {
            const exactSubId = parseInt(subCategoryId);
            if (!isNaN(exactSubId)) {
                conditions += ` AND lscl.categories_sub_id = ?`;
                dataBindings.push(exactSubId);
                countBindings.push(exactSubId);
            }
        } else if (subCategoryId) {
            const subId = parseInt(subCategoryId);
            subCtePrefix = `WITH RECURSIVE sub_tree(id) AS (
    SELECT id FROM categories_subs WHERE id = ${subId}
    UNION ALL
    SELECT cs.id FROM categories_subs cs
    JOIN categories_subs_parent_sub_lnk psub ON cs.id = psub.categories_sub_id
    JOIN sub_tree st ON psub.inv_categories_sub_id = st.id
)
`;
            conditions += ` AND lscl.categories_sub_id IN (SELECT id FROM sub_tree)`;
        }

        if (search) {
            const endsWithSpace = /\s$/.test(rawSearch);
            const words = search.split(/\s+/).filter(Boolean);
            const makeWordPattern = (w: string, isPrefix: boolean) => {
                const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (isPrefix) {
                    return `(^|\\s)${escaped}`;
                }
                return `(^|\\s)${escaped}(\\s|$)`;
            };
            const titleCond = words.map(() => `l.title ~* ?`).join(' AND ');
            const rabbiCond = words.map(() => `r.name ~* ?`).join(' AND ');
            const mcCond = words.map(() => `mc.name ~* ?`).join(' AND ');
            const scCond = words.map(() => `sc.name ~* ?`).join(' AND ');
            conditions += ` AND ((${titleCond}) OR (${rabbiCond}) OR (${mcCond}) OR (${scCond}))`;
            const patterns = words.map((w, i) => {
                const isLastWord = i === words.length - 1;
                const isPrefix = !endsWithSpace && isLastWord;
                return makeWordPattern(w, isPrefix);
            });
            dataBindings.push(...patterns, ...patterns, ...patterns, ...patterns);
            countBindings.push(...patterns, ...patterns, ...patterns, ...patterns);
        }

        dataBindings.push(pageSize, offset);

 const dataQuery = `${subCtePrefix}SELECT
        l.id,
        l.document_id AS "documentId",
        json_build_object(
            'title', l.title,
            'lesson_date_hebrew', l.lesson_date_hebrew,
            'lesson_date_gregorian', l.lesson_date_gregorian,
            'AudioDir', l.audio_dir,
            'AudioFileName', l.audio_file_name,
            'PdfFileName', l.pdf_file_name,
            'PdfFiles', l.pdf_files,
            'duration', l.duration,
            'views', l.views,
            'youtube_id', l.youtube_id,

            'rabbi', json_build_object(
                'data', CASE WHEN r.id IS NOT NULL THEN
                    json_build_object(
                        'id', r.id,
                        'attributes', json_build_object('name', r.name)
                    )
                ELSE NULL END
            ),

            'main_category', json_build_object(
                'data', CASE WHEN mc.id IS NOT NULL THEN
                    json_build_object(
                        'id', mc.id,
                        'attributes', json_build_object('name', mc.name)
                    )
                ELSE NULL END
            ),

            'sub_category', json_build_object(
                'data', CASE WHEN sc.id IS NOT NULL THEN
                    json_build_object(
                        'id', sc.id,
                        'documentId', sc.document_id,
                        'attributes', json_build_object(
                            'name', sc.name,
                            'parent_sub', (
                                SELECT json_build_object(
                                    'data', json_build_object(
                                        'attributes', json_build_object('name', p.name)
                                    )
                                )
                                FROM categories_subs p
                                JOIN categories_subs_parent_sub_lnk l_parent ON p.id = l_parent.inv_categories_sub_id
                                WHERE l_parent.categories_sub_id = sc.id
                                LIMIT 1
                            )
                        )
                    )
                ELSE NULL END
            )
        ) AS attributes
    FROM lessons l
    LEFT JOIN lessons_rabbi_lnk lrl ON l.id = lrl.lesson_id
    LEFT JOIN rabbis r ON lrl.rabbi_id = r.id
    LEFT JOIN lessons_main_category_lnk lmcl ON l.id = lmcl.lesson_id
    LEFT JOIN categories_mains mc ON lmcl.categories_main_id = mc.id
    LEFT JOIN lessons_sub_category_lnk lscl ON l.id = lscl.lesson_id
    LEFT JOIN categories_subs sc ON lscl.categories_sub_id = sc.id
    LEFT JOIN categories_subs_main_category_lnk csmcl ON lscl.categories_sub_id = csmcl.categories_sub_id

    WHERE ${conditions}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?;
`;

        const countQuery = `${subCtePrefix}SELECT COUNT(*)
    FROM lessons l
    LEFT JOIN lessons_rabbi_lnk lrl ON l.id = lrl.lesson_id
    LEFT JOIN rabbis r ON lrl.rabbi_id = r.id
    LEFT JOIN lessons_main_category_lnk lmcl ON l.id = lmcl.lesson_id
    LEFT JOIN categories_mains mc ON lmcl.categories_main_id = mc.id
    LEFT JOIN lessons_sub_category_lnk lscl ON l.id = lscl.lesson_id
    LEFT JOIN categories_subs sc ON lscl.categories_sub_id = sc.id
    LEFT JOIN categories_subs_main_category_lnk csmcl ON lscl.categories_sub_id = csmcl.categories_sub_id
    WHERE ${conditions};
`;

        const [dataRes, countRes] = await Promise.all([
            strapi.db.connection.raw(dataQuery, dataBindings),
            strapi.db.connection.raw(countQuery, countBindings)
        ]);

        const rows = dataRes.rows || dataRes;
        const total = parseInt((countRes.rows ? countRes.rows[0].count : countRes[0]['COUNT(*)']) || 0);

        ctx.body = {
            data: rows,
            meta: {
                pagination: {
                    page,
                    pageSize,
                    pageCount: Math.ceil(total / pageSize),
                    total
                }
            }
        };
    } catch (err) {
        ctx.badRequest("SQL Error: " + err.message);
    }
},async getAudioDirs(ctx) {
  try {
    const { rabbiDocumentId, mainCategoryDocumentId, subCategoryDocumentId } = ctx.query as any;

    if (!rabbiDocumentId) return ctx.badRequest("rabbiDocumentId is required");

    const knex = strapi.db.connection;

    let query = knex("lessons AS l")
      .join("lessons_rabbi_lnk AS lrl", "l.id", "lrl.lesson_id")
      .join("rabbis AS r", "lrl.rabbi_id", "r.id")
      .where("r.document_id", rabbiDocumentId)
      .whereNotNull("l.audio_dir")
      .distinct("l.audio_dir")
      .orderBy("l.audio_dir", "asc");

    if (subCategoryDocumentId) {
      query = query
        .join("lessons_sub_category_lnk AS lscl", "l.id", "lscl.lesson_id")
        .join("categories_subs AS sc", "lscl.categories_sub_id", "sc.id")
        .where("sc.document_id", subCategoryDocumentId);
    } else if (mainCategoryDocumentId) {
      query = query
        .join("lessons_main_category_lnk AS lmcl", "l.id", "lmcl.lesson_id")
        .join("categories_mains AS mc", "lmcl.categories_main_id", "mc.id")
        .where("mc.document_id", mainCategoryDocumentId);
    }

    const results = await query;
    ctx.body = results.map(r => r.audio_dir).filter(Boolean);

  } catch (err) {
    console.error("SQL Error in getAudioDirs:", err);
    ctx.badRequest("SQL Error: " + err.message);
  }
},
    async downloadFile(ctx) {
      try {
        const { audioDir, audioFileName, title } = ctx.query as { audioDir: string; audioFileName: string; title?: string };
        if (!audioDir || !audioFileName) return ctx.badRequest('חסרים פרמטרים');
        const cleanDir = audioDir.replace(/^\/+|\/+$/g, '');
        const encodedPath = cleanDir.split('/').map((p: string) => encodeURIComponent(p)).join('/');
        const fileUrl = `https://ateretmordechaifiles.com/mediaFiles/${encodedPath}/${encodeURIComponent(audioFileName)}`;
        const response = await axios.get(fileUrl, { responseType: 'stream' });
        const ext = audioFileName.split('.').pop() || 'mp3';
        const safeTitle = (title || audioFileName).replace(/[/\\?%*:|"<>]/g, '-');
        const downloadName = safeTitle.endsWith(`.${ext}`) ? safeTitle : `${safeTitle}.${ext}`;
        ctx.set('Content-Type', response.headers['content-type'] || 'audio/mpeg');
        ctx.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`);
        if (response.headers['content-length']) ctx.set('Content-Length', response.headers['content-length']);
        ctx.body = response.data;
      } catch (err: any) {
        console.error('downloadFile error:', err.message);
        return ctx.badRequest('שגיאה בהורדת הקובץ: ' + err.message);
      }
    },

    // נגינה עם תמיכה ב-Range (דילוג בנגן) — מעביר את בקשת הטווח לשרת המדיה
    async streamFile(ctx) {
      try {
        const { audioDir, audioFileName } = ctx.query as { audioDir: string; audioFileName: string };
        if (!audioDir || !audioFileName) return ctx.badRequest('חסרים פרמטרים');
        const cleanDir = audioDir.replace(/^\/+|\/+$/g, '');
        const encodedPath = cleanDir.split('/').map((p: string) => encodeURIComponent(p)).join('/');
        const fileUrl = `https://ateretmordechaifiles.com/mediaFiles/${encodedPath}/${encodeURIComponent(audioFileName)}`;
        const range = ctx.get('range');
        const response = await axios.get(fileUrl, {
          responseType: 'stream',
          headers: range ? { Range: range } : {},
          validateStatus: (s: number) => s === 200 || s === 206,
        });
        ctx.status = response.status;
        ctx.set('Content-Type', response.headers['content-type'] || 'audio/mpeg');
        ctx.set('Accept-Ranges', 'bytes');
        if (response.headers['content-length']) ctx.set('Content-Length', response.headers['content-length']);
        if (response.headers['content-range']) ctx.set('Content-Range', response.headers['content-range']);
        ctx.body = response.data;
      } catch (err: any) {
        console.error('streamFile error:', err.message);
        return ctx.badRequest('שגיאה בנגינת הקובץ: ' + err.message);
      }
    },

    // --- פונקציית ה-Sync המקורית ---
    async sync(ctx) {
        try {
            if (!YOUTUBE_API_KEY) return ctx.badRequest('YOUTUBE_API_KEY חסר ב-.env');

            // 1. משיכת הנתונים מיוטיוב RSS (15 אחרונים)
            let rssResponse = await axios.get(RSS_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const rssResult = await parseStringPromise(rssResponse.data);
            const entries = rssResult.feed.entry || [];
            const videoIds = entries.map(e => e['yt:videoId'][0]);

            // 2. משיכת פרטים נוספים (משך השיעור) מה-API
            const videoDetailsRes = await axios.get(
                `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
            );
            let videoDetailsMap = {};
            videoDetailsRes.data.items.forEach(item => {
                videoDetailsMap[item.id] = item.contentDetails.duration;
            });

            // 3. טעינת רבנים מהמערכת
            const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
            let addedCount = 0;
            let skippedCount = 0;

            for (const entry of entries) {
                const videoId = entry['yt:videoId'][0];
                const rawTitle = entry.title[0];

                const existing = await strapi.documents('api::lesson.lesson').findMany({
                    filters: { youtube_id: videoId }
                });

                if (existing.length > 0) { skippedCount++; continue; }

                const duration = videoDetailsMap[videoId] ? formatDuration(videoDetailsMap[videoId]) : "00:00";
                const publishedDate = entry.published[0];
                const hDate = new hebcal.HDate(new Date(publishedDate));
                const lessonDate = publishedDate.split('T')[0];

                let foundRabbiId = null;
                for (const r of allRabbis) {
                    const baseName = r.name.replace('הרב', '').trim();
                    if (rawTitle.includes(baseName)) { foundRabbiId = r.id; break; }
                }

                let rssViews = 0;
                try {
                    rssViews = parseInt(entry['media:group'][0]['media:community'][0]['media:statistics'][0].$['views'] || 0);
                } catch (e) { rssViews = 0; }

                await strapi.documents('api::lesson.lesson').create({
                    data: {
                        title: rawTitle,
                        youtube_id: videoId,
                        duration: duration,
                        views: rssViews,
                        lesson_date_gregorian: lessonDate,
                        lesson_date_hebrew: hDate.toString('h'),
                        rabbi: foundRabbiId,
                        locale: 'en',
                        publishedAt: new Date(),
                    },
                    status: 'published',
                });
                addedCount++;
            }

            return { success: true, added: addedCount, skipped: skippedCount };

        } catch (err) {
            console.error('❌ שגיאה במהלך הסנכרון:', err.message);
            return ctx.badRequest(err.message);
        }
    },

    async syncViews(ctx) {
        try {
            // הנתיב auth:false — מאמתים כאן ידנית JWT של משתמש מחובר (הטוקן של דף ההתחברות)
            let payload: any = null;
            try { payload = await strapi.plugin('users-permissions').service('jwt').getToken(ctx); } catch { /* טוקן לא תקף */ }
            if (!payload?.id) return ctx.unauthorized('נדרשת התחברות');

            return { success: true, ...(await syncYoutubeViews(strapi)) };
        } catch (err: any) {
            console.error('שגיאה בסנכרון צפיות:', err.message);
            return ctx.badRequest(err.message);
        }
    },

    async incrementPlay(ctx) {
        try {
            const { documentId } = ctx.params;
            const knex = (strapi as any).db.connection;
            // COALESCE: שיעורים עם views=NULL (למשל שמע בלבד) נספרים מ-0 ולא נשארים NULL
            await knex('lessons').where('document_id', documentId).update({ views: knex.raw('COALESCE(views, 0) + 1') });
            ctx.body = { success: true };
        } catch (err: any) {
            return ctx.badRequest(err.message);
        }
    },

    async scanAudio(ctx) {
        const SCANNER_URL = 'https://ateretmordechaifiles.com/list-files.php?key=ATERET_SCAN_2026';

        const FOLDER_TO_RABBI_NAME: Record<string, string> = {
            'BIS':  'הרב יהושע ביסמוט',
            'Bibi': 'הרב יהושע ביבי',
            'YB':   'הרב יואל בלומנפלד',
            'RMA':  'הרב מרדכי עטיה',
            'BNA':  'הרב בניהו עטיה',
            'JH':   'הרב יואל חקון',
        };

        const getDuration = async (dir: string, fileName: string): Promise<string> => {
            try {
                const cleanDir = dir.startsWith('/') ? dir.slice(1) : dir;
                const url = encodeURI(`https://ateretmordechaifiles.com/mediaFiles/${cleanDir}/${fileName}`);

                // שלב 1: קרא 10 bytes ראשונים — לבדוק ID3 tag וגודל הקובץ
                const firstRes = await axios.get(url, {
                    headers: { Range: 'bytes=0-9' },
                    responseType: 'arraybuffer',
                    timeout: 8000,
                });
                const firstBuf = Buffer.from(firstRes.data);
                const contentRange = firstRes.headers['content-range'] as string;
                const sizeMatch = contentRange?.match(/\/(\d+)$/);
                const fileSize = sizeMatch ? parseInt(sizeMatch[1]) : 0;

                // חשב היכן מתחיל האודיו (אחרי ID3v2 tag אם קיים)
                let audioStart = 0;
                if (firstBuf[0] === 0x49 && firstBuf[1] === 0x44 && firstBuf[2] === 0x33) {
                    const id3Size = ((firstBuf[6] & 0x7F) << 21) | ((firstBuf[7] & 0x7F) << 14) |
                                   ((firstBuf[8] & 0x7F) << 7)  |  (firstBuf[9] & 0x7F);
                    audioStart = id3Size + 10;
                }

                // שלב 2: קרא 256KB של נתוני אודיו אחרי ה-ID3
                const endByte = Math.min(audioStart + 262143, fileSize - 1);
                const audioRes = await axios.get(url, {
                    headers: { Range: `bytes=${audioStart}-${endByte}` },
                    responseType: 'arraybuffer',
                    timeout: 20000,
                });
                const audioBuf = Buffer.from(audioRes.data);
                const audioSize = fileSize > 0 ? fileSize - audioStart : audioBuf.length;

                const { parseBuffer } = await import('music-metadata');
                const meta = await parseBuffer(audioBuf, { mimeType: 'audio/mpeg', size: audioSize });
                const total = Math.floor(meta.format.duration || 0);
                console.log(`[getDuration] ${fileName} fileSize=${fileSize} audioStart=${audioStart} total=${total}s`);
                if (!total) return '';
                const h = Math.floor(total / 3600);
                const m = Math.floor((total % 3600) / 60);
                const s = total % 60;
                return h > 0
                    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
                    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            } catch (e: any) {
                console.error('getDuration failed for', fileName, ':', e.message);
                return '';
            }
        };

        try {
            const limit: number = ctx.request.body?.limit || 100;
            const response = await axios.get(SCANNER_URL);
            const allFiles: { dir: string; fileName: string; date?: string }[] = response.data;

            if (!Array.isArray(allFiles)) {
                return ctx.badRequest('תגובה לא תקינה מהסקריפט');
            }
            const foundFiles = allFiles.slice(0, limit);

            const knex = (strapi as any).db.connection;

            // שליפת רבנים דרך document service
            const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany({ status: 'published' } as any) as any[];
            console.log('[scanAudio] rabbis from documents:', JSON.stringify(allRabbis.map((r: any) => ({ id: r.id, documentId: r.documentId, name: r.name }))));

            // בדיקה אילו קבצים חסרים ב-DB
            const existingNames = await knex('lessons').whereIn('audio_file_name', foundFiles.map(f => f.fileName)).select('audio_file_name');
            const existingSet = new Set(existingNames.map((r: any) => r.audio_file_name));
            const newFiles = foundFiles.filter(f => !existingSet.has(f.fileName));

            console.log('[scanAudio] new files to add:', newFiles.length);

            // שליפת כל המשכים במקביל
            const durations = await Promise.all(newFiles.map(f => getDuration(f.dir, f.fileName)));
            console.log('[scanAudio] durations:', durations);

            const hebcal = require('hebcal');

            // יצירת כל הרשומות
            let addedCount = 0;
            for (let i = 0; i < newFiles.length; i++) {
                const file = newFiles[i];
                const topFolder = file.dir.split('/').filter(Boolean)[0] || '';
                const rabbiName = FOLDER_TO_RABBI_NAME[topFolder] || null;
                // שמות הרבנים במסד כוללים סיומת כמו שליט"א — משווים בלעדיה
                const foundRabbi = rabbiName
                    ? allRabbis.find((r: any) => String(r.name || '').replace(/\s*שליט.{0,2}א\s*$/, '').trim() === rabbiName)
                    : null;
                console.log(`[scanAudio] file=${file.fileName} topFolder=${topFolder} rabbiName=${rabbiName} foundRabbi=`, foundRabbi);

                let hebrewDate = '';
                if (file.date) {
                    try {
                        const hDate = new hebcal.HDate(new Date(file.date));
                        hebrewDate = hDate.toString('h');
                    } catch { /* */ }
                }

                const created = await strapi.documents('api::lesson.lesson').create({
                    data: {
                        title: '',
                        AudioDir: file.dir,
                        AudioFileName: file.fileName,
                        duration: durations[i],
                        lesson_date_gregorian: file.date || null,
                        lesson_date_hebrew: hebrewDate || null,
                        rabbi: foundRabbi ? { connect: [{ documentId: foundRabbi.documentId }] } : undefined,
                        locale: 'en',
                        _skipAudioCheck: true,
                    } as any,
                    status: 'published',
                });

                // לוג — מה נשמר ב-relation table
                const lessonRow = await knex('lessons').where('document_id', created.documentId).orderBy('id', 'asc').first();
                const rabbiLnk = await knex('lessons_rabbi_lnk').where('lesson_id', lessonRow?.id).first();
                const rabbiInDb = rabbiLnk ? await knex('rabbis').where('id', rabbiLnk.rabbi_id).first() : null;
                console.log(`[scanAudio] created lesson id=${lessonRow?.id} | rabbi_lnk=${JSON.stringify(rabbiLnk)} | rabbi in DB=${JSON.stringify(rabbiInDb)}`);

                addedCount++;
            }

            return { success: true, scanned: foundFiles.length, added: addedCount };

        } catch (err: any) {
            console.error('Audio scan error:', err.message);
            return ctx.badRequest(err.message);
        }
    },

    async uploadAudio(ctx) {
    const SFTPClient = require('ssh2-sftp-client');
    const fs = require('fs');

    try {
      const files = (ctx.request as any).files;
      const audioDir = (ctx.request as any).body?.audioDir;

      if (!audioDir) return ctx.badRequest('audioDir is required');

      const file = files?.file;
      if (!file) return ctx.badRequest('file is required');

      const filePath = file.filepath || file.path;
      const fileName = file.originalFilename || file.name;

      if (!filePath || !fileName) return ctx.badRequest('קובץ לא תקין');

      const sftp = new SFTPClient();
      try {
        await sftp.connect({
          host: process.env.FTP_HOST,
          port: 22,
          username: process.env.FTP_USER,
          password: process.env.FTP_PASSWORD,
          readyTimeout: 30000,
        });

        const cleanDir = audioDir.startsWith('/') ? audioDir.slice(1) : audioDir;
        const remotePath = `/home/${process.env.FTP_USER}/public_html/mediaFiles/${cleanDir}/${fileName}`;
        console.log(`[uploadAudio] מעלה אל: ${remotePath}`);
        await sftp.put(filePath, remotePath);
        console.log(`[uploadAudio] הועלה בהצלחה: ${fileName}`);
      } finally {
        await sftp.end();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      // שליפת אורך השיעור מהקובץ שהועלה
      let duration = '';
      try {
        const axios = require('axios');
        const cleanDir = audioDir.startsWith('/') ? audioDir.slice(1) : audioDir;
        const audioUrl = encodeURI(`https://ateretmordechaifiles.com/mediaFiles/${cleanDir}/${fileName}`);
        const headRes = await axios.head(audioUrl, { timeout: 10000 });
        const contentLength = parseInt(headRes.headers['content-length'] || '0');
        if (contentLength > 0) {
          const bitrate = 128 * 1024 / 8;
          const seconds = Math.round(contentLength / bitrate);
          const h = Math.floor(seconds / 3600);
          const m = Math.floor((seconds % 3600) / 60);
          const s = seconds % 60;
          duration = h > 0
            ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
            : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }
      } catch (e) { /* אם לא מצליח לחשב אורך — ממשיך בלי */ }

      ctx.body = { success: true, fileName, duration };
    } catch (err) {
      console.error('שגיאה בהעלאת שמע:', err);
      ctx.badRequest('שגיאה בהעלאת הקובץ: ' + err.message);
    }
  },
async titlePattern(ctx) {
  try {
    const { rabbiDocumentId, mainCategoryDocumentId, subCategoryDocumentId } = ctx.query as any;
    if (!rabbiDocumentId) return ctx.badRequest("rabbiDocumentId is required");

    const knex = strapi.db.connection;

    let query = knex("lessons AS l")
      .join("lessons_rabbi_lnk AS lrl", "l.id", "lrl.lesson_id")
      .join("rabbis AS r", "lrl.rabbi_id", "r.id")
      .where("r.document_id", rabbiDocumentId)
      .whereNotNull("l.title");

    if (subCategoryDocumentId) {
      query = query
        .join("lessons_sub_category_lnk AS lscl", "l.id", "lscl.lesson_id")
        .join("categories_subs AS sc", "lscl.categories_sub_id", "sc.id")
        .where("sc.document_id", subCategoryDocumentId);
    } else if (mainCategoryDocumentId) {
      query = query.where(function() {
        this.whereIn('l.id',
          knex('lessons_main_category_lnk AS lmcl2')
            .select('lmcl2.lesson_id')
            .join('categories_mains AS mc2', 'lmcl2.categories_main_id', 'mc2.id')
            .where('mc2.document_id', mainCategoryDocumentId)
        ).orWhereIn('l.id',
          knex('lessons_sub_category_lnk AS lscl2')
            .select('lscl2.lesson_id')
            .join('categories_subs_main_category_lnk AS csmcl', 'lscl2.categories_sub_id', 'csmcl.categories_sub_id')
            .join('categories_mains AS mc3', 'csmcl.categories_main_id', 'mc3.id')
            .where('mc3.document_id', mainCategoryDocumentId)
        );
      });
    }

    const results = await query
      .select("l.title")
      .orderBy("l.lesson_date_gregorian", "desc")
      .limit(2);

    ctx.body = results.map((r: any) => r.title).filter(Boolean);
  } catch (err) {
    console.error("SQL Error in titlePattern:", err);
    ctx.badRequest("SQL Error: " + err.message);
  }
},
async uploadPdf(ctx) {
    const { Client } = require('basic-ftp');
    const fs = require('fs');
    const path = require('path');

    try {
      const files = (ctx.request as any).files;
      const audioDir = (ctx.request as any).body?.audioDir;

      if (!audioDir) return ctx.badRequest('audioDir is required');

      const file = files?.file;
      if (!file) return ctx.badRequest('file is required');

      const filePath = file.filepath || file.path;
      const fileName = file.originalFilename || file.name;

      if (!filePath || !fileName) return ctx.badRequest('קובץ לא תקין');

      const client = new Client();
      try {
        await client.access({
          host: process.env.FTP_HOST,
          user: process.env.FTP_USER,
          password: process.env.FTP_PASSWORD,
          secure: false,
        });

        const cleanDir = audioDir.startsWith('/') ? audioDir.slice(1) : audioDir;
        const remotePath = `/public_html/mediaFiles/${cleanDir}/${fileName}`;
        await client.uploadFrom(filePath, remotePath);

        ctx.body = { success: true, fileName };
      } finally {
        client.close();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('שגיאה בהעלאת PDF:', err);
      ctx.badRequest('שגיאה בהעלאת הקובץ: ' + err.message);
    }
  },
async getPdfFiles(ctx) {
        const audioDir = ctx.query.audioDir as string;
        if (!audioDir) return ctx.badRequest('audioDir is required');

        try {
            const files = await fetchPdfList(audioDir);
            ctx.body = files.map(f => f.fileName);
        } catch (err: any) {
            console.error('getPdfFiles error:', err.message);
            return ctx.badRequest(err.message);
        }
    },

    // ה-PDF האחרון שהוכנס לתיקייה (לפי תאריך; ללא תאריכים — לפי שם) + כל הקבצים
    async getLatestPdf(ctx) {
        const audioDir = ctx.query.audioDir as string;
        if (!audioDir) return ctx.badRequest('audioDir is required');

        try {
            const files = await fetchPdfList(audioDir);
            const sorted = [...files].sort((a, b) =>
                (b.date || '').localeCompare(a.date || '') ||
                b.fileName.localeCompare(a.fileName, undefined, { numeric: true })
            );
            ctx.body = { latest: sorted[0] || null, files: files.map(f => f.fileName) };
        } catch (err: any) {
            console.error('getLatestPdf error:', err.message);
            return ctx.badRequest(err.message);
        }
    },

    // נתוני ה-PDF (תיקייה + שם קובץ) מתוך תיאור סרטון היוטיוב
    async getYoutubeHints(ctx) {
        const youtubeId = ctx.query.youtubeId as string;
        if (!youtubeId || !/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) return ctx.badRequest('youtubeId לא תקין');

        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) return ctx.badRequest('YOUTUBE_API_KEY חסר');

        try {
            const res = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: { part: 'snippet', id: youtubeId, key: apiKey },
                timeout: 15000,
            });
            const description: string = res.data?.items?.[0]?.snippet?.description || '';
            const { extractPdfLink } = require('../utils/youtube-description');
            const { fetchYoutubeFileName, toMp3FileName } = require('../utils/youtube-file-name');
            const originalName: string | null = await fetchYoutubeFileName(youtubeId);
            console.log(`[youtube-hints] ${youtubeId} שם קובץ מקורי מיוטיוב:`, originalName);
            ctx.body = {
                description,
                pdf: extractPdfLink(description),
                youtubeFileName: originalName,
                audioFileName: originalName ? toMp3FileName(originalName) : null,
            };
        } catch (err: any) {
            console.error('getYoutubeHints error:', err.message);
            return ctx.badRequest(err.message);
        }
    },

    async suggestFileName(ctx) {
        const audioDir = ctx.query.audioDir as string;
        if (!audioDir) return ctx.badRequest('audioDir is required');

        const raw = ctx.query.lessonDate as string;
        const parsed = raw ? new Date(raw) : new Date();
        const lessonDate = isNaN(parsed.getTime()) ? new Date() : parsed;

        const { suggestFromFolder } = require('../utils/filename-pattern');

        let files: any[] = [];
        let source = 'db';

        // מסד הנתונים מכיר את שמות הקבצים של כל השיעורים בכל התיקיות.
        // זה עדיף על list-files.php, שמחזיר רק 100 קבצים אחרונים מכל האתר.
        try {
            const rows = await strapi.db.connection('lessons')
                .whereRaw('LOWER(audio_dir) = LOWER(?)', [audioDir])
                .whereNotNull('audio_file_name')
                .select('audio_file_name', 'lesson_date_gregorian')
                .orderBy('lesson_date_gregorian', 'asc')
                .orderBy('id', 'asc');

            files = rows.map((r: any) => ({
                fileName: r.audio_file_name,
                date: r.lesson_date_gregorian
                    ? new Date(r.lesson_date_gregorian).toISOString().slice(0, 10)
                    : '',
            }));
        } catch (err: any) {
            console.error('suggestFileName DB error:', err.message);
        }

        // תיקייה שעדיין אין עליה שיעורים במערכת — מנסים את רשימת הקבצים של האתר
        if (!files.length) {
            source = 'scanner';
            try {
                const res = await axios.get(
                    'https://ateretmordechaifiles.com/list-files.php?key=ATERET_SCAN_2026',
                    { timeout: 20000 }
                );
                const norm = (d: string) => '/' + String(d || '').replace(/^\/+|\/+$/g, '');
                const all = Array.isArray(res.data) ? res.data : [];
                files = all.filter((f: any) => norm(f.dir) === norm(audioDir));
            } catch (err: any) {
                console.error('suggestFileName scanner error:', err.message);
            }
        }

        if (!files.length) {
            return ctx.badRequest(`אין עדיין שיעורים עם שם קובץ בתיקייה ${audioDir}`);
        }

        const result = suggestFromFolder(files, lessonDate);
        if (source === 'scanner') {
            result.notes.push('אין שיעורים בתיקייה במערכת — נבדקו רק הקבצים האחרונים באתר');
            if (result.confidence === 'high') result.confidence = 'medium';
        }
        ctx.body = result;
    },

    // בודק אם קובץ השמע כבר קיים בשרת המדיה (כדי לא להמיר מחדש בכל שמירה)
    async audioExists(ctx) {
        const { audioDir, audioFileName } = ctx.query as { audioDir: string; audioFileName: string };
        if (!audioDir || !audioFileName) return ctx.badRequest('חסרים פרמטרים');
        const cleanDir = audioDir.replace(/^\/+|\/+$/g, '');
        const encodedPath = cleanDir.split('/').map((p: string) => encodeURIComponent(p)).join('/');
        const fileUrl = `${MEDIA_BASE}/mediaFiles/${encodedPath}/${encodeURIComponent(audioFileName)}`;
        try {
            const res = await axios.head(fileUrl, { timeout: 10000, validateStatus: () => true });
            const size = Number(res.headers['content-length'] || 0);
            ctx.body = { exists: res.status === 200 && size > 0 };
        } catch (err: any) {
            // במקרה של שגיאת רשת לא ברור אם הקובץ קיים — הלקוח יחליט
            ctx.body = { exists: false, error: err.message };
        }
    },

    // שולח בקשת המרה לשרת המדיה. ההמרה עצמה רצה שם (yt-dlp + ffmpeg)
    // והקובץ נשמר ישירות בתיקיית היעד — בלי מנהרה ובלי שהקובץ יעבור דרך כאן.
    async convertAudio(ctx) {
        const { documentId, audioDir, audioFileName, youtubeId } = ctx.request.body as any;
        if (!youtubeId || !audioDir || !audioFileName) return ctx.badRequest('חסרים פרמטרים');

        const jobKey = documentId || `job${Date.now()}`;
        try {
            const res = await fetch(`${MEDIA_BASE}/convert.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Upload-Secret': process.env.UPLOAD_SECRET,
                },
                body: JSON.stringify({
                    youtube_id: youtubeId,
                    audio_dir: audioDir,
                    audio_file_name: audioFileName,
                    job_key: jobKey,
                }),
            });
            const text = await res.text();
            if (!res.ok) throw new Error(`convert.php ${res.status}: ${text.slice(0, 300)}`);

            const data = JSON.parse(text);
            console.log('[convertAudio] נכנס לתור בשרת:', data.job_key, audioFileName);
            ctx.body = { success: true, audioFileName, jobKey: data.job_key, status: 'processing' };
        } catch (err: any) {
            console.error('[convertAudio] שגיאה:', err.message);
            return ctx.badRequest('שליחת ההמרה לשרת נכשלה: ' + err.message);
        }
    },

    // מעלה קובץ (שמע / PDF) לשרת המדיה. הדפדפן שולח לכאן עם JWT, והסוד נשאר רק בשרת.
    async uploadMedia(ctx) {
        const { audioDir } = ctx.request.body as any;
        const upload: any = (ctx.request.files as any)?.file;
        const file = Array.isArray(upload) ? upload[0] : upload;
        if (!file || !audioDir) return ctx.badRequest('חסרים פרמטרים');

        const fs = require('fs');
        try {
            const buffer = await fs.promises.readFile(file.filepath);
            const form = new FormData();
            form.append('audioDir', String(audioDir));
            form.append('file', new Blob([buffer]), file.originalFilename || file.name);

            const res = await fetch(`${MEDIA_BASE}/upload.php`, {
                method: 'POST',
                headers: { 'X-Upload-Secret': process.env.UPLOAD_SECRET || '' },
                body: form,
            });
            const text = await res.text();
            if (!res.ok) throw new Error(`upload.php ${res.status}: ${text.slice(0, 300)}`);
            ctx.body = JSON.parse(text);
        } catch (err: any) {
            console.error('[uploadMedia] שגיאה:', err.message);
            return ctx.badRequest('העלאה לשרת המדיה נכשלה: ' + err.message);
        } finally {
            fs.promises.unlink(file.filepath).catch(() => {});
        }
    },

    // מוחק קובץ שמע בודד משרת המדיה (החלפת קובץ בעריכת שיעור)
    async deleteAudio(ctx) {
        const { audio_dir, audio_file_name } = ctx.request.body as any;
        if (!audio_dir || !audio_file_name) return ctx.badRequest('חסרים פרמטרים');
        try {
            const res = await fetch(`${MEDIA_BASE}/delete-audio.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Upload-Secret': process.env.UPLOAD_SECRET || '',
                },
                body: JSON.stringify({ audio_dir, audio_file_name }),
            });
            // 404 = הקובץ כבר לא קיים — מעבירים הלאה כדי שהלקוח יחליט
            if (res.status === 404) { ctx.status = 404; ctx.body = { error: 'not found' }; return; }
            if (!res.ok) throw new Error(`delete-audio.php ${res.status}: ${(await res.text()).slice(0, 300)}`);
            ctx.body = { success: true };
        } catch (err: any) {
            console.error('[deleteAudio] שגיאה:', err.message);
            return ctx.badRequest('מחיקה משרת המדיה נכשלה: ' + err.message);
        }
    },

    // סטטוס ההמרה — נקרא מהדיאלוג של עריכת שיעור ומועבר לשרת המדיה
    async convertStatus(ctx) {
        const { jobKey } = ctx.query as any;
        if (!jobKey) return ctx.badRequest('חסר jobKey');
        try {
            const res = await fetch(`${MEDIA_BASE}/convert.php?status=${encodeURIComponent(jobKey)}`);
            const job = JSON.parse(await res.text());

            // כשההמרה הסתיימה — לעדכן את השיעור ולפרסם אותו
            if (job.status === 'done' && jobKey.length > 10) {
                try {
                    await strapi.documents('api::lesson.lesson').publish({ documentId: jobKey });
                } catch { /* כבר מפורסם, או שזה לא documentId */ }
            }
            ctx.body = job;
        } catch (err: any) {
            ctx.body = { status: 'unknown', error: err.message };
        }
    },
}));






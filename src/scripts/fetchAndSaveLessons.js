// scripts/fetchLessons.js

import axios from 'axios';           // לקרוא URL חיצוני (RSS)
import xml2js from 'xml2js';         // לפענח XML ל-JSON

const fetchAndInsertLessons = async () => {
  try {
    const rssUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjCwvHzEeN0dGO4eaaQi6KQ';

    // מביאים את קובץ ה-RSS
    const response = await axios.get(rssUrl);

    // ממירים את ה-XML ל-JSON
    const parsed = await xml2js.parseStringPromise(response.data, { mergeAttrs: true });

    // מוציאים את כל השיעורים מה-feed
    const entries = parsed.feed.entry || [];

    // ממירים כל entry למבנה של DB
    const lessonsToInsert = entries.map(entry => ({
      title: entry.title[0],                   // כותרת השיעור
      lesson_date_gregorian: entry.published[0], // תאריך לועזי מה-RSS
      lesson_date_hebrew: '',                  // עדיין ריק
      duration: '',                             // עדיין ריק
      youtube_id: entry['yt:videoId'][0],      // מזהה יוטיוב
      rabbi: null                               // כרגע ריק
    }));

    // מוסיפים כל שיעור ל-DB ללא בדיקה
    for (const lesson of lessonsToInsert) {
      await strapi.db.query('api::lesson.lesson').create({ data: lesson });
      console.log(`Inserted lesson: ${lesson.title}`);
    }

    console.log('All lessons inserted successfully.');
  } catch (error) {
    console.error('Error fetching or inserting lessons:', error);
  }
};

// מפעילים את הפונקציה הראשית
fetchAndInsertLessons();

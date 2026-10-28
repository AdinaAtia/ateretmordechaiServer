// const fs = require('fs');

// async function importFinalCleanStructure() {
//   try {
//     const filePath = './LessonTree.json';
//     if (!fs.existsSync(filePath)) {
//       console.log(`❌ קובץ לא נמצא: ${filePath}`);
//       return;
//     }

//     let rawContent = fs.readFileSync(filePath, 'utf8');
//     let cleanContent = rawContent.replace(/\uFEFF/g, '').trim();
//     cleanContent = cleanContent.replace(/,\s*([\]}])/g, '$1');

//     let data;
//     try {
//       data = JSON.parse(cleanContent);
//     } catch (e) {
//       data = eval('(' + cleanContent + ')');
//     }

//     const rootItems = data.id === "0" ? data.children : (Array.isArray(data) ? data : [data]);
//     console.log(`🚀 הייבוא התחיל! נמצאו ${rootItems.length} פריטים בשורש.`);

//     for (const item of rootItems) {
//       const itemName = item.name?.trim();
//       if (!itemName || itemName === "Dummy") continue;

//       // בדיקה אם זה רב
//       const rabbi = await strapi.db.query('api::rabbi.rabbi').findOne({
//         where: { externalCatId: item.id }
//       });

//       if (rabbi) {
//         console.log(`👨‍🏫 מייבא עבור הרב: ${rabbi.name}`);
//         if (item.children) await importMain(item.children, rabbi.id);
//       } 
//       // טיפול בקטגוריות כלליות
//       else if (["תדמית הישיבה", "שיעורים כלליים"].includes(itemName)) {
//         console.log(`📂 מטפל בקטגוריה כללית: ${itemName}`);
        
//         // בדיקה אם הקטגוריה הראשית הזו כבר קיימת כדי למנוע שגיאת Unique
//         let mainCat = await strapi.db.query('api::categories-main.categories-main').findOne({
//           where: { externalCatId: item.id }
//         });

//         if (!mainCat) {
//           mainCat = await strapi.entityService.create('api::categories-main.categories-main', {
//             data: { name: itemName, externalCatId: item.id, publishedAt: new Date() }
//           });
//           console.log(`✅ קטגוריה ${itemName} נוצרה.`);
//         } else {
//           console.log(`⏩ קטגוריה ${itemName} כבר קיימת, ממשיך לתתי-קטגוריות.`);
//         }

//         if (item.children) await importSub(item.children, mainCat.id);
//       }
//     }
//     console.log("✨ הסתיים בהצלחה ללא כפילויות!");
//   } catch (err) {
//     console.error("❌ שגיאה בייבוא:", err.message);
//   }
// }

// async function importMain(items, rabbiId) {
//   if (!items) return;
//   for (const item of items) {
//     if (!item.name || item.name.trim() === "Dummy") continue;

//     // בדיקה לפני יצירה
//     const existing = await strapi.db.query('api::categories-main.categories-main').findOne({
//       where: { externalCatId: item.id }
//     });

//     if (!existing) {
//       const main = await strapi.entityService.create('api::categories-main.categories-main', {
//         data: { name: item.name.trim(), externalCatId: item.id, rabbi: rabbiId, publishedAt: new Date() }
//       });
//       if (item.children) await importSub(item.children, main.id);
//     }
//   }
// }

// async function importSub(items, mainId) {
//   if (!items) return;
//   for (const item of items) {
//     if (!item.name || item.name.trim() === "Dummy") continue;

//     // בדיקה לפני יצירה
//     const existing = await strapi.db.query('api::categories-sub.categories-sub').findOne({
//       where: { externalCatId: item.id }
//     });

//     if (!existing) {
//       await strapi.entityService.create('api::categories-sub.categories-sub', {
//         data: { name: item.name.trim(), externalCatId: item.id, main_category: mainId, publishedAt: new Date() }
//       });
//     }
//   }
// }

// module.exports = importFinalCleanStructure;
// const fs = require('fs');

// async function importFinalDeepStructure() {
//   try {
//     const filePath = './LessonTree.json';
//     if (!fs.existsSync(filePath)) {
//       console.log(`❌ קובץ לא נמצא: ${filePath}`);
//       return;
//     }

//     const rawContent = fs.readFileSync(filePath, 'utf8');
//     let cleanContent = rawContent.replace(/\uFEFF/g, '').trim();
//     cleanContent = cleanContent.replace(/,\s*([\]}])/g, '$1');

//     let data;
//     try {
//       data = JSON.parse(cleanContent);
//     } catch (e) {
//       data = eval('(' + cleanContent + ')');
//     }

//     const rootItems = data.id === "0" ? data.children : (Array.isArray(data) ? data : [data]);
//     console.log(`🚀 התחלת ייבוא מבנה עמוק!`);

//     for (const item of rootItems) {
//       const itemName = item.name?.trim();
//       if (!itemName || itemName === "Dummy") continue;

//       // חיפוש רב
//       const rabbi = await strapi.db.query('api::rabbi.rabbi').findOne({
//         where: { externalCatId: item.id }
//       });

//       if (rabbi) {
//         console.log(`👨‍🏫 רב: ${rabbi.name}`);
//         if (item.children) {
//           await importRecursive(item.children, 'main', null, rabbi.id, null);
//         }
//       } else if (["תדמית הישיבה", "שיעורים כלליים"].includes(itemName)) {
//         await importRecursive([item], 'main', null, null, null);
//       }
//     }
//     console.log("✨ הסתיים בהצלחה!");
//   } catch (err) {
//     console.error("❌ שגיאה:", err.message);
//   }
// }

// async function importRecursive(items, type, mainId, rabbiId, parentSubId) {
//   if (!items || !Array.isArray(items)) return;

//   for (const item of items) {
//     if (!item.name || item.name.trim() === "Dummy") continue;

//     const uid = type === 'main' ? 'api::categories-main.categories-main' : 'api::categories-sub.categories-sub';
    
//     // בדיקה אם קיים
//     let existing = await strapi.db.query(uid).findOne({
//       where: { externalCatId: item.id }
//     });

//     const data = {
//       name: item.name.trim(),
//       externalCatId: item.id,
//       publishedAt: new Date(),
//     };

//     // הגדרת קשרים
//     if (type === 'main' && rabbiId) data.rabbi = rabbiId;
    
//     if (type === 'sub') {
//       data.main_category = mainId; // תמיד מקושר ל-Main "הסבא"
//       data.parent_sub = parentSubId; // הקישור ל"אבא" הישיר (אם קיים)
//     }

//     let currentId;
//     if (!existing) {
//       const created = await strapi.entityService.create(uid, { data });
//       currentId = created.id;
//       console.log(`✅ נוצר: ${data.name}`);
//     } else {
//       // עדכון הקישור הקיים (כדי לסדר את ההיררכיה בלי כפילויות)
//       const updated = await strapi.entityService.update(uid, existing.id, { data });
//       currentId = updated.id;
//       console.log(`🔄 עודכן: ${data.name}`);
//     }

//     // כניסה לעומק - הרמה הבאה תמיד תהיה Sub
//     if (item.children && item.children.length > 0) {
//       await importRecursive(
//         item.children, 
//         'sub', 
//         (type === 'main' ? currentId : mainId), // ה-Main נשאר קבוע לכל הצאצאים
//         rabbiId, 
//         (type === 'sub' ? currentId : null) // אם אני Sub, אני הופך ל-parentSubId של ילדיי
//       );
//     }
//   }
// }

// module.exports = importFinalDeepStructure;
// const fs = require('fs');

// async function importFinalDeepStructure() {
//   try {
//     const filePath = './LessonTree.json';
//     if (!fs.existsSync(filePath)) {
//       console.log(`❌ קובץ לא נמצא: ${filePath}`);
//       return;
//     }

//     let rawContent = fs.readFileSync(filePath, 'utf8');
//     let cleanContent = rawContent.replace(/\uFEFF/g, '').trim();
//     cleanContent = cleanContent.replace(/,\s*([\]}])/g, '$1');

//     let data;
//     try {
//       data = JSON.parse(cleanContent);
//     } catch (e) {
//       data = eval('(' + cleanContent + ')');
//     }

//     const rootItems = data.id === "0" ? data.children : (Array.isArray(data) ? data : [data]);
//     console.log(`🚀 התחלת ייבוא מבנה עמוק!`);

//     for (const item of rootItems) {
//       const itemName = item.name?.trim();
//       if (!itemName || itemName === "Dummy") continue;

//       // חיפוש רב
//       const rabbi = await strapi.db.query('api::rabbi.rabbi').findOne({
//         where: { externalCatId: item.id }
//       });

//       if (rabbi) {
//         console.log(`👨‍🏫 רב: ${rabbi.name}`);
//         if (item.children) {
//           await importRecursive(item.children, 'main', null, rabbi.id, null);
//         }
//       } else if (["תדמית הישיבה", "שיעורים כלליים"].includes(itemName)) {
//         await importRecursive([item], 'main', null, null, null);
//       }
//     }

//     console.log("✨ הייבוא הסתיים בהצלחה!");
//   } catch (err) {
//     console.error("❌ שגיאה:", err.message);
//   }
// }

// async function importRecursive(items, type, mainId, rabbiId, parentSubId) {
//   if (!items || !Array.isArray(items)) return;

//   for (const item of items) {
//     if (!item.name || item.name.trim() === "Dummy") continue;

//     const uid = type === 'main' 
//       ? 'api::categories-main.categories-main' 
//       : 'api::categories-sub.categories-sub';
    
//     // בדיקה אם רשומה קיימת
//     let existing = await strapi.db.query(uid).findOne({
//       where: { externalCatId: item.id }
//     });

//     const data = {
//       name: item.name.trim(),
//       externalCatId: item.id,
//       publishedAt: new Date(), // מיידי "פרסום"
//     };

//     // קשרים
//     if (type === 'main' && rabbiId) data.rabbi = rabbiId;
//     if (type === 'sub') {
//       data.main_category = mainId; 
//       data.parent_sub = parentSubId; 
//     }

//     let currentId;
//     if (!existing) {
//       const created = await strapi.entityService.create(uid, { data });
//       currentId = created.id;
//       console.log(`✅ נוצר: ${data.name}`);
//     } else {
//       const updated = await strapi.entityService.update(uid, existing.id, { data });
//       currentId = updated.id;
//       console.log(`🔄 עודכן: ${data.name}`);
//     }

//     // פרסום ברמת v5
//     await strapi.db.query(uid).update({
//       where: { id: currentId },
//       data: { publishedAt: new Date() }, 
//     });
//     console.log(`📢 פורסם: ${data.name}`);

//     // רקורסיה לילדים
//     if (item.children && item.children.length > 0) {
//       await importRecursive(
//         item.children, 
//         'sub', 
//         (type === 'main' ? currentId : mainId), 
//         rabbiId, 
//         (type === 'sub' ? currentId : null)
//       );
//     }
//   }
// }

// module.exports = importFinalDeepStructure;


// const fs = require('fs');

// async function importFinalDeepStructure() {
//   try {
//     // --- לוגיקת המחיקה שהתווספה ---
//     console.log("🧹 מנקה נתונים ישנים מהטבלאות...");
//     await strapi.db.query('api::categories-sub.categories-sub').deleteMany({});
//     await strapi.db.query('api::categories-main.categories-main').deleteMany({});
//     console.log("✅ הלוח נקי!");
//     // ----------------------------

//     const filePath = './LessonTree.json';
//     if (!fs.existsSync(filePath)) {
//       console.log(`❌ קובץ לא נמצא: ${filePath}`);
//       return;
//     }

//     let rawContent = fs.readFileSync(filePath, 'utf8');
//     let cleanContent = rawContent.replace(/\uFEFF/g, '').trim();
//     cleanContent = cleanContent.replace(/,\s*([\]}])/g, '$1');

//     let data;
//     try {
//       data = JSON.parse(cleanContent);
//     } catch (e) {
//       data = eval('(' + cleanContent + ')');
//     }

//     const rootItems = data.id === "0" ? data.children : (Array.isArray(data) ? data : [data]);
//     console.log(`🚀 התחלת ייבוא מבנה עמוק!`);

//     for (const item of rootItems) {
//       const itemName = item.name?.trim();
//       if (!itemName || itemName === "Dummy") continue;

//       // חיפוש רב
//       const rabbi = await strapi.db.query('api::rabbi.rabbi').findOne({
//         where: { externalCatId: item.id }
//       });

//       if (rabbi) {
//         console.log(`👨‍🏫 רב: ${rabbi.name}`);
//         if (item.children) {
//           await importRecursive(item.children, 'main', null, rabbi.id, null);
//         }
//       } else if (["תדמית הישיבה", "שיעורים כלליים"].includes(itemName)) {
//         await importRecursive([item], 'main', null, null, null);
//       }
//     }

//     console.log("✨ הייבוא הסתיים בהצלחה!");
//   } catch (err) {
//     console.error("❌ שגיאה:", err.message);
//   }
// }

// async function importRecursive(items, type, mainId, rabbiId, parentSubId) {
//   if (!items || !Array.isArray(items)) return;

//   for (const item of items) {
//     if (!item.name || item.name.trim() === "Dummy") continue;

//     const uid = type === 'main' 
//       ? 'api::categories-main.categories-main' 
//       : 'api::categories-sub.categories-sub';
    
//     // בדיקה אם רשומה קיימת
//     let existing = await strapi.db.query(uid).findOne({
//       where: { externalCatId: item.id }
//     });

//     const data = {
//       name: item.name.trim(),
//       externalCatId: item.id,
//       publishedAt: new Date(), // מיידי "פרסום"
//     };

//     // קשרים
//     if (type === 'main' && rabbiId) data.rabbi = rabbiId;
//     if (type === 'sub') {
//       data.main_category = mainId; 
//       data.parent_sub = parentSubId; 
//     }

//     let currentId;
//     if (!existing) {
//       const created = await strapi.entityService.create(uid, { data });
//       currentId = created.id;
//       console.log(`✅ נוצר: ${data.name}`);
//     } else {
//       const updated = await strapi.entityService.update(uid, existing.id, { data });
//       currentId = updated.id;
//       console.log(`🔄 עודכן: ${data.name}`);
//     }

//     // פרסום ברמת v5
//     await strapi.db.query(uid).update({
//       where: { id: currentId },
//       data: { publishedAt: new Date() }, 
//     });

//     // רקורסיה לילדים
//     if (item.children && item.children.length > 0) {
//       await importRecursive(
//         item.children, 
//         'sub', 
//         (type === 'main' ? currentId : mainId), 
//         rabbiId, 
//         (type === 'sub' ? currentId : null)
//       );
//     }
//   }
// }

// module.exports = importFinalDeepStructure;
// const fs = require('fs');

// async function importFinalDeepStructure() {
//   try {
//     const filePath = './LessonTree.json';
//     if (!fs.existsSync(filePath)) {
//       console.log(`❌ קובץ לא נמצא: ${filePath}`);
//       return;
//     }

//     let rawContent = fs.readFileSync(filePath, 'utf8');
//     let data = JSON.parse(rawContent.replace(/\uFEFF/g, ''));
//     const rootItems = data.id === "0" ? data.children : (Array.isArray(data) ? data : [data]);

//     console.log(`🚀 מתחיל סריקה והשלמת פערים בעץ (שיטת 2 שלבים)...`);

//     for (const item of rootItems) {
//       const itemName = item.name?.trim();
//       if (!itemName || itemName === "Dummy") continue;

//       const rabbi = await strapi.db.query('api::rabbi.rabbi').findOne({
//         where: { externalCatId: item.id }
//       });

//       if (rabbi) {
//         if (item.children) {
//           await importRecursive(item.children, 'main', null, rabbi.id, null);
//         }
//       } else if (["תדמית הישיבה", "שיעורים כלליים"].includes(itemName)) {
//         await importRecursive([item], 'main', null, null, null);
//       }
//     }

//     console.log("✨ הסתיים תהליך השלמת הקטגוריות!");
//   } catch (err) {
//     console.error("❌ שגיאה כללית:", err.message);
//   }
// }

// async function importRecursive(items, type, mainId, rabbiId, parentSubId) {
//   if (!items || !Array.isArray(items)) return;

//   for (const item of items) {
//     if (!item.name || item.name.trim() === "Dummy") continue;

//     const uid = type === 'main' 
//       ? 'api::categories-main.categories-main' 
//       : 'api::categories-sub.categories-sub';
    
//     let existing = await strapi.db.query(uid).findOne({
//       where: { externalCatId: item.id }
//     });

//     // שלב 1: הכנת נתונים בסיסיים ללא ה-Parent הבעייתי
//     const entryData = {
//       name: item.name.trim(),
//       externalCatId: item.id,
//       publishedAt: new Date(),
//     };

//     if (type === 'main' && rabbiId) entryData.rabbi = rabbiId;
//     if (type === 'sub' && mainId) entryData.main_category = mainId;

//     let currentId;
//     try {
//       if (existing) {
//         await strapi.db.query(uid).update({ where: { id: existing.id }, data: entryData });
//         currentId = existing.id;
//         console.log(`🔄 עודכן: ${entryData.name}`);
//       } else {
//         const created = await strapi.db.query(uid).create({ data: entryData });
//         currentId = created.id;
//         console.log(`✅ נוצר: ${entryData.name}`);
//       }

//       // שלב 2: עדכון הקישור ל-Parent בנפרד (רק עבור Sub)
//       if (type === 'sub' && parentSubId) {
//         await strapi.db.query(uid).update({
//           where: { id: currentId },
//           data: { parent_sub: parentSubId }
//         });
//       }

//       // המשך רקורסיה לעומק
//       if (item.children && item.children.length > 0) {
//         await importRecursive(
//           item.children, 
//           'sub', 
//           (type === 'main' ? currentId : mainId), 
//           rabbiId, 
//           currentId
//         );
//       }
//     } catch (err) {
//       console.error(`⚠️ שגיאה ב-${item.name}:`, err.message);
//     }
//   }
// }

// module.exports = importFinalDeepStructure;


















// const fs = require('fs');

// async function importFinalSafeStructure() {
//   try {
//     console.log("🧹 שלב 1: מנקה את הלוח (מוחק הכל כדי למנוע כפילויות)...");
//     await strapi.db.query('api::categories-sub.categories-sub').deleteMany({});
//     await strapi.db.query('api::categories-main.categories-main').deleteMany({});
//     console.log("✅ הלוח נקי!");

//     const filePath = './LessonTree.json';
//     if (!fs.existsSync(filePath)) {
//       console.log("❌ קובץ LessonTree.json לא נמצא!");
//       return;
//     }

//     let rawContent = fs.readFileSync(filePath, 'utf8');
//     let data = JSON.parse(rawContent.replace(/\uFEFF/g, ''));
//     const rootItems = data.id === "0" ? data.children : (Array.isArray(data) ? data : [data]);

//     console.log("🏗️ שלב 2: יוצר את כל השלד (זה ימלא את המסד ברשומות)...");
//     await createAllEntries(rootItems);

//     console.log("🔗 שלב 3: מחבר את הקשרים והעומק (בונה את ההיררכיה)...");
//     await linkAllEntries(rootItems);

//     console.log("✨✨✨ הייבוא הסתיים בהצלחה! עכשיו אפשר לרענן את ה-Admin ✨✨✨");
//   } catch (err) {
//     console.error("❌ שגיאה בתהליך:", err.message);
//   }
// }

// // פונקציה ליצירת הרשומות בלבד
// async function createAllEntries(items, type = 'main', rabbiId = null) {
//   for (const item of items) {
//     if (!item.name || item.name.trim() === "Dummy") continue;

//     const uid = type === 'main' ? 'api::categories-main.categories-main' : 'api::categories-sub.categories-sub';
    
//     let currentRabbiId = rabbiId;
//     if (type === 'main') {
//       const r = await strapi.db.query('api::rabbi.rabbi').findOne({ where: { externalCatId: item.id } });
//       currentRabbiId = r ? r.id : null;
//     }

//     const data = {
//       name: item.name.trim(),
//       externalCatId: item.id,
//       publishedAt: new Date(), // הופך את זה ל-Published מיד
//     };
//     if (type === 'main' && currentRabbiId) data.rabbi = currentRabbiId;

//     await strapi.db.query(uid).create({ data });
//     console.log(`✅ נוצר: ${item.name}`);

//     if (item.children && item.children.length > 0) {
//       await createAllEntries(item.children, 'sub', currentRabbiId);
//     }
//   }
// }

// // פונקציה לחיבור הקשרים (נעשית רק אחרי שהכל קיים)
// async function linkAllEntries(items, type = 'main', parentId = null) {
//   for (const item of items) {
//     if (!item.name || item.name.trim() === "Dummy") continue;

//     const uid = type === 'main' ? 'api::categories-main.categories-main' : 'api::categories-sub.categories-sub';
    
//     if (type === 'sub' && parentId) {
//       const currentEntry = await strapi.db.query(uid).findOne({ where: { externalCatId: item.id } });
      
//       const updateData = {};
      
//       // מחפש אם האבא הוא קטגוריה ראשית
//       const parentMain = await strapi.db.query('api::categories-main.categories-main').findOne({ where: { externalCatId: parentId } });
//       if (parentMain) updateData.main_category = parentMain.id;

//       // מחפש אם האבא הוא תת-קטגוריה (בשביל העומק)
//       const parentSub = await strapi.db.query('api::categories-sub.categories-sub').findOne({ where: { externalCatId: parentId } });
//       if (parentSub) updateData.parent_sub = parentSub.id;

//       if (currentEntry && (updateData.main_category || updateData.parent_sub)) {
//         await strapi.db.query(uid).update({
//           where: { id: currentEntry.id },
//           data: updateData
//         });
//         console.log(`🔗 קושר: ${item.name} -> לאבא שלו`);
//       }
//     }

//     if (item.children && item.children.length > 0) {
//       await linkAllEntries(item.children, 'sub', item.id);
//     }
//   }
// }

// module.exports = importFinalSafeStructure;




//הכי טוב!!!!!!!!!!!!!!!!!!!!!
// 'use strict';
// const fs = require('fs');
// const path = require('path');

// // הפונקציה הראשית שסטרפי קורא לה
// module.exports = async ({ strapi }) => {
//   try {
//     console.log("🧹 מנקה את הטבלאות להתחלה נקייה...");
//     await strapi.db.query('api::categories-sub.categories-sub').deleteMany({});
//     await strapi.db.query('api::categories-main.categories-main').deleteMany({});

//     const filePath = path.join(process.cwd(), 'LessonTree.json');
//     let rawContent = fs.readFileSync(filePath, 'utf8');
//     let cleanContent = rawContent.replace(/\uFEFF/g, '').trim();
//     const data = JSON.parse(cleanContent);
//     const rootItems = data.children || (Array.isArray(data) ? data : [data]);

//     console.log(`🚀 מתחיל ייבוא מבנה עמוק...`);

//     // הגדרת הפונקציה הרקורסיבית בתוך הייצוא כדי שתהיה נגישה ל-strapi
//     async function runImport(items, type, mainId, rabbiId, parentSubId) {
//       if (!items || !Array.isArray(items)) return;

//       for (const item of items) {
//         if (!item.name || item.name.trim() === "Dummy") continue;

//         const uid = type === 'main' ? 'api::categories-main.categories-main' : 'api::categories-sub.categories-sub';
        
//         // 1. יצירה בסיסית
//         const entry = await strapi.entityService.create(uid, {
//           data: {
//             name: item.name.trim(),
//             externalCatId: item.id.toString(),
//             publishedAt: new Date(),
//             rabbi: type === 'main' ? rabbiId : null,
//             main_category: type === 'sub' ? mainId : null,
//           }
//         });

//         console.log(`✅ נוצר: ${item.name}`);

//         // 2. עדכון קשר אבא (למניעת שגיאת Foreign Key ב-v5)
//         if (type === 'sub' && parentSubId) {
//           try {
//             await strapi.db.query(uid).update({
//               where: { id: entry.id },
//               data: { parent_sub: parentSubId }
//             });
//           } catch (e) {
//             console.warn(`⚠️ קשר הורה ל-${item.name} נכשל, אך הרשומה נוצרה.`);
//           }
//         }

//         // 3. המשך רקורסיבי לילדים
//         if (item.children && item.children.length > 0) {
//           await runImport(
//             item.children, 
//             'sub', 
//             (type === 'main' ? entry.id : mainId), 
//             rabbiId, 
//             entry.id
//           );
//         }
//       }
//     }

//     // לולאת השורש (רבנים וקטגוריות על)
//     for (const item of rootItems) {
//       const itemName = item.name?.trim();
//       if (!itemName || itemName === "Dummy") continue;

//       const rabbi = await strapi.db.query('api::rabbi.rabbi').findOne({
//         where: { externalCatId: item.id.toString() }
//       });

//       if (rabbi) {
//         console.log(`👨‍🏫 משייך תוכן לרב: ${rabbi.name}`);
//         await runImport(item.children, 'main', null, rabbi.id, null);
//       } else if (["תדמית הישיבה", "שיעורים כלליים", "מצגות"].includes(itemName)) {
//         await runImport([item], 'main', null, null, null);
//       }
//     }

//     console.log("✨ הייבוא הסתיים בהצלחה!");
//   } catch (err) {
//     console.error("❌ שגיאה בתהליך:", err.message);
//   }
// };



//הכי מעודכן

// 'use strict';
// const fs = require('fs');
// const path = require('path');
// 
// module.exports = async ({ strapi }) => {
//   try {
//     console.log("🚀 מתחיל ייבוא מותאם ל-Strapi v5 (סטטוס: Published)...");
// 
//     const filePath = path.join(process.cwd(), 'LessonTree.json');
//     let rawContent = fs.readFileSync(filePath, 'utf8');
//     let cleanContent = rawContent.replace(/\uFEFF/g, '').trim();
//     const data = JSON.parse(cleanContent);
//     const rootItems = data.children || (Array.isArray(data) ? data : [data]);
// 
//     // פונקציית עזר לביצוע Upsert ופרסום (Publish)
//     async function upsertCategory(uid, item, relations, priority) {
//       const externalId = item.id.toString();
//       
//       const existing = await strapi.db.query(uid).findOne({
//         where: { externalCatId: externalId }
//       });
// 
//       const dataPayload = {
//         name: item.name.trim(),
//         externalCatId: externalId,
//         priority: priority, // מעדכן את סדר העדיפות
//         ...relations
//       };
// 
//       if (existing) {
//         console.log(`🔄 מעדכן ומפרסם: ${item.name}`);
//         const updated = await strapi.documents(uid).update({
//           documentId: existing.documentId,
//           data: dataPayload,
//           status: 'published' // גורם לרשומה להיות Published (ירוק)
//         });
//         return updated.documentId;
//       } else {
//         console.log(`✅ יוצר ומפרסם חדש: ${item.name}`);
//         const created = await strapi.documents(uid).create({
//           data: dataPayload,
//           status: 'published' // גורם לרשומה להיות Published (ירוק)
//         });
//         return created.documentId;
//       }
//     }
// 
//     async function runImport(items, type, mainDocId, rabbiDocId, parentSubDocId) {
//       if (!items || !Array.isArray(items)) return;
// 
//       for (let i = 0; i < items.length; i++) {
//         const item = items[i];
//         if (!item.name || item.name.trim() === "Dummy") continue;
// 
//         const uid = type === 'main' ? 'api::categories-main.categories-main' : 'api::categories-sub.categories-sub';
//         
//         const relations = {};
//         if (type === 'main') {
//           if (rabbiDocId) relations.rabbi = rabbiDocId;
//         } else {
//           if (mainDocId) relations.main_category = mainDocId;
//           if (parentSubDocId) relations.parent_sub = parentSubDocId;
//         }
// 
//         // שליחת ה-Index כ-Priority (כדי לשמור על הסדר)
//         const currentDocId = await upsertCategory(uid, item, relations, i + 1);
// 
//         if (item.children && item.children.length > 0) {
//           await runImport(
//             item.children, 
//             'sub', 
//             (type === 'main' ? currentDocId : mainDocId), 
//             rabbiDocId, 
//             (type === 'sub' ? currentDocId : null)
//           );
//         }
//       }
//     }
// 
//     for (let i = 0; i < rootItems.length; i++) {
//       const item = rootItems[i];
//       const itemName = item.name?.trim();
//       if (!itemName || itemName === "Dummy") continue;
// 
//       const rabbi = await strapi.db.query('api::rabbi.rabbi').findOne({
//         where: { externalCatId: item.id.toString() }
//       });
// 
//       if (rabbi) {
//         console.log(`👨‍🏫 מטפל ברב: ${rabbi.name}`);
//         await runImport(item.children, 'main', null, rabbi.documentId, null);
//       } else if (["תדמית הישיבה", "שיעורים כלליים", "מצגות"].includes(itemName)) {
//         await runImport([item], 'main', null, null, null);
//       }
//     }
// 
//     console.log("✨ הסקריפט הסתיים! כל הרשומות במצב Published.");
//   } catch (err) {
//     console.error("❌ שגיאה בתהליך:", err.message);
//     if (err.details) console.error("Details:", JSON.stringify(err.details, null, 2));
//   }
// };
















// const axios = require('axios');
// const fs = require('fs');
// const Hebcal = require('hebcal');

// const STRAPI_URL = 'http://localhost:1337/api';

// // פונקציה להשהיה בין בקשות (כדי למנוע קריסה של ה-DB)
// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// async function importLessons() {
//   try {
//     // קריאת הקובץ וניקוי תווים בלתי נראים
//     let rawData = fs.readFileSync('./LessonList.json', 'utf8');
//     rawData = rawData.trim().replace(/^\uFEFF/, '');
//     const lessonsData = JSON.parse(rawData);

//     console.log(`🚀 מתחיל ייבוא של ${lessonsData.length} שיעורים...`);

//     for (const item of lessonsData) {
//       try {
//         // 1. טיפול בתאריכים
//         const dateParts = item.lessonDateTime.split('.');
//         const gregorianDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        
//         // יצירת תאריך עברי עם Hebcal
//         const dateObj = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
//         const hDate = new Hebcal.HDate(dateObj);
//         const hebrewDateStr = hDate.toString('h');

//         // 2. מציאת ה-ID של הרב בסטרפי (לפי השם)
//         const rabbiRes = await axios.get(`${STRAPI_URL}/rabbis?filters[name][$eq]=${encodeURIComponent(item.rabi)}`);
//         const rabbiId = rabbiRes.data.data[0]?.id || null;

//         // 3. מציאת ה-ID של הקטגוריה הראשית בסטרפי (לפי השם)
//         const catRes = await axios.get(`${STRAPI_URL}/categories-mains?filters[name][$eq]=${encodeURIComponent(item.category)}`);
//         const catId = catRes.data.data[0]?.id || null;

//         // 4. בניית האובייקט לסטרפי
//         const payload = {
//           data: {
//             title: item.lessonName,
//             lesson_date_gregorian: gregorianDate,
//             lesson_date_hebrew: hebrewDateStr,
//             duration: item.lessonDuration,
//             youtube_id: item.youTubeId || "",
//             views: parseInt(item.views) || 0,
//             AudioDir: item.mp3Directory,
//             AudioFileName: item.mp3FileName,
//             PdfFileName: item.pdfFileName,
//             rabbi: rabbiId,
//             main_category: catId,
//             // כרגע ללא sub_category אלא אם יש נתון ב-JSON
//           }
//         };

//         // 5. שליחה לסטרפי
//         await axios.post(`${STRAPI_URL}/lessons`, payload);
//         console.log(`✅ הוכנס: ${item.lessonName} (${hebrewDateStr})`);

//         // השהיה קלה של 50 מילישניות כדי לשמור על יציבות
//         await sleep(50);

//       } catch (error) {
//         // הדפסת שגיאה מפורטת מסטרפי
//         const msg = error.response?.data?.error?.message || error.message;
//         console.error(`❌ שגיאה בשיעור ${item.lessonName}: ${msg}`);
//       }
//     }
//     console.log('🏁 תהליך הייבוא הסתיים בהצלחה!');
//   } catch (err) {
//     console.error("💥 שגיאה קריטית בקובץ ה-JSON:", err.message);
//   }
// }

// importLessons();
// 'use strict';
// const fs = require('fs');
// const path = require('path');

// module.exports = async ({ strapi }) => {
//   try {
//     console.log("🚀 מתחיל תהליך ייבוא משופר...");

//     // 1. טעינת הקובץ וניקוי JSON
//     const filePath = path.join(process.cwd(), 'LessonList.json'); 
//     if (!fs.existsSync(filePath)) {
//       console.error(`💥 קובץ לא נמצא בנתיב: ${filePath}`);
//       return;
//     }

//     let rawContent = fs.readFileSync(filePath, 'utf8');
//     let cleanContent = rawContent.replace(/^\uFEFF/g, '').trim();
//     const lessonsData = JSON.parse(cleanContent);

//     // 2. ניקוי שיעורים קיימים
//     console.log("🧹 מנקה שיעורים קיימים לטובת ייבוא נקי...");
//     await strapi.db.query('api::lesson.lesson').deleteMany({});

//     console.log(`📝 נמצאו ${lessonsData.length} שיעורים לעיבוד.`);

//     for (const item of lessonsData) {
//       try {
//         let mainCatId = null;
//         let subCatId = null;

//         // --- חיפוש קטגוריות בצורה בטוחה (לפי ה-ID החיצוני שלך) ---
        
//         // בדיקה בתת-קטגוריה
//         const subCatRecord = await strapi.db.query('api::categories-sub.categories-sub').findOne({
//           where: { externalCatId: item.catId.toString() },
//           populate: ['main_category']
//         });

//         if (subCatRecord) {
//           subCatId = subCatRecord.id; // ה-ID הפנימי של Strapi
//           mainCatId = subCatRecord.main_category?.id || null;
//         }

//         // בדיקה בקטגוריה ראשית (אם ה-catId שייך ישירות לראשי)
//         if (!mainCatId) {
//           const mainCatRecord = await strapi.db.query('api::categories-main.categories-main').findOne({
//             where: { externalCatId: item.catId.toString() }
//           });
//           if (mainCatRecord) mainCatId = mainCatRecord.id;
//         }

//         // חיפוש רב
//         const rabbi = await strapi.db.query('api::rabbi.rabbi').findOne({
//           where: { name: item.rabi }
//         });

//         // 3. בניית הנתונים הבסיסיים
//         const baseData = {
//           title: item.lessonName,
//           lessonId: item.lessonId,
//           duration: item.lessonDuration,
//           youtube_id: item.youTubeId || "",
//           views: parseInt(item.views) || 0,
//           AudioDir: item.mp3Directory,
//           AudioFileName: item.mp3FileName,
//           publishedAt: new Date(),
//         };

//         if (rabbi) baseData.rabbi = rabbi.id;

//         // --- ניסיון יצירה ראשון: עם כל הקשרים ---
//         try {
//           const fullPayload = { ...baseData };
//           if (mainCatId) fullPayload.main_category = mainCatId;
//           if (subCatId) fullPayload.sub_category = subCatId;

//           await strapi.entityService.create('api::lesson.lesson', {
//             data: fullPayload
//           });
//           console.log(`✅ יובא: ${item.lessonName}`);
//         } 
//         catch (relationErr) {
//           // --- ניסיון יצירה שני: במקרה של שגיאת קשר (Relation Error) ---
//           // אם ה-main_category שבור, ננסה להכניס רק עם ה-sub או בלי קטגוריות
//           console.log(`⚠️ בעיית קשר בשיעור ${item.lessonId}, מנסה ייבוא ללא קטגוריה ראשית...`);
          
//           try {
//             const fallbackPayload = { ...baseData };
//             if (subCatId) fallbackPayload.sub_category = subCatId;

//             await strapi.entityService.create('api::lesson.lesson', {
//               data: fallbackPayload
//             });
//             console.log(`✅ יובא (בדיעבד): ${item.lessonName}`);
//           } catch (finalErr) {
//             console.error(`❌ נכשל סופית בשיעור ${item.lessonId}: ${finalErr.message}`);
//           }
//         }

//       } catch (err) {
//         console.error(`❌ שגיאה בלוגיקה של שיעור ${item.lessonId}:`, err.message);
//       }
//     }

//     console.log("🏁 תהליך הייבוא הסתיים בהצלחה!");
//   } catch (error) {
//     console.error("💥 שגיאה קריטית:", error.message);
//   }
// };
// 'use strict';
// const fs = require('fs');
// const path = require('path');

// module.exports = async ({ strapi }) => {
//   try {
//     console.log("🚀 מתחיל ייבוא עם סכמות מתוקנות...");

//     const filePath = path.join(process.cwd(), 'LessonList.json'); 
//     if (!fs.existsSync(filePath)) {
//       console.error("💥 קובץ LessonList.json לא נמצא!");
//       return;
//     }

//     const rawContent = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/g, '').trim();
//     const lessonsData = JSON.parse(rawContent);

//     console.log("🧹 מנקה שיעורים קיימים...");
//     await strapi.db.query('api::lesson.lesson').deleteMany({});

//     console.log(`📝 מעבד ${lessonsData.length} שיעורים...`);

//     for (const item of lessonsData) {
//       try {
//         let mainCatId = null;
//         let subCatId = null;

//         // 1. חיפוש תת-קטגוריה (והוצאת הקטגוריה הראשית המשויכת אליה)
//         const subCat = await strapi.db.query('api::categories-sub.categories-sub').findOne({
//           where: { externalCatId: item.catId.toString() },
//           populate: ['main_category']
//         });

//         if (subCat) {
//           subCatId = subCat.id;
//           mainCatId = subCat.main_category?.id || null;
//         } else {
//           // 2. אם לא נמצא בתת-קטגוריה, נחפש בראשית (אולי זה שיעור כללי)
//           const mainCat = await strapi.db.query('api::categories-main.categories-main').findOne({
//             where: { externalCatId: item.catId.toString() }
//           });
//           if (mainCat) mainCatId = mainCat.id;
//         }

//         // 3. בניית אובייקט השיעור
//         const lessonData = {
//           title: item.lessonName,
//           duration: item.lessonDuration,
//           youtube_id: item.youTubeId || "",
//           views: parseInt(item.views) || 0,
//           AudioDir: item.mp3Directory,
//           AudioFileName: item.mp3FileName,
//           PdfFileName: item.pdfFileName,
//           lesson_date_hebrew: item.lessonDateHebrew || "",
//           publishedAt: new Date(),
//         };

//         // הצמדת רב
//         const rabbi = await strapi.db.query('api::rabbi.rabbi').findOne({ 
//           where: { name: item.rabi } 
//         });
//         if (rabbi) lessonData.rabbi = rabbi.id;

//         // 4. ניסיון יצירה סופי
//         try {
//           const finalPayload = { ...lessonData };
//           if (mainCatId) finalPayload.main_category = mainCatId;
//           if (subCatId) finalPayload.sub_category = subCatId;

//           await strapi.entityService.create('api::lesson.lesson', {
//             data: finalPayload
//           });
//           // הדפסה חסכונית כדי לא להציף את הטרמינל
//           if (lessonsData.indexOf(item) % 100 === 0) {
//              console.log(`⏳ התקדמות: ${lessonsData.indexOf(item)} / ${lessonsData.length}`);
//           }
//         } catch (innerError) {
//           console.warn(`⚠️ שגיאת קשר בשיעור ${item.lessonId}, מנסה ללא קטגוריות...`);
//           await strapi.entityService.create('api::lesson.lesson', {
//             data: lessonData
//           });
//         }

//       } catch (err) {
//         console.error(`❌ כשל בשיעור ${item.lessonId}: ${err.message}`);
//       }
//     }

//     console.log("🏁 הייבוא הסתיים בהצלחה!");
//   } catch (error) {
//     console.error("💥 שגיאה קריטית בסקריפט:", error.message);
//   }
// };
// 'use strict';
// const fs = require('fs');
// const path = require('path');

// module.exports = async ({ strapi }) => {
//   try {
//     console.log("🚀 מתחיל ייבוא עם הפרדת תאריכים חכמה...");

//     const filePath = path.join(process.cwd(), 'LessonList.json'); 
//     if (!fs.existsSync(filePath)) {
//       console.error("💥 קובץ LessonList.json לא נמצא!");
//       return;
//     }

//   let rawContent = fs.readFileSync(filePath, 'utf8');

//     // 2. ניקוי תווים נסתרים וירידות שורה שוברות
//     rawContent = rawContent
//       .replace(/^\uFEFF/g, '') // ניקוי BOM
//       .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // ניקוי תווים בלתי נראים
//       .trim();

//     // 3. פירוק ה-JSON עם "תיקון אוטומטי" לגרשיים שבורים
//     let lessonsData;
//     try {
//       lessonsData = JSON.parse(rawContent);
//     } catch (e) {
//       console.warn("🛠️ נמצאו בעיות ב-JSON, מנסה תיקון אוטומטי לגרשיים פנימיים...");
//       // התיקון הקריטי: מחליף גרשיים שמופיעים בתוך טקסט בגרש בודד כדי לא לשבור את המבנה
//       const fixedContent = rawContent.replace(/(?<![:[,])"(?![:\],])/g, "'");
//       try {
//         lessonsData = JSON.parse(fixedContent);
//         console.log("✅ ה-JSON תוקן בהצלחה וממשיך לעבוד!");
//       } catch (finalError) {
//         console.error("❌ גם התיקון נכשל. מיקום השגיאה:", finalError.message);
//         throw finalError;
//       }
//     }

//     // מנקה את הטבלה כדי שלא יהיו כפילויות
//     console.log("🧹 מנקה שיעורים קיימים...");
//     await strapi.db.query('api::lesson.lesson').deleteMany({});

//     console.log(`📝 מעבד ${lessonsData.length} שיעורים...`);

//     for (const item of lessonsData) {
//       try {
//         let mainCatId = null;
//         let subCatId = null;

//         // --- הפרדת תאריכים מהשדה lessonDateTime ---
//         let hebrewDate = "";
//         let gregorianDate = null;

//         if (item.lessonDateTime) {
//           // ביטוי רגולרי שמוצא תאריך לועזי (DD.MM.YYYY) בתוך המחרוזת
//           const dateMatch = item.lessonDateTime.match(/(\d{2})\.(\d{2})\.(\d{4})/);
          
//           if (dateMatch) {
//             // הופך DD.MM.YYYY לפורמט שסטרפי אוהב: YYYY-MM-DD
//             gregorianDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
            
//             // כל מה שלפני התאריך הלועזי נחשב לתאריך עברי
//             hebrewDate = item.lessonDateTime.split(dateMatch[0])[0].trim();
//           } else {
//             // אם אין תאריך לועזי, ניקח את כל המחרוזת כעברי
//             hebrewDate = item.lessonDateTime;
//           }
//         }

//         // --- חיפוש קטגוריות ---
//         const subCat = await strapi.db.query('api::categories-sub.categories-sub').findOne({
//           where: { externalCatId: item.catId.toString() },
//           populate: ['main_category']
//         });

//         if (subCat) {
//           subCatId = subCat.id;
//           mainCatId = subCat.main_category?.id || null;
//         } else {
//           const mainCat = await strapi.db.query('api::categories-main.categories-main').findOne({
//             where: { externalCatId: item.catId.toString() }
//           });
//           if (mainCat) mainCatId = mainCat.id;
//         }

//         // --- בניית האובייקט ---
//         const lessonPayload = {
//           title: item.lessonName,
//           duration: item.lessonDuration,
//           youtube_id: item.youTubeId || "",
//           views: parseInt(item.views) || 0,
//           AudioDir: item.mp3Directory,
//           AudioFileName: item.mp3FileName,
//           PdfFileName: item.pdfFileName,
//           lesson_date_hebrew: hebrewDate,
//           lesson_date_gregorian: gregorianDate,
//           publishedAt: new Date(),
//         };

//         // הצמדת רב
//        if (item.rabi) {
//           const rawName = item.rabi.trim();
//           const simplifiedName = rawName.replace(/יי/g, 'י');

//           let rabbi = await strapi.db.query('api::rabbi.rabbi').findOne({ 
//             where: { name: { $contains: rawName } } 
//           });

//           if (!rabbi) {
//             rabbi = await strapi.db.query('api::rabbi.rabbi').findOne({
//               where: { name: { $contains: simplifiedName } }
//             });
//           }

//           if (rabbi) lessonPayload.rabbi = rabbi.id;
//         }
        
//         if (mainCatId) lessonPayload.main_category = mainCatId;
//         if (subCatId) lessonPayload.sub_category = subCatId;

//         // יצירה ב-Strapi
//         await strapi.entityService.create('api::lesson.lesson', {
//           data: lessonPayload
//         });

//       } catch (err) {
//         console.error(`❌ כשל בשיעור ${item.lessonId}: ${err.message}`);
//       }
//     }

//     console.log("🏁 הייבוא הסתיים בהצלחה! התאריכים הופרדו.");
//   } catch (error) {
//     console.error("💥 שגיאה קריטית:", error.message);
//   }
// };



///הריצה של השיעורים הכי טובה
// 'use strict';
// const fs = require('fs');
// const path = require('path');

// module.exports = async ({ strapi }) => {
//   try {
//     console.log("🚀 מתחיל ייבוא חכם (פתרון לעטיה/חקון)...");

//     const filePath = path.join(process.cwd(), 'LessonList.json'); 
//     if (!fs.existsSync(filePath)) {
//       console.error("💥 קובץ LessonList.json לא נמצא!");
//       return;
//     }

//     const rawContent = fs.readFileSync(filePath, 'utf8')
//       .replace(/^\uFEFF/g, '')
//       .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
//       .trim();

//     const lessonsData = JSON.parse(rawContent);

//     console.log("🧹 מנקה שיעורים קיימים...");
//     await strapi.db.query('api::lesson.lesson').deleteMany({});

//     console.log(`📝 מעבד ${lessonsData.length} שיעורים...`);

//     let insertedCount = 0;
//     const skipped = { noAudioNoYoutube: [], audioNotFound: [], otherError: [] };

//     const allRabbis = await strapi.db.query('api::rabbi.rabbi').findMany();

//     // --- הפונקציה שהופכת את החיפוש לחכם ---
//     const cleanMatch = (name) => {
//       if (!name) return "";
//       return name
//         .replace(/הרב|ר'|הרה"ג|מרן|אדמו"ר/g, "") // מסיר "הרב" או "ר'"
//         .replace(/יי/g, 'י')                   // הופך "עטייה" ל"עטיה" (פותר את הבעיה שראית!)
//         .replace(/\s+/g, " ")                  // מנקה רווחים כפולים
//         .trim();
//     };

//     for (const item of lessonsData) {
//       try {
//         let mainCatId = null;
//         let subCatId = null;
//         let hebrewDate = "";
//         let gregorianDate = null;

//         if (item.lessonDateTime) {
//           const dateMatch = item.lessonDateTime.match(/(\d{2})\.(\d{2})\.(\d{4})/);
//           if (dateMatch) {
//             gregorianDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
//             hebrewDate = item.lessonDateTime.split(dateMatch[0])[0].trim();
//           } else {
//             hebrewDate = item.lessonDateTime;
//           }
//         }

//         const subCat = await strapi.db.query('api::categories-sub.categories-sub').findOne({
//           where: { externalCatId: item.catId.toString() },
//           populate: ['main_category']
//         });

//         if (subCat) {
//           subCatId = subCat.id;
//           mainCatId = subCat.main_category?.id || null;
//         } else {
//           const mainCat = await strapi.db.query('api::categories-main.categories-main').findOne({
//             where: { externalCatId: item.catId.toString() }
//           });
//           if (mainCat) mainCatId = mainCat.id;
//         }

//         if (!item.mp3Directory && !item.mp3FileName && !item.youTubeId) {
//           skipped.noAudioNoYoutube.push(`${item.lessonName} (ID: ${item.lessonId})`);
//           continue;
//         }


//         const lessonPayload = {
//           title: item.lessonName,
//           duration: item.lessonDuration,
//           youtube_id: item.youTubeId || "",
//           views: parseInt(item.views) || 0,
//           AudioDir: (item.mp3Directory || "").replace('/public.php/dav/files/KX3W8YjnDgHpoA9', ''),
//           AudioFileName: item.mp3FileName,
//           PdfFileName: item.pdfFileName,
//           lesson_date_hebrew: hebrewDate,
//           lesson_date_gregorian: gregorianDate,
//           publishedAt: new Date(),
//           _skipAudioCheck: true,
//         };

//         // --- הצמדת רב חכמה ---
//         if (item.rabi) {
//           const searchName = cleanMatch(item.rabi); // מנקה את השם מה-JSON

//           // מחפש רב שגם השם שלו ב-Strapi עובר ניקוי דומה
//           const foundRabbi = allRabbis.find(r => cleanMatch(r.name).includes(searchName) ||
//                                                  searchName.includes(cleanMatch(r.name)));

//           if (foundRabbi) {
//             lessonPayload.rabbi = foundRabbi.id;
//           }
//         }
        
//         if (mainCatId) lessonPayload.main_category = mainCatId;
//         if (subCatId) lessonPayload.sub_category = subCatId;

//         await strapi.entityService.create('api::lesson.lesson', {
//           data: lessonPayload
//         });
//         insertedCount++;

//       } catch (err) {
//         if (err.message && err.message.includes('קובץ האודיו לא נמצא')) {
//           skipped.audioNotFound.push(`${item.lessonName} (ID: ${item.lessonId})`);
//         } else {
//           skipped.otherError.push(`${item.lessonName} (ID: ${item.lessonId}): ${err.message}`);
//         }
//       }
//     }

//     console.log(`\n🏁 הייבוא הסתיים!`);
//     console.log(`✅ נכנסו: ${insertedCount} שיעורים`);
//     console.log(`⚠️ דולגו — אין אודיו ואין יוטיוב: ${skipped.noAudioNoYoutube.length}`);
//     skipped.noAudioNoYoutube.forEach(s => console.log(`   - ${s}`));
//     console.log(`❌ דולגו — קובץ אודיו לא נמצא בשרת: ${skipped.audioNotFound.length}`);
//     skipped.audioNotFound.forEach(s => console.log(`   - ${s}`));
//     if (skipped.otherError.length > 0) {
//       console.log(`❌ שגיאות אחרות: ${skipped.otherError.length}`);
//       skipped.otherError.forEach(s => console.log(`   - ${s}`));
//     }
//   } catch (error) {
//     console.error("💥 שגיאה קריטית:", error.message);
//   }
// };
// מושך 15 אחרונים בצורה נכונה!!!
// import { factories } from '@strapi/strapi';
// import axios from 'axios';
// import { parseStringPromise } from 'xml2js';
// import hebcal from 'hebcal';

// const RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjCwvHzEeN0dGO4eaaQi6KQ';

// // פונקציית עזר להפיכת אורך סרטון לפורמט קריא
// const formatDuration = (pt) => {
//     if (!pt) return "00:00";
//     const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
//     if (!match) return "00:00";
//     const h = parseInt(match[1] || 0);
//     const m = parseInt(match[2] || 0);
//     const s = parseInt(match[3] || 0);
//     return h > 0 
//         ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
//         : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// };

// export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//     async sync(ctx) {
//         try {
//            

//             // 1. משיכת הנתונים מיוטיוב
//             let rssResponse = await axios.get(RSS_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
//             const rssResult = await parseStringPromise(rssResponse.data);
//             const entries = rssResult.feed.entry || [];
//             const videoIds = entries.map(e => e['yt:videoId'][0]);

//             // 2. משיכת פרטים נוספים (משך השיעור) מה-API
//             const videoDetailsRes = await axios.get(
//                 `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
//             );
            
//             let videoDetailsMap = {};
//             videoDetailsRes.data.items.forEach(item => {
//                 videoDetailsMap[item.id] = item.contentDetails.duration;
//             });

//             // 3. טעינת רבנים מהמערכת
//             const allRabbis = await strapi.documents('api::rabbi.rabbi').findMany();
//             let addedCount = 0;
//             let skippedCount = 0;

//             for (const entry of entries) {
//                 const videoId = entry['yt:videoId'][0];
//                 const rawTitle = entry.title[0];

//                 // בדיקה אם קיים
//                 const existing = await strapi.documents('api::lesson.lesson').findMany({
//                     filters: { youtube_id: videoId }
//                 });

//                 if (existing.length === 0) {
//                     const duration = videoDetailsMap[videoId] ? formatDuration(videoDetailsMap[videoId]) : "00:00";
//                     const publishedDate = entry.published[0];
//                     const hDate = new hebcal.HDate(new Date(publishedDate));

//                     // --- ניקוי שם הרב מהכותרת ---
//                     let cleanTitle = rawTitle;
//                     let foundRabbiName = "לא זוהה";
//                     let foundRabbiId = null;

//                     for (const r of allRabbis) {
//                         const baseName = r.name.replace('הרב', '').trim();
//                         if (rawTitle.includes(baseName)) {
//                             foundRabbiId = r.id;
//                             foundRabbiName = r.name;
//                             const nameRegex = new RegExp(`(הרב\\s+)?${baseName}`, 'g');
//                             cleanTitle = cleanTitle.replace(nameRegex, '');
//                             break; 
//                         }
//                     }
//                     cleanTitle = cleanTitle.replace(/^[\s\-\|.:]+/, '').trim();

//                     // --- חילוץ צפיות ---
//                     let rssViews = 0;
//                     try {
//                         rssViews = parseInt(entry['media:group'][0]['media:community'][0]['media:statistics'][0].$.views || 0);
//                     } catch (e) { rssViews = 0; }

//                     // שמירה ל-Strapi
//                     await strapi.documents('api::lesson.lesson').create({
//                         data: {
//                             title: cleanTitle,
//                             youtube_id: videoId,
//                             duration: duration,
//                             views: rssViews,
//                             lesson_date_gregorian: publishedDate.split('T')[0],
//                             lesson_date_hebrew: hDate.toString('h'),
//                             rabbi: foundRabbiId,
//                             locale: 'en',
//                             publishedAt: new Date(),
//                         },
//                         status: 'published',
//                     });

//                     // הדפסת עדכון מפורט ללוג
//                     console.log(`✅ הוסף בהצלחה:`);
//                     console.log(`   🔹 כותרת מקורית: ${rawTitle}`);
//                     console.log(`   🔹 כותרת נקייה:  ${cleanTitle}`);
//                     console.log(`   🔹 רב משויך:     ${foundRabbiName}`);
//                     console.log(`   🔹 משך שיעור:    ${duration} | צפיות: ${rssViews}`);
//                     console.log(`   🔹 תאריך עברי:   ${hDate.toString('h')}`);
//                     console.log('   ----------------------------------------------');
                    
//                     addedCount++;
//                 } else {
//                     skippedCount++;
//                 }
//             }

//             console.log(`📊 סיכום: נוספו ${addedCount} שיעורים חדשים. (${skippedCount} כבר היו קיימים).`);
//             console.log('--------------------------------------------------');

//             return { 
//                 success: true, 
//                 added: addedCount, 
//                 skipped: skippedCount 
//             };

//         } catch (err) {
//             console.error('❌ שגיאה במהלך הסנכרון:', err.message);
//             return ctx.badRequest(err.message);
//         }
//     },
// }));
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

//                     // הדפסת עדכון מפורט ללוג
//                     console.log(`✅ הוסף בהצלחה:`);
//                     console.log(`   🔹 כותרת מקורית: ${rawTitle}`);
//                     console.log(`   🔹 כותרת נקייה:  ${cleanTitle}`);
//                     console.log(`   🔹 רב משויך:     ${foundRabbiName}`);
//                     console.log(`   🔹 משך שיעור:    ${duration} | צפיות: ${rssViews}`);
//                     console.log(`   🔹 תאריך עברי:   ${hDate.toString('h')}`);
//                     console.log('   ----------------------------------------------');
                    
//                     addedCount++;
//                 } else {
//                     skippedCount++;
//                 }
//             }

//             console.log(`📊 סיכום: נוספו ${addedCount} שיעורים חדשים. (${skippedCount} כבר היו קיימים).`);
//             console.log('--------------------------------------------------');

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

// 'use strict';
// const axios = require('axios');
// const hebcal = require('hebcal');

// const CHANNEL_ID = 'UCjCwvHzEeN0dGO4eaaQi6KQ';
// const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace('UC', 'UU');

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

// module.exports = async ({ strapi }) => {
//     const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
//     if (!YOUTUBE_API_KEY) {
//         console.error('❌ YOUTUBE_API_KEY חסר ב-.env');
//         return;
//     }

//     try {
//         // מציאת הרב מרדכי עטייה במסד הנתונים
//         const allRabbis = await strapi.db.query('api::rabbi.rabbi').findMany();
//         const rabbi = allRabbis.find(r => {
//             const clean = r.name.replace(/יי/g, 'י');
//             return clean.includes('מרדכי') && clean.includes('עטי');
//         });

//         if (!rabbi) {
//             console.error('❌ הרב מרדכי עטייה לא נמצא במסד הנתונים');
//             console.log('רבנים קיימים:', allRabbis.map(r => r.name).join(', '));
//             return;
//         }

//         console.log(`✅ נמצא: ${rabbi.name} (ID: ${rabbi.id})`);

//         // שלב 0: מחיקת השיעורים השגויים שנוספו בריצה הקודמת (lesson_date_hebrew ריק)
//         console.log('🧹 מנקה שיעורים שגויים מהריצה הקודמת...');
//         const knex = strapi.db.connection;
//         const wrongRows = await knex('lessons AS l')
//             .join('lessons_rabbi_lnk AS lrl', 'l.id', 'lrl.lesson_id')
//             .where('lrl.rabbi_id', rabbi.id)
//             .where(function () {
//                 this.where('l.lesson_date_hebrew', '').orWhereNull('l.lesson_date_hebrew');
//             })
//             .select('l.document_id');

//         for (const row of wrongRows) {
//             await strapi.documents('api::lesson.lesson').delete({ documentId: row.document_id });
//         }
//         console.log(`🗑️ נמחקו ${wrongRows.length} שיעורים שגויים`);

//         // שלב 1: משיכת כל הסרטונים מהערוץ עם pagination מלא
//         console.log('🚀 מתחיל משיכת כל הסרטונים מהערוץ...');
//         let allItems = [];
//         let nextPageToken = '';
//         let pageCount = 0;

//         do {
//             pageCount++;
//             console.log(`📄 עמוד ${pageCount} - ${allItems.length} סרטונים עד כה...`);

//             const res = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
//                 params: {
//                     part: 'snippet,contentDetails',
//                     playlistId: UPLOADS_PLAYLIST_ID,
//                     maxResults: 50,
//                     pageToken: nextPageToken,
//                     key: YOUTUBE_API_KEY
//                 }
//             });

//             allItems = allItems.concat(res.data.items || []);
//             nextPageToken = res.data.nextPageToken || '';
//             await sleep(300);
//         } while (nextPageToken);

//         console.log(`📊 סה"כ ${allItems.length} סרטונים בערוץ`);

//         // שלב 2: סינון - רק שיעורים שבכותרת יש "מרדכי" + "עטי" (שתי הכתיבות)
//         const rabbiVideos = allItems.filter(item => {
//             const title = (item.snippet.title || '').replace(/יי/g, 'י');
//             return title.includes('מרדכי') && title.includes('עטי');
//         });

//         console.log(`🔍 נמצאו ${rabbiVideos.length} שיעורים של ${rabbi.name}`);
//         if (rabbiVideos.length === 0) {
//             console.log('⚠️ לא נמצאו שיעורים - בדוק את אופן כתיבת השם בכותרות יוטיוב');
//             return;
//         }

//         // שלב 3: משיכת משך זמן + צפיות בנגלות של 50 (כמו בקונטרולר)
//         const videoIds = rabbiVideos.map(i => i.contentDetails.videoId);
//         const detailsMap = {};

//         for (let i = 0; i < videoIds.length; i += 50) {
//             const batch = videoIds.slice(i, i + 50);
//             const detailsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
//                 params: {
//                     part: 'contentDetails,statistics',
//                     id: batch.join(','),
//                     key: YOUTUBE_API_KEY
//                 }
//             });

//             detailsRes.data.items.forEach(v => {
//                 detailsMap[v.id] = {
//                     duration: formatDuration(v.contentDetails.duration),
//                     views: parseInt(v.statistics.viewCount || 0)
//                 };
//             });

//             await sleep(300);
//         }

//         // שלב 4: הכנסה למסד הנתונים - אותה לוגיקה בדיוק כמו בקונטרולר
//         let addedCount = 0;
//         let skippedCount = 0;

//         for (const item of rabbiVideos) {
//             const videoId = item.contentDetails.videoId;
//             const rawTitle = item.snippet.title;
//             const publishedDate = item.snippet.publishedAt;

//             const existing = await strapi.documents('api::lesson.lesson').findMany({
//                 filters: { youtube_id: videoId }
//             });

//             if (existing.length > 0) {
//                 skippedCount++;
//                 continue;
//             }

//             try {
//                 const hDate = new hebcal.HDate(new Date(publishedDate));

//                 await strapi.documents('api::lesson.lesson').create({
//                     data: {
//                         title: rawTitle,
//                         youtube_id: videoId,
//                         duration: detailsMap[videoId]?.duration || "00:00",
//                         views: detailsMap[videoId]?.views || 0,
//                         lesson_date_gregorian: publishedDate.split('T')[0],
//                         lesson_date_hebrew: hDate.toString('h'),
//                         rabbi: rabbi.id,
//                         locale: 'en',
//                         publishedAt: new Date(),
//                     },
//                     status: 'published',
//                 });

//                 addedCount++;
//                 if (addedCount % 10 === 0 || addedCount <= 5) {
//                     console.log(`✅ [${addedCount}] ${rawTitle}`);
//                 }
//             } catch (err) {
//                 console.error(`❌ שגיאה ב-"${rawTitle}": ${err.message}`);
//             }
//         }

//         console.log('');
//         console.log('🏁 הסתיים!');
//         console.log(`✅ נוספו: ${addedCount} שיעורים חדשים`);
//         console.log(`⏩ כבר קיימים: ${skippedCount} שיעורים`);

//     } catch (err) {
//         console.error('💥 שגיאה קריטית:', err.message);
//         if (err.response?.data) {
//             console.error('פרטי שגיאה מגוגל:', JSON.stringify(err.response.data, null, 2));
//         }
//     }

// 'use strict';
// const fs = require('fs');
// const path = require('path');

// module.exports = async ({ strapi }) => {
//   try {
//     console.log("🚀 מתחיל ייבוא חכם (פתרון לעטיה/חקון)...");

//     const filePath = path.join(process.cwd(), 'LessonList.json');
//     if (!fs.existsSync(filePath)) {
//       console.error("💥 קובץ LessonList.json לא נמצא!");
//       return;
//     }

//     const rawContent = fs.readFileSync(filePath, 'utf8')
//       .replace(/^﻿/g, '')
//       .replace(/[ --]/g, "")
//       .trim();

//     const lessonsData = JSON.parse(rawContent);

//     console.log("🧹 מנקה שיעורים קיימים...");
//     await strapi.db.query('api::lesson.lesson').deleteMany({});

//     console.log(`📝 מעבד ${lessonsData.length} שיעורים...`);

//     const cleanMatch = (name) => {
//       if (!name) return "";
//       return name
//         .replace(/הרב|ר'|הרה"ג|מרן|אדמו"ר/g, "")
//         .replace(/יי/g, 'י')
//         .replace(/\s+/g, " ")
//         .trim();
//     };

//     let insertedCount = 0;
//     let skippedCount = 0;
//     const skipReasons = {};

//     for (const item of lessonsData) {
//       try {
//         let mainCatId = null;
//         let subCatId = null;
//         let hebrewDate = "";
//         let gregorianDate = null;

//         if (item.lessonDateTime) {
//           const dateMatch = item.lessonDateTime.match(/(\d{2})\.(\d{2})\.(\d{4})/);
//           if (dateMatch) {
//             gregorianDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
//             hebrewDate = item.lessonDateTime.split(dateMatch[0])[0].trim();
//           } else {
//             hebrewDate = item.lessonDateTime;
//           }
//         }

//         const subCat = await strapi.db.query('api::categories-sub.categories-sub').findOne({
//           where: { externalCatId: item.catId.toString() },
//           populate: ['main_category']
//         });

//         if (subCat) {
//           subCatId = subCat.id;
//           mainCatId = subCat.main_category?.id || null;
//         } else {
//           const mainCat = await strapi.db.query('api::categories-main.categories-main').findOne({
//             where: { externalCatId: item.catId.toString() }
//           });
//           if (mainCat) mainCatId = mainCat.id;
//         }

//         const lessonPayload = {
//           title: item.lessonName,
//           duration: item.lessonDuration,
//           youtube_id: item.youTubeId || "",
//           views: parseInt(item.views) || 0,
//           AudioDir: (item.mp3Directory || "").replace('/public.php/dav/files/KX3W8YjnDgHpoA9', ''),
//           AudioFileName: item.mp3FileName,
//           PdfFileName: item.pdfFileName,
//           lesson_date_hebrew: hebrewDate,
//           lesson_date_gregorian: gregorianDate,
//           publishedAt: new Date(),
//         };

//         if (item.rabi) {
//           const searchName = cleanMatch(item.rabi);
//           const allRabbis = await strapi.db.query('api::rabbi.rabbi').findMany();
//           const foundRabbi = allRabbis.find(r => cleanMatch(r.name).includes(searchName) ||
//                                                  searchName.includes(cleanMatch(r.name)));
//           if (foundRabbi) {
//             lessonPayload.rabbi = foundRabbi.id;
//           }
//         }

//         if (mainCatId) lessonPayload.main_category = mainCatId;
//         if (subCatId) lessonPayload.sub_category = subCatId;

//         // ולידציה — בדיקת שדות חובה לפני הכנסה
//         const missing = [];
//         if (!lessonPayload.title) missing.push('כותרת');
//         if (!lessonPayload.lesson_date_gregorian) missing.push('תאריך');
//         if (!lessonPayload.rabbi) missing.push('רב');
//         if (!lessonPayload.main_category && !lessonPayload.sub_category) missing.push('קטגוריה');
//         if (item.views === undefined || item.views === null) missing.push('צפיות');

//         if (missing.length > 0) {
//           console.warn(`⚠️ דולג: "${item.lessonName}" — חסר: ${missing.join(' | ')}`);
//           skippedCount++;
//           missing.forEach(r => { skipReasons[r] = (skipReasons[r] || 0) + 1; });
//           continue;
//         }

//         await strapi.entityService.create('api::lesson.lesson', {
//           data: lessonPayload
//         });

//         insertedCount++;

//       } catch (err) {
//         console.error(`❌ כשל בשיעור ${item.lessonId}: ${err.message}`);
//       }
//     }

//     console.log(`🏁 הייבוא הסתיים! נכנסו: ${insertedCount} שיעורים.`);
//     if (skippedCount > 0) {
//       console.log(`⚠️ סה"כ דולגו: ${skippedCount} שיעורים`);
//       Object.entries(skipReasons).forEach(([reason, count]) => {
//         console.log(`   - חסר ${reason}: ${count} שיעורים`);
//       });
//     }

//   } catch (error) {
//     console.error("💥 שגיאה קריטית:", error.message);
//   }
// };

// ייבוא 29 קטגוריות חסרות — הסתיים בהצלחה, מושבת

// const fs = require('fs');
// const path = require('path');

// module.exports = async ({ strapi }) => {
//   try {
//     console.log("🚀 מתחיל ייבוא חכם (פתרון לעטיה/חקון)...");

//     const filePath = path.join(process.cwd(), 'LessonList.json');
//     if (!fs.existsSync(filePath)) {
//       console.error("💥 קובץ LessonList.json לא נמצא!");
//       return;
//     }

//     const rawContent = fs.readFileSync(filePath, 'utf8')
//       .replace(/^﻿/g, '')
//       .replace(/[ --]/g, "")
//       .trim();

//     const lessonsData = JSON.parse(rawContent);

//     console.log("🧹 מנקה שיעורים קיימים...");
//     await strapi.db.query('api::lesson.lesson').deleteMany({});

//     console.log(`📝 מעבד ${lessonsData.length} שיעורים...`);

//     const cleanMatch = (name) => {
//       if (!name) return "";
//       return name
//         .replace(/הרב|ר'|הרה"ג|מרן|אדמו"ר/g, "")
//         .replace(/יי/g, 'י')
//         .replace(/\s+/g, " ")
//         .trim();
//     };

//     let insertedCount = 0;
//     let skippedCount = 0;
//     const skipReasons = {};

//     for (const item of lessonsData) {
//       try {
//         let mainCatId = null;
//         let subCatId = null;
//         let hebrewDate = "";
//         let gregorianDate = null;

//         if (item.lessonDateTime) {
//           const dateMatch = item.lessonDateTime.match(/(\d{2})\.(\d{2})\.(\d{4})/);
//           if (dateMatch) {
//             gregorianDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
//             hebrewDate = item.lessonDateTime.split(dateMatch[0])[0].trim();
//           } else {
//             hebrewDate = item.lessonDateTime;
//           }
//         }

//         const subCat = await strapi.db.query('api::categories-sub.categories-sub').findOne({
//           where: { externalCatId: item.catId.toString() },
//           populate: ['main_category']
//         });

//         if (subCat) {
//           subCatId = subCat.id;
//           mainCatId = subCat.main_category?.id || null;
//         } else {
//           const mainCat = await strapi.db.query('api::categories-main.categories-main').findOne({
//             where: { externalCatId: item.catId.toString() }
//           });
//           if (mainCat) mainCatId = mainCat.id;
//         }

//         const lessonPayload = {
//           title: item.lessonName,
//           duration: item.lessonDuration,
//           youtube_id: item.youTubeId || "",
//           views: parseInt(item.views) || 0,
//           AudioDir: (item.mp3Directory || "").replace('/public.php/dav/files/KX3W8YjnDgHpoA9', ''),
//           AudioFileName: item.mp3FileName,
//           PdfFileName: item.pdfFileName,
//           lesson_date_hebrew: hebrewDate,
//           lesson_date_gregorian: gregorianDate,
//           publishedAt: new Date(),
//         };

//         if (item.rabi) {
//           const searchName = cleanMatch(item.rabi);
//           const allRabbis = await strapi.db.query('api::rabbi.rabbi').findMany();
//           const foundRabbi = allRabbis.find(r => cleanMatch(r.name).includes(searchName) ||
//                                                  searchName.includes(cleanMatch(r.name)));
//           if (foundRabbi) lessonPayload.rabbi = foundRabbi.id;
//         }

//         if (mainCatId) lessonPayload.main_category = mainCatId;
//         if (subCatId) lessonPayload.sub_category = subCatId;

//         const missing = [];
//         if (!lessonPayload.title) missing.push('כותרת');
//         if (!lessonPayload.lesson_date_gregorian) missing.push('תאריך');
//         if (!lessonPayload.rabbi) missing.push('רב');
//         if (!lessonPayload.main_category && !lessonPayload.sub_category) missing.push('קטגוריה');
//         if (item.views === undefined || item.views === null) missing.push('צפיות');

//         if (missing.length > 0) {
//           console.warn(`⚠️ דולג: "${item.lessonName}" — חסר: ${missing.join(' | ')}`);
//           skippedCount++;
//           missing.forEach(r => { skipReasons[r] = (skipReasons[r] || 0) + 1; });
//           continue;
//         }

//         await strapi.entityService.create('api::lesson.lesson', {
//           data: lessonPayload
//         });

//         insertedCount++;

//       } catch (err) {
//         console.error(`❌ כשל בשיעור ${item.lessonId}: ${err.message}`);
//       }
//     }

//     console.log(`🏁 הייבוא הסתיים! נכנסו: ${insertedCount} שיעורים.`);
//     if (skippedCount > 0) {
//       console.log(`⚠️ סה"כ דולגו: ${skippedCount} שיעורים`);
//       Object.entries(skipReasons).forEach(([reason, count]) => {
//         console.log(`   - חסר ${reason}: ${count} שיעורים`);
//       });
//     }

//   } catch (error) {
//     console.error("💥 שגיאה קריטית:", error.message);
//   }
// };

// const fs = require('fs');
// const path = require('path');

// module.exports = async ({ strapi }) => {
//   try {
//     console.log("Starting import...");
//     const filePath = path.join(process.cwd(), 'LessonList.json');
//     if (!fs.existsSync(filePath)) { console.error("LessonList.json not found!"); return; }
//     const rawContent = fs.readFileSync(filePath, 'utf8').replace(/^﻿/, '').trim();
//     const lessonsData = JSON.parse(rawContent);
//     console.log("Clearing existing lessons...");
//     await strapi.db.query('api::lesson.lesson').deleteMany({});
//     console.log(`Processing ${lessonsData.length} lessons...`);
//     let insertedCount = 0;
//     const skipped = { noMedia: [], otherError: [] };
//     const allRabbis = await strapi.db.query('api::rabbi.rabbi').findMany();
//     const allSubCats = await strapi.db.query('api::categories-sub.categories-sub').findMany({ populate: ['main_category'] });
//     const subCatMap = new Map(allSubCats.map(s => [s.externalCatId, s]));
//     const allMainCats = await strapi.db.query('api::categories-main.categories-main').findMany();
//     const mainCatMap = new Map(allMainCats.map(m => [m.externalCatId, m]));
//     global._isImporting = true;
//     const cleanMatch = (name) => {
//       if (!name) return "";
//       return name.replace(/[הרב]|ר'/g, "").replace(/יי/g, 'י').replace(/\s+/g, " ").trim();
//     };
//     for (const item of lessonsData) {
//       try {
//         if (!item.mp3Directory && !item.mp3FileName && !item.youTubeId) {
//           skipped.noMedia.push(`${item.lessonName} (ID: ${item.lessonId})`);
//           continue;
//         }
//         let hebrewDate = "", gregorianDate = null;
//         if (item.lessonDateTime) {
//           const dateMatch = item.lessonDateTime.match(/(\d{2})\.(\d{2})\.(\d{4})/);
//           if (dateMatch) {
//             gregorianDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
//             hebrewDate = item.lessonDateTime.split(dateMatch[0])[0].trim();
//           } else { hebrewDate = item.lessonDateTime; }
//         }
//         let mainCatId = null, subCatId = null;
//         const subCat = subCatMap.get(item.catId.toString());
//         if (subCat) { subCatId = subCat.id; mainCatId = subCat.main_category?.id || null; }
//         else { const mainCat = mainCatMap.get(item.catId.toString()); if (mainCat) mainCatId = mainCat.id; }
//         const lessonPayload = {
//           title: item.lessonName,
//           duration: item.lessonDuration,
//           youtube_id: item.youTubeId || "",
//           views: parseInt(item.views) || 0,
//           AudioDir: (item.mp3Directory || "").replace('/public.php/dav/files/KX3W8YjnDgHpoA9', ''),
//           AudioFileName: item.mp3FileName,
//           PdfFileName: item.pdfFileName,
//           lesson_date_hebrew: hebrewDate,
//           lesson_date_gregorian: gregorianDate,
//           publishedAt: new Date(),
//         };
//         if (item.rabi) {
//           const searchName = cleanMatch(item.rabi);
//           const foundRabbi = allRabbis.find(r => cleanMatch(r.name).includes(searchName) || searchName.includes(cleanMatch(r.name)));
//           if (foundRabbi) lessonPayload.rabbi = foundRabbi.id;
//         }
//         if (mainCatId) lessonPayload.main_category = mainCatId;
//         if (subCatId) lessonPayload.sub_category = subCatId;
//         await strapi.entityService.create('api::lesson.lesson', { data: lessonPayload });
//         insertedCount++;
//       } catch (err) {
//         skipped.otherError.push(`${item.lessonName} (ID: ${item.lessonId}): ${err.message}`);
//       }
//     }
//     global._isImporting = false;
//     console.log(`\nImport done! Inserted: ${insertedCount}`);
//     console.log(`Skipped (no media): ${skipped.noMedia.length}`);
//     skipped.noMedia.forEach(s => console.log(`  - ${s}`));
//     if (skipped.otherError.length > 0) {
//       console.log(`Errors: ${skipped.otherError.length}`);
//       skipped.otherError.forEach(s => console.log(`  - ${s}`));
//     }
//   } catch (error) {
//     console.error("Critical error:", error.message);
//     global._isImporting = false;
//   }
// };

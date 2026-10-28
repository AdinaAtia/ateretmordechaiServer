import nodemailer from 'nodemailer';

const createTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

// ---- ניקוי ובדיקת קלט (כל מה שמגיע מהדפדפן הוא לא אמין) ----

const escapeHtml = (s: string) => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// טקסט חופשי למייל: escape ואז שבירות שורה
const toHtml = (s: string) => escapeHtml(s).replace(/\r?\n/g, '<br/>');

// לכותרות (נושא המייל): שורה אחת בלבד
const oneLine = (s: string) => s.replace(/[\r\n\t]+/g, ' ').trim();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** מחרוזת מקוצצת אם הערך תקין (מחרוזת באורך המותר), אחרת null */
const readText = (v: unknown, min: number, max: number): string | null => {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length >= min && s.length <= max ? s : null;
};

// נמען: הרב (אם הוגדר לו מייל) ועותק תמיד לתיבת האתר
const buildRecipients = (rabbiEmail?: string | null) => {
  const site = process.env.GMAIL_USER;
  return rabbiEmail ? { to: rabbiEmail, cc: site } : { to: site };
};

const findRabbiByName = (name: string) => strapi.db.query('api::rabbi.rabbi').findOne({
  where: { name, publishedAt: { $notNull: true } },
});

const findRabbiEmailByLesson = async (lessonDocumentId: unknown) => {
  // documentId של Strapi: אותיות ומספרים בלבד
  if (typeof lessonDocumentId !== 'string' || !/^[a-z0-9]{1,64}$/i.test(lessonDocumentId)) return null;
  try {
    const lesson: any = await strapi.documents('api::lesson.lesson').findOne({
      documentId: lessonDocumentId,
      populate: { rabbi: true },
    });
    return lesson?.rabbi?.email || null;
  } catch {
    return null;
  }
};

export default {
  async lessonFeedback(ctx) {
    const body = ctx.request.body || {};

    // honeypot: שדה נסתר שבני אדם לא ממלאים. בוט שמילא אותו מקבל "הצלחה" בלי שנשלח מייל
    if (body.website) return ctx.send({ ok: true });

    const name = readText(body.name, 1, 100);
    const email = readText(body.email, 5, 254);
    const message = readText(body.message, 2, 5000);
    const lessonTitle = readText(body.lessonTitle, 1, 300);

    if (!name || !email || !message || !lessonTitle) return ctx.badRequest('חסרים שדות חובה או שהם לא תקינים');
    if (!EMAIL_RE.test(email)) return ctx.badRequest('כתובת דוא"ל אינה תקינה');

    const rabbiEmail = await findRabbiEmailByLesson(body.lessonDocumentId);

    try {
      await createTransporter().sendMail({
        from: `"אתר הישיבה" <${process.env.GMAIL_USER}>`,
        ...buildRecipients(rabbiEmail),
        replyTo: email,
        subject: `תגובה על שיעור | ${oneLine(lessonTitle)}`,
        html: `
          <div dir="rtl">
            <h2>תגובה חדשה על שיעור</h2>
            <p><strong>שיעור:</strong> ${escapeHtml(lessonTitle)}</p>
            <p><strong>שם:</strong> ${escapeHtml(name)}</p>
            <p><strong>דוא"ל:</strong> ${escapeHtml(email)}</p>
            <p><strong>תגובה:</strong></p>
            <p>${toHtml(message)}</p>
          </div>
        `,
      });
    } catch (err: any) {
      strapi.log.error(`contact.lessonFeedback: שליחת מייל נכשלה — ${err?.message}`);
      return ctx.internalServerError('שליחת התגובה נכשלה');
    }
    return ctx.send({ ok: true });
  },

  async send(ctx) {
    const body = ctx.request.body || {};

    // honeypot: שדה נסתר שבני אדם לא ממלאים. בוט שמילא אותו מקבל "הצלחה" בלי שנשלח מייל
    if (body.website) return ctx.send({ ok: true });

    const fullName = readText(body.fullName, 2, 100);
    const email = readText(body.email, 5, 254);
    const questionType = readText(body.questionType, 1, 100);
    const subject = readText(body.subject, 1, 150);
    const message = readText(body.message, 10, 5000);
    // שם הרב נבדק בדיוק כפי שהוא ברשימה (בלי trim) — כמו החיפוש שהיה עד היום
    const rabbiName = typeof body.rabbiName === 'string' && body.rabbiName.length > 0 && body.rabbiName.length <= 100
      ? body.rabbiName
      : null;

    if (!fullName || !email || !rabbiName || !questionType || !subject || !message) {
      return ctx.badRequest('חסרים שדות חובה או שהם לא תקינים');
    }
    if (!EMAIL_RE.test(email)) return ctx.badRequest('כתובת דוא"ל אינה תקינה');

    // חייב להיות רב קיים ומפורסם — אחרת אי אפשר לנתב את הפנייה
    const rabbi: any = await findRabbiByName(rabbiName);
    if (!rabbi) return ctx.badRequest('הרב שנבחר אינו קיים');

    try {
      await createTransporter().sendMail({
        from: `"אתר הישיבה" <${process.env.GMAIL_USER}>`,
        ...buildRecipients(rabbi.email),
        replyTo: email,
        subject: `פנייה חדשה | ${oneLine(rabbiName)} | ${oneLine(questionType)} | ${oneLine(subject)}`,
        html: `
          <div dir="rtl">
            <h2>פנייה חדשה מהאתר</h2>
            <p><strong>שם:</strong> ${escapeHtml(fullName)}</p>
            <p><strong>דוא"ל:</strong> ${escapeHtml(email)}</p>
            <p><strong>פנייה לרב:</strong> ${escapeHtml(rabbiName)}</p>
            <p><strong>סוג שאלה:</strong> ${escapeHtml(questionType)}</p>
            <p><strong>נושא:</strong> ${escapeHtml(subject)}</p>
            <p><strong>תוכן:</strong></p>
            <p>${toHtml(message)}</p>
          </div>
        `,
      });
    } catch (err: any) {
      strapi.log.error(`contact.send: שליחת מייל נכשלה — ${err?.message}`);
      return ctx.internalServerError('שליחת הפנייה נכשלה');
    }

    return ctx.send({ ok: true });
  },
};

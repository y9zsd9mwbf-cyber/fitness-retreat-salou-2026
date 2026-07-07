const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'contacts.json');
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'nataliiafitt@gmail.com';

let transporter = null;
try {
  const nodemailer = require('nodemailer');
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({ sendmail: true, newline: 'unix', path: '/usr/sbin/sendmail' });
  }
} catch (error) {
  console.warn('nodemailer не установлен или не настроен:', error.message);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedPortalCodes = ['a7K9mP2x'];

app.get('/portal.html', (req, res) => {
  const code = req.query.code;

  if (!allowedPortalCodes.includes(code)) {
    return res.sendFile(path.join(__dirname, 'public', 'portal-locked.html'));
  }

  return res.sendFile(path.join(__dirname, 'public', 'portal.html'));
});

app.get('/documents/common/:filename', (req, res) => {
  const code = req.query.code;

  if (!allowedPortalCodes.includes(code)) {
    return res.status(403).send('Доступ запрещён');
  }

  return res.sendFile(path.join(__dirname, 'public', 'documents', 'common', req.params.filename));
});
app.use(express.static(path.join(__dirname, 'public')));

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, instagram, country, message } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }
  const entry = {
    id: Date.now(),
    name,
    email,
    phone: phone || '',
    instagram: instagram || '',
    country: country || '',
    message: message || '',
    time: new Date().toISOString(),
  };

  const makeEmailBody = () => {
    return `Новое сообщение с лендинга ретрита:\n\nИмя: ${entry.name}\nEmail: ${entry.email}\nТелефон: ${entry.phone}\nInstagram: ${entry.instagram}\nСтрана: ${entry.country}\nСообщение: ${entry.message}`;
  };

  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const arr = JSON.parse(data || '[]');
    arr.push(entry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
  } catch (err) {
    console.error('Не удалось сохранить заявку:', err);
    return res.status(500).json({ error: 'Could not save contact' });
  }

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER || 'noreply@example.com',
        to: CONTACT_EMAIL,
        cc: entry.email,
        replyTo: entry.email,
        subject: 'Новая заявка на ретрит',
        text: makeEmailBody(),
      });
    } catch (emailError) {
      console.error('Ошибка отправки письма:', emailError);
    }
  }

  return res.json({ ok: true });
});

app.get('/api/contacts', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data || '[]'));
  } catch (err) {
    res.json([]);
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

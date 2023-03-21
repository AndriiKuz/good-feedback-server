const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
app.use(cors());
dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/send', upload.single('file'), (req, res) => {
  const { name, tel, address, ad, text, raiting } = req.body;
  const file = req.file;

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    subject: `Новий відгук від ${name}`,
    html: `
      <style>
        img {
          max-width:100%;
          height:auto;
        }
      </style>

      <h1 style='color:#f15b22; text-align:center; font-size:36px;'>Good sushi & pizza feedback</h1>
      <p style='font-size:16px;'>
        Привіт, мене звати <strong>${name}</strong>, я дізнався про вас від <strong>${ad}</strong>. 
        Я здійснював замовлення за номером телефону 
        <strong>${tel}</strong> на адресу <strong>${address}</strong>. 
        Хочу поділитися своїми враженнями про Вас: <strong>${text}</strong>.
        Я задоволена(й) на <strong>${raiting === null ? raiting : 0}/5</strong>.
        ${file ? 'Також прикріплюю фото нижче.' : ''}
      </p>

      <p style='text-align:right; font-size:12px;'>З повагою, ваш клієнт <strong>${name}</strong>.</p>

    `,
    attachments: file
      ? [
          {
            filename: file.originalname,
            content: file.buffer,
          },
        ]
      : null,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Something went wrong.');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Email sent successfully!');
    }
  });
});

const port = process.env.PORT || 3001;

app.listen(port, () => console.log(`Server started on port ${port}`));

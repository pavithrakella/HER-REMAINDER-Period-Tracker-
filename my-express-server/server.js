// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB...');
}).catch((error) => {
  console.error('Could not connect to MongoDB...', error);
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
});

const User = mongoose.model('User', userSchema);

const welcomeHtml = `
  <h1>Welcome to YourPeriod App</h1>
  <p>Do you want to check out your period date?</p>
`;

async function sendWelcomeEmail(email) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `YourPeriod App <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to YourPeriod App',
      html: welcomeHtml,
    });
    console.log("Message sent: " + info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function sendPeriodNotification(email, periodStartDate, currentDate, cycleLength) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceStart = Math.floor((currentDate - periodStartDate) / msPerDay);
  const currentCycleDay = (daysSinceStart % cycleLength) + 1; // Modulo to get the current day in the cycle

  console.log(`Period Start Date: ${periodStartDate.toISOString()}`);
  console.log(`Current Date: ${currentDate.toISOString()}`);
  console.log(`Calculated Cycle Day: ${currentCycleDay}`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `YourPeriod App <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Period Reminder',
      html: `<h1>Period Reminder</h1><p>Today is day ${currentCycleDay} of your period cycle.</p><br><p>If your cycle dates change, please update them.</p>`,
    });
    console.log("Notification sent: " + info.messageId);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

app.post('/user-login', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const newUser = new User({ name, phone, email });
    await newUser.save();
    sendWelcomeEmail(email);
    res.status(201).send('Login successful');
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(400).send(`Error during login: ${error.message}`);
  }
});

app.post('/send-notifications', async (req, res) => {
  const periodDates = req.body.periodDates.map(date => new Date(date));
  const periodStartDate = new Date(periodDates[0]); // Assuming the first date is the start date
  const cycleLength = req.body.cycleLength; // Get cycle length from request body
  res.send({ message: 'Period dates received' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const date of periodDates) {
    schedule.scheduleJob(date, async function() {
      const users = await User.find();
      const currentDate = new Date(date);
      users.forEach(user => {
        sendPeriodNotification(user.email, periodStartDate, currentDate, cycleLength);
      });
    });

    // Check if today's date is included and send the notification immediately
    if (date.toISOString() === today.toISOString()) {
      const users = await User.find();
      users.forEach(user => {
        sendPeriodNotification(user.email, periodStartDate, today, cycleLength);
      });
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const express = require("express");
const mongoose = require("mongoose");
const dotEnv = require("dotenv");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const User = require('./models/User');

const app = express();
dotEnv.config();
const PORT = process.env.PORT || 6500;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true, // Add this if needed
})
.then(() => {
  console.log("MongoDB connected successfully");
})
.catch((error) => {
  console.error("MongoDB connection error:", error);
});

// Session store setup
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Add other MongoDB connection options as needed
  }
});

app.use(session({
  secret: "This is a secret",
  resave: false,
  saveUninitialized: false,
  store: store
}));

// Example route for handling user login
app.post('/user-login', async (req, res) => {
  const { name, phone, email } = req.body;

  const newUser = new User({ name, phone, email });
  try {
    await newUser.save();
    req.session.isAuthenticated = true;
    res.send('Form submitted successfully');
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).send('An error occurred');
  }
});

app.listen(PORT, () => {
  console.log(`Server started and running at ${PORT}`);
});

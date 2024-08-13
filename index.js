// index.js
const app = require('./app'); // Ensure the correct path to app.js
const mongoose = require('mongoose');

// Database connection
const dbURI = 'mongodb://127.0.0.1:27017/yourDatabaseName'; // Replace with your database URI
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB successfully!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

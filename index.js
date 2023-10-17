// app.js

const express = require('express');
const app = express();
const port = 3000; // or any port you prefer

// Define a route
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

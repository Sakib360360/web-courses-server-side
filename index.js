// app.js
require("dotenv").config();
const express = require('express');
const cors = require("cors");
const app = express();
const port = 3000; // or any port you prefer

// middlewares
app.use(express.json());
app.use(cors());

// add mongoDB connection
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vahgs6d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Database collations
    const CoursesCollection = client.db("WebCourseDB").collection("Courses");
    const InstructorsCollection = client.db("WebCourseDB").collection("Instructors");

    // get all the courses
    app.get("/courses", async (req, res)=>{
      const query = {}
      const result = await CoursesCollection.find(query).toArray();
      res.send(result);
    });

    // get all the instructors
    app.get("/instructors", async (req, res)=>{
      const query={};
      const result = await InstructorsCollection.find(query).toArray();
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// Define a route
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

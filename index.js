// app.js
require("dotenv").config();
const express = require('express');
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const port = 3000; // or any port you prefer

// middlewares
app.use(express.json());
app.use(cors());

// verify JWT token
const verifyJWT = (req, res, next)=>{
  const authorization = req.headers.authorization;
  if(!authorization){
    res.status(401).send({error: true, message: "unauthorized! access denied."});
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
    if(err){
      res.status(401).send({error: true, message: "unauthorized! access denied."});
    }
    req.decoded = decoded;
    next();
  })
}

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
    const UsersCollection = client.db("WebCourseDB").collection("Users");

    // verify whether the user is a admin or not
    const verifyAdmin = async (req, res, next)=>{
      const email = req.decoded.email;
      const query = {email: email};
      const user = await UsersCollection.findOne(query);

      if(user?.role !== "admin"){
        return res.status(403).send({error: true, message: "Forbidden! access denied"});
      }
      next();
    }

    // verify whether the user is a instructor or not
    const verifyInstructor = async (req, res, next)=>{
      const email = req.decoded.email;
      const query = {email: email};
      const user = await UsersCollection.findOne(query);

      if(user?.role !== "instructor"){
        return res.status(403).send({error: true, message: "Forbidden! access denied"});
      }
      next();
    }

    const verifyStudent = async (req, res, next)=>{
      const email = req.decoded.email;
      const query = {email: email};
      const user = await UsersCollection.findOne(query);

      if(user?.role !== "student"){
        return res.status(403).send({error: true, message: "Forbidden! access denied"});
      }
      next();
    }

    // jwt post API
    app.post("/jwt", (req, res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1h"});
      res.send(token);
    });

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

// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const { MongoClient, ServerApiVersion } = require('mongodb');

// const app = express();
// const port = process.env.PORT||3000;

// app.use(cors());
// app.use(express.json());
 



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8holrnh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();


//     const servicesCollection = client.db('serviceDB').collection('services')

//     app.get('/services', async(req, res) =>{
//       const result = await servicesCollection.find().toArray();
//       res.send(result);
//     })

//     app.post('/services', async(req, res)=>{
//       const newService = req.body;
//       console.log(newService)
//       const result = await servicesCollection.insertOne(newService)
//       res.send(result);

//     })



//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);



// app.get('/', (req, res)=>{
//     res.send('server is running')
// });

// app.listen(port, ()=>{
//     console.log(`server is running on port ${port}`)
// })














const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // allow requests from your frontend
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8holrnh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Main
async function run() {
  try {
    await client.connect();

    const servicesCollection = client.db('serviceDB').collection('services');

    // GET all services
    app.get('/services', async (req, res) => {
      const result = await servicesCollection.find().toArray();
      res.send(result);
    });

    // GET services by email
    app.get('/my-services', async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }
      const result = await servicesCollection.find({ email }).toArray();
      res.send(result);
    });

    // ADD service
    app.post('/services', async (req, res) => {
      const newService = req.body;
      console.log('New service added', newService);
      const result = await servicesCollection.insertOne(newService);
      res.send(result);
    });

    // UPDATE service by ID
    app.put('/my-services/:id', async (req, res) => {
      const id = req.params.id;
      const updated = req.body;
      const filter = { _id: new ObjectId(id) };
      const result = await servicesCollection.updateOne(filter, { $set: updated });
      res.send(result);
    });

    // DELETE service by ID
    app.delete('/my-services/:id', async (req, res) => {
      const id = req.params.id;
      const result = await servicesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running.");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
















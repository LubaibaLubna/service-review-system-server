const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8holrnh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const servicesCollection = client.db('serviceDB').collection('services');
    const reviewsCollection = client.db('serviceDB').collection('reviews');
    const usersCollection = client.db('serviceDB').collection('users'); 
    
app.get('/services', async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i'); 
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const services = await servicesCollection.find(query).toArray(); // optionally add .limit(50)
    res.send(services);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server Error' });
  }
});
    //  Route to get all Categories
    app.get('/categories', async (req, res) => {
      try {
        const categories = await servicesCollection.distinct('category');
        res.send(categories);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Server Error' });
      }
    });

    //  Route to get service, reviews, and users count
    app.get('/counts', async (req, res) => {
      try {
        const servicesCount = await servicesCollection.countDocuments();
        const reviewsCount = await reviewsCollection.countDocuments();

        let usersCount = 0;
        if (usersCollection) {
          usersCount = await usersCollection.countDocuments();
        }
        
        res.send({ servicesCount, reviewsCount, usersCount });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Server Error' });
      }
    });

    //  Route to get services by email
    app.get('/my-services', async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(400).send({ message: "Email is required" });

      try {
        const result = await servicesCollection.find({ email }).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Server Error" });
        console.error(err);
      }
    });

    
         // Get 6 featured services for homepage
app.get('/services/featured', async (req, res) => {
  try {
    const featuredServices = await servicesCollection.find().limit(6).toArray();
    res.send(featuredServices);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Server Error' });
  }
});


    //  Get service by id
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const service = await servicesCollection.findOne({ _id: new ObjectId(id) });
        if (service) {
          res.send(service);
        } else {
          res.status(404).send({ message: "Service not found" });
        }
      } catch (err) {
        res.status(500).send({ message: "Server Error" });
        console.error(err);
      }
    });

    //  Post service
    app.post('/services', async (req, res) => {
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService);
      res.send(result);
    });

    //  Update service
    app.put('/my-services/:id', async (req, res) => {
      const id = req.params.id;
      const updated = req.body;
      const filter = { _id: new ObjectId(id) };
      const result = await servicesCollection.updateOne(filter, { $set: updated });
      res.send(result);
    });

    //  Delete service
    app.delete('/my-services/:id', async (req, res) => {
      const id = req.params.id;
      const result = await servicesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // ===== REVIEWS =====

    //  Get reviews by serviceId
    app.get('/reviews', async (req, res) => {
      const serviceId = req.query.serviceId;
      if (!serviceId) return res.status(400).send({ message: "serviceId is required" });

      try {
        const reviews = await reviewsCollection.find({ serviceId }).toArray();
        res.send(reviews);
      } catch (err) {
        res.status(500).send({ message: "Server Error" });
        console.error(err);
      }
    });

    // Get reviews by user email
    app.get('/reviews/user/:email', async (req, res) => {
      const email = req.params.email;
      try {
        const reviews = await reviewsCollection.find({ email }).toArray();
        res.send(reviews);
      } catch (err) {
        res.status(500).send({ message: "Server Error" });
        console.error(err);
      }
    });

    //  Post a new review
    app.post('/reviews', async (req, res) => {
      const newReview = req.body;
      const result = await reviewsCollection.insertOne(newReview);
      res.send(result);
    });

    //  Update a review
    app.put('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const { text, rating } = req.body;
      try {
        const filter = { _id: new ObjectId(id) };
        const update = { $set: { text, rating } };
        const result = await reviewsCollection.updateOne(filter, update);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Server Error" });
        console.error(err);
      }
    });

    //  Delete a review
    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const result = await reviewsCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Server Error" });
        console.error(err);
      }
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
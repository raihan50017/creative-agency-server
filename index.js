const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const fileUpload = require('express-fileupload');
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7txzq.mongodb.net/<dbname>?retryWrites=true&w=majority`;

const PORT = process.env.PORT || 5000;

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send('I am working successfully');
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const adminCollection = client.db("creativeAgency").collection("creativeAdmin");
    const serviceCollection = client.db("creativeAgency").collection("services");
    const orderCollection = client.db("creativeAgency").collection("orders");
    const reviewCollection = client.db("creativeAgency").collection("reviews");


    app.post('/registerAsAdmin', (req, res) => {
        const name = req.body.name;
        const email = req.body.email;
        const admin = {
            name,
            email
        }
        adminCollection.insertOne(admin)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        serviceCollection.insertOne({ title, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/findServiceById', (req, res) => {
        const id = req.body.serviceId;
        serviceCollection.find({ _id: ObjectID(id) })
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/addReview', (req, res) => {
        const review = req.body;
        reviewCollection.insertOne(review)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/addOrder', (req, res) => {

        const orderInfo = req.body;

        orderCollection.insertOne(orderInfo)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })


    app.post('/findOrderByEmail', (req, res) => {
        const email = req.body.email;
        orderCollection.find({ email: email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.get('/allOrder', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/checkAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, documents) => {
                res.send(documents.length > 0);
            })
    });

    console.log("DATABASE CONNECTED SUCCESSFULLY");

});


app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
})


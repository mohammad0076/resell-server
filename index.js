const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.send('OOBBSS IS RUNNING')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9xqik64.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}
async function run() {
    try {
        const bookscollection = client.db('oobbss').collection('books');
        const sbookscollection = client.db('oobbss4').collection('books');
        const bookngcollection = client.db('oobbss').collection('booking');
        const usercollection = client.db('oobbss').collection('userss');
        const addcollection = client.db('oobbss').collection('addaproduct');
        const addcollections = client.db('oobbss').collection('addaproducts');





        app.get('/category', async (req, res) => {
            const query = {};
            const category = await bookscollection.find(query).toArray();
            res.send(category)
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;


            const q = {
                category: id
            };
            const c = await bookscollection.find(q).toArray();

            res.send(c)
        })
        app.get('/categorys', async (req, res) => {
            const query = {};
            const category = await sbookscollection.find(query).toArray();
            res.send(category)
        })
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            const result = await bookngcollection.insertOne(bookings)
            res.send(result)


        })
        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            console.log(`tokem`, req.headers.authorization)
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }


            const query = { email: email };
            const book = await bookngcollection.find(query).toArray();
            res.send(book)



        })


        app.post('/users', async (req, res) => {
            const uer = req.body;
            const result = await usercollection.insertOne(uer)
            res.send(result)


        })
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usercollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
            // res.send({ isAdmin: user?.option === 'Buyer' });

        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usercollection.findOne(query);

            res.send({ isoption: user?.option === 'Seller' });

        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usercollection.find(query).toArray()
            res.send(users)
        })
        // app.get('/category/:id', async (req, res) => {
        //     const id = req.params.id;


        //     const q = {
        //         category: id
        //     };
        //     const c = await bookscollection.find(q).toArray();

        //     res.send(c)
        // })
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;

            const q = {
                option: id
            };
            const c = await usercollection.find(q).toArray()
            res.send(c)


        })
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usercollection.findOne(query);

            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1hr' })
                return res.send({ acccessToken: token })
            }
            res.status(403).send({ acccessToken: '' })
        })
        app.post('/addedbook', async (req, res) => {
            const add = req.body;
            const result = await addcollection.insertOne(add);
            res.send(result);
        });
        app.get('/addedbook', async (req, res) => {
            const query = {};
            const result = await addcollection.find(query).toArray();
            res.send(result);
        })
        app.post('/advertize', async (req, res) => {
            const add = req.body;
            const result = await addcollections.insertOne(add);
            res.send(result);
        });


        app.get('/addedbook/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }

            const result = await addcollection.deleteOne(filter)
            res.send(result);
        })


        app.put('/users/admin/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            // const query = { email: decodedEmail };
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }

            }
            const result = await usercollection.updateOne(filter, updatedDoc, options)
            res.send(result);



        })

    }
    finally {

    }
}
run().catch(console.log)

app.listen(port, () => {
    console.log(`oobbss is running on ${port}`)
}
)




import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { signup } from './controllers/auth.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
dotenv.config();

const app = express();
app.use(express.json());


// session saving and cookie management
app.use(cors({
    origin: ["http://localhost:3000", "https://test-4e8c8.web.app"],
    methods: ["GET", "POST"],
    credentials: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));

//mongodb connection
mongoose.set("strictQuery", true);
const uri = process.env.ATLAS_URL;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () =>{
    console.log("DATABASE CONNECTED SUCCESFULLY");
});

//authentication Part
app.post('/auth/signup', signup);
app.use('/auth', authRoutes);


app.get('/checkLogin', (req,res) => {
    if (req.session.user) {
        res.send({loggedIn: true, username: req.session.user});
    }
    else{
        res.send({loggedIn: false})
    }
});

app.get('/getLoggedinUserinfo', (req,res) => {
    res.send(req.session.user);
})

app.post('/getUsers', (req,res) => {
    const search = req.body.keyword || "";
    if (search === "") {
        res.send([]);
    }
    else{
        Users.find({username: {$regex: search, $options: "i"}}, (err,responce) => {
            if (err) {
                res.send(err);
            }
            else{
                res.send(responce);
            }
        })
    }
})

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.send({loggedIn: false})
})

const port = process.env.PORT || 3001;

app.listen(port, (req,res) => {
    console.log("SERVER IS RUNNING AT PORT 3001");
});


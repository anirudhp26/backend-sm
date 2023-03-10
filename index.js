const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
let Users = require('./models/users.model');

const salt = 1;

require('dotenv').config({ path: './.env' });

const app = express();
app.use(express.json());


// session saving and cookie management
app.use(cors({
    origin: ["http://localhost:3000", "https://test-4e8c8.web.app"],
    methods: ["GET", "POST"],
    credentials: true,
}));

app.enable('trust proxy');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    key: "user",
    secret: "anirudh2628*",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000,
        secure: true,
        httpOnly: true,
        sameSite: 'none',
    },
}));


//mongodb connection
mongoose.set("strictQuery", true);
const uri = process.env.ATLAS_URL;
mongoose.connect(uri, { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once('open', () =>{
    console.log("DATABASE CONNECTED SUCCESFULLY");
});

//authentication Part
app.post('/signup', (req,res) => {
    const username = req.body.username;
    const email = req.body.email;
    const regpassword = req.body.password;
    bcrypt.hash(regpassword,salt,(err,password) => {
        const user = new Users({username, email, password});
        req.session.user = username;
        user.save().then(res.send("USER SAVED"))
    });
});

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

app.post('/login', (req,res) => {
    const regusername = req.body.username;
    const regemail = req.body.email;
    const regpassword = req.body.password;
    Users.find({username: regusername} || {email: regemail}, (err, responce) => {
        if (err != undefined) {
            res.send({loginStatus: false, message: 'Some Error encountered, Please try again after sometime'})
        }
        if(responce.length == 0){
            res.send({loginStatus: false, message: 'No such User exists'})
        } else{
            bcrypt.compare(regpassword, responce[0].password, (error, valid) => {
                if (error) {
                    res.send({loginStatus: false, message: 'Some Error encountered, Please try again after sometime'})
                }
                if (valid) {
                    req.session.user = regusername;
                    res.send({loginStatus: true})
                } else {
                    res.send({loginStatus: false, message: 'Incorrect Password'})
                }
            });
        };
    });
});

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.send({loggedIn: false})
})

const port = process.env.PORT || 3001;

app.listen(port, (req,res) => {
    console.log("SERVER IS RUNNING AT PORT 3001");
});

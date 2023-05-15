require('dotenv').config()
const express = require('express');
const mongoose = require("mongoose");
const user = require('./user')
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');

const app = express();

app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false
}));

app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"))





//---------------------> register handle <--------------------------------
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log(email, password, username);
    if (await user.newUser(username, email, password)) {
        res.send(true);
    } else {
        res.send(false);
    }
});



//---------------------> create token <--------------------------------
const createtoken = async (email, name) => {
    const token = await jwt.sign({ email, name }, "thisismysecretedevendra");
    console.log(token);
    return token;
}

//---------------------->>verify user<<-----------------------------


//---------------------> Login handle <--------------------------------
app.post('/login', async (req, res) => {
    // res.cookie("key", "value", { maxAge: 1000 * 60 * 10, httpOnly: false });
    const { email, password } = await req.body;
    console.log(email, password);
    const Verify = await user.verifyUser(email, password);
    console.log(Verify);
    if (Verify) {
        const token = await createtoken(email, Verify).then((result) => {
            res.cookie("jwttoken", result);
            console.log(result);
        });

    }
    await res.send(Verify)
});




const auth = async (req, res, next) => {
    const token = req.cookies.jwttoken;
    console.log(token);

    try {
        jwt.verify(token, "thisismysecretedevendra");
        next();
    } catch (error) {
        res.redirect('/login');
    }
    console.log(token);
    next();
}




//----------------------file uploader----------------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, '../my-app/public/uploads');
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage });
app.post('/uploadProfileDetails', upload.single('ProfileImage'), async function (req, res) {
    // const { title, content, author } = req.body;
    let Path = '';
    try {
        console.log(req.file);
        Path = req.file.path.substring(16);
        Path = Path.replaceAll('\\', '/');
    } catch (err) {

    }
    const { type, email } = req.body;
    if (type === "CoverImage") {
        user.SET_COVER_IMAGE(email, Path);
    } else {
        user.SET_MAIN_IMAGE(email, Path);
    }
    // await user.PostUpload(title, content, author, Path, 'chintubhuaya75@gmail.com ');
    // res.redirect('/');


});
app.post('/uploadPost', upload.single('ProfileImage'), async function (req, res) {
    const { title, content, author, email } = req.body;
    let Path = '';
    try {
        console.log(req.file);
        Path = req.file.path.substring(16);
        Path = Path.replaceAll('\\', '/');
    } catch (err) {

    }

    console.log(req.body);
    console.log(title, content, author, email);
    await user.PostUpload(title, content, author, Path, email);
    res.redirect('/');


});


// app.post('/uploadphoto', upload.single('filed'), async function (req, res) {
//     console.log(req.file);
//     res.redirect('/');


// });
app.post('/getProfileDetails', async (req, res) => {
    const { email } = req.body;
    const data = await user.GET_PROFILE_DETAILS(email);
    console.log(data);
    res.send(data)
})

app.get('/createpost', auth, (req, res) => {
    res.send("this is secrete");
});
//--------------------------get All post---------------------------
app.post('/getposts', async (req, res) => {
    console.log(req.body);
    const data = await user.GetPost();;
    res.send(data)
});
//----------------------------get one user post---------------------
app.post('/getmyposts', async (req, res) => {
    const { email } = req.body;
    console.log(email);
    const data = await user.MY_POST(email);
    console.log(data);
    res.send(data);
})
app.post('/deletemyposts', async (req, res) => {
    const { id, email } = req.body;
    console.log(id);
    const data = await user.DELETE_MY_POST(id, email);
    console.log(data);
    res.send(data)
})
app.get('/secrete', auth, (req, res) => {
    res.send("this is secrete");
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/login.html");
})

app.get('/', (req, res) => {
    res.send('hello word');
})
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log("running in http://localhost:3001/");
})
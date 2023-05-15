require('dotenv').config()
const { json } = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
// mongoose.connect("mongodb://0.0.0.0:27017/My_comminiuty", { useNewUrlParser: true }).then(() => {
//     console.log("connected");
// })
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true }).then(() => {
    console.log("database connected ");
})
mongoose.set('strictQuery', false);


const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    path: {
        type: String,
    },
    createdAt: {
        type: String,
        default: Date.now
    },
    updateAt: {
        type: String,
        default: Date.now
    },
    email: {
        type: String
    }
});
const Post = mongoose.model("Post", postSchema);
//--------------post Schema









//----------------------user Schema ----------------------------------

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    coverImage: String,
    mainImage: String,
    post: [postSchema]
});
const User = mongoose.model("User", userSchema);


const check_Register_Or_Not = async (email) => {
    return User.findOne({ email }).then((res) => {
        return res === null ? true : false;
    })
}




async function newUser(name, email, password) {
    if (await check_Register_Or_Not(email)) {
        const user = await new User({
            name: name,
            email: email,
            password: password
        });
        user.save().then((res) => {
            console.log(res);
        });
        return true;
    } else {
        return false;
    }
}


//---------------verify User----------------------------
const verifyUser = async (email, password) => {
    console.log(email, password);
    let rtrn = await User.findOne({ email }).then(res => {
        if (res === null) {
            return false;
        }
        else if (res.password !== password) {
            console.log(res.password, password);
            return false;
        }
        else {
            return res.name;
        }

    });
    return rtrn;

}



//------------------------ PostUpload--------------------

function PostUpload(title, content, author, path, email) {
    // console.log(User);
    console.log(email);
    const poSts = new Post({
        title: title,
        content: content,
        author: author,
        path: path,
        email: email
    });
    User.findOne({ email }).then(updatePost => {
        // console.log(updatePost.email + 'this is email');
        console.log(updatePost.post.push(poSts));

        // console.log(updatePost.name + 'this is email');
        updatePost.save().then((res) => {
            console.log(res);
        });;
        // console.log(updatePost);
    });
    // User.find({}).then(updatePost => {
    //     // console.log(updatePost);
    //     // console.log(updatePost.post.push(post));
    //     // updatePost.save();
    //     console.log(updatePost);
    // });
    // user.save();
}

//-----------------------Get All posts-----------------

const GetPost = async () => {
    const data = await User.find({}).then((res) => {
        return res;
    }).then((err) => {
        return err;
    })
    return data;
}

const GET_PROFILE_DETAILS = async (email) => {
    const data = await User.find({ email }).then(res => {
        console.log(res);
        return { coverImage: res[0].coverImage, mainImage: res[0].mainImage };
    }).then((err) => {
        return err;
    })
    return data;
}
const MY_POST = async (email) => {
    const data = await User.find({ email }).then((res) => {
        console.log(res);
        return res[0].post;
    }).then((err) => {
        return err;
    })
    return data;
}
const DELETE_MY_POST = async (objectId, email) => {
    const data = await User.updateOne(
        { email: email },
        { $pull: { post: { _id: objectId } } }).then((res) => {
            return res;
        }).then((err) => {
            return err;
        })
    return data;
}
const SET_COVER_IMAGE = (email, Path) => {
    User.updateOne(
        { email },
        { $set: { coverImage: Path } }
    )
        .then(result => {
            console.log(`${result.modifiedCount} document(s) updated`);
        })
        .catch(err => {
            console.log(err);
        })
};
const SET_MAIN_IMAGE = (email, Path) => {
    User.updateOne(
        { email },
        { $set: { mainImage: Path } }
    )
        .then(result => {
            console.log(`${result.modifiedCount} document(s) updated`);
        })
        .catch(err => {
            console.log(err);
        })
};
module.exports = {
    newUser, verifyUser, PostUpload, GetPost, MY_POST, DELETE_MY_POST, SET_MAIN_IMAGE, SET_COVER_IMAGE, GET_PROFILE_DETAILS
}
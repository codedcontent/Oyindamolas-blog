// The required modules
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialising the app
const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// Connect to the database
mongoose.connect('mongodb+srv://admin-oge:PceD6930ZjAGo6eG@cluster0.7jm4t.mongodb.net/trustblogDB?retryWrites=true&w=majority', {useUnifiedTopology: true, useNewUrlParser: true});
// Creating the blogs schema
const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    views: Number
});
// Creating the blogs model
const Blog = mongoose.model('Blog', blogSchema);

// Variables
let loggedIn = false;


// The routes
app.get('/', (req, res) => {
    if(loggedIn){
        res.redirect('/blogs');
    }else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/logout', (req, res) => {
    loggedIn = false;
    res.redirect('login');
});

app.get('/blogs', (req, res) => {
    if(loggedIn){

        Blog.find({}, (err, blogs) => {
            if(err){
                console.log(err);
            }else {
                console.log(blogs);
                res.render('blogs', {
                    blogs: blogs
                });
            }
        });
    }else {
        res.redirect('/login');
    }
});

app.get('/compose', (req, res) => {
    if(loggedIn){
        res.render('compose');
    }else {
        res.redirect('/login');
    }
});

// Post routes
app.post('/login', (req, res) => {
    if(process.env.BLOG_USERNAME === req.body.username && process.env.BLOG_PASSWORD === req.body.password){
        loggedIn = true;
        res.redirect('/blogs');
        console.log(loggedIn);
    }else {
        res.redirect('/login');
    }
});

app.post('/compose', (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const views = 1;

    const newPost = new Blog({
        title: title,
        content: content,
        views: views
    });
    newPost.save();
    res.redirect('/blogs');
});

app.post('/delete', (req, res) => {
    const blogId = req.body.delete;
    console.log(blogId);

    Blog.findByIdAndRemove(blogId, (err) => {
        if(err){
            console.log(err);
        }else {
            console.log('removed the blog successfully');
            res.redirect('/blogs');
        }
    });
});

app.get('/share/:postId', (req, res) => {
    const postId = req.params.postId;
    console.log(postId);
    Blog.findById(postId, (err, post) => {
        if(err){
            console.log(err);
        }else {
            post.views += 1;
            post.save();
            res.render('post', {
                post: post
            });
            console.log(post.views);
        }
    });
})





app.listen(process.env.PORT || 3000, console.log('server is live'));
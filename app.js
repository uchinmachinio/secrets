require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set("strictQuery", true);

mongoose.connect("mongodb://127.0.0.1:27017/userDB", function(){
  console.log("connected to DB");
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);


app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  User.find({email: req.body.username}, function(err, user){
    if(err){
      console.log(err);
    }else{
      if(user.length === 0){
        newUser.save(function(err){
          if(err){
            console.log(err);
          }else{
            res.render("secrets");
          }
        });
      }else{
        res.send("email already registered");
      }
    }
  });
});

app.post("/login", function(req, res){
  const userName = req.body.username;
  const password = req.body.password;
  User.findOne({email: userName}, function(err, user){
    if(err){
      console.log(err);
    }else if (user) {
      if(user.password === password){
        res.render("secrets")
      }else{
        res.send("incorrect password or email");
      }
    }else{
      res.send("incorrect password or email");
    }
  });
});

app.listen(3000, function(){
  console.log("connected");
});

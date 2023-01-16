  //jshint esversion:6let

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const date = require(__dirname + "/date.js");  
const dbName = 'todolistDB';
const url = `mongodb://localhost:27017/${dbName}`;

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.use(express.static('public'));

//connecting to database
mongoose.connect(url);

const itemsSchema = new mongoose.Schema({
    name : String
}) 

const Item = new mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!!"
});
const item2 = new Item({
  name: "hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

Item.insertMany(defaultItems, (err)=>{
  (err)
  ? console.log(err)
  : console.log("document created successfully")
});


const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", (req, res)=> {
    let day = date.getDate();
    res.render("list", {listTitle: day, newListItems: items});
});

app.post("/", (req, res)=> {

  let item = req.body.newItem;

  if(req.body.list === "Work"){
    workItems.push(item);
    res.redirect("/work");
  } else{
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", (req, res)=>{
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/About", (req, res)=>{
  res.render("About");
});

app.listen(3000, ()=>{ 
    console.log("Server is running on port 3000");
});
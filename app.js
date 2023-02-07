  //jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

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

//new Schema
const listSchema = {
  name : String,
  items : [itemsSchema]
};

//new Model
const List = mongoose.model("List", listSchema);


// const workItems = [];


//homepage view
app.get("/", (req, res)=> {
    Item.find({}, (err, item)=>{

      if(item.length === 0){
        Item.insertMany(defaultItems, err =>{
          (err)
          ? console.log(err)
          : console.log('default items added to the collections successfully');
        });
        res.redirect("/");
      } else  {
          res.render("list", {listTitle: "Today", newListItems: item});
      }
    });
});


//creating custom pages
app.get("/:customListName", (req, res)=> {
    customListName = _.capitalize(req.params.customListName);
    List.findOne({name : customListName}, (err, foundList)=>{
      if(!err){
        if(!foundList){
          // Create a new list
          const list = new List({
            name : customListName,
            items : defaultItems
          });
          
          list.save().then(()=> console.log(`${customListName} list created successfully`));
          res.redirect(`/${customListName}`); 
        }else{
          // show the existing list
          res.render("list", {listTitle : foundList.name, newListItems: foundList.items});
        }
      }
    });

});


//insert operation
app.post("/", (req, res)=> {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const new_item = new Item({
    name : itemName
  });

  if(listName === "Today"){
  new_item.save().then(()=>{
    console.log("item added to collection successfully");
  });
  res.redirect('/');
} else {
  List.findOne({name : listName}, (err, foundList) =>{
    foundList.items.push(new_item);
    foundList.save().then(()=> console.log("item added to foundList successfully"));
    res.redirect(`/${listName}`);
  })
}
});


//delete operation
app.post('/delete', (req, res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, err =>{
      err ? console.log(err) : console.log("item removed successfully");
    })
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkedItemId}}},(err, foundList)=>{
      err 
      ? console.log(err)
      : res.redirect(`/${listName}`);
    });
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
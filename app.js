//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

mongoose.connect("mongodb+srv://gayashvihangana:Default_1234@cluster0.etpak2p.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist"
});

const item2 = new Item ({
  name: "Hit + button to add a new item"
});

const item3 = new Item ({
  name: "<-- hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema)


app.get("/", function(req, res) {

// const day = date.getDate();

  Item.find({})
  .then(function(foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
      .then(function() {
        console.log("Data inserted successfully!");
      })
      .catch(function(err) {
        console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  })
  .catch(function(err) {
  console.log(err);
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then(function(foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemId)
    .then(function(){
      res.redirect("/");
    })
    .catch(function(err) {
      console.log(err);
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then(function() {
      res.redirect("/" + listName);
    })
    .catch(function(err) {
      console.log(err);
    });
  }

  
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  

  List.findOne({name: customListName})
  .then(function(foundList) {
    if (!foundList) {
      // create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    
      list.save();
      res.redirect("/" + customListName);
    } else {
      // show previous list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});

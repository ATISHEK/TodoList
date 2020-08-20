//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

/////// connect ///////
mongoose.connect("mongodb+srv://atishek007:atishek260197@cluster0.sejla.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);
///////////////default items ///////////////////////
const item1 = new Item({
  name: "Welcome "
});
const item2 = new Item({
  name: "Hit + to Add"
});
const item3 = new Item({
  name: "<-- Hit this to delete "
});
const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);
///////////////////////////////////////////////////


app.get("/", function(req, res) {

  Item.find(function(err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (!err) {
          console.log("Succesfully added default items");
        } else {
          res.send(err);
        }
        res.redirect("/")
      });
    } else
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
  })

});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    "name": customListName
  }, function(err, foundList) {
    if (!err) {
      if (foundList) {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
      else {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.render("list", {
          listTitle: customListName,
          newListItems: defaultItems
        })
      }
    } else console.log(err);
  });



});

app.post("/", function(req, res) {
  const list = req.body.list ;
  const itemName = new Item({
    name: req.body.newItem
  });
  if(list==="Today"){
    itemName.save();
    res.redirect("/");
  }else {
    List.findOne({"name" : list} , function(err , foundList){
      foundList.items.push(itemName);
      foundList.save();
      res.redirect("/" + list);
    });
  }
});

app.post("/delete", function(req, res) {
  const list = req.body.hidden ;
  if(list==="Today"){
    Item.deleteOne({
      "_id": req.body.checkbox
    }, function(err) {
      if (!err) {
        console.log("Item deleted Succesfully");
        res.redirect("/");
      } else console.log(err);
    });
  }else {
  List.findOneAndUpdate ( {"name" : list} ,
  {$pull : {"items" :{ "_id" : req.body.checkbox}}} ,
  function(err ,foundList){
    if(!err){
      res.redirect("/" + list);
    }
  });
}
});

app.get("/about", function(req, res) {
  res.render("about");
});





app.listen(3000, function() {
  console.log("Server started on port 3000");
});

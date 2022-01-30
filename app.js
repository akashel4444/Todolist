//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb://localhost:27017/todolistDB" , {useNewUrlParser : true});
// const itemsSchema = new mongoose.Schema({
//   name : String
// });
// NO NEED TO USE NEW MONGOODB SCHEMA FUNCTION FOR CREATING SCHEMA
const itemsSchema = {
  name : String
};
const Item =  mongoose.model("Item" , itemsSchema);
const item1 = new Item({
  name : "welcome to your todolist"
});
const item2 = new Item({
  name : "Hit the + button to add new items"
});
const item3 = new Item({
  name : "<-- Hit this to delete an item"
});
const defaultItems = [item1 , item2 , item3];
const listSchema = {
  name : String ,
  items : [itemsSchema]
};
const List = mongoose.model("List" ,listSchema);



app.get("/", function(req, res) {

// const day = date.getDate();
Item.find({}, function(err , foundItems){

  if(err){
    console.log(err);
  }else if(foundItems.length==0){
    Item.insertMany(defaultItems , function(err){
      if(err){
        console.log(err);
      }else {
        console.log("inserted succesfully items to DB!");
      }
    });
    res.redirect("/");
    // redirect again to route page is important beacuse it will show all the items uploaded
  }
  else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});

  // res.render("list", {listTitle: "Today", newListItems: items});

});
app.get("/:customListName" , function(req , res){
  const requestedTitle = _.capitalize(req.params.customListName);

  List.findOne({name :requestedTitle} , function(err ,foundList){
    if(!err){
      if(!foundList){
        // console.log("doesnot exist");
        //IF LIST DOESNOT EXIT THEN WE WILL CREATE NEW listTitle
        const list = new List({
          name : requestedTitle,
          items : defaultItems
          });
          list.save();
          res.redirect("/" +requestedTitle);
          //luckily we r inside requestedTitl page so thats why we didnot write /requestedTitle

      }else {
        // console.log("list exist")
        //IF LIST EXIST THEN WE WILL REDIRECT OR SHOW THAT WEBPAGE OF listTitle
          res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
      }
    }
    });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list ;
  const item = new Item({
    name : itemName
  });
  if(listName== "Today"){

    const item = new Item({
      name : itemName
    });
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name : listName} , function(err , foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName );
    });
  }


});

app.post("/delete" ,function(req , res){
  const checkedItemId = req.body.checkbox ;
  const listname = req.body.listName ;
  if(listname=="Today"){
    Item.findByIdAndRemove(checkedItemId , function(err){
      if(err){
        console.log(err);
      }else {
        console.log("succesfully deleted");
        res.redirect("/");
      }
    });
  }else {
    List.findOneAndUpdate({name :  listname} , {$pull :{items : {_id : checkedItemId }}} , function(err , foundone){
      if(!err){
        res.redirect("/"+ listname);
      }
    });
  }

});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

//jshint esversion:6

const express = require("express");
const date = require(__dirname + "/date.js"); //because it's local you have to put dirname.
let day = date.getDate(); //date is required above and send the file of the date and triggers the getDate function.
const mongoose = require("mongoose");
const app = express();
require('dotenv').config();
// const items = ['coding', 'clean litterbox', 'do the dishes']; //const still can push items in array with const.
// const workItems = [];

app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect(`${process.env.DB_URI}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
//Replace <password> with the password for the Admin-Dannique user. 
//Replace myFirstDatabase with the name of the database that connections will use by default. Ensure any option params are URL encoded.

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema); //"Item = singular name, shows up in collection as:"items" also called modelname.

const item1 = new Item({
  name: "Welcome to your personal to-do list!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit the checkbox to delete an item."
});

const item4 = new Item({
  name: "Create your own custom list by giving it a name"
})

const defaultItems = [item1, item2, item3, item4];



const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);

//start mongod,
// open other tab and open mongo,
//show dbs,
//use "todolistDB",
//show collections,
//db.items.find()

app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Data inserted");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        paramName: "Home",
        listTitle: day,
        newListItems: foundItems
      });
    }
  });
})

app.get("/:customListName", function (req, res) {

  function capitalizeFirstLetter(param) {
    return param.charAt(0).toUpperCase() + param.slice(1);
  }
  const customListName = capitalizeFirstLetter(req.params.customListName);

  List.findOne({
    name: customListName
  }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        }); //create new list if it doesn't exist yet.
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          paramName: foundList.name,
          listTitle: day + " ",
          newListItems: foundList.items,
        }) //show existing list
      }
    } else {
      console.log(err);
    }

  }); // difference between find and findOne is that find gives an array back, and findOne gives an object back.
})

app.post("/", function (req, res) {
  const itemName = req.body.listItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listName == "Home") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  };

})

app.post("/delete", function (req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName
  if (listName == "Home") {
    Item.findByIdAndRemove(checkedItemId, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted: ", result);
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  };

})

app.get("/about", function (req, res) {
  res.render("about");
})


let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port, function(){
  console.log("server started");
});

// app.listen(3000, function () {
//   console.log("Server started on port 3000.");
// })
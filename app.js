//jshint esversion:6

const express = require("express");
const date = require(__dirname + "/date.js");
let day = date.getDate(); 
const mongoose = require("mongoose");
const app = express();
require('dotenv').config();

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

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema); 

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

app.route("/")

.get(function (req, res) {
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

.post(function (req, res) {
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
        }) 
      }
    } else {
      console.log(err);
    }

  }); 
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
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("server started");
});
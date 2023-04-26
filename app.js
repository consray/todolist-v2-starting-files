//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// const date = require(__dirname + "/date.js");

const app = express();

// const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err.message));

async function main() {
  await mongoose.connect('mongodb+srv://consray:Dennis81631059@cluster0.0qhsrvi.mongodb.net/todolistDB');

  

  //creating mongoose schema
  const itemsSchema = new mongoose.Schema({
    name: String
  })

  //creating mongoose model
  const Item = mongoose.model("Item", itemsSchema);

  //creating new items
  const item1 = new Item({
    name: "Welcome to your todolist!"
  })

  const item2 = new Item({
    name: "Hit the + button to add a new item."
  })

  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  })

  //saving created item in array
  const defaultItems = [item1, item2, item3];

  const listSchema = {
    name: String,
    items: [itemsSchema]
  }

  const List = mongoose.model("List", listSchema);



  app.get("/", async (req, res) => {
    const tt = await Item.find({});    

      if (tt.length === 0){
      try{
        await Item.insertMany(defaultItems);
        console.log('Successfully saved default items to DB');``
      } catch(err) {
        console.log(err);
      }
      res.redirect("/");
      } else {
        try{
            res.render("list", {
              listTitle: "Today",
              newListItems: tt
            });
      } catch(err) {
      console.log(err.message);
      }
  }
  });
  
  app.post("/", async (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.list;
  
    const item = new Item({
      name: itemName
    });

    try{
      if (listName === "Today"){
        await item.save();
        res.redirect("/");
      } else {
        await List.findOne({name: listName})
          .then(async foundList => {
            await foundList.items.push(item);
            await foundList.save();
            res.redirect("/" + listName);
          })
      }

    } catch(err) {
      console.log(err);
    };
  });

  app.post("/delete", async (req, res) => {
    try{
      const checkedItemId = req.body.checkbox;
      const listName = req.body.listName;

      if (listName === "Today"){
        await Item.findByIdAndRemove(checkedItemId);
        res.redirect("/");
        console.log("Successfully deleted checked item.");
      }else{
        await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
        res.redirect("/" + listName);
        console.log("Successfully deleted checked item.");
        
      }
    } catch(err) {
      console.log(err);
    };
  });
  
  app.get('/:customListName', async(req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    try{
      List.findOne({name: customListName})
        .then(foundList => {
          if(!foundList) {
            const list = new List({
              name: customListName,
              items: defaultItems
            });
            list.save();
          } else {
            console.log("List found.");
            res.render("list", {
              listTitle: foundList.name,
              newListItems: foundList.items
            });
          };
        })
    } catch(err) {
      console.log(err);
    };

    
  });
  
  app.get("/about", function(req, res){
    res.render("about");
  });
  
  
  
  app.listen(3000, function() {
    console.log('Server started on port 3000');
  });
  

  // mongoose.connection.close();
};

  




const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

const mongooseUri = "mongodb://127.0.0.1:27017/wikiDB";
mongoose.connect(mongooseUri, { useNewUrlParser: true });

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please check your data entry, no name specified!"],
  },
  content: {
    type: String,
    required: [true, "Please check your data entry, no content specified!"],
  },
});

const Article = mongoose.model("Article", articleSchema);

// Requests targeting all articles
app
  .route("/articles")

  .get(function (req, res) {
    console.log("get all articles");
    Article.find({})
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        res.send(error);
      });
  })

  .post(function (req, res) {
    try {
      const article = new Article({
        title: req.body.title,
        content: req.body.content,
      });
      article.save();
      res.send(`Successfully saved a new article.`);
    } catch (error) {
      res.send(error);
    }
  })

  .delete(function (req, res) {
    try {
      Article.deleteMany({}).then((result) => {
        res.send(
          `Successfully deleted all articles. Deleted ${result.deletedCount} articles.`
        );
      });
    } catch (error) {
      res.send(error);
    }
  });

// Requests targetting a specific article
app
  .route("/articles/:articleTitle")

  .get(function (req, res) {
    console.log(req.params.articleTitle);
    try {
      Article.findOne({ title: requestedArticleTitle }).then((article) => {
        if (article) {
          res.send(article);
        } else {
          res.send("No article matching that title was found.");
        }
      });
    } catch (error) {
      res.send(error);
    }
  })

  .put(function (req, res) {
    Article.findOneAndUpdate(
      { title: req.params.articleTitle },
      { title: req.body.title, content: req.body.content },
      { new: true }
    )
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        res.send(error);
      });
  })

  .patch(function (req, res) {
    Article.findOneAndUpdate(
      { title: req.params.articleTitle },
      { $set: [req.body] }
    )
      .then(() => {
        res.send("Successfully updated article.");
      })
      .catch((error) => {
        res.send(error);
      });
  })

  .delete(function (req, res) {
    Article.deleteOne({ title: req.params.articleTitle })
      .then(() => {
        res.send("Item deleted successfully.");
      })
      .catch((error) => {
        res.send(error);
      });
  });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

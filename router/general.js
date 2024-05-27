const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");
const public_users = express.Router();

public_users.use(express.json());

public_users.post("/register", (req, res) => {
  let { username, password } = req.body;
  if (username && password) {
    if (isValid(username)) {
      users.push({ username, password });
      return res.status(200).json({
        message: "User registered successfully",
      });
    } else {
      return res.status(400).json({
        message: "Username already exists",
      });
    }
  } else {
    return res.status(400).json({
      message:
        "Username or password not provided",
    });
  }
});

public_users.get("/", async (req, res) => {
  try {
    const responseBooks = await axios.get(
      "http://localhost:5000/books"
    );
    res.status(200).json(responseBooks.data);
  } catch (e) {
    res.status(404).send("Can't get books " + e);
  }
});

public_users.get(
  "/isbn/:isbn",
  async (req, res) => {
    let isbn = req.params.isbn;
    try {
      const response = await axios.get(
        "http://localhost:5000/books"
      );
      if (response.data[isbn]) {
        return res
          .status(200)
          .json(response.data[isbn]);
      } else {
        return res
          .status(404)
          .send(
            "No book found with ISBN " + isbn
          );
      }
    } catch (error) {
      return res
        .status(500)
        .send("Internal Server Error");
    }
  }
);

public_users.get(
  "/author/:author",
  async (req, res) => {
    let author = req.params.author;
    let booksByAuthor = [];
    try {
      const response = await axios.get(
        "http://localhost:5000/books"
      );
      for (let isbn in response.data) {
        if (
          response.data[isbn].author == author
        ) {
          booksByAuthor.push(response.data[isbn]);
        }
      }
      if (booksByAuthor.length > 0) {
        return res
          .status(200)
          .json(booksByAuthor);
      } else {
        return res
          .status(404)
          .send(
            "No book found with author " + author
          );
      }
    } catch (error) {
      return res
        .status(500)
        .send("Internal Server Error");
    }
  }
);

public_users.get(
  "/title/:title",
  async (req, res) => {
    let title = req.params.title;
    let booksByTitle = [];
    try {
      const response = await axios.get(
        "http://localhost:5000/books"
      );
      for (let isbn in response.data) {
        if (response.data[isbn].title == title) {
          booksByTitle.push(response.data[isbn]);
        }
      }
      if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle);
      } else {
        return res
          .status(404)
          .send(
            "No book found with title " + title
          );
      }
    } catch (error) {
      return res
        .status(500)
        .send("Internal Server Error");
    }
  }
);

public_users.get("/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  if (books[isbn]) {
    return res
      .status(200)
      .json(books[isbn].reviews);
  } else {
    return res
      .status(404)
      .send("No book found with ISBN " + isbn);
  }
});

module.exports.general = public_users;

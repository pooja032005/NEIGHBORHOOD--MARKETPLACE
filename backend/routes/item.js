const express = require("express");
const router = express.Router();

const {
  createItem,
  getItems,
  getItemById,
} = require("../controllers/itemController");

const { auth } = require("../utils/authMiddleware");

// CREATE
router.post("/create", auth, createItem);

// GET ALL
router.get("/", getItems);

// GET SINGLE
router.get("/:id", getItemById);

module.exports = router;

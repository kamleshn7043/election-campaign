const express = require("express");
const router = express.Router();

const {
  adminLogin,
  createAdmin
} = require("../controllers/admin.controller");

// LOGIN
router.post("/login", adminLogin);

// CREATE ADMIN
router.post("/create", createAdmin);

module.exports = router;

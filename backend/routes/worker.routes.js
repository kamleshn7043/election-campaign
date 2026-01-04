const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  workerLogin,
  createWorker,
  getAreaVoters,      // ➕ ADD
  updateSupport       // ➕ ADD
} = require("../controllers/worker.controller");

// WORKER LOGIN
router.post("/login", workerLogin);

// CREATE WORKER (ADMIN ONLY)
router.post("/create", authMiddleware, createWorker);

// =========================
// WORKER VIEW OWN AREA VOTERS
// =========================
router.get("/voters", authMiddleware, getAreaVoters);

// =========================
// WORKER UPDATE SUPPORT
// =========================
router.put("/support/:mobile", authMiddleware, updateSupport);

module.exports = router;

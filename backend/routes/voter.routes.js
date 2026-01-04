const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
  addVoter,
  getAllVoters,
  uploadExcelVoters,
  deleteVoter,
  updateVoter,
  getSingleVoter
} = require("../controllers/voter.controller");

// =======================
// ADMIN VIEW ALL VOTERS (USED BY REPORTS ALSO)
// =======================
router.get("/all", authMiddleware, getAllVoters);

// =======================
// ADMIN REPORT DATA
// =======================
router.get("/report/all", authMiddleware, getAllVoters);

// =======================
// ADMIN ADD SINGLE VOTER
// =======================
router.post("/add", authMiddleware, addVoter);

// =======================
// ADMIN UPLOAD EXCEL
// =======================
router.post("/upload-excel", authMiddleware, uploadExcelVoters);

// =======================
// ADMIN UPDATE VOTER (INLINE UPDATE)
// =======================
router.put("/update/:id", authMiddleware, updateVoter);

// =======================
// ADMIN DELETE VOTER
// =======================
router.delete("/delete/:id", authMiddleware, deleteVoter);

// =======================
// ADMIN GET SINGLE VOTER (⚠️ ALWAYS LAST)
// =======================
router.get("/:id", authMiddleware, getSingleVoter);

module.exports = router;

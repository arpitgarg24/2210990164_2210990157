const express = require("express");
const router = express.Router();
const {
  getNotes, getNote, createNote, updateNote, deleteNote,
  rateNote, saveNote, getSavedNotes,
} = require("../controllers/notesController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

router.get("/", optionalAuth, getNotes);
router.get("/saved", protect, getSavedNotes);
router.get("/:id", optionalAuth, getNote);
router.post("/", protect, createNote);
router.put("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);
router.post("/:id/rate", protect, rateNote);
router.post("/:id/save", protect, saveNote);

module.exports = router;

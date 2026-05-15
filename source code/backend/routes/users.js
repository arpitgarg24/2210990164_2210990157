const express = require("express");
const router = express.Router();
const { getUser, getUserNotes, toggleSubscribe, getTopAuthors } = require("../controllers/usersController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getTopAuthors);
router.get("/:id", getUser);
router.get("/:id/notes", getUserNotes);
router.post("/:id/subscribe", protect, toggleSubscribe);

module.exports = router;

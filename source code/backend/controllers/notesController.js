const Note = require("../models/Note");
const User = require("../models/User");

// GET /api/notes - list with filter/sort/search/paginate
exports.getNotes = async (req, res) => {
  try {
    const { search, category, sort = "newest", page = 1, limit = 12, author } = req.query;
    const query = { isPublished: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (author) query.author = author;

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { views: -1 },
      "top-rated": { averageRating: -1 },
    };

    const notes = await Note.find(query)
      .populate("author", "name avatar")
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()
      .then(notes => notes.map(n => ({
        ...n,
        averageRating: n.ratings?.length
          ? Math.round((n.ratings.reduce((s, r) => s + r.value, 0) / n.ratings.length) * 10) / 10
          : 0,
        ratingCount: n.ratings?.length || 0,
      })));

    const total = await Note.countDocuments(query);
    res.json({ notes, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/notes/:id
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate("author", "name avatar bio subscribers")
      .populate("ratings.user", "name avatar");

    if (!note) return res.status(404).json({ message: "Note not found" });

    await Note.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    const noteObj = note.toObject({ virtuals: true });
    res.json(noteObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const { title, description, content, category, tags, isPremium, price, thumbnail } = req.body;
    const note = await Note.create({
      title, description, content, category,
      tags: tags || [], isPremium: isPremium || false,
      price: price || 0, thumbnail: thumbnail || "",
      author: req.user._id,
    });
    await note.populate("author", "name avatar");
    res.status(201).json(note);
  } catch (err) {
    if (err.name === "ValidationError")
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(", ") });
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/notes/:id
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("author", "name avatar");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.author.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });
    await note.deleteOne();
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/notes/:id/rate
exports.rateNote = async (req, res) => {
  try {
    const { value, review } = req.body;
    if (!value || value < 1 || value > 5)
      return res.status(400).json({ message: "Rating must be 1-5" });

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.author.toString() === req.user._id.toString())
      return res.status(400).json({ message: "Cannot rate your own note" });

    const existingIdx = note.ratings.findIndex(r => r.user.toString() === req.user._id.toString());
    if (existingIdx >= 0) {
      note.ratings[existingIdx].value = value;
      note.ratings[existingIdx].review = review || "";
    } else {
      note.ratings.push({ user: req.user._id, value, review: review || "" });
    }

    await note.save();
    await note.populate("ratings.user", "name avatar");
    res.json({ averageRating: note.averageRating, ratingCount: note.ratingCount, ratings: note.ratings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/notes/:id/save
exports.saveNote = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const noteId = req.params.id;
    const isSaved = user.savedNotes.includes(noteId);

    if (isSaved) {
      user.savedNotes = user.savedNotes.filter(id => id.toString() !== noteId);
    } else {
      user.savedNotes.push(noteId);
    }
    await user.save();
    res.json({ saved: !isSaved, savedNotes: user.savedNotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/notes/saved - get saved notes for current user
exports.getSavedNotes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedNotes",
      populate: { path: "author", select: "name avatar" },
    });
    const notes = user.savedNotes.map(n => {
      const obj = n.toObject ? n.toObject({ virtuals: true }) : n;
      return {
        ...obj,
        averageRating: obj.ratings?.length
          ? Math.round((obj.ratings.reduce((s, r) => s + r.value, 0) / obj.ratings.length) * 10) / 10
          : 0,
        ratingCount: obj.ratings?.length || 0,
      };
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

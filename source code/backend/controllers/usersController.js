const User = require("../models/User");
const Note = require("../models/Note");

// GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id/notes
exports.getUserNotes = async (req, res) => {
  try {
    const notes = await Note.find({ author: req.params.id, isPublished: true })
      .populate("author", "name avatar")
      .sort({ createdAt: -1 })
      .lean()
      .then(notes => notes.map(n => ({
        ...n,
        averageRating: n.ratings?.length
          ? Math.round((n.ratings.reduce((s, r) => s + r.value, 0) / n.ratings.length) * 10) / 10
          : 0,
        ratingCount: n.ratings?.length || 0,
      })));
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/:id/subscribe
exports.toggleSubscribe = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: "Cannot subscribe to yourself" });

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const currentUser = await User.findById(req.user._id);
    const isSubscribed = currentUser.subscribedTo.includes(req.params.id);

    if (isSubscribed) {
      currentUser.subscribedTo = currentUser.subscribedTo.filter(id => id.toString() !== req.params.id);
      targetUser.subscribers = targetUser.subscribers.filter(id => id.toString() !== req.user._id.toString());
    } else {
      currentUser.subscribedTo.push(req.params.id);
      targetUser.subscribers.push(req.user._id);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      subscribed: !isSubscribed,
      subscriberCount: targetUser.subscribers.length,
      subscribedTo: currentUser.subscribedTo,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users - get top authors
exports.getTopAuthors = async (req, res) => {
  try {
    const authors = await User.find().select("-password").sort({ "subscribers.length": -1 }).limit(10);
    // Enrich with note count
    const enriched = await Promise.all(authors.map(async (a) => {
      const noteCount = await Note.countDocuments({ author: a._id, isPublished: true });
      return { ...a.toObject(), noteCount, subscriberCount: a.subscribers.length };
    }));
    res.json(enriched.sort((a, b) => b.subscriberCount - a.subscriberCount));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "30d" });

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  role: user.role,
  subscriberCount: user.subscribers?.length || 0,
  subscribedTo: user.subscribedTo,
  savedNotes: user.savedNotes,
  createdAt: user.createdAt,
});

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user._id), user: sanitizeUser(user) });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(", ") });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({ token: signToken(user._id), user: sanitizeUser(user) });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate("savedNotes", "title category");
  res.json(sanitizeUser(user));
};

exports.updateProfile = async (req, res) => {
  const { name, bio, avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id, { name, bio, avatar },
      { new: true, runValidators: true }
    );
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

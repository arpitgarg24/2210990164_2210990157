const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String, required: true, unique: true,
      lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 200 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    subscribedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
  },
  { timestamps: true }
);

userSchema.virtual("subscriberCount").get(function () {
  return this.subscribers.length;
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);

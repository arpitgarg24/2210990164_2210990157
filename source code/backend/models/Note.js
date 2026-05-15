const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  value: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, maxlength: 500 },
}, { timestamps: true });

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 500 },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String, required: true,
      enum: ["Mathematics", "Science", "Technology", "History", "Literature",
             "Business", "Arts", "Language", "Philosophy", "Other"],
    },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    isPremium: { type: Boolean, default: false },
    price: { type: Number, default: 0, min: 0 },
    ratings: [ratingSchema],
    views: { type: Number, default: 0 },
    thumbnail: { type: String, default: "" },
    isPublished: { type: Boolean, default: true },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

noteSchema.virtual("averageRating").get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
});

noteSchema.virtual("ratingCount").get(function () {
  return this.ratings ? this.ratings.length : 0;
});

noteSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Note", noteSchema);

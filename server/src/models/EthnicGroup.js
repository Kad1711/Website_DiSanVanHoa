const mongoose = require('mongoose');
const { generateSlug } = require('../utils/slug.util');

// Reusable sub-schema for Cloudinary image metadata
const imageSchema = new mongoose.Schema(
  {
    url:      { type: String, required: true },
    publicId: { type: String, required: true },
    width:    Number,
    height:   Number,
    format:   String,
  },
  { _id: false }
);

const ethnicGroupSchema = new mongoose.Schema(
  {
    name:         { type: String, required: [true, 'Tên dân tộc là bắt buộc.'], trim: true, unique: true },
    slug:         { type: String, unique: true, lowercase: true },
    description:  { type: String, default: '' },
    thumbnail:    imageSchema,
    coverImage:   imageSchema,
    region:       { type: String, trim: true, default: '' },
    cultureSummary: { type: String, default: '' },
    status:       { type: String, enum: ['published', 'draft'], default: 'published' },
  },
  { timestamps: true }
);

ethnicGroupSchema.pre('save', function () {
  if (!this.slug || this.isModified('name')) {
    this.slug = generateSlug(this.name);
  }
});

module.exports = mongoose.model('EthnicGroup', ethnicGroupSchema);

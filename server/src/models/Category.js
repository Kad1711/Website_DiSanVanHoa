const mongoose = require('mongoose');
const { generateSlug } = require('../utils/slug.util');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên thể loại là bắt buộc.'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    icon: {
      type: String,
      default: '📚',
    },
    color: {
      type: String,
      default: '#ea580c',
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
  },
  { timestamps: true }
);

categorySchema.pre('save', function () {
  if (!this.slug || this.isModified('name')) {
    this.slug = generateSlug(this.name);
  }
});

module.exports = mongoose.model('Category', categorySchema);

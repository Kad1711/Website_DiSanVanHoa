const mongoose = require('mongoose');
const { generateSlug } = require('../utils/slug.util');

const imageSchema = new mongoose.Schema(
  {
    url:      { type: String, required: true },
    publicId: { type: String, required: true },
    width:    Number,
    height:   Number,
    format:   String,
    caption:  { type: String, default: '' },
  },
  { _id: false }
);

const videoSchema = new mongoose.Schema(
  {
    title:        { type: String, default: '' },
    url:          { type: String, required: true },
    publicId:     { type: String, required: true },
    resourceType: { type: String, default: 'video' },
    duration:     Number,
    format:       String,
    type: {
      type: String,
      enum: ['normal-video', 'ai-video'],
      default: 'normal-video',
    },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: [true, 'Nội dung bình luận là bắt buộc.'], trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const workSchema = new mongoose.Schema(
  {
    title:   { type: String, required: [true, 'Tiêu đề tác phẩm là bắt buộc.'], trim: true },
    slug:    { type: String, unique: true, lowercase: true },
    author:  { type: String, trim: true, default: 'Dân gian' },
    category: {
      type: String,
      enum: ['tho', 'truyen-ngan', 'su-thi', 'dan-ca', 'truyen-thuyet', 'khac'],
      default: 'khac',
    },
    ethnicGroup:     { type: mongoose.Schema.Types.ObjectId, ref: 'EthnicGroup' },
    summary:         { type: String, trim: true, maxlength: 1000, default: '' },
    content:         { type: String, default: '' },
    coverImage:      imageSchema,
    gallery:         [imageSchema],
    videos:          [videoSchema],
    relatedLocations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
    likes:           [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments:        [commentSchema],
    status:          { type: String, enum: ['draft', 'published'], default: 'draft' },
    createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

workSchema.pre('save', function () {
  if (!this.slug || this.isModified('title')) {
    this.slug = generateSlug(this.title);
  }
});

module.exports = mongoose.model('Work', workSchema);

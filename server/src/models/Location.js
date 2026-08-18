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

const locationSchema = new mongoose.Schema(
  {
    name:   { type: String, required: [true, 'Tên địa điểm là bắt buộc.'], trim: true },
    slug:   { type: String, unique: true, lowercase: true },
    province: { type: String, required: [true, 'Tỉnh/thành phố là bắt buộc.'], trim: true },
    district: { type: String, trim: true, default: '' },
    address:  { type: String, trim: true, default: '' },
    coordinates: {
      lat: { type: Number, required: [true, 'Vĩ độ là bắt buộc.'], min: -90, max: 90 },
      lng: { type: Number, required: [true, 'Kinh độ là bắt buộc.'], min: -180, max: 180 },
    },
    ethnicGroup:    { type: mongoose.Schema.Types.ObjectId, ref: 'EthnicGroup' },
    shortDescription: { type: String, trim: true, maxlength: 500, default: '' },
    description:    { type: String, default: '' },
    images:         [imageSchema],
    videos:         [videoSchema],
    relatedWorks:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Work' }],
    status:         { type: String, enum: ['published', 'draft'], default: 'draft' },
    createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

locationSchema.pre('save', function () {
  if (!this.slug || this.isModified('name')) {
    this.slug = generateSlug(this.name);
  }
});

module.exports = mongoose.model('Location', locationSchema);

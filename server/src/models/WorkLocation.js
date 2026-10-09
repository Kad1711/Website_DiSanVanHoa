const mongoose = require('mongoose');

const workLocationSchema = new mongoose.Schema(
  {
    work: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Work',
      required: [true, 'Tác phẩm là bắt buộc.'],
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Địa điểm là bắt buộc.'],
    },
    order: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    role: {
      type: String,
      enum: ['START', 'DEVELOPMENT', 'CLIMAX', 'END', 'OTHER'],
      default: 'DEVELOPMENT',
    },
    journeyTitle: {
      type: String,
      trim: true,
      default: '',
    },
    journeyDescription: {
      type: String,
      trim: true,
      default: '',
    },
    media: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate (work, location) links
workLocationSchema.index({ work: 1, location: 1 }, { unique: true });
workLocationSchema.index({ work: 1, order: 1 });
workLocationSchema.index({ location: 1 });

module.exports = mongoose.model('WorkLocation', workLocationSchema);

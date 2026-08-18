const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: [true, 'Tên hiển thị là bắt buộc.'],
      trim: true,
      maxlength: [100, 'Tên tối đa 100 ký tự.'],
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ.'],
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc.'],
      minlength: [6, 'Mật khẩu tối thiểu 6 ký tự.'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      url: String,
      publicId: String,
    },
  },
  { timestamps: true }
);

// Hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Strip password from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

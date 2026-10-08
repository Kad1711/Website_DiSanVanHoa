const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ.';

  // Mongoose validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  // Duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} đã tồn tại.`;
  }
  // Multer limit file size
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'Dung lượng tệp quá lớn, vượt quá giới hạn tối đa cho phép.';
  }
  // Bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Dữ liệu ID "${err.value}" không hợp lệ cho trường ${err.path || ''}.`.trim();
  }
  // JWT
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.'; }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;

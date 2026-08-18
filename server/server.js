require('dotenv').config();

console.log('MONGODB_URI exists:', Boolean(process.env.MONGODB_URI));
console.log(
  'Mongo env keys:',
  Object.keys(process.env).filter((key) => key.toUpperCase().includes('MONGO'))
);

const app = require('./app');
const connectDB = require('./src/config/db');

require('./src/config/cloudinary');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Backend Server running at: http://localhost:${PORT}`);
    console.log(`💻 Frontend App running at:   http://localhost:5173`);
    console.log(`======================================================\n`);
  });
};

start();
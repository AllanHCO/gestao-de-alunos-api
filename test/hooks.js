import mongoose from 'mongoose';

after(async function () {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

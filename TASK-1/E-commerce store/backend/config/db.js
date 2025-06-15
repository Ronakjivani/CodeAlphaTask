const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI ||'mongodb+srv://23it088:WTbhXlsJtzaAdOEQ@cluster0.nhh5r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

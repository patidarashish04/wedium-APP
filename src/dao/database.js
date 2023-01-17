const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        //mongodb connection string
        const con = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log(`Successfully connect to MongoDB.`);
    }
    catch (err) {
        console.log(`No connection ` + err);
        process.exit(1);
    }
}

module.exports = connectDB

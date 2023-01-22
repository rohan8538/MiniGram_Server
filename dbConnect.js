const mongoose = require("mongoose");

module.exports = async () => {
    const mongoUrl = `mongodb+srv://rohan:${process.env.dbPass}@cluster0.rfelp9t.mongodb.net/?retryWrites=true&w=majority`;

    try{
        const connect = await mongoose.connect(mongoUrl, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log(`MongoDB connected: ${connect.connection.host}`);
    }catch(e){
        console.log(e);
        process.exit(1);
    }   
};
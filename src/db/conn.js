const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
}).then(() => {
    console.log("Database connection is successfully!");
}).catch((error) => {
    console.log("Database connection is failed:", error);
});

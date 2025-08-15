const mongoose = require("mongoose");
let initData = require("./data.js");
const Listing = require("../models/listing.js");

main().then(()=>{
    console.log("MongoDB connected successfully");
}).catch((err)=>{
    console.log(err);
});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB = async()=>{
    await Listing.deleteMany({});
    initData = initData.map((obj)=>({ ...obj, owner:"686620a098d9f7266d3183f5"}));
    await Listing.insertMany(initData);
    console.log("data was initialized");
}

initDB();

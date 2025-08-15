const mongoose = require("mongoose");

const listingSchema = mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
           type: String,
           default: "https://images.unsplash.com/photo-1591170715502-fbc32adc4f52?..."
        }
    },
    price:{
        type:Number,
    },
    location:{
        type:String,
    },
    country:{
        type:String,
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    geometry:{
        type: {
           type: String, // Don't do `{ location: { type: String } }`
           enum: ['Point'], // 'location.type' must be 'Point'
           required: true
        },
        coordinates: {
           type: [Number],
           required: true
        }
    },
    category:{
        type:String,
        enum:["Trending", "Rooms", "Iconic Cities", "Mountains", "Castle", "Amazing Pools", "Camping", "Farms", "Artic"],
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js");
const {storage} = require("../cloudConfig.js");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const multer  = require('multer');
const upload = multer({storage});

const validateListing = (req, res, next) => {
    console.log("🔥 Incoming Form Data:", req.body);  // 👈 Add this
    let { error } = listingSchema.validate(req.body);

    if (error) {
        console.log("❌ Joi Validation Error:", error.details);
        throw new ExpressError(400, error.details.map(el => el.message).join(", "));
    } else {
        next();
    }
};

// SEARCH route - should be above :id route to avoid conflict
router.get("/search", isLoggedIn, wrapAsync(async (req, res) => {
    const { query } = req.query;

    if (!query) {
        req.flash("error", "Please enter a search term.");
        return res.redirect("/listings");
    }

    const listings = await Listing.find({
        title: { $regex: query, $options: "i" }  // Case-insensitive match
    });

    res.render("listings/index.ejs", { allListings: listings});
}));


//delete route
router.delete("/:id", isLoggedIn, isOwner ,wrapAsync(async(req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

//update route
router.put("/:id", isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(async(req, res)=>{
    let {id} = req.params;
    let response = await geocodingClient.forwardGeocode({
       query: req.body.listing.location,
       limit: 1
    })
    .send()

    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    listing.geometry = response.body.features[0].geometry;
    await listing.save();
    if(typeof req.file != "undefined"){
         let url = req.file.path;
         let  filename = req.file.filename;
         listing.image = {url, filename};
         await listing.save();
    }
    req.flash("success", "Listing Edited");
    res.redirect(`/listings/${id}`);
}));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
}));

//create route
router.post("/", 
  upload.single('listing[image]'), 
  validateListing, 
  wrapAsync(async (req, res) => {
    
    let response = await geocodingClient.forwardGeocode({
       query: req.body.listing.location,
       limit: 1
    })
    .send()

    let url = req.file.path;
    let  filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  })
);


//new route
router.get("/new", isLoggedIn,  wrapAsync(async(req, res)=>{
    res.render("listings/new.ejs");
}));

//show route
router.get("/:id", wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews", populate:{path:"author"},}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}));

//All listing route
router.get("/", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

module.exports = router;
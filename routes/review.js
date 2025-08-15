const express = require("express");
const router =  express.Router({mergeParams:true});
const {reviewSchema} = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isAuthor} = require("../middleware.js");

const validateReview = (req, res, next)=>{
    let {error} = reviewSchema.validate(req.body);

    if(error){
        throw new ExpressError(400, "Validation Error");
    }
    else{
        next();
    }
}

//delete route
router.delete("/:reviewId", isLoggedIn, isAuthor, wrapAsync(async(req, res)=>{
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
}));

//review route
router.post("/", isLoggedIn, validateReview, wrapAsync(async(req, res)=>{
    let newReview = new Review(req.body.review);
    let listing = await Listing.findById(req.params.id);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created");
    res.redirect(`/listings/${listing._id}`);

}));

module.exports = router;
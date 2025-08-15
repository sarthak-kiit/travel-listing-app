const Joi = require('joi');

const validCategories = [
  "Trending", 
  "Rooms", 
  "Iconic Cities", 
  "Mountains", 
  "Castle", 
  "Amazing Pools", 
  "Camping", 
  "Farms", 
  "Artic"
];

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    price: Joi.number().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    category: Joi.string().valid(...validCategories).required(), // ✅ Added this
    image: Joi.object({
      url: Joi.string().uri().allow('').optional(),
      filename: Joi.string().allow('').optional()
    }).optional(),

    geometry: Joi.object({
     type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().items(Joi.number().required()).length(2).required()
    }).optional() // 👈 geometry is now optional

  }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required()
    }).required()
});
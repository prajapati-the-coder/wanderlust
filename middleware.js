const Listing = require('./models/listing')
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError')
const {listingSchema, reviewSchema} = require('./schema.js')


module.exports.isLoggedIn = (req, res, next)=>{
    // console.log(req.path, "..", req.originalUrl)
    if(!req.isAuthenticated()){
        //saving original url or redirectURL
        req.session.redirectUrl = req.originalUrl

        req.flash("error", "You must be logged in to create new listing!")
        return res.redirect("/login")
    }
    next()
}

module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next()
}

module.exports.isOwner = async(req, res, next)=>{
    let { id } = req.params

    //Authorizing 
    let listing = await Listing.findById(id)
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the Owner of the listing!")
        return res.redirect(`/listings/${id}`)
    }
    next()
}

//validation for Schema
module.exports.validateListing = (req, res, next) =>{
    let {error} = listingSchema.validate(req.body)
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",")
        throw new ExpressError(400, errMsg)
    }else{
        next()
    }
}

//Validation for review
module.exports.validateReview = (req, res, next) =>{
    let {error} = reviewSchema.validate(req.body)
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",")
        throw new ExpressError(400, errMsg)
    }else{
        next()
    }
}

//Review Authorization
module.exports.isReviewAuthor = async(req, res, next)=>{
    let {id, reviewId } = req.params

    //Authorizing 
    let review = await Review.findById(reviewId)
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of the review!")
        return res.redirect(`/listings/${id}`)
    }
    next()
}
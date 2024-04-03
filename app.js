if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

// console.log(process.env.SECRET)

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require("./utils/ExpressError.js")
const session = require('express-session')
const Mongostore = require('connect-mongo') 
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user.js')

const listingRouter = require('./routes/listing.js')
const reviewRouter = require('./routes/review.js')
const userRouter = require('./routes/user.js')

const dbUrl = process.env.ATLASDB_URL

main().then((res) => {
    console.log("Connection established")
}).catch((err) => console.log(err))

async function main() {
    await mongoose.connect(dbUrl)
}

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride("_method"))
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname, "/public")))


const store = Mongostore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600,
})


store.on("error", ()=>{
    console.log("Error in Mongo Session Store", err)
})

//Session
const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
}

// app.get("/", (req, res) => {
//     res.send("Hi! I'm root")
// })

app.use(session(sessionOptions))
app.use(flash())

//passport
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash middleware for session
app.use((req, res, next)=>{
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user

    // console.log(res.locals.success)
    next()
})

//Demo User 
// app.get("/demouser", async(req, res)=>{
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"delta-student",
//     })

//     let registeredUser = await User.register(fakeUser, "helloworld")
//     res.send(registeredUser)
// })


app.use("/listings", listingRouter)
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter)


// app.get('/testListing', async (req, res)=>{
//     let sampleListing = new Listing ({
//         title: "Blu Radison",
//         description:"For travellers",
//         price:1000,
//         location:"Jaipur",
//         country:"India",
//     })

//     await sampleListing.save()
//     console.log('Sample was saved')
//     res.send("Successful testing")
// })


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"))
})


//middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went wrong" } = err
    res.status(statusCode).render("error.ejs", {message})
    // res.status(statusCode).send(message)
    // res.render("error.ejs", {message})
    // res.send("Something went wrong!")
})

app.listen(8080, () => {
    console.log("App is listening on port 8080")
})

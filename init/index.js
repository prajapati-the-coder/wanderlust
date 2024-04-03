const mongoose = require('mongoose')
const initData = require('./data.js')
const Listing = require('../models/listing.js')

main().then((res)=>{
    console.log("Connection established")
}).catch((err)=> console.log(err))

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
}

const initDB = async ()=>{
    await Listing.deleteMany({})
    
    //Assign owner to the DB ....Jo data phle se insert tha uske liye hai
    initData.data = initData.data.map((obj)=>({...obj, owner: '65fd60b876cffde7ccd15bdd'}))
    await Listing.insertMany(initData.data)
    console.log("Data was inserted")
}

initDB();
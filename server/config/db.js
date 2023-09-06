const mongoose = require('mongoose')
const connectDB = async ()=>{
    try{
        mongoose.set('strictQuery', false)
        const conn = await mongoose.connect(process.env.MONGODBURL)
        console.log(`Connection has been made ${conn.connection.host}`)

    }catch (err) {
        console.log(err)
    }
}


module.exports = connectDB;
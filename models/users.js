require("dotenv").config()
const mongoose = require("mongoose")

mongoose.connect(process.env.Mongo,{

    useNewUrlParser: true,
    useUnifiedTopology: true
  
  })

const UserSchema= mongoose.Schema({
    firstname:{
        required:true,
        type:String
    },
    lastname:{
        required:true,
        type:String
    },
    email:{
        required:true,
        type:String,
        unique:true
    },
    password:{
        required:true,
        type:String
    },
    tokens:{
        token:{
            type:String,
        }
    },
    verified:{
        type:Boolean,
        default:false
    }
  },{timestamps: true})

const User = new mongoose.model("User",UserSchema)

module.exports = User
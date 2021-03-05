const mongoose = require("mongoose");
const { v1:uuidv1 } = require("uuid");
const crypto = require("crypto");
const {ObjectId} = mongoose.Schema

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        maxlength: 40,
        required: true
    },
    email:{
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    about:{
        type:String,
        trim:true,
        maxlength:400
    },
    hashed_password: {
        type: String,
        required: true
    },
    photo:{
        data:Buffer,
        contentType: String
    },
    role:{
        type:Number,
        default: 0
    },
    salt:{
        type:String
    },
    followers:[{
        type:ObjectId,
        ref:"User"
    }],
    following:[{
        type:ObjectId,
        ref:"User"
    }],
    posts:{
        type:Array,
        default:[]
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
    type: Date,
    default: Date.now
    }
},{ timestamps: { createdAt: 'createdDate',updatedAt: 'updatedDate' }});

userSchema.virtual('password')
.set(function(password){
    this._password = password;
    this.salt = uuidv1();
    this.hashed_password = this.encryptedPassword(password);
})
.get(()=>{
    return this._password;
})

userSchema.methods = {
    authenticate: function(plainText){
        if(this.hashed_password === this.encryptedPassword(plainText)){
            return true;
        }
        return false;
    },
    encryptedPassword: function(password){
        if(!password) return ('');
        try{
            return crypto.createHmac('sha1',this.salt).update(password).digest('hex');
        }catch(err){
            console.log(`${err}`);
        }
    }
}


module.exports = mongoose.model("User",userSchema);
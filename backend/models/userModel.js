import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String},
  about: { type: String },
  experience: { type: String },
  skills: [{ type: String }],
  institute: { type: String },
  education : {type: String },
  dob : { type: Date},
  image: { 
    type: String,
    default:"data:image/jpeg;base64,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"
   },
  resume: { type: String },
  sociallink1:{type:String}, //linkedin
  sociallink2:{type:String}, //github
  sociallink3:{type:String}, //instagram
  sociallink4:{type:String}, // X

  appliedjobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "jobs" }],  
});
const userModel = mongoose.model("user", userSchema);
export default userModel;
import mongoose from "mongoose";

const authSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, dropDups: true },
  password: { type: String, required: true }
});

export const Auth = mongoose.model('Auth', authSchema);

export default Auth;

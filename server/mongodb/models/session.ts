import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, dropDups: true },
  cookie: { type: String, required: true, unique: true, dropDups: true }
});

export const Session = mongoose.model('session', sessionSchema);

export default Session;

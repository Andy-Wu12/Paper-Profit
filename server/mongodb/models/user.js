import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, dropDups: true},
  email: { type: String, required: true, unique: true, dropDups: true },
});

userSchema.methods.details = function getName() {
  const details = {username: this.username, email: this.email};
  return details;
}

export const User = mongoose.model('User', userSchema);

export default User;

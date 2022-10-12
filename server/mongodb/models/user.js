import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, dropDups: true},
  email: { type: String, required: true, unique: true, dropDups: true },
  password: { type: String, required: true }
});

userSchema.methods.details = function getName() {
  const details = `${this.username}'s email is ${this.email}`;
  console.log(details);
}

export const User = mongoose.model('User', userSchema);

export default User;

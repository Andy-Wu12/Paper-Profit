import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  action: { type: String, required: true },
  date: { type: Date, required: true }

});

export const Transaction = mongoose.model('transaction', transactionSchema);

export default Transaction;
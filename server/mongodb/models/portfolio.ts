import mongoose, { Types } from "mongoose";

export interface IHolding {
  _id: Types.ObjectId
  symbol: string,
  quantity: number,
  pricePerShare: number,
  datePurchased: Date
}

export interface IPortfolio {
  _id: Types.ObjectId,
  username: string,
  holdings: IHolding[],
  value: number
}

const portfolioSchema = new mongoose.Schema<IPortfolio>({
  username: { type: String, required: true, unique: true, dropDups: true },
  holdings: { type: [{
    symbol: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePerShare: { type: Number, required: true },
    datePurchased: { type: Date, required: true }
  }], default: []},
  value: { type: Number, default: 0 }

});

portfolioSchema.methods.details = function getDetails() {
  return {username: this.username, stocksOwned: this.holdings, totalValue: this.value};
}

export const Portfolio = mongoose.model('portfolio', portfolioSchema);

export default Portfolio;
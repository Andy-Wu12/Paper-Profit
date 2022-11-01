import mongoose from "mongoose";

const watchListSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, dropDups: true },
  symbols: { type: [{
    type: String
  }], default: []},

});

watchListSchema.methods.details = function getDetails() {
  return {username: this.username, stocksWatched: this.symbols};
}

export const Watchlist = mongoose.model('watchlist', watchListSchema);

export default Watchlist;
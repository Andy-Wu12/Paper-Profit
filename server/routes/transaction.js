import Router from '@koa/router';

import Transaction from '../mongodb/models/transaction.js';
import User from '../mongodb/models/user.js';
import Portfolio from '../mongodb/models/portfolio.js';

export const router = new Router({prefix: '/transaction'});

router.post('/buy', async (ctx) => {
  const queryDict = ctx.request.query;
  const postBody = ctx.request.body;

  const username = postBody.username;
  const price = postBody.price;
  const symbol = queryDict.symbol;
  const quantity = postBody.quantity;

  try {
    if(queryDict === '{}') {
      throw new Error('Invalid request');
    }

    const user = await User.findOne({username: username});
    const transactionCost = quantity * price;

    if(user.balance < transactionCost) {
      throw new Error('User balance too low for transaction');
    }

    const purchaseTime = Date.now();

    const transaction = new Transaction({
      username: username,
      symbol: symbol,
      action: 'buy', 
      quantity: quantity, 
      price: price,
      date: purchaseTime
    });
    transaction.save();

    // Update User's portfolio holdings
    const portfolio = await Portfolio.findOne({username: username});

    await Portfolio.updateOne(
      {username: username},
      {
        value: portfolio.value + (price * quantity),
        $push: {holdings: {
        symbol: symbol,
        quantity: quantity,
        pricePerShare: price,
        datePurchased: purchaseTime
      }}},
    );
    
    await User.updateOne(
      {username: username},
      {balance: user.balance - transactionCost}
    );


    ctx.status = 200;
    ctx.body = {message: 'Transaction successful', status: ctx.status};
    
  } catch(e) {
    ctx.status = 400;
    ctx.body = {message: e.message, status: ctx.status}
  }

});

router.post('/sell', async (ctx) => {
  const queryDict = ctx.request.query;
  const postBody = ctx.request.body;

  const username = postBody.username;
  const sellPrice = postBody.price;
  const symbol = queryDict.symbol;
  const quantity = postBody.quantity;

  try {
    if(queryDict === '{}') {
      throw new Error('Invalid request');
    }
    
    const user = await User.findOne({username: username});
    // Check if user's portfolio contains the specified symbols
    const portfolio = await Portfolio.findOne({username: username, 'holdings.symbol': {$in: symbol}});
    if(!portfolio) {
      throw new Error(`${username} does not own shares of ${symbol}`);
    }

    // Sort assets by date to get FIFO sell order
    const holdings = portfolio.holdings;
    sortByDate(holdings, 'datePurchased');

    // Validate enough shares of symbol
    let numShares = 0;
    let fifoHoldings = [];

    for(const holding of holdings) {
      if(holding.symbol == symbol) {
        numShares += holding.quantity;
        fifoHoldings.push(holding);
      }
      if(numShares >= quantity) {
        break;
      }
    };

    // TODO: If valid number of shares, sell with FIFO principle else throw Error.
    if(numShares >= quantity) {
      let valueLoss = 0;
      let netProfit = 0;
      let sharesToSell = quantity;
      let index = 0;
      while(sharesToSell > 0) {
        // Iterate through holdings until desired amount of shares sold.
        let holding = fifoHoldings[index++];
        const sharesToSellFromDoc = Math.min(holding.quantity, sharesToSell);
        sharesToSell -= sharesToSellFromDoc;
        // Track remaining holding quantity and value loss of portfolio (not net profit / loss)
        holding.quantity -= sharesToSellFromDoc;
        valueLoss += sharesToSellFromDoc * holding.pricePerShare;
        netProfit += sharesToSellFromDoc * sellPrice;

        if(holding.quantity < 1) {
          // Remove the element from holdings if all of the shares are sold
          await Portfolio.updateOne(
            {username: username},
            {
              value: portfolio.value - valueLoss,
              $pull: {holdings: {
                _id: holding._id
            }}},
          );
        }
        else {
          // Only portion of all shares sold from this holding
          await Portfolio.findOneAndUpdate({'holdings._id': holding._id}, 
          {$set: {
              'holdings.$.quantity': holding.quantity, 
              value: portfolio.value - valueLoss
            }
          });
        }
      }
      // Update user balance with profit / loss
      user.balance += netProfit;
      user.save();
    }
    else {
      throw new Error(`${username} does not own enough shares of ${symbol} to sell ${quantity}`);
    }

    ctx.status = 200;
    ctx.body = {message: 'Transaction successful', status: ctx.status};
    
  } catch(e) {
    ctx.status = 400;
    ctx.body = {message: e.message, status: ctx.status}
  }

});

function sortByDate(list, dateKeyName) {
  list.sort(function(a, b) {
    if(a[dateKeyName] < b[dateKeyName]) return -1;
    if(a[dateKeyName] > b[dateKeyName]) return 1;
    return 0;
  });
}

export default router;

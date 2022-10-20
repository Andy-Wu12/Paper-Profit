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

  // Hardcode quantity for now
  const quantity = 1;

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
  const price = postBody.price;
  const symbol = queryDict.symbol;

  // Hardcode quantity for now
  const quantity = 1;

  try {
    if(queryDict === '{}') {
      throw new Error('Invalid request');
    }
    
    const user = await User.findOne({username: username});
    // Check if user's portfolio contains the specified symbols
    const portfolio = await Portfolio.findOne({username: username, 'holdings.symbol': {$in: symbol}});
    if(portfolio.length < 1) {
      throw new Error(`${username} does not own shares of ${symbol}`);
    }

    // Sort assets by date to get FIFO sell order
    const holdings = portfolio.holdings;
    sortedByDate(holdings, 'datePurchased');

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

    console.log(fifoHoldings);
    // TODO: If valid number of shares, sell else throw Error

    // const gain = 0;

    // const transaction = new Transaction({
    //   username: username, 
    //   symbol: symbol, 
    //   action: 'sell', 
    //   quantity: quantity,
    //   price: price,
    //   date: Date.now()
    // });
    // transaction.save();

    // await Portfolio.updateOne(
    //   {username: username},
    //   {
    //     value: portfolio.value + (price * quantity),
    //     $push: {holdings: {
    //     symbol: symbol,
    //     quantity: quantity,
    //     pricePerShare: price,
    //     datePurchased: purchaseTime
    //   }}},
    // );
    
    // await User.updateOne(
    //   {username: username},
    //   {balance: user.balance + gain}
    // );

    ctx.status = 200;
    ctx.body = {message: 'Transaction successful', status: ctx.status};
    
  } catch(e) {
    ctx.status = 400;
    ctx.body = {message: e.message, status: ctx.status}
  }

});

function sortedByDate(list, dateKeyName) {
  list.sort(function(a, b) {
    if(a[dateKeyName] < b[dateKeyName]) return -1;
    if(a[dateKeyName] > b[dateKeyName]) return 1;
    return 0;
  });
}

export default router;

import Router from '@koa/router';

import Transaction from '../mongodb/models/transaction.js';

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

    // TODO: Check if user has enough money to buy
    const transaction = new Transaction({
      username: username, 
      symbol: symbol,
      action: 'buy', 
      quantity: quantity, 
      price: price
    });
    transaction.save();

    ctx.status = 200;
    ctx.body = {message: 'Transaction successful', status: ctx.status};
    
  } catch(e) {
    ctx.status = 400;
    ctx.body = {message: 'Bad request', status: ctx.status}
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
    
    // TODO: Check if user owns shares before transaction is made.
    const transaction = new Transaction({
      username: username, 
      symbol: symbol, 
      action: 'sell', 
      quantity: quantity,
      price: price
    });
    transaction.save();

    ctx.status = 200;
    ctx.body = {message: 'Transaction successful', status: ctx.status};
    
  } catch(e) {
    ctx.status = 400;
    ctx.body = {message: 'Bad request', status: ctx.status}
  }

});

export default router;

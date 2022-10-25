import Router from '@koa/router';

const wsRouter = Router();
const baseURL = 'http://localhost:3011';

const balanceSubs = {};

wsRouter.get('/', async (ctx, next) => {
	// `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
  // the websocket is added to the context on `ctx.websocket`.
	ctx.websocket.send('Hello');
	ctx.websocket.on('message', (message) => {
    console.log(message);
	});
	return next;
});

wsRouter.get('/balance', async (ctx) => {

  ctx.websocket.on('message', async (message) => {
    // Currently receiving bytes instead of JSON string....
    const messageJSON = await JSON.parse(message);
    const username = messageJSON['username'];
    if(messageJSON.action === 'sub') {
      balanceSubs[username] = 0;
    }
    // Only send response message if balance is changed
    while(true) {
      const response = await fetch(`${baseURL}/users/${username}`);
      const data = await response.json();
      
      if(data.balance !== balanceSubs[username]) {
        balanceSubs[username] = data.balance;
        ctx.websocket.send(data.balance);
      }
    }
})
});

export default wsRouter;
import Router from '@koa/router';

const wsRouter = Router();
const baseURL = 'http://localhost:3011';

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
  let balance = 0;
  let connected = true;

  // Connection management
  const pingInterval = 5000; // milliseconds
  const pongReturnReq = 20000;
  let lastPongDate = Date.now();

  // Websocket.on('open') doesn't seem to work for koa-websocket, so leaving this here as alternative
  // Ping every few seconds, make sure pong response is received in timely manner or else disconnect ws
  const ping = setInterval(() => {
    ctx.websocket.ping();
    console.log('ping sent!');
    if(Date.now() - pongReturnReq >= lastPongDate) {
      console.log('Closing timed-out socket!');
      connected = false;
      ctx.websocket.close();
      clearInterval(ping);
    }
  }, pingInterval);
  
  ctx.websocket.on('pong', async () => {
    console.log('pong received!');
    lastPongDate = Date.now();
  });

  ctx.websocket.on('message', async (message) => {
    try {
      const messageJSON = await JSON.parse(message);
      const username = messageJSON['username'];

      while(connected) {
        const response = await fetch(`${baseURL}/users/${username}`);
        const data = await response.json();
      
        // Only send response message if balance is changed
        if(data.balance !== balance) {
          balance = data.balance;
          ctx.websocket.send(data.balance);
        }
      }
    } catch (e) {
      console.log(e.message);
      connected = false;
      ctx.websocket.close();
    }
  })
});

export default wsRouter;
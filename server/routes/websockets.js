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
  ctx.websocket.on('message', async (message) => {
    console.log(message);
    const response = await fetch(`${baseURL}/users/${message}`);
    const data = await response.json();

    ctx.websocket.send(data.balance);
})
});

export default wsRouter;
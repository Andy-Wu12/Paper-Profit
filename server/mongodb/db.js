import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from './models/user.js';

const app = new Koa();
const router = new Router();
const port = 3012;

const db_name = "stock-sim";
const uri = `mongodb://localhost:27017/${db_name}`;
mongoose.connect(uri);

// const testUser = new User({username: "user1", email: "mail@123.com", password: "testPass"});
// testUser.save();

// const user = process.env.MONGODB_ATLAS_USER;
// const pass = process.env.MONGODB_ATLAS_KEY;

// Vanilla Mongodb
// const db = client.db('stock-sim')
// const collection = db.collection('users');
// collection.insertOne({username: "awu", password: "test"});

app.use(cors({origin: '*'}));
dotenv.config();


router.get('/', (ctx) => {
	ctx.body = {'Server\'s API Endpoints': {
		'Get list of all users': {
			'route' : '/users',
			'example' : `http://localhost:${port}/users`
		},
		'Get specific user': {
			'route' : '/users/:username',
			'example' : `http://localhost:${port}/users/user1`
		},
	}};
});

router.get('/users', async (ctx) => {
	ctx.body = await User.find();
});

router.get('/users/:username', async (ctx) => {
	ctx.body = await User.find({username: ctx.params['username']});
});

app.use(router.routes());

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});


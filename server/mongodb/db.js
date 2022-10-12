import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from './models/user.js';

const app = new Koa();
const router = new Router();
const port = 3012;

app.use(cors({origin: '*'}));
dotenv.config();

// const user = process.env.MONGODB_ATLAS_USER;
// const pass = process.env.MONGODB_ATLAS_KEY;
const db_name = "stock-sim";
const uri = `mongodb://localhost:27017/${db_name}`;

// Vanilla Mongodb
// const db = client.db('stock-sim')
// const collection = db.collection('users');
// collection.insertOne({username: "awu", password: "test"});

mongoose.connect(uri);

const testUser = new User({username: "user1", email: "mail@123.com", password: "testPass"});
testUser.save();

app.use(router.routes());

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});


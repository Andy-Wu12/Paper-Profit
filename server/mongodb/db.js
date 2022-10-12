import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

const app = new Koa();
const router = new Router();
const port = 3012;

app.use(cors({origin: '*'}));
dotenv.config();

// const user = process.env.MONGODB_ATLAS_USER;
// const pass = process.env.MONGODB_ATLAS_KEY;
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);
client.connect();

const db = client.db('stock-sim')
const collection = db.collection('users');

collection.insertOne({username: "awu", password: "test"});

app.use(router.routes());

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});


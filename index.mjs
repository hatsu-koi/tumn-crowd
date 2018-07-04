import bodyParser from "body-parser";
import express from "express";
import logger from "morgan";
import tokens from "./tokens.json";
import {MongoClient, ObjectID} from "mongodb";

(async () => {
	const client = await MongoClient.connect('mongodb://localhost:27017')
	const db = client.db('tumn-cat');
	const collection = db.collection('contents');

	const app = express();

	app.use(logger('dev'));
	app.use(bodyParser.json());

	app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname, 'app', 'index.html'));
	});

	app.get('/sentence', async (req, res) => {
		if(!req.query.token || !tokens.includes(req.query.token)) {
			res.status(403).end();
			return;
		}

		const sentence = await collection.findOne({
			filter: {
				$exists: false
			}
		});

		res.json({
			id: sentence._id.toHexString(),
			content: sentence.content
		});
	});

	app.post('/sentence', async (req, res) => {
		if(!req.query.token || !tokens.includes(req.query.token)) {
			res.status(403).end();
			return;
		}

		await collection.findOneAndUpdate({
			_id: new ObjectID(req.body.id)
		}, {
			$set: {
				filter: JSON.parse(req.body.filter)
			}
		});

		res.status(200).json({ok: true});
	});
})();

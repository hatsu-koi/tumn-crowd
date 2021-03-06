import bodyParser from "body-parser";
import express from "express";
import http from "http";
import logger from "morgan";
import mongodb from "mongodb";
import path from "path";
import tokens from "./tokens.json";

import OpenKoreanText from 'open-korean-text-node';


const port = ((val) => {
	let port = parseInt(val, 10);

	if(isNaN(port)) return val;
	if(port >= 0) return port;
	return false;
})(process.env.PORT || '3000');

(async () => {
	const {MongoClient, ObjectID} = mongodb;
	const OpenKoreanTextProcessor = OpenKoreanText.default;

	const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true})
	const db = client.db('tumn-cat');
	const collection = db.collection('contents');

	await OpenKoreanTextProcessor.ensureJvm();

	const app = express();

	app.set('port', port);

	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: false
	}));
	app.use('/dist', express.static('./dist/'));

	app.get('/', (req, res) => {
		res.sendFile(path.resolve('./app', 'index.html'));
	});

	app.get('/sentence', async (req, res) => {
		if(!req.query.token || !Object.keys(tokens).includes(req.query.token)) {
			res.status(403).end();
			return;
		}

		let from = parseInt(req.query.from);
		let count = parseInt(req.query.count);

		if(!isFinite(from)) from = 0;
		if(!isFinite(count)) count = 5;

		from = from;

		const filter = {
			filter: {
				$exists: false
			}
		};

		if(typeof tokens[req.query.token] === 'number') {
			filter.index = {
				$gt: tokens[req.query.token]
			};

			filter.reserved = {
				$exists: false
			};

		} else if(tokens[req.query.token] === 'reserved'){
			filter.reserved = {
				$exists: true
			};
		}

		const sentences = await collection.find(filter, {skip: from, limit: count}).toArray();

		const sentenceArray = [];
		for(let sentence of sentences) {
			const tokens = await OpenKoreanTextProcessor.tokenize(
				await OpenKoreanTextProcessor.normalize(sentence.content)
			);

			const words = tokens.toJSON().map(({text, pos, stem}) => {
				if(pos === 'Space') return null;

				return {
					text,
					value: `${stem || text}/${pos}`
				};
			}).filter(v => v !== null);

			sentenceArray.push({
				id: sentence._id.toHexString(),
				content: {
					index: sentence.index,
					words,
					reserved: sentence.reserved
				}
			});
		}

		res.json(sentenceArray);
	});

	app.post('/sentence', async (req, res) => {
		if(!req.body.token || !Object.keys(tokens).includes(req.body.token)) {
			res.status(403).end();
			return;
		}

		await collection.findOneAndUpdate({
			_id: new ObjectID(req.body.id)
		}, {
			$set: {
				filter: JSON.parse(req.body.filter),
				content: JSON.parse(req.body.content)
			}
		});

		res.status(200).json({ok: true});
	});

	app.post('/sentence/reserve', async (req, res) => {
		if(!req.body.token || !Object.keys(tokens).includes(req.body.token)) {
			res.status(403).end();
			return;
		}

		await collection.findOneAndUpdate({
			_id: new ObjectID(req.body.id)
		}, {
			$set: {
				reserved: req.body.reason
			}
		});

		res.status(200).json({ok: true});
	});

	const server = http.createServer(app);

	server.listen(port);
	server.on('error', (error) => {
		if(error.syscall !== 'listen') throw error;

		let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

		switch(error.code){
			case 'EACCES':
				console.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				throw error;
		}
	});

	server.on('listening', () => {
		let addr = server.address();
		let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
		console.log('Listening on ' + bind);
	});
})();

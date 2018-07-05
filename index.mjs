import bodyParser from "body-parser";
import express from "express";
import http from "http";
import logger from "morgan";
import mongodb from "mongodb";
import path from "path";
import tokens from "./tokens.json";

const port = ((val) => {
	let port = parseInt(val, 10);

	if(isNaN(port)) return val;
	if(port >= 0) return port;
	return false;
})(process.env.PORT || '3000');

(async () => {
	const {MongoClient, ObjectID} = mongodb;

	const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true})
	const db = client.db('tumn-cat');
	const collection = db.collection('contents');

	const app = express();

	app.set('port', port);

	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use('/dist', express.static('./dist/'));

	app.get('/', (req, res) => {
		res.sendFile(path.resolve('./app', 'index.html'));
	});

	app.get('/sentence', async (req, res) => {
		if(!req.query.token || !tokens.includes(req.query.token)) {
			res.status(403).end();
			return;
		}

		let from = parseInt(req.query.from);
		let count = parseInt(req.query.count);

		if(!isFinite(from)) from = 0;
		if(!isFinite(count)) count = 5;

		const sentences = await collection.find({
			filter: {
				$exists: false
			}
		}, {skip: from, limit: count}).toArray();

		res.json(
			sentences.map(sentence => ({
				id: sentence._id.toHexString(),
				content: sentence.content
			}))
		);
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

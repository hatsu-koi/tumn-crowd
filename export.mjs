import fs from "fs";
import mongodb from "mongodb";

(async () => {
	const {MongoClient, ObjectID} = mongodb;

	const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true})
	const db = client.db('tumn-cat');
	const collection = db.collection('contents');

	let sentences = await collection.find({
		filter: {
			$exists: true
		}
	}).toArray();

	sentences = sentences.map(v => {
		v.content = v.content.split(/[^ㄱ-ㅎㅏ-ㅣ가-힣A-Za-z0-9-_]+/);
		return v;
	});

	fs.writeFileSync('./result/mature.json', JSON.stringify(sentences.map(({content, filter}) => {
		return {
			content,
			filter: filter.map(v => v % 2 >= 1)
		};
	})));

	fs.writeFileSync('./result/swearword.json', JSON.stringify(sentences.map(({content, filter}) => {
		return {
			content,
			filter: filter.map(v => v % 4 >= 2)
		};
	})));

	fs.writeFileSync('./result/hatespeech.json', JSON.stringify(sentences.map(({content, filter}) => {
		return {
			content,
			filter: filter.map(v => v >= 4)
		};
	})));

	console.log("Finished!");
})();

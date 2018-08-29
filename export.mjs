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

	fs.writeFileSync('./result/multilabel.json', JSON.stringify(sentences.map(({content, filter}) => {
		return {
			content,
			filter: filter.map(v => [v % 2 >= 1, v % 4 >= 2, v >= 4])
		};
	})));

	const dataList = {};
	['mature', 'swearwords', 'hatespeech'].forEach((v, i) => {
		dataList[v] = {};

		const mask = Math.pow(2, i);
		sentences.forEach(sentence => {
			sentence['content'].forEach((word, wi) => {
				if(sentence['filter'][wi] & mask) {
					dataList[v][word] = true;
				}
			});
		});
	});

	fs.writeFileSync('./result/words.json', JSON.stringify(dataList, null, '\t'));

	let sentencesEmbedding = await collection.find({
		filter: {
			$exists: true
		}
	}).toArray();

	fs.writeFileSync('./result/embedding.json', JSON.stringify(sentencesEmbedding.map(({content}) => {
		return {
			content
		};
	})));

	console.log("Finished!");
})();

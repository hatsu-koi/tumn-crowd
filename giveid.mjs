import mongodb from "mongodb";

const {MongoClient} = mongodb;

(async () => {
	const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true});
	const db = client.db('tumn-cat');
	const collection = db.collection('contents');

	let i = 0;

	collection.find({}).forEach(doc => {
		i++;
		collection.findOneAndUpdate({
			_id: doc._id
		}, {
			$set: {
				index: i
			}
		});
	});
})();

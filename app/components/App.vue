<template>
	<main class="App List">
		<sentence
			v-for="sentence in sentences"
			:key="sentence.id" :id="sentence.id"
			:sentence="sentence.content"
			:token="token"
			@remove="removeAndAdd(sentence.id)">

		</sentence>
	</main>
</template>

<style scoped>
	.App {
		background: #f1f2f3;
		width: 100%;
		min-height: 100vh;
		position: absolute;
	}
</style>

<style>
	body {
		margin: 0;
	}
</style>

<script>
	import Sentence from "./Sentence.vue";

	export default {
		data() {
			return {
				sentences: [],
				token: ''
			};
		},

		methods: {
			askToken() {
				this.token = prompt("Please enter your token");
			},

			async addData(n, from=0) {
				const res = await fetch(`./sentence/?token=${this.token}&count=${n}&from=${from}`);
				const json = await res.json();

				this.sentences.push(...json);
			},

			async removeAndAdd(id) {
				this.sentences = this.sentences.filter(v => v.id !== id);
				await this.addData(1, 4);
			}
		},

		mounted() {
			//this.askToken();
			this.token = 'nenchan';
			this.addData(5);
		},

		components: {
			Sentence
		}
	};
</script>

<template>
	<main class="App List">
		<sentence
			v-for="sentence in sentences"
			:key="sentence.id" :id="sentence.id"
			:sentence="sentence.content">

		</sentence>

		<button class="Button Button--add">
			+
		</button>
	</main>
</template>

<script>
	export default {
		data() {
			sentences: [],
			token: ''
		},

		methods: {
			askToken() {
				this.token = prompt("Please enter your token");
			},

			async addData() {
				const res = await fetch(`./sentence/?token=${this.token}`)
				const json = await res.json();

				this.sentences.push(json);
			},

			async addBulk(n) {
				for(let i = 0; i < n; i++)
					await this.addData();
			}
		},

		mounted() {
			this.askToken();
			this.addBulk(10);
		}
	}
</script>

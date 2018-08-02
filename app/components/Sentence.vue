<template>
	<div class="Sentence">
		<div class="Words">
			<word v-for="(word, index) in words"
				:key="index"
				:word="word"
				v-model="marks[index]"
				@close="closeAll">

			</word>
		</div>
		<button class="Button" @click="submit">제출</button>
	</div>
</template>

<style scoped>
	.Sentence {
		margin: 30px;
		padding: 10px;
		background: #fff;
		box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .3);
	}

	.Words {
		display: flex;
		flex-wrap: wrap;
		margin: 10px 0;
	}
</style>

<script>
	import Word from "./Word.vue";

	export default {
		data() {
			return {
				marks: []
			};
		},

		props: {
			sentence: {
				type: Object,
				required: true
			},

			id: {
				type: String,
				required: true
			},

			token: {
				type: String,
				required: true
			}
		},

		computed: {
			words() {
				return this.sentence.words;
			}
		},

		methods: {
			async submit() {
				await fetch(`./sentence`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						id: this.id,
						token: this.token,
						content: JSON.stringify(this.sentence.words.map(v => v.value)),
						filter: JSON.stringify(this.marks)
					})
				});

				this.$emit('remove');
			},

			closeAll() {
				this.$children.forEach(v => v.overlay = false);
			}
		},

		created() {
			this.marks = [...Array(this.words.length)].map(v => 0);
		},

		components: {
			Word
		}
	};
</script>

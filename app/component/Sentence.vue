<template>
	<div class="Sentence">
		<div class="Words">
			<word v-for="(word, index) in words" :key="index" text="word" v-model="marks[i]"></word>
		</div>
		<button class="Button" @click="submit">제출</button>
	</div>
</template>

<script>
	export default {
		data() {
			marks: []
		},

		props: {
			sentence: {
				type: String,
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
				sentence.split(/[^ㄱ-ㅎㅏ-ㅣ가-힣A-Za-z0-9-_]+/)
			}
		},

		methods: {
			async submit() {
				await fetch(`./sentence/?token=${this.token}`, {
					method: 'POST',
					body: JSON.stringify({
						id: this.id,
						filter: this.marks
					})
				});

				this.$emit('remove');
			}
		},

		created() {
			this.marks = [...Array(this.words.length)].map(v => 0);
		}
	};
</script>

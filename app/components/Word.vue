<template>
	<div class="Word" @keydown="handleKey">
		<button class="Word__content" @click="toggleOverlay" :class="{
			'Word__content--mature': isMature,
			'Word__content--swearwords': isSwearwords,
			'Word__content--hatespeech': isHatespeech
		}">
			{{word.text}}
		</button>
		<div class="Word__overlay" v-if="overlay">
			<label>
				<input type="checkbox" v-model="isMature">
				음란
			</label>

			<label>
				<input type="checkbox" v-model="isSwearwords">
				비속어
			</label>

			<label>
				<input type="checkbox" v-model="isHatespeech">
				혐오발언
			</label>
		</div>
	</div>
</template>

<style scoped>
	.Word {
		margin: 4px 0;
	}

	.Word__content {
		background: rgba(0, 0, 0, .5);
		color: #f1f2f3;
		border: none;
		border-radius: 5px;
		margin: 4px;
		height: 100%;
		outline: none;
	}

	.Word__overlay {
		position: absolute;
		background: #fff;
		padding: 10px;
	}

	.Word__content--mature {
		background: #ff5722;
	}

	.Word__content--swearwords {
		background: #00bcd4;
	}

	.Word__content--hatespeech {
		background: #ffc107;
	}

	.Word__content--mature.Word__content--hatespeech {
		background: #ff9800;
	}

	.Word__content--mature.Word__content--swearwords {
		background: #7e57c2;
	}

	.Word__content--hatespeech.Word__content--swearwords {
		background: #8bc34a;
	}

	.Word__content--mature.Word__content--hatespeech.Word__content--swearwords {
		background: #202020;
	}
</style>

<script>
	const FILTER_MATURE = 1;
	const FILTER_SWEARWORDS = 2;
	const FILTER_HATESPEECH = 4;

	export default {
		model: {
			prop: '_value',
			event: 'update'
		},

		props: {
			_value: {
				type: Number,
				required: true
			},

			word: {
				type: Object,
				required: true
			}
		},

		data() {
			return {
				overlay: false
			};
		},

		computed: {
			value: {
				get() {
					return this._value;
				},

				set(v) {
					this.$emit('update', v);
				}
			},

			isMature: {
				get() {
					return this.value & FILTER_MATURE;
				},

				set(v) {
					if(v) {
						this.value |= FILTER_MATURE;
					} else {
						this.value &= ~FILTER_MATURE;
					}
				}
			},

			isSwearwords: {
				get() {
					return this.value & FILTER_SWEARWORDS;
				},

				set(v) {
					if(v) {
						this.value |= FILTER_SWEARWORDS;
					} else {
						this.value &= ~FILTER_SWEARWORDS;
					}
				}
			},

			isHatespeech: {
				get() {
					return this.value & FILTER_HATESPEECH;
				},

				set(v) {
					if(v) {
						this.value |= FILTER_HATESPEECH;
					} else {
						this.value &= ~FILTER_HATESPEECH;
					}
				}
			}
		},

		methods: {
			toggleOverlay() {
				if(!this.overlay) {
					this.$emit('close');
					this.overlay = true;
					return;
				}

				this.$emit('close');
			},

			handleKey(ev) {
				switch(ev.key) {
					case 'a':
						this.isMature = !this.isMature;
						break;

					case 's':
						this.isSwearwords = !this.isSwearwords;
						break;

					case 'd':
						this.isHatespeech = !this.isHatespeech;
						break;

					case 'Escape':
						this.$emit('close');
						break;
				}
			}
		}
	};
</script>

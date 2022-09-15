<template>
	<div class="center column score">
		<div class="space-between row">
			<h2 class="player" style="text-align: left" v-if="res == 1">
				{{ player }}
			</h2>
			<h3 class="player" style="text-align: left" v-else>{{ player }}</h3>
			<h2>{{ points1 }} | {{ points2 }}</h2>
			<h2 class="player" style="text-align: right" v-if="res == 2">
				{{ adversary }}
			</h2>
			<h3 class="player" style="text-align: right" v-else>{{ adversary }}</h3>
		</div>
		<div class="stack bar">
			<div class="bar2"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, defineProps, onMounted } from 'vue';
let define = inject('colors');
const props = defineProps(['player', 'adversary', 'points1', 'points2']);
let res = 0;
if (props.points1 > props.points2) res = 1;
else if (props.points2 > props.points1) res = 2;
let total = props.points2 + props.points1;
let score = (props.points1 / total) * 100;
</script>

<style scoped>
.score {
	margin: 10px auto;
	width: 80%;
}
.player {
	margin: auto 6px;
	width: 5rem;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.bar {
	background-color: v-bind('define.color0');
	border-radius: 10px;
	height: 20px;
	width: 100%;
}
.bar2 {
	position: absolute;
	top: 0;
	left: 0;
	background-color: v-bind('define.color2');
	border-top-left-radius: 10px;
	box-shadow: 0px 1px 3px #333;
	border-bottom-left-radius: 10px;
	height: 20px;
	width: v-bind("score + '%'");
}
</style>

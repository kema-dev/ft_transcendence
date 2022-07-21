<template>
	<div id="ingame_container">
		<div v-if="playing == false" class="center column not_playing">
			<h3>Not actually playing ...</h3>
			<button class="button_ingame" @click="create_room">Create a new room</button>
			<button class="button_ingame" @click="join_room">Join a room</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { useRoute } from 'vue-router'

let define = inject("colors");
const route = useRoute();

function create_room() {
	console.log("create a new room");
}

function join_room() {
	console.log("Join a room");
}

let playing = false;


</script>

<style>

#ingame_container {
	--heightContainer: calc(100vh - 180px);
	height: var(--heightContainer);
	position: relative;
}

.not_playing {
	/* margin-top: calc(0.5 * var(--heightContainer)); */
	position: absolute;
	top: 30%;
}

.button_ingame {
	background-color: v-bind("define.color2");
	border-radius: 10px;
	color: v-bind("define.color0");
	padding-left: 0.5rem;
	padding-right: 0.5rem;
	height: 1.5rem;
	margin-top: 1rem;
}

</style>
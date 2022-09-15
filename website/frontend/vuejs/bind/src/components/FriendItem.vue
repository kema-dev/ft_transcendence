<template>
	<div class="friend_case space-between row">
		<div class="center row">
			<router-link
				class="center"
				:to="{ name: 'player', params: { name: friend.login } }"
			>
				<img :src="friend.avatar" class="avatar" alt="avatar" />
			</router-link>
			<div class="center column">
				<slot name="content"></slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Socket } from "engine.io-client";
import { inject, defineProps } from "vue";
let socket: Socket = inject("socket")!;
let me = inject("user")!;
let define = inject("colors");
const props = defineProps(["friend"]);
</script>

<style scoped>
.friend_case {
	width: 95%;
	height: 80px;
	background: #fff;
	border: solid 1px #ccc;
	border-radius: 100px;
	margin: 5px 0;
	padding-right: 3px;
	padding-left: 10px;
	font-size: 1.2rem;
	outline: none;
	box-shadow: 0px 0px 5px #aaa;
}
.avatar {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	margin-right: 10px;
	box-shadow: 0px 1px 5px #333;
}
/* .avatar_case {
	border: 1px solid #333;
	border-radius: 10px;
	border-corner-shape: 1px curve #333;
	height: 30px;
	width: 30px;
} */
</style>

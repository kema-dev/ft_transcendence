<template>
	<div class="friend_case left_center row">
		<router-link
			class="center"
			:to="{ name: 'player', params: { name: friend.login } }"
		>
			<img :src="friend.avatar" class="avatar" alt="avatar" />
		</router-link>
		<slot name="content"></slot>
	</div>
</template>

<script setup lang="ts">
import { Socket } from "engine.io-client";
import { inject, defineProps } from "vue";
let socket: Socket = inject("socket")!;
let me = inject("user")!;
let colors = inject("colors");
const props = defineProps(["friend"]);
</script>

<style scoped>
.friend_case {
	width: 110%;
	height: 80px;
	background: #fff;
	border: solid 1px #ccc;
	border-radius: 100px;
	margin: 5px 0;
	padding-right: 3px;
	padding-left: 4px;
	font-size: 1.2rem;
	outline: none;
	/* box-shadow: 0px 0px 5px #aaa; */
	border: 2px solid v-bind("colors.color2");
}
.avatar {
	width: 70px;
	height: 70px;
	border-radius: 50%;
	margin-right: 5px;
	object-fit: cover;
	/* box-shadow: 0px 1px 5px #333; */

}
</style>

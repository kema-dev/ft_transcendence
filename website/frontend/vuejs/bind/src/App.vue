<template>
	<div>
		<router-view />
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import { provide, ref } from "vue";
import User from "@/chat/User";



let me = new User("Totolosa", require("@/assets/avatars/(1).jpg"));
me.friends.push(new User("Myfriend", require("@/assets/avatars/(6).jpg")));
provide("me", me);
provide("playing", false);
provide("colors", {
	color0: "#fff",
	color1: "#000",
	color2: "#16638D",
	color3: "#E5F4FB",
});
</script>

<style>
* {
	border: 0;
	font-size: 100%;
	font-family: inherit;
	text-decoration: none;
}
*,
::before,
::after {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}
div {
	width: 100%;
	align-items: center;
}
h1 {
	font-family: "Orbitron", sans-serif;
	font-size: 2rem;
}
h2 {
	font-family: "Orbitron", sans-serif;
	font-size: 1rem;
}
h3 {
	font-family: "Orbitron", sans-serif;
	font-size: 0.8rem;
}
button {
	cursor: pointer;
	background: none;
	font-family: "Orbitron", sans-serif;
	font-size: 1rem;
}
a {
	color: black;
}
.column {
	flex-direction: column;
}
.row {
	flex-direction: row;
}
.center {
	display: flex;
	justify-content: center;
	align-items: center;
}
.left {
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
}
.left_center {
	display: flex;
	justify-content: flex-start;
	align-items: center;
}
.right {
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
}
.space-between {
	display: flex;
	justify-content: space-between !important;
	align-items: center;
}
.space-around {
	display: flex;
	justify-content: space-around !important;
	align-items: center;
}
.stack {
	position: relative;
}
.wrap {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: row;
}
.border {
	border: 1px solid black
}
@media screen and (max-width: 1000px) {
	.wrap {
		flex-direction: column;
	}
}
</style>

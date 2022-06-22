<template>
	<div>
		<router-view />
	</div>
</template>

<script setup lang="ts">
import { provide } from "vue";
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
h1 {
	font-family: "Orbitron", sans-serif;
}
h2 {
	font-family: "Orbitron", sans-serif;
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
	width: 100%;
}
.row {
	flex-direction: row;
	width: 100%;
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
.right {
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
}
.space-between {
	display: flex;
	justify-content: space-between !important;
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
@media screen and (max-width: 1000px) {
	.wrap {
		flex-direction: column;
	}
}
</style>

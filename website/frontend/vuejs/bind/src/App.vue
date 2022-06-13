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
}
button {
	cursor: pointer;
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

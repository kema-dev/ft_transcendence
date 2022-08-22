<template>
	<div id="blockAdvert_view" class="center">
		<div class="blockAdvert center column">
			<img :src="img" alt="Warning" class="warning_img">
			<span class="blockAdvertText">{{msg}}</span>
			<slot name="buttons"></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { anyTypeAnnotation } from "@babel/types";
import { inject, defineProps } from "vue";
let define = inject("colors");
let props = defineProps({
	img: String,
	msg: String,
})

</script>

<style>
#blockAdvert_view {
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	background-color: rgba(0, 0, 0, 0.3);
	position: absolute;
	top: 0;
	z-index: 2;
}
.blockAdvert {
	width : 80%;
	height: auto;
	padding: 15px;
	background-color: #fff;
	color: black;
	border-radius: 10px;
	white-space: pre-line;
}
.warning_img {
	height: 40px;
	width: 40px;
}
.blockAdvertText {
	margin: 10px 0;
}
.blockAdvertButtons > button {
	padding: 5px;
	margin: 0 5px;
	color: #fff;
	background-color: v-bind("define.color2");
	border-radius: 10px;
}
</style>
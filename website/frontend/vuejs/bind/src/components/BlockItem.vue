<template>
	<div id="blockAdvert_view" class="center">
		<div class="blockAdvert center column">
			<img src="~@/assets/warning_logo.png" alt="Warning" class="warning_img">
			<span class="blockAdvertText">
				<b>Are you sure to block this User?</b><br>You will not receive message from him/her anymore
			</span>
			<div class="blockAdvertButtons center raw">
				<button>Yes</button>
				<button @click="hideAdvert">No</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject } from "vue";
let define = inject("colors");
function hideAdvert () {
	let advert = document.getElementById("blockAdvert_view");
	if (advert != null) {
		advert.style.setProperty('visibility', 'hidden');
	}
}
</script>

<style scoped>
#blockAdvert_view {
	visibility: hidden;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.3);
	position: absolute;
	top: 0;
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
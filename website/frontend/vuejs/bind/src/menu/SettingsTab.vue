<template>
	<div height="100vh" class="column center">
		<div v-on:click="change_avatar" id="avatar">
			<img src="@/assets/avatars/(1).jpg" id="img" />
		</div>
		<input id="none" type="file" />
		<h1>{{user.name}}</h1>
		<h2>level {{user.level}}</h2>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
let user = {
	name: "zeus",
	level: "1000",
	avatar: require("@/assets/avatars/(2).jpg"),
	friends: ["Jane", "John", "Jacksdfgtertwdsfadfsafdertert"],
};
onMounted(() => {
	let input = document.querySelector("#none");
	input?.addEventListener("change", () => {
		const reader = new FileReader();
		reader.addEventListener("load", () => {
			const uploaded_image = reader.result;
			document.querySelector("#img").src = `${uploaded_image}`;
		});
		reader.readAsDataURL(input.files[0]);
	});
});
function change_avatar() {
	let input = document.querySelector("#none");
	input.click();
}
</script>

<style scoped>
#avatar {
	width: 40%;
	margin: 20px;
	border-radius: 50%;
	box-shadow: 0px 2px 5px #333;
	cursor: pointer;
	vertical-align: middle;
	/* background-image: url("@/assets/avatars/(1).jpg"); */
	/* background-size: 100%; */
	/* height: 40%; */
	/* padding-top: 40%; */
}
#img {
	vertical-align: middle;
	width: 100%;
	border-radius: 50%;
}
#none {
	display: none;
}
</style>

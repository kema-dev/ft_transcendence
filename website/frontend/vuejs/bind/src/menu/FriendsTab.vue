<template>
	<div height="100vh">
		<div class="center row">
		<input type="text" placeholder="Recherche" class="search"/>
		<button class="search_button">go</button>
		</div>
	</div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.search {
	width: 90%;
	height: 50px;
	background: #fff;
	border: solid 1px #ccc;
	border-radius: 5px;
	margin: 15px 0;
	padding-left: 10px;
	font-size: 1.2rem;
	outline: none;
}
.search_button {
	width: 8%;
	height: 50px;
	background: #fff;
	border: solid 1px #ccc;
	border-radius: 5px;
	margin: 15px 0;
	font-size: 1.2rem;
	outline: none;
}
</style>

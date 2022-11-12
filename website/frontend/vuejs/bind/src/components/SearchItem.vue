<template>
	<div class="search_groupe center row stack">
		<input
			:value="search"
			placeholder="Search"
			id="search"
			@input="$emit('update:search', $event.target!.value)"
		/>
	</div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, onMounted } from 'vue';

const props = defineProps({
	search: String,
});

defineEmits(['update:search']);

onMounted(() => {
	document.getElementById('search')?.focus();
});
</script>

<style scoped>
.search_groupe {
	margin-top: 5px;
	width: 70%;
}
#search {
	top: 0px;
	width: 90%;
	height: 40px;
	background-image: url('~@/assets/logo_search.png');
	background-position: left 10px top 50%;
	background-size: 20px 20px;
	background-repeat: no-repeat;
	border: solid 1px #ccc;
	border-radius: 12px;
	padding-left: 40px;
	margin: 15px 0;
	margin-right: 2%;
	font-size: 1rem;
	outline: none;
	box-shadow: 0px 0px 4px #aaa;
}
.reset_button {
	position: absolute;
	right: 10%;
}
.reset_button_img {
	height: 15x;
	width: 15px;
}
</style>

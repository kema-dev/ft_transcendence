<template>
	<div>

		<div v-if="playing == false" class="center">
			<h3>Not actually playing ...</h3>
			<button></button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute();

let playing = false;


</script>

<style>

</style>
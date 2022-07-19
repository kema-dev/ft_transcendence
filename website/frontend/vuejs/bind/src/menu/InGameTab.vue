<template>
	<div>
		<p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eligendi suscipit fugiat autem dolorum atque quaerat ipsam minima soluta cum mollitia consectetur voluptate nemo dolore est vel, totam cumque commodi saepe?</p>
		<p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eligendi suscipit fugiat autem dolorum atque quaerat ipsam minima soluta cum mollitia consectetur voluptate nemo dolore est vel, totam cumque commodi saepe?</p>
		<p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eligendi suscipit fugiat autem dolorum atque quaerat ipsam minima soluta cum mollitia consectetur voluptate nemo dolore est vel, totam cumque commodi saepe?</p>
		<h2>test 1 2</h2>
		<h2>test 1 2</h2>
		<h2>test 1 2</h2>
		<h2>test 1 2</h2>
		<h1>{{route.params.name}}</h1>
	</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute();
</script>

<style>

</style>
<template>
    <div>
		<h1>test: {{test}}</h1>
    </div>
</template>

<script setup lang="ts">
import { inject, defineProps } from 'vue'
import { useRoute } from 'vue-router'
let define = inject('colors');
const route = useRoute()
const props = defineProps(['player'])
let test = route.params.player
console.log(route.params.player)
</script>

<style scoped>

</style>

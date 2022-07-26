<template>
	<div>
		<h1>{{route.params.conv_name}} route</h1>
		<h1>{{route.params.conv}} route2</h1>
		<h1>{{conv?.user?.name}} props</h1>
	</div>
</template>

<script setup lang="ts">
import { inject, defineProps, onMounted, ref } from "vue";
import { useRoute } from 'vue-router';
import Conversation from '@/chat/Conversation';

const route = useRoute();
const props = defineProps({
  conv: Conversation
})
console.log(props.conv);
</script>

<style scoped>

</style>
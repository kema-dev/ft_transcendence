<template>
    <div>
			<h1 v-if="!lobbys.length">No lobby</h1>
			<div v-for="lobby in lobbys" :key="lobby.lobby_name" class="center">
				<LobbyItem :lobby="lobby"></LobbyItem>
			</div>
    </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, provide, Ref, ref } from 'vue';
import { Socket } from 'socket.io-client';
import LobbyItem from '../components/LobbyItem.vue';

let define = inject('colors');
let socket: Socket = inject('socket')!;
let lobbys = ref([]);
socket.on('lobbys', (data: any) => {
	lobbys.value = data;
});
socket.emit('lobbys');

</script>

<style scoped>

</style>

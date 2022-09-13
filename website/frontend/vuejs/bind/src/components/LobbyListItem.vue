<template>
	<div class="wrap">
		<p class="title">Matchmaking</p>
		<div v-for="lobby in lobbies" :key="lobby.name">
			<div class="lobby">
				<div class="lobby-name">
					{{ lobby.name }}
				</div>
				<div class="lobby-players">
					<div v-for="player in lobby.players" :key="player">
						{{ player }}
					</div>
				</div>
				<div class="lobby-join">
					<button @click="join(lobby.name)">join</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, provide, ref } from "vue";
import { Socket } from "socket.io-client";
import { VueCookies } from "vue-cookies";
import { useToast } from "vue-toastification";
const toast = useToast();

let define = inject("colors");
let socket: Socket = inject("socket")!;
const $cookies = inject<VueCookies>('$cookies'); 

const test_lobby = {
	name: "test",
	players: ["test1", "test2", "test3"],
}

let lobbies = ref([test_lobby]);

onMounted(() => {
	socket.emit("lobby_list", {username: $cookies.get("login")});
	socket.on("lobby_list", (data: any) => {
		lobbies.value = data.lobbies;
	});
});

function join(name: string) {
	socket.emit("join_lobby", {username: $cookies.get("login"), lobby: name});
	socket.on("join_lobby", (data: any) => {
		if (data.status == "ok") {
			toast.success("You've joined the lobby " + name);
		} else {
			toast.error("Unable to join the lobby " + name);
		}
	});
}
</script>

<style>
body {
	font-family: "Roboto", sans-serif;
}
.lobby {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 80px;
	margin: 10px;
	border-radius: 10px;
	background-color: #222;
}
.lobby-name {
	width: 200px;
	padding: 0 10px;
}
.lobby-players {
	width: 200px;
	padding: 0 10px;
}
.lobby-join {
	width: 200px;
	padding: 0 10px;
}
</style>

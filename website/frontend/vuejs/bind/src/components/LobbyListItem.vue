<template>
	<div class="wrap">
		<nav>
			<ul class="dropdown">
				<li class="drop"><a>LOBBIES</a>
					<ul class="sub_menu">
						<li v-for="lobby in lobbies" v-bind:key="lobby.lobby_name" v-on:click="join(lobby.lobby_name)"><a>{{ lobby.lobby_name }}</a></li>
					</ul>
				</li>
			</ul>
		</nav>
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

let lobbies = ref([]);
let lobby_name = ref($cookies.get("login") + "'s lobby");

onMounted(() => {
	socket.emit("lobby_list");
	socket.on("lobby_list", (data: any) => {
		lobbies.value = data;
	});
});

function join(id: string) {
	socket.emit("join_lobby", {username: $cookies.get("login"), lobby: id});
	socket.on("join_lobby", (data: any) => {
		if (data.status == "ok") {
			toast.success("You've joined the lobby " + id);
		} else {
			toast.error("Unable to join the lobby " + id);
		}
	});
}
</script>

<style>

.dropdown {
	top: 60px;
	left: 0;
	list-style: none;
	margin: 0;
	padding: 0;
	position: fixed;
	display: inline-block;
}

.dropdown li {
	display: inline-block;
}

.dropdown li a {
	display: block;
	padding: 10px 20px;
	color: #000;
	text-decoration: none;
}

.dropdown li a:hover {
	background: #16638d;
}

.dropdown li:hover .sub_menu {
	display: block;
}

.sub_menu {
	list-style: none;
	margin: 0;
	padding: 0;
	position: absolute;
	display: none;
	background: #16638dd7;
	border-radius: 0 0 5px 5px;
	overflow: scroll;
	height: calc(100vh - 65px);
}

.sub_menu li {
	display: block;
}

.sub_menu li a {
	display: block;
	padding: 10px 20px;
	text-decoration: none;
	color: #000;
}

.sub_menu li a:hover {
	background: #16638d;
}

</style>

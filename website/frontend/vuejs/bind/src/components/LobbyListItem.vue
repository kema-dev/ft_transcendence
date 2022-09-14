<template>
	<div class="wrap">
		<nav>
			<ul class="dropdown">
				<li class="drop"><a href="#">LOBBIES</a>
					<ul class="sub_menu">
						<li><a href="#">Lorem</a></li>
						<li><a href="#">Ipsum</a></li>
						<li><a href="#">Dolor</a></li>
						<li><a href="#">Lipsum</a></li>
						<li><a href="#">Consectetur </a></li>
						<li><a href="#">Duis</a></li>
						<li><a href="#">Sed</a></li>
						<li><a href="#">Natus</a></li>
						<li><a href="#">Excepteur</a></li>
						<li><a href="#">Voluptas</a></li>
						<li><a href="#">Voluptate</a></li>
						<li><a href="#">Malorum</a></li>
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
	background: #16638d81;
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

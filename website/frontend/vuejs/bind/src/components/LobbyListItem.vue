<template>
	<div class="wrap">
		<nav>
			<ul class="dropdown">
				<li class="drop">
					<a>LOBBIES</a>
					<ul class="sub_menu">
						<li
							v-for="lobby in lobbies"
							v-bind:key="lobby.lobby_name"
							v-on:click="join(lobby.lobby_name)"
						>
							<a>{{ lobby.lobby_name }}</a>
						</li>
					</ul>
				</li>
			</ul>
		</nav>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, provide, defineProps, ref, Ref } from 'vue';
import { Socket } from 'socket.io-client';
import { VueCookies } from 'vue-cookies';
import { useToast } from 'vue-toastification';
import API from './axios';
const toast = useToast();

let define = inject('colors');
let socket: Socket = inject('socket')!;
const $cookies = inject<VueCookies>('$cookies');

let lobby_name = ref($cookies.get('login') + "'s lobby");
let lobbies = ref([]);

let start: Ref = inject('playing');
let isCreate: Ref = inject('isCreate');

let start: Ref = inject('playing');
let isCreate: Ref = inject('create');

onMounted(() => {
	socket.off('lobby_list');
	socket.on('lobby_list', (data: any) => {
		lobbies.value = data;
	});
	socket.emit('lobby_list');
});

async function join(lobby_name: string) {
	socket.emit('join_lobby', {
		login: $cookies.get('login'),
		lobby: lobby_name,
	});
	isCreate.value = true;
	start.value = true;
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

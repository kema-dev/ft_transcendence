<template>
	<div class="friendInfoCont center column">
		<div class="space-between raw">
			<h2 @click="toProfile(friend.login)" class="name">
				{{ friend.login }}
			</h2>
			<button
				class="action"
				style="margin-right: 10px"
				@click="remove_friend(friend.login)"
			>
				X
			</button>
		</div>
		<div class="space-between raw">
			<div class="left column">
				<h3 class="text">level {{ friend.level }}</h3>
				<h3 v-if="statusDone" class="status">
					{{ status ? "online" : "offline" }}
				</h3>
			</div>
			<div class="btns center raw">
				<button @click="inviteGame(user.login)" class="btnCont center">
					<img src="@/assets/ball_logo.svg" class="btnImg">
				</button>
				<button @click="toChat(user.login)" class="btnCont center">
					<img src="@/assets/chat.svg" class="btnImg">
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineProps, inject, onMounted, onUnmounted, ref, Ref } from "vue";
import { Socket } from 'engine.io-client';
import router from "@/router";

let colors = inject("colors");
let me = inject("user")!;
const socket: Socket = inject('socket')!;
const props = defineProps(["friend"]);
let statusColor = {
	online: "green",
	offline: "red",
	"in game": "orange",
};
let status: Ref<boolean> = ref(false);
const statusDone : Ref<boolean> = ref(false);

function remove_friend(name: string) {
	socket.emit("removeFriend", { sender: me.value.login, receiver: name });
}

function toProfile(login: string) {
	router.push({name: 'player', params: {name: login}})
}

onMounted(() => {
	socket.on("userStatus", (data: {user: string, status: boolean}) => {
		if (data.user == props.friend.login) {
			status.value = data.status;
			statusDone.value = true;
		}
	});
	socket.emit("userStatus", props.friend.login);
})

onUnmounted(() => {
	socket.off('userStatus');
})
</script>

<style>
.friendInfoCont {
	max-width: calc(100% - 75px);
}
.status {
	/* margin: 0 9px; */
	color: white;
	padding: 0 5px;
	border-radius: 5px;
	background-color: v-bind((status ? "green" : "red"));
}
.action {
	margin: 0 3px;
	padding: 2px 6px;
	border-radius: 10px;
}
.action:hover {
	background-color: v-bind("colors.color2");
	color: white;
	box-shadow: 0px 0px 4px #aaa;
}
.loginLevelCont {
	/* max-width: 20%; */
	/* max-width: 100px; */
	width: fit-content;
}
.name {
	width: auto;
	max-width: 80%;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	text-align: left;
	cursor: pointer;
}
.text {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	text-align: left;
	/* width: 7rem; */
}
</style>

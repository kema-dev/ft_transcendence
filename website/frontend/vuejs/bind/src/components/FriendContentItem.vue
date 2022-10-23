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
			<h3 class="text">level {{ friend.level }}</h3>
			<h3
				class="status"
				:style="'background-color: ' + statusColor[friend.status] + ';'"
			>
				{{ friend.status }}
			</h3>
		</div>
		<div class="space-between row">
			<!-- <div class="left row"> -->
			<h2 class="score">{{ friend.rank }}</h2>
			<!-- <h2 class="score">{{friend.ratiov}} | {{friend.ratiod}}</h2> -->
			<!-- </div> -->
			<div class="right row" style="margin-right: 7px">
				<button v-if="friend.status == 'in game'" class="action">
					watch
				</button>
				<button class="action">play</button>
				<button class="action">chat</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineProps, inject } from "vue";
import { Socket } from "engine.io-client";
import router from "@/router";

let me = inject("user")!;
let socket: Socket = inject("socket")!;
const props = defineProps(["friend"]);
let statusColor = {
	online: "green",
	offline: "red",
	"in game": "orange",
};

function remove_friend(name: string) {
	socket.emit("removeFriend", { sender: me.value.login, receiver: name });
}

function toProfile(login: string) {
	router.push({name: 'player', params: {name: login}})
}
</script>

<style>
.friendInfoCont {
	max-width: calc(100% - 75px);
}
.status {
	margin: 0 9px;
	color: white;
	padding: 0 5px;
	border-radius: 5px;
}
.action {
	margin: 0 3px;
	padding: 2px 6px;
	/* background-color: v-bind("define.color3"); */
	border-radius: 10px;
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

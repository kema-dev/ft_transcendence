<template>
	<div class="space-between left row">
		<div class="left column">
			<router-link
				:to="{
					name: 'player',
					params: { name: friend.login },
				}"
				><h2 class="name">
					{{ friend.login }}
				</h2></router-link
			>
			<h3 class="text">level {{ friend.level }}</h3>
		</div>
		<div class="right column">
			<button
				class="action"
				style="margin-right: 10px"
				@click="remove_friend(friend.login)"
			>
				X
			</button>
			<h3
				class="status"
				:style="'background-color: ' + statusColor[friend.status] + ';'"
			>
				{{ friend.status }}
			</h3>
		</div>
	</div>
	<div class="space-between row">
		<!-- <div class="left row"> -->
		<h2 class="score">{{ friend.rank }}</h2>
		<!-- <h2 class="score">{{friend.ratiov}} | {{friend.ratiod}}</h2> -->
		<!-- </div> -->
		<div class="right row" style="margin-right: 7px">
			<button v-if="friend.status == 'in game'" class="action">
				watch game
			</button>
			<button class="action">invit</button>
			<button class="action">chat</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineProps, inject } from "vue";
import { Socket } from "engine.io-client";

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
</script>

<style>
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
.name {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	width: 8.5rem;
	text-align: left;
}
.text {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	width: 7rem;
	text-align: left;
}
</style>

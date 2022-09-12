<template>
	<div
		class="friend_case space-between row"
	>
		<div class="center row">
			<router-link :to="{name: 'player', params: {name: friend.login}}"><img :src="friend.avatar" class="avatar" alt="avatar" /></router-link>
			<div class="center column">
				<div class="space-between left row">
					<div class="left column">
						<router-link :to="{name: 'player', params: {name: friend.login}}"><h2 class="name">{{ friend.login }}</h2></router-link>
						<h3 class="text">level {{ friend.level }}</h3>
					</div>
					<div class="right column">
						<button
							class="action"
							v-on:click="remove_friend(friend.login)"
						>
							X
						</button>
						<h3 class="status" v-if="bool">{{ friend.status }}</h3>
					</div>
				</div>
				<div class="space-between row">
				<!-- <div class="left row"> -->
					<h2 class="score">{{friend.rank}}</h2>
					<!-- <h2 class="score">{{friend.ratiov}} | {{friend.ratiod}}</h2> -->
				<!-- </div> -->
				<div class="right row">
					<button class="action" v-on:click="add_friend(friend.login)" v-if="!bool">add friend</button>
					<button class="action">invit</button>
					<button class="action" v-if="bool">chat</button>
				</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Socket } from 'engine.io-client';
import { inject, defineProps } from "vue";
let socket: Socket = inject('socket')!;
let me = inject('user')!;
let define = inject("colors");
const props = defineProps(['friend', 'bool'])

function add_friend(name: string) {
	socket.send('addFriend', {sender: me.login, reciever: name})
}
function remove_friend(name: string) {
	name;
}
</script>

<style scoped>
.friend_case {
	width: 95%;
	height: 80px;
	background: #fff;
	border: solid 1px #ccc;
	border-radius: 12px;
	margin: 5px 0;
	padding-right: 3px;
	padding-left: 10px;
	font-size: 1.2rem;
	outline: none;
	box-shadow: 0px 0px 5px #aaa;
}
.status {
	margin: 0 9px;
}
.score {
	font-weight: 500;
}
/* .avatar_case {
	border: 1px solid #333;
	border-radius: 10px;
	border-corner-shape: 1px curve #333;
	height: 30px;
	width: 30px;
} */
.avatar {
	width: 55px;
	height: 55px;
	border-radius: 50%;
	margin-right: 10px;
	box-shadow: 0px 2px 5px #333;
}
.friend_right {
	padding: 5px;
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
}</style>

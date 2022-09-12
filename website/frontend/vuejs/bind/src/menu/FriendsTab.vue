<template>
	<div>
		<div class="center column">
			<!-- <div class="search_groupe center row">
				<input
					type="text"
					placeholder="Recherche"
					id="search"
					ref="search"
				/>
				<button>
					<span class="material-symbols-outlined icon_search">
						search
					</span>
				</button>
			</div> -->
			<!-- <SearchItem v-model="search"/> -->
			<input type="text" placeholder="Recherche" id="search" ref="search" />
			<div v-if="search.value == ''" class="column center">
			<div v-if="me?.requestFriend.length != 0">
				<h2>Friend request</h2>
				<div v-for="friend in me?.requestFriend" :key="friend.login">
					<h2>{{ friend.login }}</h2>
				</div>
			</div>
				<!-- <div class="center column"> -->
				<h2 v-if="me?.friends.length == 0">No friends</h2>
				<div
					v-for="friend of me?.friends"
					v-bind:key="friend.login"
					class="row center"
				>
					<div
						class="center column"
					>
						<FriendItem :friend="friend" :bool="true"/>
					</div>
					<!-- </div> -->
				</div>
			</div>
			<div v-else class="center column">
				<h2 v-if="users.length == 0">No user</h2>
				<div
					v-else
					v-for="user in users"
					:key="user.login"
					class="row center"
				>
					<FriendItem :friend="user" :bool="false"/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { inject, onMounted, onUnmounted, Ref, ref } from "vue";
import FriendItem from "@/components/FriendItem.vue";
import SearchItem from "@/components/SearchItem.vue";
import { FQDN } from "../../.env.json";
import User from "@/chat/User";
import { Socket } from "engine.io-client";

let define = inject("colors");
let me = inject("user")!;
let socket: Socket = inject("socket")!;
let users = ref([]);
const search = ref("");
onMounted(() => {
socket.on("getUsersByLoginFiltred", (data: User[]) => {
	users.value = data;
	console.log(users);
});
	let input = document.getElementById("search");
	if (input == null) console.log("error");
	input?.addEventListener("input", (str) => {
		if (input.value == null) {
			search.value = "";
			return;
		}
		search.value = input.value;
		if (search.value != "") {
			// users.value = post('user/getUsers', search.value);
			socket.emit("getByLoginFiltred", search.value);
		}
	});
});
onUnmounted(() => {
	socket.off("getUsersByLoginFiltred");
})
// function search_user(str: string) {
// 	users.forEach((u) => u.name == str);
// }
</script>

<style scoped>
.search_groupe {
	margin-top: 5px;
	width: 90%;
}
#search {
	/* position: absolute; */
	top: 0px;
	width: 80%;
	height: 40px;
	background: #fff;
	border: solid 1px #ccc;
	border-radius: 12px;
	padding-left: 10px;
	margin: 15px 0;
	margin-right: 2%;
	font-size: 1.2rem;
	outline: none;
	box-shadow: 0px 0px 4px #aaa;
}
.icon_search {
	font-size: 2rem;
}
</style>

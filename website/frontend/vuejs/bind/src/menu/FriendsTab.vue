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
			<div v-if="me.requestFriend.length != 0">
				<h2>Friend request</h2>
				<div v-for="friend in me.requestFriend" :key="friend.login">
					<h2>{{ friend.login }}</h2>
				</div>
			</div>
				<!-- <div class="center column"> -->
				<h2 v-if="me.friends.length == 0">No friends</h2>
				<div
					v-for="friend in users"
					v-bind:key="friend.login"
					class="row center"
				>
					<div
						v-if="me.friends.includes(friend)"
						class="center column"
					>
						<FriendItem :friend="friend" />
					</div>
					<!-- </div> -->
				</div>
			</div>
			<div v-else class="center column">
				<h2>{{users.length}}</h2>
				<h2 v-if="users.length == 0">No user</h2>
				<div
					v-else
					v-for="user in users"
					v-bind:key="user.login"
					class="row center"
				>
					<FriendItem :friend="user" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { inject, onMounted, ref } from "vue";
import FriendItem from "@/components/FriendItem.vue";
import SearchItem from "@/components/SearchItem.vue";
import { FQDN } from "../../.env.json";
import User from "@/chat/User";
import { Socket } from "engine.io-client";

let define = inject("colors");
let me: User = inject("me")!;
let socket: Socket = inject("socket")!;
let users = ref([]);
const search = ref("");
socket.on("getUsersByLoginFiltred", (data: User[]) => {
	users.value = data;
	console.log(users);
});
onMounted(() => {
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
// function search_user(str: string) {
// 	users.forEach((u) => u.name == str);
// }
function post(url: string, args: any) {
	let data;
	axios
		.post(FQDN + ":3000/api/v1/" + url, args)
		.then((response) => {
			data = response.data;
			console.log(url + ": ", data);
		})
		.catch((error) => {
			console.log(url + ": failed request.\nargs: " + args);
			console.log(error);
		});
	return data;
}

// let userr = post("user/getUser", {login: user.name});
// let avatar = post("user/getAnyByLogin", {
// 	login: user.name,
// 	infos: ["avatar"],
// });
// let users = [
// 	{
// 		login: "John",
// 		level: "25",
// 		avatar: require("@/assets/avatars/(1).jpg"),
// 		friends: ["Jane"],
// 		status: "offline",
// 		rank: "1st",
// 		ratiov: "10",
// 		ratiod: "5",
// 	},
// 	{
// 		name: "Jane",
// 		level: "24",
// 		avatar: require("@/assets/avatars/(2).jpg"),
// 		friends: ["Jill"],
// 		status: "online",
// 		rank: "2st",
// 		ratiov: "10",
// 		ratiod: "5",
// 	},
// 	{
// 		login: "Jacksdfgtertwdsfadfsafdertert",
// 		level: "2365464654654654646546546545",
// 		avatar: require("@/assets/avatars/(3).jpg"),
// 		status: "in game",
// 		rank: "3st",
// 		ratiov: "10",
// 		ratiod: "5",
// 	},
// 	{
// 		name: "Jill",
// 		level: "2",
// 		avatar: require("@/assets/avatars/(4).jpg"),
// 		friends: ["Jane", "Jacksdfgtertwdsfadfsafdertert"],
// 		status: "online",
// 		rank: "4st",
// 		ratiov: "10",
// 		ratiod: "5",
// 	},
// 	{
// 		name: "Joe",
// 		level: "21",
// 		avatar: require("@/assets/avatars/(5).jpg"),
// 		friends: ["Jane", "Jacksdfgtertwdsfadfsafdertert"],
// 		status: "online",
// 		rank: "5st",
// 		ratiov: "10",
// 		ratiod: "5",
// 	},
// ];
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

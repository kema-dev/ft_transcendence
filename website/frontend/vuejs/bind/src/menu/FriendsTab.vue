<template>
	<div>
		<div class="center column">
			<!-- <div class="stack"> -->
			<div class="search_groupe center row">
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
			</div>
			<div v-if="search.value == ''" class="column center">
				<!-- <div class="center column"> -->
				<h2 v-if="user.friends.length == 0">No friends</h2>
				<div
					v-for="friend in users"
					v-bind:key="friend.name"
					class="row center"
				>
					<div
						v-if="user.friends.includes(friend.name)"
						class="center column"
					>
						<FriendItem :friend="friend" />
					</div>
					<!-- </div> -->
				</div>
			</div>
			<div v-else class="center column">
				<div
					v-for="friend in users"
					v-bind:key="friend.name"
					class="row center"
				>
					<div class="center row" v-if="friend.name == search.value">
						<div :set="(find = true)" style="display: none"></div>
						<FriendItem :friend="friend" />
					</div>
				</div>
				<h2 v-if="find == false">No user</h2>
				<div :set="(find = false)"></div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { inject, onMounted, ref } from "vue";
import FriendItem from "@/components/FriendItem.vue";
let define = inject("colors");

let find = false;

const search = ref("");
onMounted(() => {
	let input = document.getElementById("search");
	if (input == null) console.log("error");
	input?.addEventListener("input", (str) => {
		if (input.value == null) {
			search.value = "";
			return;
		}
		search.value = input.value;
	});
});

function search_user(str: string) {
	users.forEach((u) => u.name == str);
}
let user = {
	name: "zeus",
	level: "1000",
	avatar: require("@/assets/avatars/(2).jpg"),
	friends: ["Jane", "John", "Jacksdfgtertwdsfadfsafdertert"],
};
let rank = "";
axios
	.get("http://localhost:3000/api/v1/user/getRank", { login: user.name })
	.then((response) => {
		rank = response.data;
		console.log("rank:", rank);
	})
	.catch((error) => {
		console.log(error);
		console.log("rank: failed request");
	});
let users = [
	{
		name: "John",
		level: "25",
		avatar: require("@/assets/avatars/(1).jpg"),
		friends: ["Jane"],
		status: "offline",
		rank: "1st",
		ratiov: "10",
		ratiod: "5",
	},
	{
		name: "Jane",
		level: "24",
		avatar: require("@/assets/avatars/(2).jpg"),
		friends: ["Jill"],
		status: "online",
		rank: "2st",
		ratiov: "10",
		ratiod: "5",
	},
	{
		name: "Jacksdfgtertwdsfadfsafdertert",
		level: "2365464654654654646546546545",
		avatar: require("@/assets/avatars/(3).jpg"),
		status: "in game",
		rank: "3st",
		ratiov: "10",
		ratiod: "5",
	},
	{
		name: "Jill",
		level: "2",
		avatar: require("@/assets/avatars/(4).jpg"),
		friends: ["Jane", "Jacksdfgtertwdsfadfsafdertert"],
		status: "online",
		rank: "4st",
		ratiov: "10",
		ratiod: "5",
	},
	{
		name: "Joe",
		level: "21",
		avatar: require("@/assets/avatars/(5).jpg"),
		friends: ["Jane", "Jacksdfgtertwdsfadfsafdertert"],
		status: "online",
		rank: "5st",
		ratiov: "10",
		ratiod: "5",
	},
];
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

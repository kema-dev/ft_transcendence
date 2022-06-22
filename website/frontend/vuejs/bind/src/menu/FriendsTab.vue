<template>
	<div height="100vh">
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
						class="friend_case space-between row"
						v-if="user.friends.includes(friend.name)"
					>
						<div class="center row">
							<img :src="friend.avatar" class="avatar" alt="avatar" />
							<div class="center column">
								<div class="space-between left row">
									<div class="left column">
										<h2 class="text">{{ friend.name }}</h2>
										<h3 class="text">level {{ friend.level }}</h3>
									</div>
									<button
										class="action"
										v-on:click="remove_friend(friend.name)"
									>
										X
									</button>
								</div>
								<div class="right row">
									<button class="action">invit</button>
									<button class="action">chat</button>
								</div>
							</div>
						</div>
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
					<div
						class="friend_case space-between row"
						v-if="friend.name == search.value"
					>
						<div class="center row">
							<img :src="friend.avatar" class="avatar" alt="avatar" />
							<div class="center column">
								<div class="space-between left row">
									<div class="left column">
										<h2 class="text">{{ friend.name }}</h2>
										<h3 class="text">level {{ friend.level }}</h3>
									</div>
									<button
										class="action"
										v-on:click="remove_friend(friend.name)"
									>
										X
									</button>
								</div>
								<div class="right row">
									<button class="action" v-on:click="add_friend" v-if="!user.friends.includes(friend.name)">add friend</button>
									<button class="action">invit</button>
									<button class="action">chat</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { inject, onMounted, ref } from "vue";
let define = inject("colors");
axios.get("http://localhost:3000/api/v1/");

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
	users.forEach(u => u.name == str)
}
function add_friend(name: string) {
	name;
}
function remove_friend(name: string) {
	name;
}
let user = {
	name: "zeus",
	level: "1000",
	avatar: require("@/assets/avatars/(2).jpg"),
	friends: ["Jane", "John", "Jacksdfgtertwdsfadfsafdertert"],
};
let users = [
	{
		name: "John",
		level: "25",
		avatar: require("@/assets/avatars/(1).jpg"),
		friends: ["Jane"],
	},
	{
		name: "Jane",
		level: "24",
		avatar: require("@/assets/avatars/(2).jpg"),
		friends: ["Jill"],
	},
	{
		name: "Jacksdfgtertwdsfadfsafdertert",
		level: "2365464654654654646546546545",
		avatar: require("@/assets/avatars/(3).jpg"),
	},
	{
		name: "Jill",
		level: "2",
		avatar: require("@/assets/avatars/(4).jpg"),
		friends: ["Jane", "Jacksdfgtertwdsfadfsafdertert"],
	},
	{
		name: "Joe",
		level: "21",
		avatar: require("@/assets/avatars/(5).jpg"),
		friends: ["Jane", "Jacksdfgtertwdsfadfsafdertert"],
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
}
.icon_search {
	font-size: 2rem;
}
.friend_case {
	width: 95%;
	height: 80px;
	background: #fff;
	border: solid 1px #ccc;
	border-radius: 12px;
	margin: 5px 0;
	padding-right: 6px;
	padding-left: 10px;
	font-size: 1.2rem;
	outline: none;
	box-shadow: 0px 0px 5px #aaa;
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
.text {
	overflow: hidden;
	white-space: nowrap; /* Don't forget this one */
	text-overflow: ellipsis;
	width: 12rem;
	text-align: left;
}
</style>

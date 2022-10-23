<template>
	<div class="center">
		<div v-if="userDone" class="center column friend-page">
			<SearchItem v-model:search="search" id="searchItem" />
			<div v-if="search == '' && me.requestFriend.length" class="column center">
				<div class="titleCont left_center">
					<img src="@/assets/notif.svg" class="logo">
					<h2 class="title">Friend request</h2>
				</div>
				<div
					v-for="friend in me.requestFriend"
					:key="friend.login"
					class="column left"
				>
					<div class="requestCont center raw">
						<BasicProfil @click="toProfile(friend.login)" class="basicProfil"
							:avatar="friend.avatar" :login="friend.login"
						/>
						<button @click="acceptFriend(friend.login)" class="friendInvBtn center">
							<img src='@/assets/done.svg' class="acceptImg"/>
						</button>
						<button @click="declineFriend(friend.login)" class="friendInvBtn center">
							<img src='@/assets/close_logo.svg' class="declineImg"/>
						</button>
					</div>
				</div>
			</div>
			<div class="titleCont left_center">
				<img src="@/assets/group2_logo.svg" class="logo">
				<h2 class="title">Friends</h2>
			</div>
			<div v-if="me.friends.length">
				<div
					v-for="friend of me.friends"
					v-bind:key="friend.login"
					class="row center"
				>
					<div class="center column">
						<FriendItem :friend="friend">
							<template #content>
								<FriendContentItem :friend="friend" />
							</template>
						</FriendItem>
					</div>
				</div>
			</div>
			<h2 v-else class="noResults">No friends</h2>
			<div v-if="search.length">
				<div class="titleCont left_center">
					<img src="@/assets/add2_logo.svg" class="logo">
					<h2 class="title">More</h2>
				</div>
				<div v-for="user of users" :key="user.login" class="row center">
					<FriendItem :friend="user">
						<template v-if="myFriend(user.login)" #content>
							<div class="space-between left row">
								<div class="left column">
									<router-link
										:to="{
											name: 'player',
											params: { name: user.login },
										}"
										><h2 class="name">
											{{ user.login }}
										</h2></router-link
									>
									<h3 class="text">level {{ user.level }}</h3>
								</div>
							</div>
							<div class="space-between row">
								<!-- <div class="left row"> -->
								<h2 class="score">{{ user.rank }}</h2>
								<!-- <h2 class="score">{{user.ratiov}} | {{user.ratiod}}</h2> -->
								<!-- </div> -->
								<div class="right row" style="margin-right: 15px">
									<button class="action" @click="add_friend(user.login)">
										add friend
									</button>
									<button class="action">invit</button>
								</div>
							</div>
						</template>
						<template v-else #content>
							<FriendContentItem :friend="user" />
						</template>
					</FriendItem>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, Ref, ref, watch } from 'vue';
import FriendItem from '@/components/FriendItem.vue';
import SearchItem from '@/components/SearchItem.vue';
import { Socket } from 'engine.io-client';
import FriendContentItem from '../components/FriendContentItem.vue';
import BasicProfil from "@/components/BasicProfilItem.vue";
import router from '@/router';


// ==================== INIT ====================

// COMPONENTS VARIABLES
let define = inject('colors');
const myName: string = inject("me")!;
let me = inject('user')!;
let socket: Socket = inject('socket')!;
let notifs: Ref<number> = inject('notifs')!;
let users = ref([]);
let userDone : Ref<boolean> = inject("userDone")!;
const search = ref('');

// SOCKET LISTENERS
socket.on('getUsersByLoginFiltred', (data: any[]) => {
	users.value = data;
	console.log(users);
});

// WATCHERS
watch(search, () => {
	// if (search.value != '') 
		socket.emit('getByLoginFiltred', {me: myName, search: search.value});
})

// ==================== METHODS ====================

function add_friend(name: string) {
	socket.emit('addFriend', { sender: me.value.login, receiver: name });
}
// function remove_friend(name: string) {
// 	socket.emit('removeFriend', { sender: me.value.login, receiver: name });
// }
function acceptFriend(name: string) {
	socket.emit('acceptFriend', { sender: me.value.login, receiver: name });
}
function declineFriend(name: string) {
	socket.emit('declineFriend', { sender: me.value.login, receiver: name });
}
function myFriend(name: string) {
	return !me.value.friends.find((friend) => friend.login == name);
}
function toProfile(login: string) {
	router.push({name: 'player', params: {name: login}})
}


// ==================== LIFECYCLE HOOKS ====================

onUnmounted(() => {
	socket.off('getUsersByLoginFiltred');
});

</script>

<style scoped>
#searchItem {
	margin-top: 20px;
	margin-bottom: -10px;
}
.search_groupe {
	margin-top: 5px;
	width: 90%;
}
.request-button {
	margin: 0 10px;
}
.group_name {
	margin-top: 10px;
}
.icon_search {
	font-size: 2rem;
}
.score {
	font-weight: 500;
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
}
.wrap-request {
	flex-wrap: wrap;
}
.friend-page {
	width: clamp(18rem, 80%, 550px);
}


.separator {
	flex-shrink: 0;
	width: 90%;
	height: 1px;
	background-color: grey;
	margin-top: 30px;
}
.titleCont {
  margin-top: 20px;
  margin-bottom: 15px;
	margin-right: auto;
	margin-left: 10px;
}
.title {
	font-size: 1.2rem;
}
.noResults {
  font-size: 0.9rem;
  margin-top: 20px;
}
.img {
  width: 50px;
  height: 50px;
}
.logo {
  width: 25px;
  height: 25px;
  margin-right: 10px;
  filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}

.requestCont {
	margin: 5px 0;
	height: 2.5rem;
	width: auto;
	padding: 0 4px;
	/* margin-left: 15px; */
	background-color: white;
	border-radius: calc(2.5rem / 2);
	border: 2px solid v-bind("define.color2");
}
.friendInvBtn {
	height: 30px;
	width: 30px;
	margin-left: 10px;
	border-radius: 13px;
}
.friendInvBtn:hover {
	box-shadow: 0px 0px 4px #aaa;
	background-color: white;
}
.acceptImg {
	width: 26px;
	height: 26px;
	filter: invert(44%) sepia(46%) saturate(3108%) hue-rotate(90deg)
		brightness(111%) contrast(110%);
}
.declineImg {
	width: 26px;
	height: 26px;
	filter: invert(40%) sepia(25%) saturate(6663%) hue-rotate(339deg)
		brightness(98%) contrast(106%);
}
.requestCont > .basicProfil > .login {
	max-width: 150px !important;
}
.basicProfil {
	cursor: pointer;
}

</style>

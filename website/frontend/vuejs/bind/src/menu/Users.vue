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
			<div v-if="filterFriends().length || !search.length">
				<div class="titleCont left_center">
					<img src="@/assets/group2_logo.svg" class="logo">
					<h2 class="title">Friends</h2>
				</div>
				<div v-if="filterFriends().length">
					<div
						v-for="friend of filterFriends()"
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
				<h2 v-else-if="!search.length" class="noResults">No friends</h2>
			</div>
			<div v-if="search.length">
				<div class="titleCont left_center">
					<img src="@/assets/add2_logo.svg" class="logo">
					<h2 class="title">More</h2>
				</div>
				<div v-for="user of users" :key="user.login" class="center column">
					<FriendItem :friend="user">
						<template #content>
							<div class="center column">
								<h2 class="name">{{ user.login }}</h2>
								<div class="space-between raw" :style="'margin-top: 10px;'">
									<h3 class="text">level {{ user.level }}</h3>
									<div class="btns center raw">
										<button @click="add_friend(user.login)" class="btnCont center">
											<img src="@/assets/add_friend.svg" class="btnImg">
										</button>
										<button @click="inviteGame(user.login)" class="btnCont center">
											<img src="@/assets/ball_logo.svg" class="btnImg">
										</button>
										<button @click="toChat(user.login)" class="btnCont center">
											<img src="@/assets/chat.svg" class="btnImg">
										</button>
									</div>
								</div>
							</div>


							<!-- <div class="space-between left row">
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
								<h2 class="score">{{ user.rank }}</h2>
								<div class="right row" style="margin-right: 15px">
									<button class="action" @click="add_friend(user.login)">
										add friend
									</button>
									<button class="action">invit</button>
								</div>
							</div> -->
						</template>
						<!-- <template #content>
							<FriendContentItem :friend="user" />
						</template> -->
					</FriendItem>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, Ref, ref, watch } from 'vue';
import { Socket } from 'engine.io-client';
import router from '@/router';
import FriendItem from '@/components/FriendItem.vue';
import SearchItem from '@/components/SearchItem.vue';
import FriendContentItem from '../components/FriendContentItem.vue';
import BasicProfil from "@/components/BasicProfilItem.vue";
import ProfileUserDto from "@/dto/ProfileUserDto";
import ResumUserDto from "@/dto/ResumUserDto";


// ==================== INIT ====================

// COMPONENTS VARIABLES
const colors = inject('colors');
const myName: string = inject("me")!;
const me : Ref<ProfileUserDto>= inject('user')!;
const socket: Socket = inject('socket')!;
const notifs: Ref<number> = inject('notifs')!;
const userDone : Ref<boolean> = inject("userDone")!;
const search = ref('');
const users : Ref<ResumUserDto[]> = ref([]);

// SOCKET LISTENERS
socket.on("getUsersByLoginFiltred", (data: ResumUserDto[]) => {
	users.value = data.filter(user => {
		return !me.value.friends.map(f => f.login).includes(user.login);
	})
});

// WATCHERS
watch(search, () => {
	if (search.value == '')
		users.value = [];
	if (search.value != '') 
		socket.emit('getByLoginFiltred', {me: myName, search: search.value});
})


// ==================== METHODS ====================

function filterFriends() {
	return me.value.friends.filter(friend => {
		return friend.login
			.toUpperCase()
			.startsWith(search.value.toUpperCase());
	});
}

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

function toChat(login: string) {
	router.push({name: 'PrivConv', params: {conv_name: login}})
}


// ==================== LIFECYCLE HOOKS ====================

onUnmounted(() => {
	socket.off('getUsersByLoginFiltred');
});

</script>

<style scoped>
.friend-page {
	width: clamp(18rem, 80%, 550px);
}
#searchItem {
	margin-top: 20px;
	margin-bottom: -10px;
}
.name {
	margin-right: auto;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	text-align: left;
}
.text {
	/* margin-right: auto;

	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis; */
	text-align: left;
}
.score {
	font-weight: 500;
}
.action {
	margin: 0 3px;
	padding: 2px 6px;
	/* background-color: v-bind("define.color3"); */
	border-radius: 10px;
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
	border: 2px solid v-bind("colors.color2");
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
.btns {
	width: 70%;
}
.btnCont {
	width: 30px;
	height: 30px;
	border-radius: 50%;
	margin: 0 4%;
}
.btnImg {
	width: 24px;
	height: 24px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
.btnCont:hover {
	background-color: v-bind("colors.color2");
	box-shadow: 0px 0px 4px #aaa;
}
.btnCont:hover > .btnImg {
	filter: brightness(0) invert(1);
}

</style>

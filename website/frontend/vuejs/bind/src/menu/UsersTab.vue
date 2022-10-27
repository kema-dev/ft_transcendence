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
							<FriendItem :info="friend" :friend="true"/>
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
				<div v-if="users.length" class="center column">
					<FriendItem v-for="user of users" :key="user.login"
						:info="user" :friend="false"
					/>
				</div>
				<h2 v-else class="noResults">No Results</h2>
			</div>

		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, onBeforeUpdate, onMounted, onUnmounted, onUpdated, Ref, ref, watch } from 'vue';
import { Socket } from 'engine.io-client';
import router from '@/router';
import FriendItem from '@/components/FriendItem.vue';
import SearchItem from '@/components/SearchItem.vue';
import BasicProfil from "@/components/BasicProfilItem.vue";
import ProfileUserDto from "@/dto/ProfileUserDto";
import ResumUserDto from "@/dto/ResumUserDto";


// ==================== INIT ====================

// COMPONENTS VARIABLES
const colors = inject('colors');
const myName: string = inject("me")!;
const me : Ref<ProfileUserDto>= inject('user')!;
const socket: Socket = inject('socket')!;
const userDone : Ref<boolean> = inject("userDone")!;
const search = ref('');
const users : Ref<ResumUserDto[]> = ref([]);
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

function acceptFriend(name: string) {
	socket.emit('acceptFriend', { sender: me.value.login, receiver: name });
}

function declineFriend(name: string) {
	socket.emit('declineFriend', { sender: me.value.login, receiver: name });
}

function toProfile(login: string) {
	router.push({name: 'player', params: {name: login}})
}


// ==================== LIFECYCLE HOOKS ====================

onMounted(() => {
	socket.on("getUsersByLoginFiltred", (data: ResumUserDto[]) => {
		users.value = data.filter(user => {
			return !me.value.friends.map(f => f.login).includes(user.login);
		})
	});
})

onUnmounted(() => {
	socket.off('getUsersByLoginFiltred');
});

</script>

<style scoped>
.friend-page {
}
#searchItem {
	margin-top: 20px;
	margin-bottom: -15px;
}
.name {
	margin-right: auto;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	text-align: left;
}
.text {
	text-align: left;
}
.score {
	font-weight: 500;
}
.action {
	margin: 0 3px;
	padding: 2px 6px;
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
	padding-left: 40px;
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
	margin-left: 40px;
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
/* .requestCont > .basicProfil > .login {
	max-width: 170px !important;
} */
.basicProfil {
	cursor: pointer;
}
</style>

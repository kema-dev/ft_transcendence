<template>
	<div class="center">
		<div class="center column friend-page">
			<!-- <div class="search_groupe center row">
				<input
					type="text"
					placeholder="Recherche"
					id="search"
					ref="search"
				/>
				<button>
					<span class="material-symbols-outlined icon_search"> search </span>
				</button>
			</div> -->
			<!-- <SearchItem v-model="search"/> -->

			<!-- <input type="text" placeholder="Recherche" id="search" ref="search" /> -->
			<SearchItem v-model:search="search"/>
			<div v-if="search.value == ''" class="column center">
				<div v-if="me?.requestFriend.length != 0" class="column center">
					<h2>Friend request</h2>
					<div
						v-for="friend in me?.requestFriend"
						:key="friend.login"
						class="column center"
					>
						<FriendItem :friend="friend">
							<template #content>
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
									<div class="center row wrap-request">
										<button
											class="request-button"
											@click="acceptFriend(friend.login)"
										>
											Accept
										</button>
										<button
											class="request-button"
											@click="declineFriend(friend.login)"
										>
											Decline
										</button>
									</div>
								</div>
							</template>
						</FriendItem>
					</div>
				</div>
				<!-- <div class="center column"> -->
				<h2 v-if="me?.friends.length == 0" class="group_name">No friends</h2>
				<h2 v-else class="group_name">Friends</h2>
				<div
					v-for="friend of me?.friends"
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
					<!-- </div> -->
				</div>
			</div>
			<div v-else class="center column">
				<h2 v-if="users.length == 0">No user</h2>
				<div v-else v-for="user of users" :key="user.login" class="row center">
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
import { inject, onMounted, onUnmounted, Ref, ref } from 'vue';
import FriendItem from '@/components/FriendItem.vue';
import SearchItem from '@/components/SearchItem.vue';
import { Socket } from 'engine.io-client';
import FriendContentItem from '../components/FriendContentItem.vue';

let define = inject('colors');
const myName: string = inject("me")!;
let me = inject('user')!;
let socket: Socket = inject('socket')!;
let notifs: Ref<number> = inject('notifs')!;
let users = ref([]);

const search = ref('');
function add_friend(name: string) {
	socket.emit('addFriend', { sender: me.value.login, receiver: name });
	alert('friend request sent');
}
function remove_friend(name: string) {
	socket.emit('removeFriend', { sender: me.value.login, receiver: name });
}
function acceptFriend(name: string) {
	socket.emit('acceptFriend', { sender: me.value.login, receiver: name });
}
function declineFriend(name: string) {
	socket.emit('declineFriend', { sender: me.value.login, receiver: name });
}
function myFriend(name: string) {
	return !me.value.friends.find((friend) => friend.login == name);
}

onMounted(() => {
	socket.on('getUsersByLoginFiltred', (data: any[]) => {
		users.value = data;
		console.log(users);
	});
	let input = document.getElementById('search');
	if (input == null) console.log('error');
	input?.addEventListener('input', (str) => {
		if (input.value == null) {
			search.value = '';
			return;
		}
		search.value = input.value;
		if (search.value != '') {
			// users.value = post('user/getUsers', search.value);
			socket.emit('getByLoginFiltred', {me: myName, search: search.value});
		}
	});
	// notifs.value = 0;
});
onUnmounted(() => {
	socket.off('getUsersByLoginFiltred');
});
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
</style>

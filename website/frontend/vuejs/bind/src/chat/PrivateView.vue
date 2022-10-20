<template>
	<div v-if="privDone" id="private_view" class="center column">
		<div class="toBarCont center raw stack">
			<SearchItem v-model:search="search" />
			<div class="option_buttons space-around raw stack">
				<button @click="createNewMsg()" class="button_cont center">
					<span v-if="!newMsg" class="infoButtonText">New message</span>
					<img
						v-if="!newMsg"
						src="~@/assets/new_msg.svg"
						alt="New message"
						class="button_img"
					/>
					<span v-if="newMsg" class="infoButtonText">Back</span>
					<img
						v-if="newMsg"
						src="~@/assets/undo_logo.svg"
						alt="New message"
						class="button_img"
					/>
				</button>
			</div>
		</div>
		<PlayInvitationItem
			v-for="invit in user_invitations"
			v-bind:match="invit"
			:key="invit.nbrPlayer"
		/>
		<div v-if="!newMsg && userDone" class="myConversations center column">
			<ConversationTab
				v-for="(data, i) in privsFiltred"
				:key="i"
				:name-conv="data.user.login"
				:message="data.messages[data.messages.length - 1].msg"
				:date="new Date(data.messages[data.messages.length - 1].date)"
				:last-msg-user="data.messages[data.messages.length - 1].user"
				:read="data.readed"
				:avatar="data.user.avatar"
				class="center"
			/>
			<!-- <h2 v-else class="comment">No conversations</h2> -->
			<h2 v-if="!privsRef.length" class="comment">No conversations</h2>
			<h2 v-else-if="!privsFiltred.length && search.length" class="comment">
				No results
			</h2>
		</div>
		<div v-if="newMsg" class="newMsgResults">
			<div
				v-if="userDone && knownPeople?.length"
				class="knownPeople left column"
			>
				<h2 class="typeUsers">Friends/conversations</h2>
				<router-link
					v-for="(data, i) in knownPeople"
					:key="i"
					:to="{ name: 'PrivConv', params: { conv_name: data.login } }"
				>
					<BasicProfil :avatar="data.avatar" :login="data.login" />
				</router-link>
			</div>
			<div
				v-if="userServReqDone && search.length > 0 && serverUsers?.length"
				class="otherPeople left column"
			>
				<h2 class="typeUsers">More people</h2>
				<router-link
					v-for="(data, i) in serverUsers"
					:key="i"
					:to="{ name: 'PrivConv', params: { conv_name: data.login } }"
				>
					<BasicProfil :avatar="data.avatar" :login="data.login" />
				</router-link>
			</div>
			<h2
				v-if="!privsFiltred.length && !knownPeople?.length && !search.length"
				class="comment"
			>
				Type in the search bar
			</h2>
			<h2
				v-if="
					userServReqDone &&
					search.length &&
					!serverUsers?.length &&
					!knownPeople?.length
				"
				class="comment"
			>
				No results
			</h2>
		</div>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import {
	inject,
	onMounted,
	ref,
	Ref,
	nextTick,
	onBeforeUnmount,
	watch,
	onUpdated,
} from 'vue';
import ConversationTab from '@/chat/ConversationTab.vue';
import BasicProfil from '@/components/BasicProfilItem.vue';
import SearchItem from '@/components/SearchItem.vue';
import { BasicUserDto } from '@/chat/dto/BasicUserDto';
import { Socket } from 'socket.io-client';
import HTTP from '../components/axios';
import { PrivConvDto } from '@/chat/dto/PrivConvDto';
import { ProfileUserDto } from '@/dto/ProfileUserDto';
import MatchDto from '../dto/MatchDto';
import MatchItem from '../components/MatchItem.vue';
import PlayInvitationItem from '@/components/PlayInvitationItem.vue';

// ================= INIT =================

// INIT COMPONENT VARIABLES
let colors = inject('colors');
let me: Ref<ProfileUserDto> = inject('user')!;
let userDone: Ref<boolean> = inject('userDone')!;
let mySocket: Socket = inject('socket')!;
let apiPath: string = inject('apiPath')!;
const search = ref('');
const newMsg = ref(false);
let userServReqDone = ref(false);
let knownPeople = ref<BasicUserDto[]>();
let serverUsers = ref<BasicUserDto[]>();

// GET PRIVS REFS
let privsRef: Ref<PrivConvDto[]> = inject('privs')!;
let nbPrivNR: { n: Ref<number[]>; reset: () => void } = inject('nbPrivNR')!;
let privsFiltred: Ref<PrivConvDto[]> = ref([]);
const privDone: Ref<boolean> = inject('privDone')!;

let invitations_to_game: Ref<Array<{ login: string; lobby: string }>> = inject(
	'invitations_to_game',
)!;

let user_invitations: Ref<
	Array<{
		name: string;
		player_count: number;
		ball_count: number;
		players: string[];
	}>
> = inject('user_invitations')!;

watch(invitations_to_game.value, (val) => {
	mySocket.off('get_match_infos');
	mySocket.on(
		'get_match_infos',
		(match: {
			nbrPlayer: number;
			nbrBall: number;
			lobby_name: string;
			players: string[];
			owner: string;
		}) => {
			// check if the match is already in the list
			let matchAlreadyInList = false;
			for (let i = 0; i < user_invitations.value.length; i++) {
				if (user_invitations.value[i].name === match.lobby_name) {
					matchAlreadyInList = true;
					break;
				}
			}
			if (!matchAlreadyInList) {
				user_invitations.value.push({
					name: match.lobby_name,
					player_count: match.nbrPlayer,
					ball_count: match.nbrBall,
					players: match.players,
				});
			}
		},
	);
	for (let i = 0; i < invitations_to_game.value.length; i++) {
		mySocket.emit('get_match_infos', invitations_to_game.value[i].lobby);
	}
});

mySocket.off('remove_invit');
mySocket.on('remove_invit', (lobby_name: string) => {
	user_invitations.value = user_invitations.value.filter((invit) => {
		return invit.name !== lobby_name;
	});
	invitations_to_game.value = invitations_to_game.value.filter((invit) => {
		return invit.lobby !== lobby_name;
	});
});

// INIT
if (privDone.value && userDone.value) init();

// INIT IF PAGE REFRESH
watch(privDone, () => {
	if (userDone.value) init();
});
watch(userDone, () => {
	if (privDone.value) init();
});

function init() {
	nbPrivNR.reset();
	privsFiltred.value = privsRef.value;
	// privsFiltred.value = privsRef.value.filter(priv => {
	// 	return !me.value.blockeds.map(b => b.login).includes(priv.user.login)
	// });
	knownPeople.value = setKnownPeople();
	watch(me.value.blockeds, () => {
		console.log(`me.blocked changed`);
		// privsFiltred.value = privsRef.value.filter(priv => {
		// 	!me.value.blockeds.map(b => b.login)
		// 	.includes(priv.user.login)
		// }).filter(priv => {
		// 	return priv.user.login
		// 		.toUpperCase()
		// 		.startsWith(search.value.toUpperCase());
		// });
		privsFiltred.value = privsRef.value.filter((priv) => {
			return priv.user.login
				.toUpperCase()
				.startsWith(search.value.toUpperCase());
		});
	});
}

// ====================== WATCHERS ======================

watch(search, () => {
	userServReqDone.value = false;
	privsFiltred.value = privsRef.value
		// .filter(priv => {
		// 	return !me.value.blockeds.map(b => b.login)
		// 		.includes(priv.user.login)
		// })
		.filter((priv) => {
			return priv.user.login
				.toUpperCase()
				.startsWith(search.value.toUpperCase());
		});
	if (newMsg.value) {
		knownPeople.value = setKnownPeople();
		if (search.value != '') getServerUsers();
	}
});

// ====================== METHODS ======================

function getServerUsers() {
	HTTP.get(
		apiPath +
			'chat/getServerUsersFiltred/' +
			me.value.login +
			'/' +
			search.value,
	)
		.then((res) => {
			serverUsers.value = res.data;
			filterServerUsers();
			userServReqDone.value = true;
		})
		.catch((e) => console.log(e));
}

function filterServerUsers() {
	serverUsers.value = serverUsers.value!.filter((user) => {
		let isAlreadyKnow = true;
		for (let people of knownPeople.value!) {
			if (people.login == user.login) {
				isAlreadyKnow = false;
				break;
			}
		}
		return isAlreadyKnow;
	});
}

function setKnownPeople() {
	// console.log(`setKnowPeople`);
	let convs: BasicUserDto[] = [];
	let friends: BasicUserDto[] = [];
	convs = privsFiltred.value.map(
		(p) => new BasicUserDto(p.user.login, p.user.avatar),
	);
	friends = me.value.friends
		.map((f) => new BasicUserDto(f.login, f.avatar))
		.filter((f) => {
			let notIn = !convs.map((c) => c.login).includes(f.login);
			let notBan = !me.value.blockeds.map((b) => b.login).includes(f.login);
			let startWithSearch = f.login.startsWith(search.value);
			if (notIn && notBan && startWithSearch) return true;
		});
	return convs.concat(friends);
}

function createNewMsg() {
	search.value = '';
	newMsg.value = !newMsg.value;
	knownPeople.value = setKnownPeople();
	nextTick(() => {
		document.getElementById('search')?.focus();
	});
}

// function onlyContBlocked() {
// 	return privsRef.value.every(p => me.value.blockeds
// 		.map(b => b.login).includes(p.user.login));
// }

// ====================== LIFECYCLES HOOKS ======================

onUpdated(() => {
	if (nbPrivNR.n.value.length) nbPrivNR.reset();
});

onMounted(() => {
	const box = document.getElementById('privateTabText');
	if (box != null) box.classList.add('chatTabActive');
});

onBeforeUnmount(() => {
	const box = document.getElementById('privateTabText');
	if (box != null) box.classList.remove('chatTabActive');
});
</script>

<style scoped>
#private_view {
	height: calc(100vh - 180px);
	justify-content: flex-start;
}
.comment {
	margin-top: 1rem;
}
.option_buttons {
	width: 25%;
}
.button_img {
	width: 30px;
	height: 30px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
.button_cont {
	border-radius: 50%;
	padding: 5px;
	/* position: static; */
}
.button_cont:hover {
	background-color: white;
	box-shadow: 0px 0px 4px #aaa;
}

.infoButtonText {
	visibility: hidden;
	font-size: 0.8rem;
	width: auto;
	background-color: rgba(0, 0, 0, 0.6);
	color: #fff;
	text-align: center;
	padding: 5px 0;
	border-radius: 6px;
	position: absolute;
	z-index: 1;
	bottom: 110%;
	right: 0;
	/* transform: translate(50%); */
}
.button_cont:hover .infoButtonText {
	visibility: visible;
	opacity: 0;
	animation: displayButtonInfo 0.3s;
	animation-delay: 0.3s;
	animation-fill-mode: forwards;
}
@keyframes displayButtonInfo {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.newMsgResults {
	width: 90%;
}
.typeUsers {
	margin-top: 15px;
	margin-bottom: 5px;
}

/* TRANSITION ROUTER VIEW */

/* .myFade-enter-active,
.myFade-leave-active {
	transition: opacity 3s ease;
}

.myFade-enter-from,
.myFade-leave-to {
	opacity: 0;
} */
</style>

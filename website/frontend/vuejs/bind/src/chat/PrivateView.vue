<template>
	<!-- <div v-if="initReqDone" id="private_view" class="center column"> -->
	<div v-if="privDone" id="private_view" class="center column">
		<div class="toBarCont center raw stack">
			<!-- <SearchItem @searchInput="searchChange" :key="searchKey" /> -->
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
		<div v-if="!newMsg" class="myConversations center column">
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
			<h2 v-if="privs!.length == 0" class="no_results">No conversations</h2>
			<h2 v-else-if="privsFiltred!.length == 0" class="no_results">
				No results
			</h2>
		</div>
		<div v-if="newMsg" class="newMsgResults">
			<div v-if="privsFiltred.length > 0" class="knownPeople left column">
				<h2 class="typeUsers">Friends/conversations</h2>
				<router-link
					v-for="(data, i) in privsFiltred.slice(0, 5)"
					:key="i"
					:to="{ name: 'PrivConv', params: { conv_name: data.user.login } }"
				>
					<BasicProfil :avatar="data.user.avatar" :login="data.user.login" />
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
			<!-- <h2 v-if="privsFiltred.length == 0 && !serverUsers">
				No results
			</h2> -->
			<h2 v-if="privsFiltred.length == 0 && search.length == 0">
				No conversation yet, search for a new one !
			</h2>
			<h2 v-if="userServReqDone && search.length > 0 && !serverUsers?.length">
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
} from "vue";
/* eslint-disable @typescript-eslint/no-unused-vars */
import ConversationTab from "@/chat/ConversationTab.vue";
import BasicProfil from "@/components/BasicProfilItem.vue";
import SearchItem from "@/components/SearchItem.vue";
import { BasicUserDto } from "@/chat/dto/BasicUserDto";
import { Socket } from "socket.io-client";
import HTTP from "../components/axios";
import { PrivConvDto } from "@/chat/dto/PrivConvDto";
import { ProfileUserDto } from "@/dto/ProfileUserDto"

// INJECTS
let colors = inject("colors");
let me: Ref<ProfileUserDto> = inject("user")!;
let mySocket: Socket = inject("socket")!;
let apiPath: string = inject("apiPath")!;

// let privs : Ref<PrivConvDto[]> = inject("privs")!;
// let nbPrivNR : { n: Ref<number[]>, reset: () => void} = inject("nbPrivNR")!;
let privs: Ref<PrivConvDto[]> = inject("privs")!;
let nbPrivNR: { n: Ref<number[]>; reset: () => void } = inject("nbPrivNR")!;
let privsFiltred = ref(privs.value);
const privDone: Ref<boolean> = inject("privDone")!;
let serverUsers = ref<BasicUserDto[]>();
// let knownPeople = ref<BasicUser[]>();

const search = ref("");
const newMsg = ref(false);
let userServReqDone = ref(false);

if (privs.value.length) {
	nbPrivNR.reset();
}

watch(privDone, () => {
	// console.log(`privDone = ${privDone.value}`);
	privsFiltred.value = privs.value;
	nbPrivNR.reset();
});

onUpdated(() => {
	if (nbPrivNR.n.value.length) nbPrivNR.reset();
});

watch(search, () => {
	userServReqDone.value = false;
	privsFiltred.value = privs.value?.filter(function (value) {
		return value.user.login
			.toUpperCase()
			.startsWith(search.value.toUpperCase());
	});
	// if (newMsg.value) {
	// 	friendsFiltred.value = me.friends.filter(function(value) {
	// 		return value.login.toUpperCase().startsWith(search.value.toUpperCase());
	// 	});
	// }
	if (newMsg.value) {
		if (search.value != "") {
			getServerUsers();
		}
	}
});

function getServerUsers() {
	HTTP.get(apiPath + "chat/getServerUsersFiltred/" + me.value.login + "/" + search.value)
		.then((res) => {
			serverUsers.value = res.data;
			filterServerUsers();
			userServReqDone.value = true;
		})
		.catch((e) => console.log(e));
}

function filterServerUsers() {
	serverUsers.value = serverUsers.value!.filter((user, i) => {
		let isAlreadyKnow = true;
		for (let priv of privsFiltred.value) {
			if (priv.user.login == user.login) {
				isAlreadyKnow = false;
				break;
			}
		}
		return isAlreadyKnow;
		// ========== AJOUTER FRIENDS ===========
	});
}

// function knownPeople(): User[] {
// 	let res: User[] = [];
// 	for (let i = 0; i < privsFiltred.value!.length; i++) {
// 		res.push(privsFiltred.value![i].login);
// 	}
// 	// for (let i = 0; i < friendsFiltred.value.length; i++) {
// 	// 	if (!res.includes(friendsFiltred.value[i])) {
// 	// 		res.push(friendsFiltred.value[i]);
// 	// 	}
// 	// }
// 	return res;
// }

// function otherPeople(): User[] {
// 	let others = [user4, user5];
// 	return others.filter(function(value) {
// 		return value.login.toUpperCase().startsWith(search.value.toUpperCase());
// 	});
// }

function createNewMsg() {
	search.value = "";
	newMsg.value = !newMsg.value;
	// searchKey.value += 1;
	nextTick(() => {
		document.getElementById('search')?.focus();
	});
}

onMounted(() => {
	const box = document.getElementById("privateTabText");
	if (box != null) box.classList.add("chatTabActive");
});

onBeforeUnmount(() => {
	const box = document.getElementById("privateTabText");
	if (box != null) box.classList.remove("chatTabActive");
});
</script>

<style scoped>
#private_view {
	height: calc(100vh - 180px);
	justify-content: flex-start;
}
.no_results {
	margin-top: 1rem;
}

/* ============= BUTTONS TOPBAR ============= */
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

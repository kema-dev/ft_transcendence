<template>
	<!-- <div v-if="initReqDone" id="private_view" class="center column"> -->
	<div v-if="privDone" id="private_view" class="center column">
		<div class="option_private center raw">
			<SearchItem @searchInput="searchChange" :key="searchKey" />
			<div class="buttons_cont space-around raw">
				<button @click="createNewMsg()" class="button_cont center column">
					<span v-if="!newMsg" class="infoButtonText">New message</span>
					<img
						v-if="!newMsg"
						src="~@/assets/new_msg.svg"
						alt="New message"
						class="new_msg_img"
					/>
					<span v-if="newMsg" class="infoButtonText">Back</span>
					<img
						v-if="newMsg"
						src="~@/assets/undo_logo.svg"
						alt="New message"
						class="new_msg_img"
					/>
				</button>
			</div>
		</div>
		<div v-if="!newMsg" class="myConversations center column">
			<ConversationTab
				v-for="(data, i) in privsFiltred" :key="i"
				:name-conv="data.user.login"
				:message="data.messages[data.messages.length-1].msg"
				:date="new Date(data.messages[data.messages.length-1].date)"
				:last-msg-user="data.messages[data.messages.length-1].user"
				:read="data.readed"
				:avatar="data.user.avatar"
				class="center"
			/>
			<h2 v-if="privs!.length == 0" class="no_results">
				No conversations
			</h2>
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
					:to="{name: 'PrivConv', params: {conv_name: data.user.login}}"
				>
					<BasicProfil  :avatar="data.user.avatar" :login="data.user.login"/>
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
					<BasicProfil :avatar="data.avatar" :login="data.login"/>
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
import { inject, onMounted, ref, Ref, nextTick, onBeforeUnmount, watch, onUpdated } from "vue";
import ConversationTab from "@/chat/ConversationTab.vue";
import BasicProfil from "@/components/BasicProfilItem.vue";
import SearchItem from "@/components/SearchItem.vue";
import { BasicUser } from "@/chat/objects/BasicUser"
import { Socket } from "socket.io-client";
import HTTP from "../components/axios";
import { PrivConv } from "@/chat/objects/PrivConv";


// INJECTS
let colors = inject("colors");
let me: string = inject("me")!;
let mySocket: Socket = inject("socket")!;
let apiPath: string = inject("apiPath")!;
let privs : Ref<PrivConv[]> = inject("privs")!;
let nbPrivNR : { n: Ref<number[]>, reset: () => void} = inject("nbPrivNR")!;
let privsFiltred = ref(privs.value);
const privDone: Ref<boolean> = inject("privDone")!;

// let knownPeople = ref<BasicUser[]>();
let serverUsers = ref<BasicUser[]>();
const search = ref("");
const newMsg = ref(false);
const searchKey = ref(0);
let userServReqDone = ref(false);

if (privs.value.length) {
	console.log(`Privs Notif Saw = ${nbPrivNR.n.value}`)
	nbPrivNR.reset();
}

watch(privDone, () => {
	// console.log(`privDone = ${privDone.value}`);
	privsFiltred.value = privs.value;
	console.log(`Privs Notif Saw = ${nbPrivNR.n.value}`)
	nbPrivNR.reset();
})

onUpdated(() => {
	if (nbPrivNR.n.value.length)
		nbPrivNR.reset();
})

function searchChange(value: string) {
	userServReqDone.value = false;
	search.value = value;
	// console.log("privs = ", privsFiltred.value);
	privsFiltred.value = privs.value?.filter(function(value) {
		return value.user.login.toUpperCase().startsWith(search.value.toUpperCase());
	});
	// if (newMsg.value) {
	// 	friendsFiltred.value = me.friends.filter(function(value) {
	// 		return value.login.toUpperCase().startsWith(search.value.toUpperCase());
	// 	});
	// }
	if (newMsg.value) {
		if (search.value == ""){
			// serverUsers.value = [];
		}
		else {
			HTTP.get(apiPath + "chat/getUsersByLoginFiltred/" + me + "/" + search.value)
			.then(res => {
				let usersTmp : BasicUser[] = [];
				res.data.forEach((user : BasicUser) => {
					usersTmp.push(new BasicUser(user.login));
				});
				serverUsers.value = usersTmp;

				serverUsers.value = serverUsers.value.filter((user, i) => {
					let isAlreadyKnow = true;
					for (let priv of privsFiltred.value) {
						if (priv.user.login == user.login){
							isAlreadyKnow = false;
							break;
						}
					}
					return isAlreadyKnow;
					// ========== AJOUTER FRIENDS =========== 
				})

				userServReqDone.value = true;	
			})
			.catch(e => console.log(e));
		}
	}

	// if (search.value != "" && newMsg.value){
	// 	// userServReqDone.value = false;
	// 	HTTP.get(apiPath + "chat/getUsersByLoginFiltred/" + me + "/" + search.value)
	// 		.then(res => {
	// 			let usersTmp : BasicUserDto[] = [];
	// 			res.data.forEach((user : BasicUserDto) => {
	// 				usersTmp.push(new BasicUserDto(user.login));
	// 			});
	// 			serverUsers.value = usersTmp;
	// 		})
	// 		.catch(e => console.log(e));
		
	// 	// serverUsers.value = (await HTTP.get(
	// 	// 	apiPath + "chat/getUsersByLoginFiltred/" + me + "/" + search.value)).data;
	// 	userServReqDone.value = true;	
	// }

		// HTTP.get(apiPath + "chat/getUsersByLoginFiltred/" + me).then(res => serverUsers.value = res);
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
	newMsg.value = !newMsg.value;
	searchKey.value += 1;
	nextTick(() => {
		document.getElementById("search")?.focus();
	});
}


onMounted(() => {
	const box = document.getElementById('privateTabText');
	if (box != null)
		box.classList.add("chatTabActive");
})

onBeforeUnmount(() => {
	const box = document.getElementById('privateTabText');
	if (box != null)
		box.classList.remove("chatTabActive");
})

</script>

<style>
#private_view {
	height: calc(100vh - 180px);
	justify-content: flex-start;
}
.no_results {
	margin-top: 1rem;
}
.buttons_cont {
	width: 20%;
}
.button_cont {
	border-radius: 50%;
	padding: 5px;
	position: relative;
}
.button_cont:hover {
	background-color: white;
	box-shadow: 0px 0px 4px #aaa;
}
.new_msg_img {
	height: 28px;
	width: 28px;
	/* border-radius: 50%; */
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
.infoButtonText {
	opacity: 0;
	font-size: 0.8rem;
	width: auto;
	background-color: rgba(0, 0, 0, 0.6);
	color: #fff;
	text-align: center;
	padding: 5px;
	border-radius: 6px;
	position: absolute;
	z-index: 1;
	bottom: 100%;
	/* right: 50%; */
}
.button_cont:hover .infoButtonText {
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

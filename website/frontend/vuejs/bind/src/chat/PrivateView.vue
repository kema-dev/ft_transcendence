<template>
	<div v-if="initReqDone" id="private_view" class="center column">
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
				:name-conv="data.login"
				:message="data.message"
				:date="data.date"
				:last-msg-user="data.lastMsgUser"
				:read="data.readed"
				:avatar="data.avatar"
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
			<!-- <div v-if="knownPeople().length > 0" class="knownPeople left column">
				<h2 class="typeUsers">Friends/conversations</h2>
				<router-link
					v-for="(data, i) in knownPeople()"
					:key="i"
					:to="{ name: 'PrivConv', params: { conv_name: data.login } }"
				>
					<BasicProfil :avatar="data.avatar" :login="data.login"/>
				</router-link>
			</div> -->
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
			<!-- <h2 v-if="knownPeople().length == 0 && !serverUsers">
				No results
			</h2> -->
			<h2 v-if="userServReqDone && search.length > 0 && !serverUsers?.length">
				No results
			</h2>
		</div>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import { inject, onMounted, defineEmits, ref, nextTick, onBeforeMount } from "vue";
import ConversationTab from "@/chat/ConversationTab.vue";
import BasicProfil from "@/components/BasicProfilItem.vue";
import SearchItem from "@/components/SearchItem.vue";
import Private from "@/chat/objects/Private";
import PrivateTabDto from "@/chat/dto/PrivateTabDto"
import User from "@/chat/objects/User";
import Message from "@/chat/objects/Message";
import BasicUserDto from "@/chat/dto/BasicUserDto"
import { Socket } from "socket.io-client";
import HTTP from "../components/axios";
import { baseCompile } from "@vue/compiler-core";

let define = inject("colors");
let me: string = inject("me")!;
let mySocket: Socket = inject("socket")!;
let apiPath: string = inject("apiPath")!;
let privs = ref<PrivateTabDto[]>();
let privsFiltred = ref<PrivateTabDto[]>();
let serverUsers = ref<BasicUserDto[]>();
const search = ref("");
const newMsg = ref(false);
const searchKey = ref(0);
let initReqDone = ref(false);
let userServReqDone = ref(false);

mySocket.on("newPrivMsg", () => {
	HTTP.get(apiPath + "chat/getPrivs/" + me)
	.then(res => {
		// console.log(`privConvDto = ${res.data}`);
		let privsTmp : PrivateTabDto[] = [];
		res.data.forEach((priv : PrivateTabDto) => {
			privsTmp.push(new PrivateTabDto(priv.login, priv.message
				, new Date(priv.date), priv.lastMsgUser, priv.readed));
		});
		// privsTmp.forEach(priv => console.log(`priv = 
		// 	login = ${priv.login}
		// 	message = ${priv.message}
		// 	date = ${priv.date}
		// 	lastMsgUser = ${priv.lastMsgUser}
		// 	readed = ${priv.readed}
		// `));
		privs.value = privsTmp;
		privsFiltred.value = privs.value;
		initReqDone.value = true;
	})
	.catch(e => console.log(e));
});

// mySocket.on("getUsersByLoginFiltred", (data : [{login: string}]) => {
// 	let tmp : BasicUser[] = [];
// 	for(let i = 0; i < data.length; i++) {
// 		tmp.push(new BasicUser(data[i].login));
// 	}
// 	serverUsers.value = tmp;
// 	// console.log("serverUsers = ", serverUsers.value);
// });

// (async () => {
// 	let dto : PrivateTabDto[] = (await HTTP.get(apiPath + "chat/getPrivs/" + me)).data;
// 	let privsTmp : PrivateTabDto[] = [];
// 	dto.forEach(priv => {
// 		privsTmp.push(new PrivateTabDto(priv.login, priv.message, new Date(priv.date)));
// 	});
// 	privs.value = privsTmp;
// 	privsFiltred.value = privs.value;
// })();

HTTP.get(apiPath + "chat/getPrivs/" + me)
	.then(res => {
		// console.log(`privConvDto = ${res.data}`);
		let privsTmp : PrivateTabDto[] = [];
		res.data.forEach((priv : PrivateTabDto) => {
			privsTmp.push(new PrivateTabDto(priv.login, priv.message
				, new Date(priv.date), priv.lastMsgUser, priv.readed));
		});
		privs.value = privsTmp;
		privsFiltred.value = privs.value;
		initReqDone.value = true;
	})
	.catch(e => console.log(e));




// let user1 = new User("Totolosa", require("@/assets/avatars/(1).jpg"));
// let user2 = new User("Ocean", require("@/assets/avatars/(2).jpg"));
// let user3 = new User("Patrick la trick", require("@/assets/avatars/(3).jpg"));
// let user4 = new User("Jeanjean", require("@/assets/avatars/(4).jpg"));
// let user5 = new User("Totofake", require("@/assets/avatars/(5).jpg"));
// // let user6 = new User("Patrick la trick", require("@/assets/avatars/(6).jpg"));

// let msg1 = new Message(
// 	user1,
// 	"Salut frere rwf;jnavionra'mrv'aomfgifsivbdfvndfnvjsdglbjgb;fgklb;s;bg",
// 	new Date("July 17, 2022 03:24:00")
// );
// let msg2 = new Message(user2, "Salut poto", new Date("July 22, 2022 03:25:12"));
// let msg3 = new Message(user3, "Game?", new Date("July 18, 2022 12:45:45"));
// let msg4 = new Message(
// 	user1,
// 	"Non je dois finir de faire le front, et wallah c'est chaud",
// 	new Date("July 18, 2022 12:47:55")
// );
// let msg5 = new Message(
// 	user1,
// 	"dsaibciauwncopneejvnjnfcoamsdomvcafosnvonsvonoans",
// 	new Date()
// );
// let msg6 = new Message(user2, "Mais tu sais pas parler en fait", new Date());

// let conv1 = new Private(user2, [msg1, msg2]);
// let conv2 = new Private(user3, [msg3, msg4]);
// let conv3 = new Private(user1, [msg5, msg6]);

// // let conversations = [conv1, conv2, conv3];
// // let convsFiltred = ref(conversations);
// // let friendsFiltred = ref(me.friends);
// let conversations = [conv1, conv2, conv3];
// let convsFiltred = ref(conversations);
// // let friendsFiltred = ref(me.friends);



// conversations.sort(function (x, y) {
// 	if (
// 		x.messages[x.messages.length - 1].date <
// 		y.messages[y.messages.length - 1].date
// 	) {
// 		return 1;
// 	}
// 	if (
// 		x.messages[x.messages.length - 1].date >
// 		y.messages[y.messages.length - 1].date
// 	) {
// 		return -1;
// 	}
// 	return 0;
// });

function searchChange(value: string) {
	userServReqDone.value = false;
	search.value = value;
	// console.log("privs = ", privsFiltred.value);
	privsFiltred.value = privs.value?.filter(function(value) {
		return value.login.toUpperCase().startsWith(search.value.toUpperCase());
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
				let usersTmp : BasicUserDto[] = [];
				res.data.forEach((user : BasicUserDto) => {
					usersTmp.push(new BasicUserDto(user.login));
				});
				serverUsers.value = usersTmp;
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

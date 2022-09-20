<template>
	<div id="channel_view" class="center column stack">
		<div class="option_private center raw">
			<SearchItem v-if="!newChannel" v-model:search="search"/>
			<!-- <div v-if="newChannel" class="newChannelTitle">Create a new Channel</div> -->
			<div v-if="newChannel" class="newChannelTitle center">
				<span class="newChannelTitleText">Create a new Channel</span>
			</div>
			<div class="option_buttons space-around raw stack">
				<button
					v-if="!newChannel"
					@click="findChannelFn()"
					class="button_cont center"
				>
					<span v-if="!findChannel" class="infoButtonText">Join channel</span>
					<img
						v-if="!findChannel"
						src="~@/assets/logo_search.svg"
						alt="Find Channel Button"
						class="button_img"
					/>
					<span v-if="findChannel" class="infoButtonText">Back</span>
					<img
						v-if="findChannel"
						src="~@/assets/undo_logo.svg"
						alt="Undo Button"
						class="button_img"
					/>
				</button>
				<button
					v-if="!findChannel"
					@click="newChannelFn()"
					class="button_cont center"
				>
					<span v-if="!newChannel" class="infoButtonText">Create channel</span>
					<img
						v-if="!newChannel"
						src="~@/assets/add_logo.svg"
						alt="New message"
						class="button_img"
					/>
					<span v-if="newChannel" class="infoButtonText">Back</span>
					<img
						v-if="newChannel"
						src="~@/assets/undo_logo.svg"
						alt="New message"
						class="button_img"
					/>
				</button>
			</div>
		</div>
		<div v-if="chanDone && !findChannel && !newChannel" class="myChannels center column">
			<div v-for="(data, i) in chansFiltred" :key="i" class="center">
				<ConversationTab
					v-if="data.messages.length > 0"
					:name-conv="data.name"
					:message="data.messages.at(-1)!.msg"
					:date="data.messages.at(-1)!.date"
					:last-msg-user="data.messages.at(-1)!.user"
					:read="data.readed"
					:chan="true"
					class="center"
				/>
				<ConversationTab
					v-else
					:name-conv="data.name"
					:date="data.creation"
					:chan="true"
					class="center"
				/>
				<!-- <ConversationTab v-else :name-conv="data.name" :avatar="data.avatar" :date="data.creation" :chan="true" class="center"/> -->
			</div>
			<h2 v-if="chansRef.length == 0" class="no_results">No conversations</h2>
			<h2 v-else-if="chansFiltred!.length == 0" class="no_results">
				No results
			</h2>
		</div>
		<div
			v-if="findChannel && serverChans.length > 0"
			class="findChannelResults left column"
		>
			<!-- <div v-if="search.length > 0 && serverChans.length > 0" class="left column"> -->
			<ChannelTab v-for="(data, i) in serverChans" :key="i" :infos="data" />
		</div>
		<h2 v-else-if="findChannel && search.length > 0 && serverChans.length == 0">No results</h2>
		<!-- </div> -->
		<form
			v-if="newChannel"
			@submit.prevent="submitChannel"
			id="channelForm"
			class="channelForm left column"
		>
			<div class="elemForm_cont left column">
				<label for="name" class="labelForm">Channel name</label>
				<input type="text" name="name" required id="name" class="inputForm" />
			</div>
			<div class="elemForm_cont left column">
				<div class="left_center raw">
					<label for="pswCheckbox" class="labelForm">Password ?</label>
					<input
						v-model="pswCheck"
						type="checkbox"
						name="pswCheckbox"
						id="pswCheckbox"
						value="psw required"
					/>
				</div>
				<input
					type="text"
					name="pswInput"
					id="pswInput"
					class="inputForm"
					:disabled="!pswCheck"
					:required="pswCheck"
				/>
			</div>
			<!-- <div class="elemForm_cont left column">
				<label for="users" class="labelForm">User to invite in channel</label>
				<input type="text" name="usersChann" id="usersChann" class="inputForm">
			</div> -->
			<input type="submit" value="Create" id="submitButton" />
		</form>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import {
	inject,
	onMounted,
	onBeforeUnmount,
	ref,
	Ref,
	nextTick,
	watch,
} from "vue";
/* eslint-disable @typescript-eslint/no-unused-vars */
import HTTP from "../components/axios";
import { Socket } from "socket.io-client";
import { useToast } from 'vue-toastification';
import ChannelTab from "@/chat/ChannelTab.vue";
import SearchItem from "@/components/SearchItem.vue";
import ConversationTab from "@/chat/ConversationTab.vue";
import { ChannelDto } from "@/chat/dto/ChannelDto";
import { ChannelTabDto } from "@/chat/dto/ChannelTabDto ";
import { NewChanDto } from "@/chat/dto/NewChanDto"
import { MessageDto } from "@/chat/dto/MessageDto";
import { BasicUserDto } from "@/chat/dto/BasicUserDto";
// import { chansRef, printChans }  from "@/globals"
	
	
const toast = useToast();
let colors = inject("colors");
let me : string = inject("me")!;
let mySocket: Socket = inject("socket")!;
let apiPath: string = inject("apiPath")!;

let chansRef : Ref<ChannelDto[]> = inject("chans")!;
let chansFiltred : Ref<ChannelDto[]> = ref(chansRef.value);
const chanDone: Ref<boolean> = inject("chanDone")!;

let serverChans : Ref<ChannelTabDto[]> = ref([]);
let chanServReqDone = ref(false);

const search = ref("");
const findChannel = ref(false);
const newChannel = ref(false);
const pswCheck = ref(false);

watch(chanDone, () => {
	// console.log(`chanDone = ${chanDone.value}`);
	chansFiltred.value = chansRef.value;
	// nbPrivNR.reset();
});

watch(search, () => {
	console.log(`search Change`);
	chanServReqDone.value = false;
	chansFiltred.value = chansRef.value?.filter(function (chan) {
		return chan.name.toUpperCase().startsWith(search.value.toUpperCase());
	});
	if (findChannel.value && search.value != "") getServerChans();
});

function getServerChans() {
	HTTP.get(apiPath + "chat/getServerChansFiltred/" + me + "/" + search.value)
		.then((res) => {
			let chansTmp: ChannelTabDto[] = [];
			res.data.forEach((chan: ChannelTabDto) => {
				chansTmp.push(
					new ChannelTabDto(chan.name, chan.nbUsers, chan.psw, chan.ban)
				);
			});
			serverChans.value = chansTmp;
			// filterServerChans();
			chanServReqDone.value = true;
		})
		.catch((e) => console.log(e));
}

function filterServerChans() {
	serverChans.value = serverChans.value!.filter((chan, i) => {
		let isAlreadyKnow = true;
		for (let chanKnown of chansFiltred.value) {
			if (chanKnown.name == chan.name) {
				isAlreadyKnow = false;
				break;
			}
		}
		return isAlreadyKnow;
	});
}

// function knownPeople() : Channel[] {
// 	let res : Channel[] = [];
// 	for (let i = 0; i < convsFiltred.value.length; i++) {
// 		res.push(convsFiltred.value[i]);
// 	}
// 	return res;
// }

// function otherPeople() : User[] {
// 	let others = [user4, user5];
// 	return others.filter(function(value) {
// 		return value.name.toUpperCase().startsWith(search.value.toUpperCase());
// 	});
// }

function findChannelFn() {
	findChannel.value = !findChannel.value;
	search.value = "";
	nextTick(() => {
		document.getElementById("search")?.focus();
	});
}
function newChannelFn() {
	newChannel.value = !newChannel.value;
}

function submitChannel() {
	let form = document.getElementById('channelForm') as HTMLFormElement;
	const data = new FormData(form);
	// if (data.get("pswInput") as string) {
		
	// 	// conversations.push(new Channel(data.get('name') as string, [me], data.get("pswInput") as string));
	// 	// console.log(data.get("pswInput") as string);
	// } else {
	// 	// conversations.push(new Channel(data.get('name') as string, [me]));
	// }
	let chanName = data.get("name") as string;
	let chanPsw = data.get("pswInput") as string;
	console.log(`chanName = ${chanName}`);
	console.log(`chanPsw = ${chanPsw}`);
	HTTP.post(apiPath + "chat/CreateChan", new NewChanDto(chanName, me, chanPsw))
	.then(res => {
		let newChan = res.data as ChannelDto;
		newChan.creation = new Date(newChan.creation);
		chansRef.value.push(newChan);
	})
	.catch(e => {
		if (e.response.data.message === 'CHAN_ALREADY_EXIST') {
			toast.warning("This channel name already exist");
		}
	});
	newChannel.value = false;
}

onMounted(() => {
	const box = document.getElementById("channelsTabText");
	if (box != null) box.classList.add("chatTabActive");
});

onBeforeUnmount(() => {
	const box = document.getElementById("channelsTabText");
	if (box != null) box.classList.remove("chatTabActive");
});
</script>

<style scoped>
#channel_view {
	height: calc(100vh - 180px);
	justify-content: flex-start;
}
.no_results {
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

/* .buttons_cont{
	width: 20%;
}
.button_cont {
	border-radius: 50%;
	margin: 5px;
	position: static;
}
.button_cont:hover {
	background-color: white;
	box-shadow: 0px 0px 4px #aaa;
}
.new_msg_img {
	height: 28px;
	width: 28px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg) brightness(86%) contrast(83%);
}
.infoButtonText {
	visibility: hidden;
	opacity: 0;
	font-size: 0.8rem;
	width: auto;
	background-color: rgba(0,0,0,0.6);
	color: #fff;
	text-align: center;
	padding: 5px;
	border-radius: 6px;
	position: absolute;
	z-index: 1;
	bottom: 100%;
}
.button_cont:hover .infoButtonText {
	visibility: visible;
	opacity: 0;
	animation: displayButtonInfo 0.3s;
	animation-delay: 0.3s;
	animation-fill-mode: forwards;
}
@keyframes displayButtonInfo {
	from { opacity: 0; }
	to { opacity: 1; }
} */

.findChannelResults {
	margin-top: 10px;
	width: 90%;
}
.typeUsers {
	margin-top: 15px;
	margin-bottom: 5px;
}
.newChannelTitle {
	height: 75px;
	width: 70%;
	align-items: center;
}
.newChannelTitleText {
	font-size: 1.15rem;
	font-weight: 500;
	color: v-bind("colors.color2");
	border-bottom: 2px solid v-bind("colors.color2");
	font-family: "Orbitron", sans-serif;
	padding-bottom: 10px;
}
.channelForm {
	width: 80%;
}
.elemForm_cont {
	padding-bottom: 10px;
}
.labelForm {
	/* font-family: "Orbitron", sans-serif; */
	font-weight: 400;
}
.inputForm {
	padding: 0 5px;
	border-radius: 5px;
	height: 1.5rem;
	outline: none;
}
#pswCheckbox {
	margin-left: 10px;
}
#submitButton {
	background-color: v-bind("colors.color2");
	color: #fff;
	border-radius: 5px;
	margin-top: 10px;
	padding: 5px;
	font-family: 'Orbitron', sans-serif;
}
#submitButton:hover {
	/* font-weight: 500; */
	/* box-shadow: 3px 3px 3px rgba(0,0,0,0.2); */
	box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
	cursor: pointer;
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

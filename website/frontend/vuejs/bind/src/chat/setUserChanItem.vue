<template>
	<div class="moreButCont center row stack">
		<div v-if="statusDone" class="status"></div>
		<button
			@click="showMore = !showMore"
			class="setUserCont center"
		>
			<span v-if="showMore" class="infoButtonText">
				Hide
			</span>
			<img v-if="!showMore"
				src='~@/assets/more.svg'
				alt="User setting"
				class="infoImg"
			/>
			<img v-else
				src='~@/assets/undo_logo.svg'
				alt="User setting"
				class="infoImg"
			/>
		</button>
		<button v-if="showMore"
			@click="sendPrivMsg()"
			class="setUserCont center"
		>
			<span class="infoButtonText">
				Private message
			</span>
			<img
				src='~@/assets/new_msg.svg'
				alt="Send private message"
				class="infoImg"
			/>
		</button>
		<button v-if="showMore && statusDone && userStatus != 'ingame'"
			@click="inviteGame()"
			class="setUserCont center"
		>
			<span class="infoButtonText">
				Invit in game
			</span>
			<img
				src='~@/assets/ball_logo.svg'
				alt="Send private message"
				class="infoImg"
			/>
		</button>
		<button v-if="showMore && statusDone && userStatus == 'ingame'"
			@click="specGame()"
			class="setUserCont center"
		>
			<span class="infoButtonText">
				Watch game
			</span>
			<img
				src='~@/assets/eye.svg'
				alt="Watch Game"
				class="infoImg"
			/>
		</button>
		<button v-if="props.isAdmin && props.group == 'users' && showMore"
			@click="promote()"
			class="setUserCont center"
		>
			<span class="infoButtonText">
				Promote Admin
			</span>
			<img
				src='~@/assets/arrow_up.svg'
				alt="User setting"
				class="infoImg"
			/>
		</button>
		<button v-if="props.isAdmin && props.group == 'admins' && showMore"
			@click="demote()"
			class="setUserCont center"
		>
			<span class="infoButtonText">
				Demote User
			</span>
			<img
				src='~@/assets/arrow_down.svg'
				alt="User setting"
				class="infoImg"
			/>
		</button>
		<button v-if="props.isAdmin && props.group != 'mutes' && props.group != 'bans' && showMore"
			@click="updateSanction('mute')"
			class="setUserCont center"
		>
			<span class="infoButtonText">
				Mute
			</span>
			<img
				src='~@/assets/mute.svg'
				alt="User setting"
				class="infoImg"
			/>
		</button>
		<button v-if="props.isAdmin && showMore
			&& (props.group == 'bans' || props.group == 'mutes')"
			@click="restoreUser()"
			class="setUserCont center"
		>
			<span class="infoButtonText">
				{{props.group == 'mutes' ? 'Unmute' : 'Unban'}}
			</span>
			<img
				src='~@/assets/restore.svg'
				alt="Restore User"
				class="infoImg"
			/>
		</button>
		<button v-if="props.isAdmin && showMore"
			@click="kickUser()"
			class="setUserCont center"
		>
			<span class="infoButtonText">
				Kick
			</span>
			<img
				src='~@/assets/kick.svg'
				alt="User setting"
				class="infoImg"
			/>
		</button>
		<button v-if="props.isAdmin && showMore && props.group != 'bans'"
			@click="updateSanction('ban')"
			class="setUserCont center"
		>
			<span class="infoButtonText">
				Ban
			</span>
			<img
				src='~@/assets/block_logo.svg'
				alt="User setting"
				class="infoImg"
			/>
		</button>
	</div>
	<WarningMsg v-if="sanction != ''"
		:msg="'For how many time you want to ' 
			+ sanction + ' this user?'"
		msg2="(hh:mm:ss)"
		:img="sanction == 'mute' ? 
			require('@/assets/mute2.svg') : require('@/assets/banned_logo.png')"
	>
		<template #content>
			<div id="timeCont" class="center raw">
				<input type="number" name="hoursBan" id="hoursBan" class="timeInput"
					value="0" min="0" max="99">
				<input type="number" name="minutesBan" id="minutesBan" class="timeInput"
					value="0" min="0" max="99">
				<input type="number" name="secondsBan" id="secondsBan" class="timeInput"
					value="0" min="0" max="99">
			</div>
		</template>
		<template #buttons>
			<div class="blockAdvertButtons center raw">
				<button @click="muteBan(sanction)">OK</button>
				<button @click="resetSanction()">Back</button>
			</div>
		</template>
	</WarningMsg>
</template>

<script setup lang="ts">
import { inject, defineProps, onMounted, onBeforeUnmount, ref, nextTick } from "vue";
import { Socket } from "socket.io-client";
import { ModifChanDto } from "@/chat/dto/ModifChanDto"
import WarningMsg from "@/components/WarningMsg.vue";
import router from "@/router";
import { useToast } from 'vue-toastification';
const toast = useToast();

let colors = inject('colors');
let showMore = ref(false);
let mySocket: Socket = inject("socket")!;
const myName: string = inject("me")!;
let isCreate : Ref<boolean> = inject('isCreate')!;
let isJoin : Ref<boolean> = inject('isJoin')!;
let sanction = ref("");
let userStatus = ref('');
let statusColor = ref('');
let statusDone = ref(false);


const props = defineProps({
	login: {
		type: String,
		required: true,
	},
	chan: {
		type: String,
		required: true,
	},
	group: {
		type: String,
		required: true,
	},
	isAdmin: {
		type: Boolean,
		required: true,
	},
});

function promote() {
	mySocket.emit("modifChan", 
		new ModifChanDto(myName, props.chan, "promotAdm", props.login));
}

function demote() {
	mySocket.emit("modifChan", 
		new ModifChanDto(myName, props.chan, "demotUser", props.login));
}

function kickUser() {
	mySocket.emit("modifChan", 
		new ModifChanDto(myName, props.chan, "kick", props.login, props.group));
}

function sendPrivMsg() {
	router.push({name: 'PrivConv', params: { conv_name: props.login }});
}

function specGame() {
	mySocket.emit('look_lobby2', {
		spec: myName,
		player: props.login,
	});
	isCreate.value = true;
	isJoin.value = false;
}

function inviteGame() {
	mySocket.off('invite_to_game');
	mySocket.on('invite_to_game', (data) => {
		if (data.error == 'no game') {
			toast.success('You were not in a game, created a new one for you !');
			inviteGame();
		} else if (data.error == 'no user') {
			toast.error('This user does not exist');
		} else if (data.error == 'no online') {
			toast.warning('This user is not online');
		} else {
			console.log(data);
		}
	});
	mySocket.emit("invite_to_game", { login: props.login });
}

function muteBan(sanction: string) {
	let hoursInput  = document.getElementById("hoursBan")!;
	let minutesInput  = document.getElementById("minutesBan")!;
	let secondsInput  = document.getElementById("secondsBan")!;
	hoursInput.classList.remove("invalidInput");
	minutesInput.classList.remove("invalidInput");
	secondsInput.classList.remove("invalidInput");
	let hours : number  = document.getElementById("hoursBan")!.value;
	let minutes : number  = document.getElementById("minutesBan")!.value;
	let seconds : number  = document.getElementById("secondsBan")!.value;
	let time : number = +seconds + +minutes * 60 + +hours * 3600;
	console.log(`total = ${time}, hours = ${hours}, 
		minutes = ${minutes}, seconds = ${seconds}`)
	if (time < 1 || hours < 0 || minutes < 0 || seconds < 0)
		return setTimeout(() => {
			hoursInput.classList.add("invalidInput");
			minutesInput.classList.add("invalidInput");
			secondsInput.classList.add("invalidInput");
		}, 50);
	mySocket.emit("modifChan", 
		new ModifChanDto(myName, props.chan, sanction, props.login, props.group, time));
	resetSanction();
}

function updateSanction(value: string) {
	sanction.value = value;
	nextTick(() => {
		document.getElementById('timeInput')?.focus();
	})
}

function resetSanction() {
	sanction.value = '';
	showMore.value = false;
}

function restoreUser() {
	let restore: string;
	props.group == "mutes" ? 
		restore = "restoreMute" : restore = "restoreBan";
	mySocket.emit("modifChan", 
		new ModifChanDto(myName, props.chan, restore, props.login));
}

onMounted(() => {
	mySocket.on("userStatus", (data: {user: string, status: string}) => {
		if (data.user == props.login) {
			if (data.status == 'online')
				statusColor.value = '#00CC00';
			else if (data.status == 'offline')
				statusColor.value = '#FF3333';
			else
				statusColor.value = 'orange';
			userStatus.value = data.status;
			statusDone.value = true;
		}
	});
	mySocket.emit("userStatus", props.login);
});

onBeforeUnmount(() => {
	mySocket.off("userStatus");
});

</script>

<style scoped>
* {
	--height: 30px;
}
.moreButCont {
	width: auto;
	height: 26px;
}
.status {
	width: 15px;
	height: 15px;
	border-radius: 50%;
	margin-right: 5px;
	background: v-bind(statusColor);
}
.setUserCont{
	height: 26px;
	width: 26px;
	border-radius: 13px;
}
.setUserCont:hover {
	box-shadow: 0px 0px 4px #aaa;
}
.infoImg {
	height: 20px;
	width: 20px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
#timeCont {
	width: 190px;
	margin-bottom: 15px;
	border-radius: 5px;
}
.timeInput {
	font-family: 'Orbitron', sans-serif;
	border: solid 1px v-bind("colors.color2");
	border-radius: 5px;
	width: 50px;
	margin: 0 5px;
	text-align: center;

	/* outline: none; */
}
.invalidInput {
	animation: shake 0.4s linear;
}
@keyframes shake {
	0%,
	100% {
		transform: translateX(0);
	}
	10%,
	30%,
	50%,
	70%,
	90% {
		transform: translateX(-5px);
	}
	20%,
	40%,
	60%,
	80% {
		transform: translateX(5px);
	}
	0% {
		background-color: rgb(255, 178, 178);
	}
	100.0% {
		background-color: white;
	}
}
.infoButtonText {
	visibility: hidden;
	font-size: 0.8rem;
	width: 135px;
	background-color: rgba(0, 0, 0, 0.6);
	color: #fff;
	text-align: center;
	padding: 5px 0;
	border-radius: 6px;
	position: absolute;
	z-index: 1;
	bottom: 110%;
	right: 50%;
	transform: translate(50%);
}
.setUserCont:hover .infoButtonText {
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
</style>

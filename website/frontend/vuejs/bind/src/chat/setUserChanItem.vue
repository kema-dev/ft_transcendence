<template>
	<div class="moreButCont center row stack">
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
		<button v-if="showMore"
			@click="invitGame()"
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
		<button v-if="props.isAdmin && showMore"
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
				<!-- <input @keypress.enter="muteBan(sanction)" type="time" name="timeInput" id="timeInput" step="1" required/> -->
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
import { inject, defineProps, onMounted, ref, nextTick } from "vue";
import { Socket } from "socket.io-client";
import { ModifChanDto } from "@/chat/dto/ModifChanDto"
import WarningMsg from "@/components/WarningMsg.vue";
import router from "@/router";


let colors = inject('colors');
let showMore = ref(false);
let mySocket: Socket = inject("socket")!;
let sanction = ref("");
let seconds = ref(0);
let minutes = ref(0);
let hours = ref(0);


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
		new ModifChanDto(props.chan, "promotAdm", props.login));
}

function demote() {
	mySocket.emit("modifChan", 
		new ModifChanDto(props.chan, "demotUser", props.login));
}

function sendPrivMsg() {
	router.push({name: 'PrivConv', params: { conv_name: props.login }});
}

function invitGame() {

}

function muteBan(sanction: string) {
	// let input = document.getElementById("timeInput")!;
	// input.classList.remove("invalidInput");
	// let form = document.getElementById('timeForm') as HTMLFormElement;
	// const data = new FormData(form);
	// let timeData  = data.get("timeInput") as string;
	// if (!timeData || timeData.split(':').length < 3)
	// 	return setTimeout(() => {
	// 		input!.classList.add("invalidInput");
	// 	}, 50);
	// let timeArray = timeData.split(':');
	// let hours = Number(timeArray[0]);
	// let minutes = Number(timeArray[1]);
	// let seconds = Number(timeArray[2]);

	// let timeInput = document.getElementById("timeCont")!;
	// timeInput.classList.remove("invalidInput");
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
			// timeInput!.classList.add("invalidInput");
			hoursInput.classList.add("invalidInput");
			minutesInput.classList.add("invalidInput");
			secondsInput.classList.add("invalidInput");
		}, 50);
	mySocket.emit("modifChan", 
		new ModifChanDto(props.chan, sanction, props.login, props.group, time));
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
		new ModifChanDto(props.chan, restore, props.login));
}

</script>

<style scoped>
* {
	--height: 30px;
}
.moreButCont {
	width: auto;
	height: 26px;
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
	/* width: auto; */
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

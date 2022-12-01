<template>
	<button v-if="!infos.psw" @click="joinChannel">
		<div class="channelTab center row stack">
			<div class="avatar_cont center">
				<img src="~@/assets/group_logo.svg" alt="avatar" class="avatar" />
			</div>
			<div class="chanName">{{ infos!.name }}</div>
			<div class="userNumberCont center">
				<img src="~@/assets/group2_logo.svg" alt="Number of user" class="img" />
				<span class="userNumber">{{ infos!.nbUsers }}</span>
			</div>
		</div>
	</button>
	<button v-else class="channelPsw center column stack">
		<div @click="showPswDiv()" class="channelTab center row stack">
			<div class="avatar_cont center">
				<img src="~@/assets/group2_logo.svg" alt="avatar" class="avatar" />
			</div>
			<div class="chanName">{{ infos!.name }}</div>
			<div class="userNumberCont center">
				<img src="~@/assets/group2_logo.svg" alt="Number of user" class="img" />
				<span class="userNumber">{{ infos!.nbUsers }}</span>
			</div>
			<img src="~@/assets/lock_logo.svg" alt="Protected" class="img lock" />
		</div>
		<div v-if="showPsw" class="pswInputCont center raw" id="pswBox">
			<img src="~@/assets/key_logo.svg" alt="Password" class="img" />
			<input
				v-model="psw"
				@keydown.enter="joinChannel"
				type="text"
				ref="input"
				class="pswInput"
			/>
		</div>
	</button>
	<WarningMsg
		v-if="banWarn"
		msg="You have been banned from this channel"
		:img="require('@/assets/banned_logo.png')"
	>
		<template #buttons>
			<div class="blockAdvertButtons center raw">
				<button @click="banWarn = !banWarn">OK</button>
			</div>
		</template>
	</WarningMsg>
</template>

<script setup lang="ts">
	import HTTP from "../components/axios";
import { inject, defineProps, ref, Ref, nextTick, onMounted } from "vue";
import { Socket } from "socket.io-client";
import { useRouter } from "vue-router";
import WarningMsg from "@/components/WarningMsg.vue";
import { ChannelTabDto } from "@/chat/dto/ChannelTabDto ";
import ProfileUserDto from "@/dto/ProfileUserDto";
import { ChannelDto } from "./dto/ChannelDto";

let colors = inject("colors");
let me: Ref<ProfileUserDto> = inject("user")!;
let myName: string = inject("me")!;
let mySocket: Socket = inject("socket")!;
let apiPath: string = inject("apiPath")!;
const router = useRouter();
const props = defineProps({
	infos: {
		type: ChannelTabDto,
		required: true,
	},
});

let showPsw = ref(false);
let psw = ref('');
let input = ref(null);
const banWarn = ref(false);

let chansRef : Ref<ChannelDto[]> = inject("chans")!;

function showPswDiv() {
	showPsw.value = !showPsw.value;
	psw.value = "";
	if (showPsw.value) {
		nextTick(() => {
			(input.value! as HTMLInputElement).focus();
		});
	}
}

function joinChannel() {
	if (props.infos.psw){
		(input.value! as HTMLInputElement).classList.remove("invalidPsw");
		if (psw.value == '')
			return setTimeout(() => {
				((input.value!) as HTMLInputElement).classList.add("invalidPsw");
			}, 50);
	}
	HTTP.post(apiPath + "chat/joinChanRequest/", {
		requestor: me.value.login,
		chanName: props.infos.name,
		psw: props.infos.psw ? psw.value : undefined,
	})
		.then((res) => {
			let newChan = res.data as ChannelDto;
			newChan.creation = new Date(newChan.creation);
			newChan.messages.forEach(msg => msg.date = new Date(msg.date));
			chansRef.value.push(newChan);
			mySocket.emit("newChannelUser", {chan: props.infos.name, login: myName});
			router.push({name: 'ChanConv', params: {conv_name: props.infos.name }});
		})
		.catch((e) => {
			if (e.response.data.message === 'WRONG_PSW') {
				((input.value!) as HTMLInputElement).classList.add("invalidPsw");
			} else if (e.response.data.message === 'USER_BANNDED') {
				banWarn.value = true;
			} else if (e.response.data.message === 'CHAN_NOT_FOUND') {
				console.log(e);
			}
		});

}

</script>

<style scoped>
* {
	--height: 30px;
}

.channelPsw {
	width: auto;
}
.channelTab {
	width: auto;
	height: calc(var(--height) + 10px);
	margin: 3px 0;
	background-color: white;
	border: 2px solid v-bind("colors.color2");

	border-radius: calc(calc(var(--height) + 10px) / 2);
	z-index: 1;
}
.avatar_cont {
	width: var(--height);
	height: var(--height);
}
.avatar {
	height: var(--height);
	width: var(--height);
	border-radius: 50%;
	position: absolute;
	left: 4px;
}
.chanName {
	width: auto;
	padding-left: 15px;
	font-family: "Orbitron", sans-serif;
	font-size: 0.9rem;
	font-weight: 500;
	color: black;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.userNumberCont {
	width: auto;
	padding: 0 15px;
	color: black;
}
.img {
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
	height: var(--height);
	width: var(--height);
	border-radius: 50%;
}
.lock {
	margin-right: 5px;
}
.pswInputCont {
	z-index: 0;
	height: 2rem;
	animation: slidePsw 0.3s ease-in-out;
}
@keyframes slidePsw {
	0% {
		transform: translateY(-30px);
	}
	100% {
		transform: translateY(0);
	}
}
.pswInput {
	margin-left: 10px;
	height: 1.5rem;
	border-radius: calc(1.5rem / 2);
	padding: 0 8px;
	outline: none;
	width: 200px;
	font-family: "Orbitron", sans-serif;
	font-size: 0.8rem;
}
.invalidPsw {
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

.banWarnCont {
	/* position: fixed;
	height: 800px;
	width: 400px; */
	/* position: fixed;
	height: v-bind("chanViewPos.height");
	width: v-bind("chanViewPos.width"); */
}
</style>

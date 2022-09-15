<template>
	<router-link
		v-if="!channel?.psw"
		:to="{name: 'ChannelConv', params: {conv_name: channel!.name }}"
	>
		<div class="channelTab center row stack">
			<div class="avatar_cont center">
				<img :src="channel!.avatar" alt="avatar" class="avatar" />
			</div>
			<div class="chanName">{{ channel!.name }}</div>
			<div class="userNumberCont center">
				<img src="~@/assets/group2_logo.svg" alt="Number of user" class="img" />
				<span class="userNumber">{{ channel!.numberOfUser() }}</span>
			</div>
		</div>
	</router-link>
	<div v-else class="channelPsw center column stack">
		<div @click="showPswDiv()" class="channelTab center row stack">
			<div class="avatar_cont center">
				<img :src="channel!.avatar" alt="avatar" class="avatar" />
			</div>
			<div class="chanName">{{ channel!.name }}</div>
			<div class="userNumberCont center">
				<img src="~@/assets/group2_logo.svg" alt="Number of user" class="img" />
				<span class="userNumber">{{ channel!.numberOfUser() }}</span>
			</div>
			<img src="~@/assets/lock_logo.svg" alt="Protected" class="img lock" />
		</div>
		<div v-if="showPsw" class="pswInputCont center raw" id="pswBox">
			<img src="~@/assets/key_logo.svg" alt="Password" class="img" />
			<input
				v-model="psw"
				@keydown.enter="checkPsw()"
				type="text"
				ref="input"
				class="pswInput"
			/>
		</div>
	</div>
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
import { inject, defineProps, ref, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import WarningMsg from '@/components/WarningMsg.vue';
import Channel from '@/chat/Channel';
import User from '@/chat/User';

let define = inject('colors');
let me: User = inject('me')!;
const router = useRouter();
const props = defineProps({
	channel: Channel,
});

let showPsw = ref(false);
let psw = ref('');
let input = ref(null);
const banWarn = ref(false);
let chanViewPos: DOMRect;

function showPswDiv() {
	// DEMMANDE BACK IF USER BANNED <==================================
	if (props.channel?.isBan(me)) {
		banWarn.value = true;
	} else {
		showPsw.value = !showPsw.value;
		psw.value = '';
		if (showPsw.value) {
			nextTick(() => {
				(input.value! as HTMLInputElement).focus();
			});
		}
	}
}

function checkPsw() {
	(input.value! as HTMLInputElement).classList.remove('invalidPsw');
	setTimeout(() => {
		if (psw.value == props.channel?.psw) {
			router.push({
				name: 'PrivConv',
				params: { conv_name: props.channel.name },
			});
		} else {
			(input.value! as HTMLInputElement).classList.add('invalidPsw');
		}
	}, 50);
}

onMounted(() => {
	chanViewPos = document
		.getElementById('channel_view')!
		.getBoundingClientRect()!;
	console.log(
		'height = ',
		chanViewPos.height,
		'width = ',
		chanViewPos.width,
		'top = ',
		chanViewPos.top,
		'right = ',
		chanViewPos.right,
		'bottom = ',
		chanViewPos.bottom,
		'left = ',
		chanViewPos.left,
	);
});
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
	border: 2px solid v-bind('define.color2');

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
	font-family: 'Orbitron', sans-serif;
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
	font-family: 'Orbitron', sans-serif;
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

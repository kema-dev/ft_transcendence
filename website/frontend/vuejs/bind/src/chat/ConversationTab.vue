<template>
	<router-link
		:to="{
			name: chan == true ? 'ChanConv' : 'PrivConv',
			params: { conv_name: nameConv },
		}"
		class="conv_container left row stack"
		:class="{ conv_containerNR: displayNotRead() }"
	>
		<div class="avatar_cont">
			<img v-if="avatar" :src="avatar" class="avatar" alt="avatar" />
			<img v-else src="~@/assets/group_logo.svg" class="avatar" alt="avatar" />
		</div>
		<div class="info center column">
			<div class="top-bar space-between row stack">
				<div class="login" :class="{ loginNR: displayNotRead() }">
					{{ nameConv }}
				</div>
				<div v-if="message" class="date">{{ displayDate() }}</div>
			</div>
			<div class="message_cont center" :class="{ messageNR: displayNotRead() }">
				<div v-if="message " class="column left_center">
					<h3 v-if="!chan && statusDone" class="status">
						{{ status ? "online" : "offline" }}
					</h3>
					<div :class="{'messageChan': chan, 'messagePriv': !chan }">
						{{ displayMsg() }}
					</div>
				</div>
				<!-- <div v-if="message" class="message">{{ displayMsg() }}</div> -->
				<div v-else class="messageChan">
					Created the {{ date?.toLocaleDateString("fr") }},
					{{ date?.toLocaleTimeString("fr") }}
				</div>
			</div>
		</div>
	</router-link>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject, defineProps, ref, Ref, onMounted, onUnmounted } from "vue";

let colors = inject("colors");
let me: string = inject("me")!;
let socket: Socket = inject("socket")!;
let status: Ref<boolean> = ref(false);
const statusDone : Ref<boolean> = ref(false);
const props = defineProps({
	nameConv: {
		type: String,
		required: true,
	},
	message: {
		type: String,
		required: false,
	},
	date: {
		type: Date,
		required: true,
	},
	read: {
		type: Boolean,
		required: true,
	},
	lastMsgUser: {
		type: String,
		required: false,
	},

	avatar: String,
	chan: Boolean,
});

function displayNotRead() {
	if (props.chan && props.read == false)
		return true;
	if (props.read == false && props.lastMsgUser != me)
		return true;
	else 
		return false;
}

function displayMsg() {
	if (props.lastMsgUser == me) return `You: ${props.message}`;
	else if (!props.chan) return props.message;
	else return `${props.lastMsgUser}: ${props.message}`;
}

function convertDate(date: Date): string {
	function pad(d: number) {
		return d < 10 ? "0" + d : d;
	}
	return [
		pad(date.getDate()),
		pad(date.getMonth() + 1),
		date.getFullYear(),
	].join("/");
}

function displayDate(): string {
	const now = new Date();
	let diff = now.getTime() - props.date.getTime();
	let days = diff / (1000 * 3600 * 24);
	let hours = days * 24;
	let mins = hours * 60;
	if (days >= 7) {
		return convertDate(props.date);
	} else if (days >= 1) {
		return Math.floor(days) + "d";
	} else if (hours >= 1) {
		return Math.floor(diff / (1000 * 3600)) + "h";
	} else {
		return Math.floor(mins) + "min";
	}
}


onMounted(() => {
	socket.on("userStatus", (data: {user: string, status: boolean}) => {
		if (data.user == props.nameConv) {
			status.value = data.status;
			statusDone.value = true;
		}
	});
	socket.emit("userStatus", props.nameConv);
})

onUnmounted(() => {
	socket.off('userStatus');
})
</script>

<style scoped>

* {
	--height: 80px;
}

.conv_container {
	background-color: white;
	width: 90%;
	height: var(--height);
	margin-top: 5px;
	margin-bottom: 5px;
	border: solid 2px v-bind("colors.color2");
	border-radius: calc(var(--height) / 2);
}

.avatar_cont {
	width: var(--height);
	height: var(--height);
}
.avatar {
	height: calc(var(--height) - 10px);
	width: calc(var(--height) - 10px);
	position: absolute;
	left: 4px;
	top: 50%;
	transform: translate(0, -50%);
	border-radius: 50%;
	object-fit: cover;
}
.info {
	width: calc(100% - var(--height));
	/* height: 100%; */
	padding-right: 1.5rem;
	margin-top: 5px;
}
.top-bar {
	/* padding-top: 5px; */
	/* height: 1.5rem; */
	margin-bottom: 5px;
}
.login {
	/* width: auto; */
	max-width: 90%;
	/* margin-bottom: 5px; */
	text-align: start;
	font-family: "Orbitron", sans-serif;
	font-weight: 500;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.date {
	width: auto;
	text-align: end;
	color: grey;
	/* font-family: "Orbitron", sans-serif;
	font-size: 0.8rem; */
}
.status {
	color: white;
	padding: 0 5px;
	border-radius: 5px;
	margin-right: auto;
	margin-bottom: 6px;
	background-color: v-bind((status ? "green" : "red"));
}
.message_cont {
	/* height: 100%; */
	text-align: start;
	color: grey;
	/* position: absolute; */
	/* top: 50%; */
}
.messagePriv {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.messageChan {
	margin-top: 10px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

 /* ======================== NOT READ DIPLAY ========================= */
.conv_containerNR {
	border: solid 3px v-bind("colors.color2");
}
.loginNR,
.messageNR {
	font-weight: 800;
}
.messageNR {
	color: v-bind("colors.color2");
}
</style>

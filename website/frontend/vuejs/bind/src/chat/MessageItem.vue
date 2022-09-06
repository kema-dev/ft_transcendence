<template>
	<div class="msg_cont">
		<!-- <span class="date">{{getDateMsg()}}</span> -->
		<div v-if="me == userLogin" class="myMsg_cont raw right">
			<span class="date">{{ getDateMsg() }}</span>
			<div class="myMsg_text">
				{{ message }}
			</div>
		</div>
		<div v-else class="userMsg_cont raw left">
			<img :src="userAvatar" alt="Avatar" class="avatar" />
			<div class="userMsg_text">
				{{ message }}
			</div>
			<span class="date">{{ getDateMsg() }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import { inject, defineProps, onMounted, ref } from "vue";
// import Conversation from '@/chat/Conversation';
import User from "@/chat/objects/User";
import Message from "@/chat/objects/Message";
import BasicUser from "./dto/BasicUserDto";

let colors = inject("colors");
let me: string = inject("me")!;
const props = defineProps({
  userAvatar: {
    type: String,
    required: true,
  },
  userLogin: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

function getDateMsg(): string {
	let ret =
		props.date.getHours() + ":" + props.date.getMinutes();
	ret += "\n" + props.date.toLocaleDateString("fr");
	return ret;
}
</script>

<style scoped>
* {
	--height: 35px;
}
.myMsg_cont {
	width: 100%;
	align-items: center;
}
.myMsg_text {
	width: auto;
	max-width: 65%;
	color: white;
	padding: 8px;
	border-radius: 10px;
	margin: 10px;
	background-color: v-bind("colors.color2");
	white-space: pre-line;
	overflow-wrap: break-word;
}
.userMsg_cont {
	align-items: center;
	padding-left: 7px;
}
.userMsg_text {
	width: auto;
	max-width: 65%;
	color: black;
	padding: 8px;
	border-radius: 10px;
	margin: 10px;
	background-color: white;
	white-space: pre-line;
	overflow-wrap: break-word;
}

.avatar {
	width: var(--height);
	height: var(--height);
	border-radius: 50%;
}
.date {
	font-size: 0.8rem;
	white-space: pre;
}
</style>

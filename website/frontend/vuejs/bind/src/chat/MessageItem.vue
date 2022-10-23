<template>
	<div class="msg_cont">
		<div v-if="me == userLogin" class="myMsg_cont raw right">
			<div class="myMsg_text">
				{{ message }}
			</div>

		</div>
		<div v-else class="userMsg_cont raw left">
			<img :src="userAvatar" @click="toProfile(userLogin)" 
				alt="Avatar" class="avatar" />
			<div class="userMsg_text">
				{{ message }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import router from '@/router';
import { inject, defineProps, onMounted, ref } from 'vue';

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
	displayAvatar: Boolean
});

function toProfile(player: string) {
	router.push({name: 'player', params: { name: player }});
}

</script>

<style scoped>
* {
	--height: 27px;
}
.myMsg_cont {
	width: 100%;
	align-items: center;
}
.myMsg_text {
	width: auto;
	max-width: 70%;
	color: white;
	padding: 8px;
	border-radius: 10px;
	margin: 5px 7px 5px 0;
	text-align: left;
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
	margin: 5px 0 5px 7px;
	text-align: left;
	background-color: white;
	white-space: pre-line;
	overflow-wrap: break-word;
}

.avatar {
	opacity: v-bind("displayAvatar ? 1 : 0");
	width: var(--height);
	height: var(--height);
	border-radius: 50%;
	cursor: pointer;
	object-fit: cover;
}

.date {
	font-size: 0.8rem;
	white-space: pre;
}

</style>

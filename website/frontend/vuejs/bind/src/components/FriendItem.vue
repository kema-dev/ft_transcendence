<template>
	<div class="friend_case left_center row">
		<router-link
			class="center"
			:to="{ name: 'player', params: { name: info.login } }"
		>
			<img :src="info.avatar" class="avatar" alt="avatar" />
		</router-link>
		<div class="friendInfoCont center column">
			<div class="space-between raw">
				<h2 @click="toProfile(info.login)" class="name">
					{{ info.login }}
				</h2>
				<!-- <button v-if="friend == true"
					class="action"
					style="margin-right: 10px"
					@click="remove_friend(info.login)"
				>
					X
				</button> -->
			</div>
			<div class="space-between raw">
				<div class="levelStatus left column">
					<h3 class="level">level {{ info.level }}</h3>
					<h3 v-if="statusDone" class="status">
						{{ status ? "online" : "offline" }}
					</h3>
				</div>
				<div class="btns space-evenly raw stack">
					<button v-if="!friend" @click="addFriend(user.login)" class="btnCont center">
						<span class="infoButtonText">Friend request</span>
						<img src="@/assets/add_friend.svg" class="btnImg">
					</button>
					<button @click="inviteGame(user.login)" class="btnCont center">
						<span class="infoButtonText">Invit in game</span>
						<img src="@/assets/ball_logo.svg" class="btnImg">
					</button>
					<button @click="toChat(user.login)" class="btnCont center">
						<span class="infoButtonText">Chat</span>
						<img src="@/assets/chat.svg" class="btnImg">
					</button>
					<button v-if="friend" @click="removeFriend(user.login)" class="btnCont center">
						<span class="infoButtonText">Delete friend</span>
						<img src="@/assets/delete_logo.svg" class="btnImg">
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineProps, inject, onMounted, onUnmounted, ref, Ref } from "vue";
import { Socket } from 'engine.io-client';
import router from "@/router";
import ResumUserDto from "@/dto/ResumUserDto";

let socket: Socket = inject("socket")!;
let me = inject("user")!;
let colors = inject("colors");
const props = defineProps(["info", "friend"]);
let statusColor = {
	online: "green",
	offline: "red",
	"in game": "orange",
};
let status: Ref<boolean> = ref(false);
const statusDone : Ref<boolean> = ref(false);

function addFriend(name: string) {
	socket.emit('addFriend', { sender: me.value.login, receiver: name });
}

function removeFriend(name: string) {
	socket.emit("removeFriend", { sender: me.value.login, receiver: name });
}

function toProfile(login: string) {
	router.push({name: 'player', params: {name: login}})
}

onMounted(() => {
	socket.on("userStatus", (data: {user: string, status: boolean}) => {
		if (data.user == props.friend.login) {
			status.value = data.status;
			statusDone.value = true;
		}
	});
	socket.emit("userStatus", props.friend.login);
})

onUnmounted(() => {
	socket.off('userStatus');
})
</script>

<style scoped>
.friend_case {
	width: 90%;
	height: 80px;
	background: #fff;
	border: solid 1px #ccc;
	border-radius: 100px;
	margin: 5px 0;
	padding-right: 3px;
	padding-left: 4px;
	font-size: 1.2rem;
	outline: none;
	/* box-shadow: 0px 0px 5px #aaa; */
	border: 2px solid v-bind("colors.color2");
}
.avatar {
	width: 70px;
	height: 70px;
	border-radius: 50%;
	margin-right: 5px;
	object-fit: cover;
}
.friendInfoCont {
	max-width: calc(100% - 75px);
	margin-bottom: auto;
	margin-top: 5px;
}
.name {
	width: auto;
	max-width: 80%;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	text-align: left;
	cursor: pointer;
	margin-bottom: 7px;
}
.levelStatus {
	width: min-content;
}
.level {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	text-align: left;
	margin-bottom: 5px;
}
.status {
	/* margin: 0 9px; */
	color: white;
	padding: 0 5px;
	border-radius: 5px;
	background-color: v-bind((status ? "green" : "red"));
}
.btns {
	width: calc(100% - 60px);
}
.btnCont {
	width: 30px;
	height: 30px;
	border-radius: 50%;
}
.btnImg {
	width: 24px;
	height: 24px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
.btnCont:hover {
	background-color: v-bind("colors.color2");
	box-shadow: 0px 0px 4px #aaa;
}
.btnCont:hover > .btnImg {
	filter: brightness(0) invert(1);
}
.infoButtonText {
	visibility: hidden;
	font-size: 0.8rem;
	width: 120px;
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
.btnCont:hover .infoButtonText {
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

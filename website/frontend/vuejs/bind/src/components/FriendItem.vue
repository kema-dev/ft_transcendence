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
				<h2 @click="toProfile()" class="name">
					{{ info.login }}
				</h2>
			</div>
			<div class="space-between raw">
				<div @click="toProfile()" class="levelStatus left column">
					<h3 v-if="statusDone" class="status">
						{{ userStatus}}
					</h3>
					<h3 class="level">level {{ info.level }}</h3>
				</div>
				<div class="btns space-evenly raw stack">
					<button v-if="!friend" @click="addFriend()" class="btnCont center">
						<span class="infoButtonText">Friend request</span>
						<img src="@/assets/add_friend.svg" class="btnImg">
					</button>
					<button v-if="statusDone && userStatus != 'in game'" 
						@click="inviteGame()" class="btnCont center"
					>
						<span class="infoButtonText">Invit in game</span>
						<img src="@/assets/ball_logo.svg" class="btnImg">
					</button>
					<button v-else @click="specGame()" class="btnCont center">
						<span class="infoButtonText">Watch game</span>
						<img src="@/assets/eye.svg" class="btnImg">
					</button>
					<button @click="toChat()" class="btnCont center">
						<span class="infoButtonText">Chat</span>
						<img src="@/assets/chat.svg" class="btnImg">
					</button>
					<button v-if="friend" @click="removeFriend()" class="btnCont center">
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
import { useToast } from 'vue-toastification';
import ProfileUserDto from "@/dto/ProfileUserDto";

const toast = useToast();
let socket: Socket = inject("socket")!;
let me : Ref<ProfileUserDto> = inject("user")!;
let colors = inject("colors");
const props = defineProps(["info", "friend"]);
let statusColor: Ref<string> = ref('');
let userStatus: Ref<string> = ref('');
const statusDone : Ref<boolean> = ref(false);

function addFriend() {
	socket.emit('addFriend', { sender: me.value.login, receiver: props.info.login });
}

function removeFriend() {
	socket.emit("removeFriend", { sender: me.value.login, receiver: props.info.login });
}

function toProfile() {
	router.push({name: 'player', params: {name: props.info.login}});
}

function toChat() {
	router.push({name: 'PrivConv', params: {conv_name: props.info.login}})
}

function specGame() {

}

function inviteGame() {
	socket.emit("invite_to_game", { login: props.info.login });
}

onMounted(() => {
	console.log('friendItem mounted')
	socket.on("userStatus", (data: {user: string, status: string}) => {
		if (data.user == props.info.login) {
			userStatus.value = data.status;
			if (data.status == 'online')
				statusColor.value = 'green';
			else if (data.status == 'offline')
				statusColor.value = '#FF3333';
			else {
				statusColor.value = 'orange';
				userStatus.value = 'in game'
			}
			statusDone.value = true;
		}
	})
	socket.on('invite_to_game', (data) => {
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
	socket.emit("userStatus", props.info.login);
})

onUnmounted(() => {
	console.log('friendItem dead')
	socket.off('userStatus');
	socket.off('invite_to_game');
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
	margin-right: 6px;
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
	margin-bottom: 5px;
}
.levelStatus {
	width: auto;
}
.status {
	color: white;
	padding: 1px 5px;
	border-radius: 5px;
	margin-bottom: 5px;
	background: v-bind(statusColor);
}
.level {
	width: 65px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	text-align: left;
	font-weight: 500;
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

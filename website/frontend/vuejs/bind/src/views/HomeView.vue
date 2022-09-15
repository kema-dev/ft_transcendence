<template>
	<div id="home" class="wrap" :key="reload">
		<NavbarItem />
		<!-- <router-link to="/">Log out</router-link> -->
		<div id="game" class="center">
			<!-- <div id="field"> -->
			<MatchmakingItem />
			<!-- <GameItem /> -->
			<!-- </div> -->
		</div>
		<NavmenuItem />
	</div>
</template>

<script setup lang="ts">
import NavbarItem from "@/components/NavbarItem.vue";
import NavmenuItem from "@/components/NavmenuItem.vue";
import { onMounted, Ref, provide, watch, onUnmounted } from "vue";
import { inject, ref } from "vue";
import MatchmakingItem from "@/components/MatchmakingItem.vue";
import io from "socket.io-client";
import { VueCookies } from "vue-cookies";
import { FQDN } from "../../.env.json";
import { Socket } from "socket.io-client";
import HTTP from "../components/axios";
import { PrivConv } from "@/chat/objects/PrivConv";
import Message from "@/chat/objects/Message";
import BasicUser from "@/chat/dto/BasicUserDto";
import axios from "axios";
// import { FQDN } from "@/.env.json";

// let define = inject("colors");

// COOKIES + APIPATCH
const $cookies = inject<VueCookies>("$cookies")!;
const apiPath = FQDN + ":3000/api/v1/";
provide("apiPath", apiPath);

// GET MY NAME + AVATAR
const me: string = $cookies.get("login");
console.log(`I am '${me}'`);

// CREATE SOCKET
let socket = io(FQDN + ":3000", { query: { login: me } });
provide("socket", socket);

function post(url: string, args: any, fct: any) {
	let data;
	axios
		.post(FQDN + ":3000/api/v1/" + url, args)
		.then(fct)
		.catch((error) => {
			console.log(url + ": failed request.\nargs: " + args);
			console.log(error);
		});
}
let userRef = ref();
// post('user/getUser', {login: me}, (data: any) => {
// 	userRef.value = data.data;
// });
socket.on("userUpdate", (data: any) => {
	if (data && data.login == me) {
		userRef.value = data;
		console.log(userRef.value);
		// provide("user", userRef);
	}
});
socket.emit('userUpdate', {login: me});
provide("user", userRef);
provide("me", me);

// socket.on('newPrivConv', (data: PrivConv) => {
// 	let privTmp = privs.value!;
// 	privTmp.push(data);
// 	privs.value = privTmp;
// })
// socket.on('newPrivMsg', (data: {msg: Message, id: number}) => {
// 	let privsTmp = privs.value!;
// 	let priv = privsTmp.find(priv => priv.id == data.id);
// 	priv?.messages.push(data.msg);
// 	privs.value = privsTmp;
// })

// RESIZE WINDOW
let reload = ref(0);
onMounted(() => {
	window.addEventListener("resize", () => {
		reload.value++;
	});
});

// GET PRIVS
let privs: PrivConv[] = [];
let privsRef: Ref<PrivConv[]> = ref(privs);
let privDone = ref(false);
getPrivsRequest();
provide("privs", privsRef);
provide("privDone", privDone);

onUnmounted(() => {
	socket.disconnect();
});

// function updatePrivs() {
// 	privs.value = 'South Pole'
// }

function getPrivsRequest() {
	console.log(`avant getPrivsRequest()`);
	HTTP.get(apiPath + "chat/getPrivs/" + me)
		.then((res) => {
			console.log(`privsConvDto : `);
			res.data.forEach((priv: PrivConv) => {
				console.log(`user = ${priv.user.login}`);
				priv.messages.forEach((msg) => console.log(`${msg.msg}`));
				// priv.messages.forEach((msg) => console.log(
				// 	`msg = '${msg.msg}',
				// 	user = ${msg.user},
				// 	date = ${msg.date}`
				// ));
			});

			if (!res.data)
				// privs.value = [];
				// privs = [];
				privsRef.value = [];
			else {
				// privs.value = res.data;
				let privsTmp: PrivConv[] = [];
				res.data.forEach((priv: PrivConv) => {
					let msgsTmp: Message[] = [];
					priv.messages.forEach((msg, j) => {
						msgsTmp.push(
							new Message(msg.user, msg.msg, new Date(msg.date))
						);
					});
					privsTmp.push(
						new PrivConv(priv.user, msgsTmp, priv.readed, priv.id)
					);
					console.log(`readed = ${priv.readed}`);
				});
				// privs.value = privsTmp;
				// privs = privsTmp;
				privsRef.value = privsTmp;
			}

			// privsRef = ref(privs);
			privDone.value = true;
			console.log(`getPrivsRequest Done`);

			// console.log(`privsObject : `);
			// privs.forEach(priv => {
			// 	console.log(`user = ${priv.user.login}`);
			// 	priv.messages.forEach((msg) => console.log(`${msg.msg}`));
			// });
			console.log(`privsRef : `);
			privsRef.value.forEach((priv) => {
				console.log(`user = ${priv.user.login}`);
				priv.messages.forEach((msg) => console.log(`${msg.msg}`));
			});
		})
		.catch((e) => console.log(e));
}

watch(privsRef, () => {
	console.log(`privs changed in homeview`);
});

// CREATE SOCKET LISTENERS
socket.on("newPrivConv", (data: PrivConv) => {
	console.log(`New private created`);
	// let privTmp = privs.value!;
	// privTmp.push(data);
	// privs.value = privTmp;
	// ==============
	// privs.push(data);
	// ==============
	// let msg = new Message(data.messages[0].user, data.messages[0].msg, new Date (data.messages[0].date));
	// privsRef.value.push(new PrivConv(new BasicUser(data.user.login), [msg], data.readed, data.id));
	// ==============
	let newPriv = data;
	newPriv.messages.forEach((msg) => (msg.date = new Date(msg.date)));
	privsRef.value.push(data);

	console.log(`privsRef : `);
	privsRef.value.forEach((priv) => {
		console.log(`user = ${priv.user.login}`);
		priv.messages.forEach((msg) => console.log(`${msg.msg}`));
	});
});
socket.on("newPrivMsg", (data: { msg: Message; id: number }) => {
	console.log(`New message received : ${data.msg.msg}`);
	// let privsTmp = privs.value!;
	// let priv = privsTmp.find(priv => priv.id == data.id);
	// priv?.messages.push(data.msg);
	// privs.value = privsTmp;
	// ==============
	// let priv = privs.find(priv => priv.id == data.id);
	// priv?.messages.push(data.msg);
	// ==============
	let i = privsRef.value.findIndex((priv) => priv.id == data.id);
	privsRef.value[i].messages.push(
		new Message(data.msg.user, data.msg.msg, new Date(data.msg.date))
	);

	console.log(`privsRef : `);
	privsRef.value.forEach((priv) => {
		console.log(`user = ${priv.user.login}`);
		priv.messages.forEach((msg) => console.log(`${msg.msg}`));
	});
});

// console.log(`Homeview finished`);
</script>

<style>
#home {
	width: 100%;
	align-items: center;
}
#game {
	width: 70vw;
	/* height: 100%; */
	padding-top: 60px;
}
/* #field {
	width: clamp(0px, 50vw, 80vh);
	height: clamp(0px, 50vw, 80vh);
} */
@media screen and (max-width: 1000px) {
	#game {
		/* margin: 100px 0; */
		width: 100%;
	}
}
</style>

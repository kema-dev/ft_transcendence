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
import { onMounted, Ref, provide, watch } from "vue";
import { inject, ref } from "vue";
import MatchmakingItem from '@/components/MatchmakingItem.vue';
import io from "socket.io-client"
import { VueCookies } from "vue-cookies";
import { FQDN } from "../../.env.json";
import { Socket } from "socket.io-client";
import HTTP from "../components/axios";
import { PrivConv } from "@/chat/objects/PrivConv"
import Message from "@/chat/objects/Message";
import BasicUser from "@/chat/dto/BasicUserDto";
// import { FQDN } from "@/.env.json";

// let define = inject("colors");

// COOKIES + APIPATCH
const $cookies = inject<VueCookies>('$cookies')!;
const apiPath = FQDN + ":3000/api/v1/";
provide("apiPath", apiPath);

// GET MY NAME + AVATAR
const me : string = $cookies.get('login');
provide("me", me);
console.log(`I am '${me}'`)

// CREATE SOCKET
let socket = io(FQDN + ':3000', {query: {login: me}});
provide("socket", socket);

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
let reload = ref(0)
onMounted(() => {
	window.addEventListener("resize", () => {
		reload.value++;
	})
});
	

// GET PRIVS 
// let privs : PrivConv[] = []; 
let privsRef : Ref<PrivConv[]> = ref([]);
let privDone = ref(false);
getPrivsRequest();
provide('privs', privsRef);
provide('privDone', privDone);


function getPrivsRequest() {
	// console.log(`avant getPrivsRequest()`);
	HTTP.get(apiPath + "chat/getPrivs/" + me)
	.then(res => {
		// console.log(`privsConvDto : `);
		// printPrivs(res.data);

		if (!res.data)
			// privs.value = [];
			// privs = [];
			privsRef.value = [];
		else {
			// privs.value = res.data;
			let privsTmp : PrivConv[] = [];
			res.data.forEach((priv : PrivConv) => {
				let msgsTmp : Message[] = [];
				priv.messages.forEach((msg, j) => {
					msgsTmp.push(new Message(msg.user, msg.msg, new Date(msg.date)))
				});
				privsTmp.push(new PrivConv(priv.user, msgsTmp, priv.readed, priv.id));
			});
			// privs.value = privsTmp;
			// privs = privsTmp;
			privsRef.value = privsTmp;
		}

		privDone.value = true;
		// console.log(`getPrivsRequest Done`);

		// printPrivs(privsRef.value);
	})
	.catch(e => console.log(e));
}

// CREATE SOCKET LISTENERS 
socket.on('newPrivConv', (data: PrivConv) => {
	console.log(`New private created`)
	// let privTmp = privsRef.value!;
	// let msg = new Message(data.messages[0].user, data.messages[0].msg, new Date (data.messages[0].date));
	// privTmp.push(new PrivConv(new BasicUser(data.user.login), [msg], data.readed, data.id));
	// privsRef.value = privTmp;
	// ==============
	// privs.push(data);
	// ==============
	// let msg = new Message(data.messages[0].user, data.messages[0].msg, new Date (data.messages[0].date));
	// privsRef.value.push(new PrivConv(new BasicUser(data.user.login), [msg], data.readed, data.id));
	// ==============
	let newPriv = data;
	newPriv.messages.forEach(msg => msg.date = new Date(msg.date));
	privsRef.value.unshift(data);

	// console.log(`privsRef : `);
	// printPrivs(privsRef.value);
})
socket.on('newPrivMsg', (data: {msg: Message, id: number}) => {
	console.log(`New message received : ${data.msg.msg}`)
	// let privsTmp = privsRef.value!;
	// let priv = privsTmp.find(priv => priv.id == data.id);
	// priv?.messages.push(new Message(data.msg.user, data.msg.msg, new Date(data.msg.date)));
	// privsRef.value = privsTmp;
	// ==============
	// let priv = privs.find(priv => priv.id == data.id);
	// priv?.messages.push(data.msg);
	// // ==============
	let i = privsRef.value.findIndex(priv => priv.id == data.id);
	privsRef.value[i].messages.push(new Message(data.msg.user, data.msg.msg, new Date(data.msg.date)));
	if (i != 0)
		putPrivFirst(i);

	// console.log(`privsRef : `);
	// printPrivs(privsRef.value);
})

// watch(privsRef, () => {
// 	console.log(`privs changed in homeview`);
// })

function putPrivFirst(index: number) {
	// if(privsRef.value.length == 1)
	// 	return;
	if (privsRef.value.length == 2)
		return [privsRef.value[0], privsRef.value[1]] = [privsRef.value[1], privsRef.value[0]];
	let privTmp1 = privsRef.value[0];
	let privTmp2 : PrivConv;
	privsRef.value[0] = privsRef.value[index];
	for(let i = 1; i <= index && i < privsRef.value.length - 1; i++) {
		privTmp2 = privsRef.value[i];
		privsRef.value[i] = privTmp1;
		privTmp1 = privTmp2;
	}
}

function printPriv(priv: PrivConv) {
	priv.messages.forEach((msg) => console.log(`${msg.msg}`));
}

function printPrivs(privs: PrivConv[]) {
	privs.forEach((priv : PrivConv) => {
		console.log(`user = ${priv.user.login}`);
		printPriv(priv);
	});
}

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

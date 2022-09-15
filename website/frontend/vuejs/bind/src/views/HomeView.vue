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
import { PrivConvDto } from "@/chat/dto/PrivConvDto"
import { ChannelDto } from "@/chat/dto/ChannelDto"
import { MessageDto } from "@/chat/dto/MessageDto";
import { BasicUserDto } from "@/chat/dto/BasicUserDto";
import { chansRef } from "@/globals";


//  ========== COOKIES + APIPATCH
const $cookies = inject<VueCookies>('$cookies')!;
const apiPath = FQDN + ":3000/api/v1/";
provide("apiPath", apiPath);

//	========== GET MY NAME + AVATAR
const me : string = $cookies.get('login');
provide("me", me);
console.log(`I am '${me}'`)

//	========== CREATE SOCKET
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

//	========== RESIZE WINDOW
let reload = ref(0)
onMounted(() => {
	window.addEventListener("resize", () => {
		reload.value++;
	})
});

//	===================== CHAT =====================
	
//	========== GET PRIVS 
let privsRef : Ref<PrivConvDto[]> = ref([]);
let nbPrivNR : Ref<number[]> = ref([]);
function resetNbPrivNR() {
	nbPrivNR.value = [];
}
let privDone = ref(false);
function markReaded(index : number, readed: boolean) {
	privsRef.value[index].readed = readed;
}
getPrivsRequest();
provide('privs', privsRef);
// provide('nbPrivNR', {nbPrivMsg: nbPrivNR, editNbPrivMsg: editNbPrivNR});
provide('nbPrivNR', {n: nbPrivNR, reset: resetNbPrivNR});

provide('markReaded', markReaded);
provide('privDone', privDone);


function getPrivsRequest() {
	// console.log(`avant getPrivsRequest()`);
	HTTP.get(apiPath + "chat/getPrivs/" + me)
	.then(res => {
		// console.log(`privsConvDto : `);
		// printPrivs(res.data);
		if (!res.data)
			privsRef.value = [];
		else {
			// privs.value = res.data;
			let privsTmp : PrivConvDto[] = [];
			res.data.forEach((priv : PrivConvDto) => {
				let msgsTmp : MessageDto[] = [];
				priv.messages.forEach((msg, j) => {
					msgsTmp.push(new MessageDto(msg.user, msg.msg, new Date(msg.date)))
				});
				privsTmp.push(new PrivConvDto(new BasicUserDto(priv.user.login), msgsTmp, priv.readed, priv.id));
				if (priv.readed == false && priv.messages.at(-1)?.user != me)
					nbPrivNR.value.push(priv.id);
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




//	========== CREATE SOCKET LISTENERS 
socket.on('newPrivConv', (data: PrivConvDto) => {
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
	newPriv.user = new BasicUserDto(newPriv.user.login);
	newPriv.messages.forEach(msg => msg.date = new Date(msg.date));
	privsRef.value.unshift(data);
	if (data.messages[0].user != me)
		nbPrivNR.value.push(data.id);

	// console.log(`privsRef : `);
	// printPrivs(privsRef.value);
})
socket.on('newPrivMsg', (data: {msg: MessageDto, id: number}) => {
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
	privsRef.value[i].messages.push(new MessageDto(data.msg.user, data.msg.msg, new Date(data.msg.date)));
	privsRef.value[i].readed = false;
	if (data.msg.user != me && !nbPrivNR.value.includes(privsRef.value[i].id))
		nbPrivNR.value.push(privsRef.value[i].id);
	// console.log(`nbr Priv Mesage Not Read = ${nbPrivNR.value}`)
	if (i != 0)
		putPrivFirst(i);
})

// watch(privsRef, () => {
// 	console.log(`privs changed in homeview`);
// })

function putPrivFirst(index: number) {
	// if(privsRef.value.length == 1)
	// 	return;
	if (privsRef.value.length == 2)
		return [privsRef.value[0], privsRef.value[1]] = [privsRef.value[1], privsRef.value[0]];
	console.log(`index = ${index}`);
		let privTmp1 = privsRef.value[0];
	let privTmp2 : PrivConvDto;
	privsRef.value[0] = privsRef.value[index];
	for(let i = 1; i <= index && i < privsRef.value.length; i++) {
		privTmp2 = privsRef.value[i];
		privsRef.value[i] = privTmp1;
		privTmp1 = privTmp2;
	}
}

function printPriv(priv: PrivConvDto) {
	priv.messages.forEach((msg) => console.log(`${msg.msg}`));
}

function printPrivs(privs: PrivConvDto[]) {
	privs.forEach((priv : PrivConvDto) => {
		console.log(`user = ${priv.user.login}`);
		printPriv(priv);
	});
}

//	========== GET CHANNELS

// let test = new ChannelDto("first Channel", [new BasicUser(me)]);

// console.log(`Before push`);
// printChans(chansRef.value);
// chansRef.value.push(test);
// console.log(`After push`);
// printChans(chansRef.value);



function printChan(chan: ChannelDto) {
	chan.messages.forEach((msg) => console.log(`${msg.msg}`));
}

function printChans(chans: ChannelDto[]) {
	chans.forEach((chan : ChannelDto) => {
		console.log(`channelName = ${chan.name}`);
		printChan(chan);
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

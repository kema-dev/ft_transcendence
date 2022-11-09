<template>
	<div id="home" class="wrap">
		<NavbarItem />
		<div id="game" class="center column">
			<MatchmakingItem />
		</div>
		<NavmenuItem />
	</div>
</template>

<script setup lang="ts">
import { onMounted, Ref, provide, watch, onUpdated, nextTick } from 'vue';
import { inject, ref } from 'vue';
import io from 'socket.io-client';
import { VueCookies } from 'vue-cookies';
import { useRoute } from 'vue-router';
import HTTP from '../components/axios';
import { FQDN } from '../../.env.json';
import MatchmakingItem from '@/components/MatchmakingItem.vue';
import NavbarItem from '@/components/NavbarItem.vue';
import NavmenuItem from '@/components/NavmenuItem.vue';
import { PrivConvDto } from '@/chat/dto/PrivConvDto';
import { ChannelDto } from '@/chat/dto/ChannelDto';
import { MessageDto } from '@/chat/dto/MessageDto';
import { BasicUserDto } from '@/chat/dto/BasicUserDto';
import ProfileUserDto from '@/dto/ProfileUserDto';
import { ModifChanDto } from '@/chat/dto/ModifChanDto';
import ResumUserDto from '@/dto/ResumUserDto';

//  ========== COOKIES + APIPATCH + ROUTE

const $cookies = inject<VueCookies>('$cookies')!;
const apiPath = FQDN + ':3000/api/v1/';
provide('apiPath', apiPath);
const route = useRoute();

//	========== GET MY NAME + AVATAR

const me: string = $cookies.get('login');
provide('me', me);
// console.log(`i am ${me}`)

//	========== CREATE SOCKET

let socket = io(FQDN + ':3000', { query: { login: me } });
socket.emit("userLogin", me);
provide('socket', socket);

let userRef: Ref<ProfileUserDto> = ref();
let notifs = ref(0);
let userDone = ref(false);

socket.on('userUpdate', (data: any) => {
	if (data && data.login == me) {
		userRef.value = data;
		notifs.value = data.requestFriend.length;
	}
});
getMyProfile();
provide('notifs', notifs);
provide('user', userRef);
provide('userDone', userDone);
provide('isCreate', ref(false));
provide('isJoin', ref(false));

function getMyProfile() {
	HTTP.get(apiPath + "user/getMyProfile/" + me)
	.then(res => {
		userRef.value = res.data;
		notifs.value = res.data.requestFriend.length;
		userDone.value = true;
		// console.log(`GetMyProfile Done`)
	})
	// .catch(e => console.log(e));
}

socket.on("userBlock", (data : ResumUserDto) => {
	// console.log(`User ${data.login} blocked`);
	let i = privsRef.value.findIndex((p) => p.user.login == data.login);
	privsRef.value.splice(i, 1);
	userRef.value.blockeds.push(data);
});

socket.on('userUnblock', (data: PrivConvDto) => {
	// console.log(`User ${data.user.login} unblocked with priv`);
	let priv = data;
	priv.messages.forEach((m) => (m.date = new Date(m.date)));
	let i = userRef.value.blockeds.findIndex((b) => b.login == priv.user.login);
	userRef.value.blockeds.splice(i, 1);
	privsRef.value.unshift(priv);
});

socket.on('userUnblockNoPriv', (data: string) => {
	// console.log(`User ${data} unblocked WITHOUT priv`);
	let i = userRef.value.blockeds.findIndex((b) => b.login == data);
	userRef.value.blockeds.splice(i, 1);
});


//	===================== CHAT =====================

//	========== GET PRIVS
let privsRef: Ref<PrivConvDto[]> = ref([]);
let nbPrivNR: Ref<number[]> = ref([]);
let privDone = ref(false);
let findPrivIndex = ref(false);
function resetNbPrivNR() {
	nbPrivNR.value = [];
}
getPrivsRequest();
provide('privs', privsRef);
provide('nbPrivNR', { n: nbPrivNR, reset: resetNbPrivNR });
provide('privDone', privDone);
provide('findPrivIndex', findPrivIndex);


function getPrivsRequest() {
	HTTP.get(apiPath + 'chat/getPrivs/' + me)
		.then((res) => {
			if (!res.data) {
				privsRef.value = [];
			} else {
				let privsTmp: PrivConvDto[] = res.data;
				privsTmp.forEach((priv) => {
					priv.messages.forEach((msg) => (msg.date = new Date(msg.date)));
				});
				nbPrivNR.value = privsTmp
					.filter((p) =>
						p.readed || p.messages.at(-1)!.user == me ? false : true,
					)
					.map((p) => p.id);
				privsRef.value = privsTmp;
			}
			privDone.value = true;
			// console.log(`getPrivs Done`);
		})
		// .catch((e) => console.log(e));
}

//	========== CREATE SOCKET LISTENERS

socket.on('newPrivConv', (data: PrivConvDto) => {
	console.log(`New private created`);
	let newPriv = data;
	newPriv.messages.forEach((msg) => (msg.date = new Date(msg.date)));
	privsRef.value.unshift(newPriv);
	findPrivIndex.value = true;
	if (data.messages[0].user != me) nbPrivNR.value.push(data.id);
});

socket.on('newPrivMsg', (data: { msg: MessageDto; id: number }) => {
	if (userRef.value.blockeds.map((m) => m.login).includes(data.msg.user))
		return;
	console.log(`New Private message received : ${data.msg.msg}`);
	let i = privsRef.value.findIndex((priv) => priv.id == data.id);
	privsRef.value[i].messages.push(
		new MessageDto(data.msg.user, data.msg.msg, new Date(data.msg.date)),
	);
	privsRef.value[i].readed = false;
	let blocked = userRef.value.blockeds
		.map((b) => b.login)
		.includes(data.msg.user);
	if (
		data.msg.user != me &&
		!nbPrivNR.value.includes(privsRef.value[i].id) &&
		route.path != '/home/chat/private/' + data.msg.user &&
		!blocked 
	) {
		nbPrivNR.value.push(privsRef.value[i].id);
		findPrivIndex.value = true;
	}
	if (i != 0) putPrivFirst(i);
});

function putPrivFirst(index: number) {
	if (privsRef.value.length == 2)
		return ([privsRef.value[0], privsRef.value[1]] = [
			privsRef.value[1],
			privsRef.value[0],
		]);
	let privTmp1 = privsRef.value[0];
	let privTmp2: PrivConvDto;
	privsRef.value[0] = privsRef.value[index];
	for (let i = 1; i <= index && i < privsRef.value.length; i++) {
		privTmp2 = privsRef.value[i];
		privsRef.value[i] = privTmp1;
		privTmp1 = privTmp2;
	}
}

function printPriv(priv: PrivConvDto) {
	priv.messages.forEach((msg) => console.log(`${msg.msg}`));
}

function printPrivs(privs: PrivConvDto[]) {
	if (!privs.length) console.log(`privs empty`);
	privs.forEach((priv: PrivConvDto) => {
		console.log(`user = ${priv.user.login}`);
		printPriv(priv);
	});
}

//	========== GET CHANNELS

const chansRef: Ref<ChannelDto[]> = ref([]);
const nbChanNR: Ref<string[]> = ref([]);
const chanDone = ref(false);
const chanBan = ref('');
const findChanIndex = ref(false);
function resetNbChanNR() {
	nbChanNR.value = [];
}
function chanReaded(index: number, readed: boolean) {
	chansRef.value[index].readed = readed;
}

getChansRequest();
provide('chans', chansRef);
provide('nbChanNR', { n: nbChanNR, reset: resetNbChanNR });
provide('chanReaded', chanReaded);
provide('chanDone', chanDone);
provide('chanBan', chanBan);
provide('findChanIndex', findChanIndex);

function getChansRequest() {
	HTTP.get(apiPath + 'chat/getChans/' + me)
		.then((res) => {
			if (!res.data) chansRef.value = [];
			else {
				chansRef.value = res.data as ChannelDto[];
				chansRef.value.forEach((chan) => {
					chan.creation = new Date(chan.creation);
					chan.messages.forEach((msg) => (msg.date = new Date(msg.date)));
				});
			}
			chanDone.value = true;
			// console.log(`getChans Done`);
		})
		// .catch((e) => console.log(e));
}

//	========== CREATE SOCKET LISTENERS

socket.on('newChanMsg', (data: { msg: MessageDto; name: string }) => {
	console.log(`New Channel message received :
		channel = ${data.name}, msg = ${data.msg.msg}`);
	let i = chansRef.value.findIndex((chan) => chan.name == data.name);
	chansRef.value[i].messages.push(
		new MessageDto(data.msg.user, data.msg.msg, new Date(data.msg.date)),
	);
	let blocked = userRef.value.blockeds
		.map((b) => b.login)
		.includes(data.msg.user);
	if (!blocked) chansRef.value[i].readed = false;
	if (
		data.msg.user != me &&
		!nbChanNR.value.includes(chansRef.value[i].name) &&
		route.path != '/home/chat/channel/' + data.name &&
		!blocked
	) {
		nbChanNR.value.push(chansRef.value[i].name);
	}
	if (i != 0) {
		putChanFirst(i);
		findChanIndex.value = true;
	}
});

socket.on('newChannel', (data: ChannelDto) => {
	if (!chansRef.value.map((chan) => chan.name).includes(data.name)) {
		console.log(`invited in channel '${data.name}'`);
		let newChan = data;
		newChan.creation = new Date(newChan.creation);
		newChan.messages.forEach((msg) => (msg.date = new Date(msg.date)));
		newChan.readed = false;
		chansRef.value.unshift(newChan);
		findChanIndex.value = true;
		nbChanNR.value.push(chansRef.value[0].name);
	}
});

socket.on('newChannelUser', (data: { name: string; user: BasicUserDto }) => {
	console.log(`New User '${data.user.login}' in channel : ${data.name}`);
	let i = chansRef.value.findIndex((chan) => chan.name == data.name);
	chansRef.value[i].users.push(data.user);
});

socket.on('userQuitChan', (data: { login: string; chan: string }) => {
	console.log(`User '${data.login}' left the channel '${data.chan}'`);
	let i = chansRef.value.findIndex((chan) => chan.name == data.chan);
	let y;
		if (chansRef.value[i].owner && data.login == chansRef.value[i].owner.login)
			chansRef.value[i].owner = null;
		else if ((y = chansRef.value[i].admins.findIndex(u => u.login == data.login)) != -1)
			chansRef.value[i].admins.splice(i, 1);
		else if ((y = chansRef.value[i].users.findIndex(u => u.login == data.login)) != -1)
			chansRef.value[i].users.splice(i, 1);
		else if ((y = chansRef.value[i].mutes.findIndex(u => u.login == data.login)) != -1)
			chansRef.value[i].mutes.splice(i, 1);
});

socket.on('modifChan', (data: ModifChanDto) => {
	console.log(`Chan '${data.chan}' modified`);
	let i = chansRef.value.findIndex((chan) => chan.name == data.chan);
	if (data.psw != undefined) {
		console.log(`Psw from chan '${data.chan}' modified`);
		data.psw == ''
			? (chansRef.value[i].psw = undefined)
			: (chansRef.value[i].psw = data.psw);
	}
	if (data.priv != undefined) {
		console.log(`Private from chan '${data.chan}' modified`);
		chansRef.value[i].priv = data.priv;
	} else if (data.promotAdm) {
		console.log(
			`User '${data.promotAdm}' from chan '${data.chan}' promoted to Admin`,
		);
		let j = chansRef.value[i].users.findIndex(
			(user) => user.login == data.promotAdm,
		);
		chansRef.value[i].admins.push(chansRef.value[i].users[j]);
		chansRef.value[i].users.splice(j, 1);
	} else if (data.demotUser) {
		console.log(
			`Admin '${data.demotUser}' from chan '${data.chan}' demoted to User`,
		);
		let j = chansRef.value[i].admins.findIndex(
			(user) => user.login == data.demotUser,
		);
		chansRef.value[i].users.push(chansRef.value[i].admins[j]);
		chansRef.value[i].admins.splice(j, 1);
	} else if (data.mute) {
		console.log(`User '${data.mute}' from chan '${data.chan}' is muted`);
		let j = (
			chansRef.value[i][data.group as keyof ChannelDto] as BasicUserDto[]
		).findIndex((user) => user.login == data.mute);
		chansRef.value[i].mutes.push(
			(chansRef.value[i][data.group as keyof ChannelDto] as BasicUserDto[])[j],
		);
		(
			chansRef.value[i][data.group as keyof ChannelDto] as BasicUserDto[]
		).splice(j, 1);
	} else if (data.restoreMute) {
		console.log(
			`User '${data.restoreMute}' from chan '${data.chan}' is unmuted`,
		);
		let j = chansRef.value[i].mutes.findIndex((user) => user.login == data.restoreMute,);
		chansRef.value[i].users.push(chansRef.value[i].mutes[j]);
		chansRef.value[i].mutes.splice(i, 1);
	} else if (data.kick) {
		console.log(`User '${data.kick}' from chan '${data.chan}' is kicked`);
		if (data.kick == me) {
			chanBan.value = data.chan;
			setTimeout(() => {
				chansRef.value.splice(i, 1);
				chanBan.value = '';
			}, 200);
		}
		let j = (
			chansRef.value[i][data.group as keyof ChannelDto] as BasicUserDto[]
		).findIndex((user) => user.login == data.ban);
		(
			chansRef.value[i][data.group as keyof ChannelDto] as BasicUserDto[]
		).splice(j, 1);
	} else if (data.ban) {
		console.log(`User '${data.ban}' from chan '${data.chan}' is banned`);
		if (data.ban == me) {
			chanBan.value = data.chan;
			setTimeout(() => {
				chansRef.value.splice(i, 1);
				chanBan.value = '';
			}, 200);
		}
		let j = (
			chansRef.value[i][data.group as keyof ChannelDto] as BasicUserDto[]
		).findIndex((user) => user.login == data.ban);
		chansRef.value[i].bans.push(
			(chansRef.value[i][data.group as keyof ChannelDto] as BasicUserDto[])[j],
		);
		(
			chansRef.value[i][data.group as keyof ChannelDto] as BasicUserDto[]
		).splice(j, 1);
	} else if (data.restoreBan && data.restoreBan != me) {
		console.log(
			`User '${data.restoreBan}' from chan '${data.chan}' is unbaned`,
		);
		let j = chansRef.value[i].bans.findIndex(
			(user) => user.login == data.restoreBan,
		);
		chansRef.value[i].bans.splice(i, 1);
	}
});

//	========== UTILS CHAN

function putChanFirst(index: number) {
	if (chansRef.value.length == 2)
		return ([chansRef.value[0], chansRef.value[1]] = [
			chansRef.value[1],
			chansRef.value[0],
		]);
	let chanTmp1 = chansRef.value[0];
	let chanTmp2: ChannelDto;
	chansRef.value[0] = chansRef.value[index];
	for (let i = 1; i <= index && i < chansRef.value.length; i++) {
		chanTmp2 = chansRef.value[i];
		chansRef.value[i] = chanTmp1;
		chanTmp1 = chanTmp2;
	}
}

function printChan(chan: ChannelDto) {
	console.log(`psw = ${chan.psw}`);
	console.log(`creation = ${chan.creation}`);
	console.log(`readed = ${chan.readed}`);
	console.log(`admins = ${chan.admins.map((admin) => admin.login + ', ')}`);
	console.log(`users = ${chan.users.map((user) => user.login + ', ')}`);
	chan.messages.forEach((msg) => console.log(`${msg.msg}`));
}

function printChans(chans: ChannelDto[]) {
	console.log(`printChan :`);
	if (!chans.length) {
		return console.log(`No channels`);
	}
	chans.forEach((chan: ChannelDto) => {
		console.log(`PrintChan : ${chan.name}`);
		printChan(chan);
	});
}

//	========== INVITATIONS
let invitations_to_game = ref([]);
function get_invitations() {
	socket.off('get_invited');
	socket.on('get_invited', (data: { login: string; lobby: string }) => {
		// check for duplicates
		if (
			invitations_to_game.value.findIndex(
				(invitation) => invitation.login == data.login,
			) == -1
		) {
			invitations_to_game.value.push(data);
			console.log(`get_invited : ${data.login} to ${data.lobby}`);
		}
		// invitations_to_game.value.push(data);
	});
}

get_invitations();

provide('invitations_to_game', invitations_to_game);

let user_invitations: Ref<
	Array<{
		name: string;
		player_count: number;
		ball_count: number;
		players: string[];
	}>
> = ref([]);

provide('user_invitations', user_invitations);

socket.off('get_invitations');
socket.on('get_invitations', (data: any) => {
	user_invitations.value = data;
});
socket.emit('get_invitations');

</script>

<style>
#home {
	width: 100%;
	align-items: center;
}
#game {
	width: calc(100vw - 500px);
	/* height: 100%; */
	padding-top: 60px;
}

@media screen and (max-width: 1000px) {
	#game {
		/* margin: 100px 0; */
		width: 100%;
	}
}
</style>

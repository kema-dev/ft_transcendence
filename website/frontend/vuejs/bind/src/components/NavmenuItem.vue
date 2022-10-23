<template>
	<div id="menu">
		<div id="nav_menu" class="center row">
			<router-link to="/home/chat" class="nav_menu_link stack">
				<h2 class="nav_menu_text">CHAT</h2>
				<div v-if="nbPrivNR.n.value.length + nbChanNR.n.value.length"
					class="notifMsgCont center"
				>
					<div class="notifMsgNumber">
						{{ nbPrivNR.n.value.length + nbChanNR.n.value.length}}
					</div>
				</div>
			</router-link>
			<h1 class="pipe">|</h1>
			<router-link to="/home/users" class="nav_menu_link stack">
				<h2 class="nav_menu_text" id="usersTabText">USERS</h2>
				<div v-if="notifs" class="notifMsgCont center">
					<div class="notifMsgNumber">{{ notifs }}</div>
				</div>
			</router-link>
			<h1 class="pipe">|</h1>
			<router-link to="/home/games" class="nav_menu_link stack">
				<h2 class="nav_menu_text">GAMES</h2>
				<div v-if="invitations_to_game.length"
					class="notifMsgCont center"
				>
					<div class="notifMsgNumber">
						{{ invitations_to_game.length }}
					</div>
				</div>
			</router-link>
		</div>
		<!-- <transition name="slide-fade" mode="out-in"> -->
		<div class="content">
			<router-view name="menu" />
		</div>
		<!-- </transition> -->
	</div>
</template>

<script setup lang="ts">
import { inject, Ref, watch } from 'vue';

let colors = inject('colors');
let notifs = inject('notifs');
let nbPrivNR: { n: Ref<number[]>; reset: () => void } = inject('nbPrivNR')!;
let nbChanNR: { n: Ref<string[]>; reset: () => void } = inject('nbChanNR')!;

let invitations_to_game: Ref<Array<{ login: string; lobby: string }>> = inject(
	'invitations_to_game',
)!;

</script>

<style scoped>
#menu {
	height: calc(100vh - 60px);
	/* width: 30vw; */
	width: 345px;
	background: v-bind('colors.color3');
	box-shadow: -4px 0px 4px rgba(0, 0, 0, 0.25);
	margin-top: 60px;
}
.content {
	overflow-y: scroll;
	overflow: auto;
	height: calc(100vh - 120px);
}
#nav_menu {
	width: 100%;
	height: 60px;
	justify-content: space-around;
	align-items: center;
	background-color: v-bind('colors.color0');
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
.pipe {
	font-size: 1.5rem;
	font-weight: 100;
}
.nav_menu_link {
	width: 30%;
}
.nav_menu_text {
	/* font-size: clamp(0.5rem, 1.5vw, 1.3rem); */
	font-size: 1.1rem;
	font-weight: 100;
}
.active,
.router-link-active > .nav_menu_text {
	font-weight: 900;
}
.notifMsgCont {
	position: absolute;
	right: 0px;
	top: -5px;
	height: 18px;
	width: 18px;
	border-radius: 9px;
	/* background-color: rgb(255, 69, 69); */
	background-color: v-bind('colors.color2');
}
.notifMsgNumber {
	color: white;
	font-size: 0.8rem;
	font-family: 'Orbitron', sans-serif;
	font-weight: bold;
}
.router-link-active > .notifMsgCont {
	visibility: hidden;
}

@media screen and (max-width: 1000px) {
	#menu {
		width: 100%;
		padding: 0;
		height: auto;
		margin-top: 0;
	}
	.nav_menu_text {
		font-size: clamp(1rem, 2vw, 1.3rem);
	}
}
</style>

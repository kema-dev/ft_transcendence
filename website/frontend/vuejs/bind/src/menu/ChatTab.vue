<template>
	<div id="chat_view">
		<div id="chatTopBar" class="center space-around">
			<router-link to="/home/chat/private" class="chat_item stack">
				<h2 id="privateTabText" class="chat_item_text">PRIVATE</h2>
				<div v-if="nbPrivNR.n.value.length" class="notifMsgCont center">
					<div class="notifMsgNumber">{{ nbPrivNR.n.value.length }}</div>
				</div>
			</router-link>
			<router-link to="/home/chat/channels" class="chat_item">
				<h2 id="channelsTabText" class="chat_item_text">CHANNELS</h2>
			</router-link>
		</div>
		<div class="content" id="chatContent">
			<router-view name="chat_menu" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, Ref } from 'vue';

let colors = inject('colors');
let nbPrivNR: { n: Ref<number[]>; reset: () => void } = inject('nbPrivNR')!;
</script>

<style>
#chatTopBar {
	height: 60px;
}

.chat_item_text {
	font-weight: 100;
	font-size: 0.9rem;
	padding-top: 0.5rem;
	padding-bottom: 0.5rem;
}

.chatTabActive {
	border-bottom: 2px solid v-bind('colors.color2');
	color: v-bind('colors.color2');
	font-weight: 500;
}

.notifMsgCont {
	position: absolute;
	right: -20px;
	top: 0px;
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

/* ROUTER VUE TRANSITION  */

@import "~@/chat/transitions.css";
/* .myFade-enter-active,
.myFade-leave-active {
  transition: opacity 0.5s ease;
}

.myFade-enter-from,
.myFade-leave-to {
  opacity: 0;
} */
</style>

<template>
	<div class="moreButCont center row">
		<button
			@click="showMore = !showMore"
			class="setUserCont center"
		>
			<img v-if="!showMore"
				src='~@/assets/more.svg'
				alt="User setting"
				class="infoImg"
			/>
			<img v-else
				src='~@/assets/undo_logo.svg'
				alt="User setting"
				class="infoImg"
			/>
		</button>
		<button v-if="showMore && promot != undefined"
			@click="props.promot == true ? promote() : demote()"
			class="setUserCont center"
		>
			<img v-if="props.promot == false"
				src='~@/assets/arrow_up.svg'
				alt="User setting"
				class="infoImg"
			/>
			<img v-else
				src='~@/assets/arrow_down.svg'
				alt="User setting"
				class="infoImg"
			/>
		</button>
		<button v-if="showMore"
			@click="mute()"
			class="setUserCont center"
		>
			<img
				src='~@/assets/mute.svg'
				alt="User setting"
				class="infoImg"
			/>
		</button>
		<button v-if="showMore"
			@click="ban()"
			class="setUserCont center"
		>
			<img
				src='~@/assets/block_logo.svg'
				alt="User setting"
				class="infoImg"
			/>
		</button>
	</div>
</template>

<script setup lang="ts">
import { inject, defineProps, onMounted, ref } from "vue";
import { Socket } from "socket.io-client";
import { ModifChanDto } from "@/chat/dto/ModifChanDto"
import WarningMsg from "@/components/WarningMsg.vue";

let colors = inject('colors');
let showMore = ref(false);
let mySocket: Socket = inject("socket")!;

const props = defineProps({
	login: {
		type: String,
		required: true,
	},
	chan: {
		type: String,
		required: true,
	},
	promot : Boolean,

});

// function modifUser(modif: string) {
// 	mySocket.emit("modifChan", 
// 		new ModifChanDto(props.chan, modif, props.login));
// }

function promote() {
	mySocket.emit("modifChan", 
		new ModifChanDto(props.chan, "promotAdm", props.login));
}

function demote() {
	mySocket.emit("modifChan", 
		new ModifChanDto(props.chan, "demotUser", props.login));
}

function mute() {
	let chanView = document.getElementById("chatContent")!;
	let warnComp = new WarningMsg();
	mySocket.emit("modifChan", 
		new ModifChanDto(props.chan, "mute", props.login));
}

function ban() {
	mySocket.emit("modifChan", 
		new ModifChanDto(props.chan, "mute", props.login));
}



</script>

<style scoped>
* {
	--height: 30px;
}
.moreButCont {
	width: auto;
	height: 26px;
	/* margin: 3px 0; */
}
.setUserCont{
	height: 26px;
	width: 26px;
	border-radius: 13px;
}
.setUserCont:hover {
	/* border: solid 1px v-bind("colors.color2"); */
	/* background-color: #fff; */
	box-shadow: 0px 0px 4px #aaa;
}
.infoImg {
	height: 20px;
	width: 20px;
	filter: invert(29%) sepia(16%) saturate(6497%) hue-rotate(176deg)
		brightness(86%) contrast(83%);
}
</style>

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
import { onMounted, provide } from "vue";
import { inject, ref } from "vue";
import MatchmakingItem from '@/components/MatchmakingItem.vue';
import io from "socket.io-client"
import { FQDN } from "../../.env.json";

let define = inject("colors");
let reload = ref(0)
onMounted(() => {
	window.addEventListener("resize", () => {
		reload.value++;
	})
});

let socket = io(FQDN + ':3000');
provide("socket", socket);

socket.on('connect', () => {
	console.log("client-side connected");
})

socket.on('message', function(id, data) {
	console.log(`Server message : ${id}: ${data}`, );
})
socket.on('getMsgs', (data) => {
	console.log(data);
})



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

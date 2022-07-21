<template>
	<div id="chat_menu">
		<div id="chat_bar" class="center space-around">
			<router-link to="/home/chat/in-game" class="chat_item">
				<h2 class="chat_item_text">IN-GAME</h2>
			</router-link>
			<router-link to="/home/chat/private" class="chat_item" >
				<h2 class="chat_item_text">PRIVATE</h2>
			</router-link>
			<!-- <router-link to="/home/settings" class="chat_item_link">
				<h2 class="chat_item_text">CHANNELS</h2>
			</router-link> -->

		</div>
		<div class="content">
			<router-view name="chat_menu" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject } from "vue";

let define = inject("colors");

</script>

<style>

#chat_bar {
	margin-top: 1rem;
	margin-bottom: 1rem;
	display: flex;
}

.chat_item {
	}

.chat_item_text {
	font-weight: 100;
	font-size: 0.9rem;
	padding-bottom: 1rem;
}

.router-link-active > .chat_item_text {
	border-bottom: 2px solid v-bind("define.color2");
	/* border-bottom: solid;
	border-bottom-width: 10px;
	border-bottom-color: v-bind("define.color2"); */
	color: v-bind("define.color2");
	font-weight: 500;
}

</style>

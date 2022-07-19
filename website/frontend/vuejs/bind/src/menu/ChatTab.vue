<template>
	<div id="chat_menu">
		<div id="chat_bar" class="center space-around">
			<router-link to="/home/chat/in-game" class="chat_item">
				<h2 class="nav_menu_text">IN-GAME</h2>
			</router-link>
			<router-link to="/home/friends" class="chat_item" >
				<h2 class="nav_menu_text">PRIVATE</h2>
			</router-link>
			<!-- <router-link to="/home/settings" class="nav_menu_link">
				<h2 class="nav_menu_text">CHANNELS</h2>
			</router-link> -->

		</div>
		<div class="content">
			<router-view name="chat_menu" />
		</div>
	</div>
</template>

<script setup lang="ts">

</script>

<style>

#chat_bar {
	margin-top: 1rem;
	display: flex;
}

.nav_menu_link {
	/* width: 30%; */
}

.active {
	background-color: aqua;
}

</style>

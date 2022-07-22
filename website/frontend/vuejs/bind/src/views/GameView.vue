<template>
	<div class="center column">
		<img src="@/assets/logo.png" alt="logo" />
		<h1>PONG.IO</h1>
		<input />
		<input />
		<router-link to="/home/chat/in-game">Login</router-link>
	</div>
</template>

<script setup lang="ts">
import GameField from '../components/GameField.vue';
</script>

<style></style>

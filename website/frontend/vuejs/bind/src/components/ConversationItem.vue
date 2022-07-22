<template>
    <div class="conv_container center column">

        <img v-if="conv?.user" :src="conv.user.avatar" alt="avatar">
    </div>
</template>

<script setup lang="ts">
import { defineProps, Ref, ref } from 'vue';
import Conversation from '@/chat/Conversation';

const props = defineProps({
  conv: Conversation
})

</script>

<style scoped>

</style>
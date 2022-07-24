<template>
  <div class="conv_container left row stack">
    <img v-if="conv?.user" :src="conv.user.avatar" class="avatar" alt="avatar">
    <div class="info ">
      <div class="top-bar column">
        <div class="login">{{conv?.user?.name}}</div>
        <div class="date">{{conv?.messages.date}} date</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, defineProps, onMounted, ref } from "vue";
import Conversation from '@/chat/Conversation';

let define = inject("colors");
const props = defineProps({
  conv: Conversation
})

</script>

<style scoped>
* {
  --height: 70px;
}

.conv_container {
  background-color: white;
  width: 90%;
  height: var(--height);
  margin-top: 5px;
  margin-bottom: 5px;
  border: solid 2px;
  border-color: v-bind(define.color2);
  border-radius: calc(var(--height) / 2);
}
.avatar {
  height: calc(var(--height) - 10px);
  width: calc(var(--height) - 10px);
  /* width: var(--height); */
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translate(0, -50%);
  /* border: solid 3px;
  border-color: v-bind(define.color2); */
  border-radius: 50%;
}
.info {
  
}

</style>
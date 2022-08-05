<template>
  <div class="msg_cont center raw">
    <div class="msg_text">
      {{message?.msg}}
    </div>
    <div class="avatar_cont">
      <img :src="message!.user.avatar" alt="Avatar" class="avatar">
    </div>
  </div>
  <!-- <div class="msg_cont">
    <p class="msg_text">{{message?.msg}}</p>
  </div> -->

</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import { inject, defineProps, onMounted, ref } from "vue";
// import Conversation from '@/chat/Conversation';
import User from "@/chat/User";
import Message from "@/chat/Message";

let define = inject("colors");
const props = defineProps({
  message: Message
})

</script>

<style scoped>
* {
  --height: 50px;
}
.msg_text {
  width: 70%;
  color: white;
  padding: 5px;
  border-radius: 10px;
  margin: 10px;
  background-color: v-bind(define.color2);
}
.avatar_cont {
  width: var(--height);
  height: var(--height);
  /* position: absolute; */
}
.avatar {
	height: calc(var(--height) - 10px);
  width: calc(var(--height) - 10px);
  /* position: absolute; */
  /* top: 4px; */
  /* top: 50%; */
  /* transform: translate(0, -50%); */
  border-radius: 50%;
}
</style>
<template>
  <div class="msg_cont">
    <span class="date">{{message!.date.toLocaleDateString()}}</span>
    <div v-if="me == message!.user.name" class="myMsg_cont raw right">
      <div class="myMsg_text">
        {{message?.msg}}
      </div>
      <!-- <img :src="message!.user.avatar" alt="Avatar" class="avatar"> -->
    </div>
    <div v-else class="userMsg_cont raw left">
      <img :src="message!.user.avatar" alt="Avatar" class="avatar">
      <div class="userMsg_text">
        {{message?.msg}}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import { inject, defineProps, onMounted, ref } from "vue";
// import Conversation from '@/chat/Conversation';
import User from "@/chat/User";
import Message from "@/chat/Message";

let colors = inject("colors");
let me = inject("me");
const props = defineProps({
  message: Message
})

</script>

<style scoped>
* {
  --height: 35px;
}
msg_cont {
  width: 100%;
}
.myMsg_cont {
  align-items:center;
}
.myMsg_text {
  width: auto;
  max-width: 65%;
  color: white;
  padding: 8px;
  border-radius: 10px;
  margin: 10px;
  background-color: v-bind("colors.color2");
}
.userMsg_cont {
  align-items:center;
  padding-left: 7px;
}
.userMsg_text {
  width: auto;
  max-width: 65%;
  color: black;
  padding: 8px;
  border-radius: 10px;
  margin: 10px;
  background-color: white;
}
/* .avatar_cont {
  width: var(--height);
  height: var(--height);
} */

.avatar {
  width: var(--height);
  height: var(--height);
  border-radius: 50%;

}
</style>
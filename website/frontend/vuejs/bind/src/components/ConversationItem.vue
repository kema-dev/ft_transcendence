<template>
  <div class="conv_container left row stack" >
    <!-- <router-link :to=""></router-link> -->
    <div class="avatar_cont">
      <img v-if="conv?.user" :src="conv.user.avatar" class="avatar" alt="avatar">
    </div>
    <div class="info center column">
      <div class="top-bar row center stack">
        <div class="login">{{conv?.user?.name}}</div>
        <!-- <div class="date">{{conv!.messages[conv!.messages.length - 1].date.toLocaleDateString()}}</div> -->
        <div class="date">{{display_date()}}</div>
      </div>
      <div class="message_cont center">
        <div class="message">{{conv?.messages[conv.messages.length - 1].msg}}</div>
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

function convertDate(date : Date) : string {
  function pad(d: number) { return (d < 10) ? '0' + d : d; }
  return [pad(date.getDate()), pad(date.getMonth()+1), date.getFullYear()].join('/');
}

function display_date() : string {
  const now = new Date();
  let diff = now.getTime() - props.conv!.messages[props.conv!.messages.length - 1].date.getTime();
  if (diff / (1000 * 3600 * 24) >= 7) {
    return convertDate(props.conv!.messages[props.conv!.messages.length - 1].date);
  }
  else if (diff / (1000 * 3600 * 24) >= 1){
    return Math.floor(diff / (1000 * 3600 * 24)) + "d";
  }
  else if (diff / (1000 * 3600) >= 1){
    return Math.floor(diff / (1000 * 3600)) + "h";
  }
  else { return Math.floor(diff / (1000 * 60)) + "min";}
}

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
.avatar_cont {
  width: var(--height);
  height: var(--height);
  /* height: calc(var(--height) - 10px);
  width: calc(var(--height) - 10px); */
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
  /* width: 80% ; */
  width: calc(100% - var(--height));
  height: 100%;
  /* padding-left: 1rem; */
  padding-right: 1.5rem;
}
.top-bar {
  padding-top: 5px;
  height: 1.5rem;
}
.login {
  width: 130%;
  text-align: start;
  font-family: "Orbitron", sans-serif;
  font-weight: bold;
    overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.date {
  text-align: end;
}
.message_cont {
  height: 100%;
  text-align: start;
  /* position: absolute; */
  /* top: 50%; */
}
.message {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

</style>
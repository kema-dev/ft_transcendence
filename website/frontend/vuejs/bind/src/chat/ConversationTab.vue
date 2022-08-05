<template>
    <router-link :to="{name: 'conversation', params: {conv_name: conv!.name }}" class="conv_container left row stack">
      <div class="avatar_cont">
        <img v-if="!conv!.channel" :src="conv!.users[0].avatar" class="avatar" alt="avatar">
        <img v-else :src="conv!.messages[conv!.messages.length -1].user.avatar" class="avatar" alt="avatar">
      </div>
      <div class="info center column">
        <div class="top-bar row center stack">
          <div class="login">{{conv!.name}}</div>
          <div class="date">{{display_date()}}</div>
        </div>
        <div class="message_cont center">
          <div class="message">{{conv?.messages[conv.messages.length - 1].msg}}</div>
        </div>
      </div>
    </router-link>
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
  let days = (diff / (1000 * 3600 * 24));
  let hours = days * 24;
  let mins = hours * 60;
  if (days >= 7) {
    return convertDate(props.conv!.messages[props.conv!.messages.length - 1].date);
  }
  else if (days >= 1){
    return Math.floor(days) + "d";
  }
  else if (hours >= 1){
    return Math.floor(diff / (1000 * 3600)) + "h";
  }
  else { return Math.floor(mins) + "min";}
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
}
.avatar {
  height: calc(var(--height) - 10px);
  width: calc(var(--height) - 10px);
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translate(0, -50%);
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
  color: grey;
  /* font-family: "Orbitron", sans-serif;
  font-size: 0.8rem; */
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
<template>
    <router-link :to="{name: chan == true ? 'ChannelConv' : 'PrivConv', params: {conv_name: nameConv }}" class="conv_container left row stack" :class="{ 'conv_containerNR': isRead() }">
      <div class="avatar_cont">
        <img v-if="avatar" :src="avatar" class="avatar" alt="avatar">
        <img v-else src="~@/assets/group_logo.svg" class="avatar" alt="avatar">
      </div>
      <div class="info center column">
        <div class="top-bar row center stack">
          <div class="login">{{nameConv}}</div>
          <div v-if="message" class="date">{{displayDate()}}</div>
        </div>
        <div class="message_cont center">
          <div v-if="message" class="message">{{displayMsg()}}</div>
          <div v-else class="message noMessage">Created the {{date?.toLocaleDateString("fr")}}, {{date?.toLocaleTimeString("fr")}}</div>
        </div>
      </div>
    </router-link>
</template>

<script setup lang="ts">
import { inject, defineProps, onMounted, ref } from "vue";
import Private from '@/chat/objects/Private';
import User from "./objects/User";
import Message from "./objects/Message";

let define = inject("colors");
let me : string = inject("me")!;
const props = defineProps({
  nameConv: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  lastMsgUser: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    required: true,
  },

  avatar: String,
  chan: Boolean
})

function isRead() {
  if (props.read == false && props.lastMsgUser != me)
    return true;
  return false;
}

function displayMsg() {
  if (props.lastMsgUser == me)
    return `You: ${props.message}`;
    else if (!props.chan)
    return props.message;
    else
    return `${props.lastMsgUser}: ${props.message}`;
}

function convertDate(date : Date) : string {
  function pad(d: number) { return (d < 10) ? '0' + d : d; }
  return [pad(date.getDate()), pad(date.getMonth()+1), date.getFullYear()].join('/');
}

function displayDate() : string {
  const now = new Date();
  let diff = now.getTime() - props.date.getTime();
  let days = (diff / (1000 * 3600 * 24));
  let hours = days * 24;
  let mins = hours * 60;
  if (days >= 7) {
    return convertDate(props.date);
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
  border: solid 2px v-bind("define.color2");
  /* border-color: ; */
  border-radius: calc(var(--height) / 2);
}
.conv_containerNR{
  border: solid 4px v-bind("define.color2");
  font-weight: 800;
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
.noMessage {
  color: grey;
}

</style>
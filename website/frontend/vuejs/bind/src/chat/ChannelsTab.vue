<template>
	<div id="channels_view" class="center column">
		<SearchItem @searchInput="searchChange"/>
		<div v-for="(data, i) in convsFiltred" :key="i" class="center">
			<ConversationTab :conv="data"/>
		</div>
		<h2 v-if="conversations.length == 0" class="no_results">No Channels</h2>
		<h2 v-else-if="convsFiltred!.length == 0" class="no_results">No results</h2>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import { inject, onMounted, ref } from "vue";
import ConversationTab from "@/chat/ConversationTab.vue";
import SearchItem from "@/components/SearchItem.vue";
import Conversation from "@/chat/Conversation";
import User from "@/chat/User";
import Message from "@/chat/Message";
let define = inject("colors");

let search = ref("");

let user1 = new User("Totolosa", require("@/assets/avatars/(1).jpg"));
let user2 = new User("Ocean", require("@/assets/avatars/(2).jpg"));
let user3 = new User("Patrick la trick", require("@/assets/avatars/(3).jpg"));
// let user1 = new User("Totolosa", "~@/assets/avatars/(1).jpg");
// let user2 = new User("Ocean", "~@/assets/avatars/(2).jpg");
// let user3 = new User("Patrick la trick", "~@/assets/avatars/(3).jpg");

let msg1 = new Message(user1, "Salut frere rwf;jnavionra'mrv'aomfgifsivbdfvndfnvjsdglbjgb;fgklb;s;bg", new Date('July 17, 2022 03:24:00'));
let msg2 = new Message(user2, "Salut poto", new Date('July 22, 2022 03:25:12'));
let msg3 = new Message(user3, "Game?", new Date('July 18, 2022 12:45:45'));
let msg4 = new Message(user1, "Non je dois finir de faire le front, et wallah c'est chaud", new Date('July 18, 2022 12:47:55'));
let msg5 = new Message(user1, "dsaibciauwncopneejvnjnfcoamsdomvcafosnvonsvonoans", new Date());
let msg6 = new Message(user2, "Mais tu sais pas parler en fait", new Date());

// let conv1 = new Conversation([user2], [msg1, msg2]);
// let conv2 = new Conversation([user3], [msg3, msg4]);
// let conv3 = new Conversation([user1], [msg5, msg6]);
let conv4 = new Conversation(true, [user1, user2, user3], [msg1, msg2, msg3, msg4, msg5, msg6]);
let conv5 = new Conversation(true, [user1, user2, user3], [msg1, msg2, msg3, msg4], "Test channel");


let conversations = [conv4, conv5];
// let conversations: Conversation[];
// conversations = [];
let convsFiltred = ref<Conversation[]>();
convsFiltred.value = conversations;

conversations.sort(function(x,y) {
	if (x.messages[x.messages.length - 1].date < y.messages[y.messages.length - 1].date) {
		return 1;
    }
    if (x.messages[x.messages.length - 1].date > y.messages[y.messages.length - 1].date) {
        return -1;
    }
    return 0;
});

function searchChange(value: string) {
	search.value = value;
	convsFiltred.value = conversations.filter(function(value) {
		return value.name.toUpperCase().startsWith(search.value.toUpperCase());
	});
}

</script>

<style>
#channels_view {
	height: calc(100vh - 180px);
	justify-content: flex-start;
}
.no_results {
	margin-top: 1rem;
}

/* TRANSITION ROUTER VIEW */

/* .myFade-enter-active,
.myFade-leave-active {
  transition: opacity 0.5s ease;
}

.myFade-enter-from,
.myFade-leave-to {
  opacity: 0;
} */
</style>
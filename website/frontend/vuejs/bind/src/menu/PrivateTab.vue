<template>
	<div id="private_menu" class="center column">
		<div class="search_groupe center row">
			<input
				type="text"
				placeholder="Recherche"
				id="search"
				ref="search"
			/>
			<button>
				<span class="material-symbols-outlined icon_search">
					search
				</span>
			</button>
		</div>
		<div v-for="(data, i) in conversations" :key="i" class="center">
			<ConversationItem :conv="data"/>
		</div>
	</div>
</template>

<script setup lang="ts">
/* eslint @typescript-eslint/no-var-requires: "off" */
import { inject, onMounted, ref } from "vue";
import ConversationItem from "@/components/ConversationItem.vue";
import Conversation from "@/chat/Conversation";
import User from "@/chat/User";
import Message from "@/chat/Message";
let define = inject("colors");

let user1 = new User("Totolosa", require("@/assets/avatars/(1).jpg"));
let user2 = new User("Ocean", require("@/assets/avatars/(2).jpg"));
let user3 = new User("Patrick la trick", require("@/assets/avatars/(3).jpg"));
// let user1 = new User("Totolosa", "@/assets/avatars/(1).jpg");
// let user2 = new User("Ocean", "@/assets/avatars/(2).jpg");
// let user3 = new User("Patrick la trick", "@/assets/avatars/(3).jpg");

let msg1 = new Message(user1, "Salut frere rwf;jnavionra'mrv'aomfgifsivbdfvndfnvjsdglbjgb;fgklb;s;bg", new Date('July 17, 2022 03:24:00'));
let msg2 = new Message(user2, "Salut poto", new Date('July 22, 2022 03:25:12'));
let msg3 = new Message(user3, "Game?", new Date('July 18, 2022 12:45:45'));
let msg4 = new Message(user1, "Non je dois finir de faire le front, et wallah c'est chaud", new Date('July 18, 2022 12:47:55'));
let msg5 = new Message(user1, "dsaibciauwncopneejvnjnfcoamsdomvcafosnvonsvonoans", new Date());
let msg6 = new Message(user2, "Mais tu sais pas parler en fait", new Date());

let conv1 = new Conversation(false, [msg1, msg2], undefined, user2);
let conv2 = new Conversation(false, [msg3, msg4], undefined, user3);
let conv3 = new Conversation(false, [msg5, msg6], undefined, user1);

function compareDate(a: Conversation, b: Conversation) : number {
	return 1;
}

let conversations = [conv1, conv2, conv3];
conversations.sort(function(x,y) {
    if (x.messages[x.messages.length - 1].date < y.messages[x.messages.length - 1].date) {
        return 1;
    }
    if (x.messages[x.messages.length - 1].date > y.messages[x.messages.length - 1].date) {
        return -1;
    }
    return 0;
});

</script>

<style>


.search_groupe {
	margin-top: 5px;
	width: 90%;
}
#search {
	/* position: absolute; */
	top: 0px;
	width: 80%;
	height: 40px;
	background: #fff;
	border: solid 1px #ccc;
	border-radius: 12px;
	padding-left: 10px;
	margin: 15px 0;
	margin-right: 2%;
	font-size: 1.2rem;
	outline: none;
	box-shadow: 0px 0px 4px #aaa;
}
.icon_search {
	font-size: 2rem;
}

</style>
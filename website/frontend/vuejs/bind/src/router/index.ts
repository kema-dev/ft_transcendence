import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from "@/views/HomeView.vue"
import LogpageView from '@/views/LogpageView.vue'
import SecurityView from '@/views/SecurityView.vue'
import GameView from '@/views/GameView.vue'
import Friends from '@/menu/FriendsTab.vue'
import Chat from '@/menu/ChatTab.vue'
import InGame from '@/chat/InGameTab.vue'
import Private from '@/chat/PrivateTab.vue'
import Channels from '@/chat/ChannelsTab.vue'
import Conversation from '@/chat/ConversationItem.vue'
import ConversationClass from '@/chat/Conversation'
import Settings from '@/menu/SettingsTab.vue'
import Player from '@/menu/PlayerTab.vue'

document.title = "pong.io"

const routes: Array<RouteRecordRaw> = [
	{
		name: 'logpage',
		path: '/',
		component: LogpageView
	},
	{
		name: 'security',
		path: '/security',
		component: SecurityView
	},
	{
		name: 'game',
		path: '/game',
		component: GameView
	},
	{
		name: 'home',
		path: '/home',
		components: {default: Home},
		children: [
			{
				name: 'friends',
				path: '/home/friends',
				components: {menu: Friends}
			},
			{
				name: 'chat',
				path: '/home/chat',
				components: {menu: Chat},
				redirect: '/home/chat/private',
				children: [
					// {
					// 	name: 'in-game',
					// 	path: '/home/chat/in-game',
					// 	components: {chat_menu: InGame},
					// },
					{
						name: 'private',
						path: '/home/chat/private',
						components: {chat_menu: Private},
					},
					{
						name: 'channels',
						path: '/home/chat/channels',
						components: {chat_menu: Channels},
					},
					{
						name: 'conversation',
						path: '/home/chat/private/:conv_name',
						components: {chat_menu: Conversation},
						// meta: { transition: 'slideUp' },
					}
				],
			},
			// {
			// 	name: 'in-game',
			// 	path: '/home/chat/in-game',
			// 	component: {menu: inGame}
			// },
			{
				name: 'settings',
				path: '/home/settings',
				components: {menu: Settings}
			},
			{
				name: 'player',
				// path: '/home/player',
				path: '/home/player/:name',
				components: {menu: Player},
			},
		]
	},
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

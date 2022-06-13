import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "@/views/HomeView.vue"
import Login from '@/views/LoginView.vue'
import DebugKemaView from '@/views/DebugKemaView.vue'
import Friends from '@/menu/FriendsTab.vue'
import Chat from '@/menu/ChatTab.vue'
import Settings from '@/menu/SettingsTab.vue'
import Navmenu from '@/components/NavmenuItem.vue'

const routes: Array<RouteRecordRaw> = [
	{
		name: 'login',
		path: '/',
		components: {default: Login, menu: Navmenu}
	},
	{
		name: 'debug_kema',
		path: '/debug_kema',
		component: DebugKemaView
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
				components: {menu: Chat}
			},
			{
				name: 'settings',
				path: '/home/settings',
				components: {menu: Settings}
			}
		]
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router;

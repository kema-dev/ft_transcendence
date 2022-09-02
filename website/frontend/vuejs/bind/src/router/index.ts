import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from "@/views/HomeView.vue"
import LogpageView from '@/views/LogpageView.vue'
import BackendDownView from '@/views/BackendDownView.vue'
import SecurityView from '@/views/SecurityView.vue'
import GameView from '@/views/GameView.vue'
import Friends from '@/menu/FriendsTab.vue'
import Chat from '@/menu/ChatTab.vue'
import InGame from '@/chat/InGameTab.vue'
import Private from '@/chat/PrivateView.vue'
import Channels from '@/chat/ChannelView.vue'
import PrivateConv from '@/chat/PrivateConvItem.vue'
import ChannelConv from '@/chat/ChannelConvItem.vue'
import Settings from '@/menu/SettingsTab.vue'
import Profile from '@/menu/ProfileTab.vue'
import Player from '@/menu/PlayerTab.vue'
import axios from 'axios'
import { useCookies } from "vue3-cookies";
import { useToast } from "vue-toastification";

document.title = "pong.io"
const { cookies } = useCookies();
const toast = useToast();

const routes: Array<RouteRecordRaw> = [
	{
		name: 'logpage',
		path: '/',
		component: LogpageView
	},
	{
		name: 'backend_down',
		path: '/backend_down',
		component: BackendDownView
	},
	{
		name: 'security',
		path: '/security',
		component: SecurityView
	},
	{
		name: 'home',
		path: '/home',
		components: {default: Home},
		redirect: '/home/chat/private',
		children: [
			{
				name: 'friends',
				path: '/home/friends',
				components: { menu: Friends }
			},
			{
				name: 'chat',
				path: '/home/chat',
				components: { menu: Chat },
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
						meta: { transition: 'myFade' },
					},
					{
						name: 'channels',
						path: '/home/chat/channels',
						components: {chat_menu: Channels},
						meta: { transition: 'myFade' },
					},
					{
						name: 'PrivConv',
						path: '/home/chat/private/:conv_name',
						components: {chat_menu: PrivateConv},
						meta: { transition: 'mySlide' },
					},
					{
						name: 'ChannelConv',
						path: '/home/chat/channel/:conv_name',
						components: {chat_menu: ChannelConv},
						meta: { transition: 'mySlide' },
					}
				],
			},
			// {
			// 	name: 'in-game',
			// 	path: '/home/chat/in-game',
			// 	component: {menu: inGame}
			// },
			{
				name: 'profile',
				path: '/home/profile',
				components: { menu: Profile }
			},
			{
				name: 'player',
				// path: '/home/player',
				path: '/home/player/:name',
				components: { menu: Player },
			},
		]
	},
]

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes
})

router.afterEach((to, from) => {
	const toDepth = to.path.split('/').length;
  const fromDepth = from.path.split('/').length;
	const prev = to.path.split('/').pop();
	// console.log(prev);
  to.meta.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left';
})

router.beforeEach(async (to, from) => {
	if (to.path === '/backend_down') {
		return true;
	} else {
		await axios.get('https://localhost:3000/api/v1/auth/status')
		.catch(() => {
			// backend is down
			console.log('backend is down')
			router.replace('/backend_down')
			return false;
		})
	}
	// backend is up
	if (cookies.get('session') == null) {
		// no token: redirecting to logpage
		if (to.path !== '/') {
			toast.info('📝 You are not logged in, please log in');
			router.replace('/')
		}
	} else {
		// token: check validity
		await axios
		.post('https://localhost:3000/api/v1/auth/validate_token', {
			login: cookies.get('login'),
			token: cookies.get('session'),
		})
		.then(() => {
			return true;
		}).catch((error) => {
			if (error.response.data.message == 'E_NO_SESSION') {
				toast.warning('📝 Your session token has been lost. Please log in again.')
			} else if (error.response.data.message == 'E_SESSION_MISMATCH') {
				cookies.remove('login');
				cookies.remove('session');
				toast.warning('📝 Your session is invalid. Please log in again.')
			} else if (error.response.data.message == 'E_USER_NOT_FOUND') {
				toast.warning('📝 Your session is invalid. Please log in again.')
				cookies.remove('login');
				cookies.remove('session');
			} else if (error.response.data.message == 'E_SESSION_EXPIRED') {
				toast.warning('📝 Your session is expired. Please log in again.')
				cookies.remove('login');
				cookies.remove('session');
			} else {
				toast.error('😥 Unknown error, we are sorry for that')
			}
			if (to.path !== '/') {
				toast.info('📝 You are not logged in, please log in');
				router.replace('/')
			}
			return false;
		});
	}
})

export default router

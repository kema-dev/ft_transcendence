import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/HomeView.vue';
import LogpageView from '@/views/LogpageView.vue';
import BackendDownView from '@/views/BackendDownView.vue';
import Users from '@/menu/UsersTab.vue';
import Chat from '@/menu/ChatTab.vue';
import InGame from '@/chat/InGameTab.vue';
import Private from '@/chat/PrivateView.vue';
import Channels from '@/chat/ChannelView.vue';
import PrivateConv from '@/chat/PrivateConvItem.vue';
import ChannelConv from '@/chat/ChannelConvItem.vue';
import Settings from '@/menu/SettingsTab.vue';
import Profile from '@/menu/ProfileTab.vue';
import Player from '@/menu/PlayerTab.vue';
import Games from '@/menu/GamesTab.vue';
import API from '../components/axios';
import { useCookies } from 'vue3-cookies';
import { useToast } from 'vue-toastification';
import { BasicUserDto } from '@/chat/dto/BasicUserDto';

const data = require('../../.env')

document.title = 'pong.io';
const { cookies } = useCookies();
const toast = useToast();

const routes: Array<RouteRecordRaw> = [
	{
		name: 'logpage',
		path: '/',
		component: LogpageView,
	},
	{
		name: 'backend_down',
		path: '/backend_down',
		component: BackendDownView,
	},
	{
		name: 'home',
		path: '/home',
		components: { default: Home },
		redirect: '/home/profile',
		children: [
			{
				name: 'chat',
				path: '/home/chat',
				components: { menu: Chat },
				redirect: '/home/chat/private',
				children: [
					{
						name: 'private',
						path: '/home/chat/private',
						components: { chat_menu: Private },
					},
					{
						name: 'channels',
						path: '/home/chat/channels',
						components: { chat_menu: Channels },
					},
					{
						name: 'PrivConv',
						path: '/home/chat/private/:conv_name',
						components: { chat_menu: PrivateConv },
					},
					{
						name: 'ChanConv',
						path: '/home/chat/channel/:conv_name',
						components: { chat_menu: ChannelConv },
					},
				],
			},
			{
				name: 'users',
				path: '/home/users',
				components: { menu: Users },
			},
			{
				name: 'profile',
				path: '/home/profile',
				components: { menu: Profile },
			},
			{
				name: 'player',
				path: '/home/player/:name',
				components: { menu: Player },
			},
			{
				name: 'games',
				path: '/home/games',
				components: { menu: Games },
			},
		],
	},
	// catch all 404 pages
	{
		path: '/:catchAll(.*)',
		redirect: '/home',
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

// router.afterEach((to, from) => {
// 	const toDepth = to.path.split('/').length;
// 	const fromDepth = from.path.split('/').length;
// 	const prev = to.path.split('/').pop();
// 	// console.log(prev);
// 	to.meta.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left';
// });

router.beforeEach(async (to, from) => {
	if (to.path === '/backend_down') {
		return true;
	} else {
		await API.get('auth/status').catch(() => {
			// backend is down
			console.log('backend is down');
			router.replace('/backend_down');
			return false;
		});
	}
	// backend is up
	if (cookies.get('session') == null) {
		// no token: redirecting to logpage
		if (to.path !== '/') {
			toast.info('📝 You are not logged in, please log in');
			router.replace('/');
		}
	} else {
		// token: check validity
		await API.get('auth/validate_token', {
			headers: {
				login: cookies.get('login'),
				token: cookies.get('session'),
			},
		})
			.then(() => {
				return true;
			})
			.catch((error) => {
				if (error.response.data.message == 'E_NO_SESSION') {
					toast.warning(
						'📝 Your session token has been lost. Please log in again.',
					);
				} else if (error.response.data.message == 'E_SESSION_MISMATCH') {
					cookies.remove('login');
					cookies.remove('session');
					toast.warning('📝 Your session is invalid. Please log in again.');
				} else if (error.response.data.message == 'E_USER_NOT_FOUND') {
					toast.warning('📝 Your session is invalid. Please log in again.');
					cookies.remove('login');
					cookies.remove('session');
				} else if (error.response.data.message == 'E_SESSION_EXPIRED') {
					toast.warning('📝 Your session is expired. Please log in again.');
					cookies.remove('login');
					cookies.remove('session');
				} else {
					toast.error('😥 Unknown error, we are sorry for that');
				}
				if (to.path !== '/') {
					toast.info('📝 You are not logged in, please log in');
					router.replace('/');
				}
				return false;
			});
	}
});

export default router;

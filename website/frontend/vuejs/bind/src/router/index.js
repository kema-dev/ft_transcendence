import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/HomeView.vue"
import Login from '@/views/LoginView.vue'
import DebugKemaView from '@/views/DebugKemaView.vue'

const routes = [
	{
		name: 'login',
		path: '/',
		component: Login
	},
	{
		name: 'home',
		path: '/home',
		component: Home
	},
	{
		name: 'debug_kema',
		path: '/debug_kema',
		component: DebugKemaView
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router;

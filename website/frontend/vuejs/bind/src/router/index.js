import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/HomeView.vue"
import Login from '@/views/LoginView.vue'

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
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router;

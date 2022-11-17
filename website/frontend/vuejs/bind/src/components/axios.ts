import axios from "axios";

const data = require('../../.env.json');
const api_url = '/api/v1/';

import { useCookies } from 'vue3-cookies';
const { cookies } = useCookies();

export const API = axios.create({
	baseURL: data.FQDN + api_url,
});

export default API;

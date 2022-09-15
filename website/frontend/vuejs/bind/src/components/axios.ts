import axios from "axios";

const data = require('../../.env.json');
const api_url = ':3000/api/v1/';

// let login = decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent('login').replace(/[-.+*\\]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || "";

// if (login && ((login.substring(0, 1) === '{' && login.substring(login.length - 1, login.length) === '}') || (login.substring(0, 1) === '[' && login.substring(login.length - 1, login.length) === ']'))) {
//   try {
//     login = JSON.parse(login);
//   } catch (e) {
//     login = "";
//   }
// }

// let session = decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent('session').replace(/[-.+*\\]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || "";

// if (session && ((session.substring(0, 1) === '{' && session.substring(session.length - 1, session.length) === '}') || (session.substring(0, 1) === '[' && session.substring(session.length - 1, session.length) === ']'))) {
//   try {
//     session = JSON.parse(session);
//   } catch (e) {
//     session = "";
//   }
// }

// import { useCookies } from 'vue3-cookies';
// const { cookies } = useCookies();

export const API = axios.create({
	baseURL: data.FQDN + api_url,
});

export default API;

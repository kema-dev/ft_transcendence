/* eslint-disable no-useless-escape */
import axios from 'axios';

let login = decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent('login').replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || "";

if (login && ((login.substring(0, 1) === '{' && login.substring(login.length - 1, login.length) === '}') || (login.substring(0, 1) === '[' && login.substring(login.length - 1, login.length) === ']'))) {
  try {
    login = JSON.parse(login);
  } catch (e) {
    login = "";
  }
}

let session = decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent('session').replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || "";

if (session && ((session.substring(0, 1) === '{' && session.substring(session.length - 1, session.length) === '}') || (session.substring(0, 1) === '[' && session.substring(session.length - 1, session.length) === ']'))) {
  try {
    session = JSON.parse(session);
  } catch (e) {
    session = "";
  }
}

export const HTTP = axios.create({
  baseURL: `https://localhost/`,
	headers:{
    token: session,
  }
})

export default HTTP;

<template>
  <div id="app">
    <h1>Hello Vue!</h1>
    <p>
      <input v-model="title" placeholder="Set title here">
    </p>
    <p>
      <input v-model="number" placeholder="Set number here">
    </p>
    <p>
      <button @click="test_get">GET</button>
      <button @click="test_post">POST</button>
    </p>
    <p>
      <button @click="get_cookie">GET COOKIE</button>
      <a> COOKIE: {{ cookie }} </a>
    </p>
    <p>
      <button @click="auth42">GET 42 TOKEN</button>
      <a> TOKEN: {{ token42 }} </a>
    </p>
  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    name: 'App',
    data() {
      return {
        title: '',
        number: '',
        apiPath: 'http://localhost:3000/api/',
        cookie: '',
        token42: '',
      };
    },
    methods: {
      test_post() {
        axios.post(this.apiPath + 'posts/', {
          "title": this.title,
        }).then(response => {
          console.log(response.data);
        }).catch(error => {
          console.log(error);
        });
      },
      test_get() {
        axios.get(this.apiPath + 'posts/' + this.number).then(response => {
          console.log(response.data);
        }).catch(error => {
          console.log(error);
        });
      },
      get_cookie() {
        axios.get(this.apiPath + 'cookie/').then(response => {
          this.cookie = response.data;
        }).catch(error => {
          console.log(error);
        });
      },
      auth42() {
        axios.get('https://api.intra.42.fr/oauth/authorize?client_id=4b42a21a05efa463774526895b6026f4d6119d07eac916ee0670f6985f63904e&redirect_uri=http%3A%2F%2Flocalhost%3A8080&response_type=code').then(response => {
            console.log(response.data);
        }).catch(error => {
          console.log(error);
        });
      },
    }
  }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

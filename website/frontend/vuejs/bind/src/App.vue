<template>
  <div id="app">
    <h1>{{ message }}!</h1>
    <p>
      <button @click="test_post">POST</button>
      <button @click="test_get">GET</button>
    </p>
  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    name: 'App',
    data() {
      return {
        message: 'Hello Vue!'
      }
    },
    methods: {
      test_post() {
        axios.post('/api/test:8000', {
          message: this.message
        }).then(response => {
          console.log(response.data);
        }).catch(error => {
          console.log(error);
        });
      },
      test_get() {
        axios.get('/api/test:8000').then(response => {
          console.log(response.data);
        }).catch(error => {
          console.log(error);
        });
      }
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

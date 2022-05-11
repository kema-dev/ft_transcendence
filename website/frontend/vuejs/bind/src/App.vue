<template>
  <div id="app">
    <h1>Hello Vue!</h1>
    <p>
      <a :href="this.api42Path">GET 42 TOKEN</a>
    </p>
    <p>
      <a> TOKEN: {{ token42 }} </a>
    </p>
    <p>
      <button @click="post_42">POST</button>
    </p>
    <p>
      <a :href="this.rootPath">RESET</a>
    </p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "App",
  data() {
    return {
      title: "",
      number: "",
      rootPath: "http://localhost:8080",
      apiPath: "http://localhost:3000/api/",
      api42Path:
        "https://api.intra.42.fr/oauth/authorize?client_id=4b42a21a05efa463774526895b6026f4d6119d07eac916ee0670f6985f63904e&redirect_uri=http%3A%2F%2Flocalhost%3A8080&response_type=code",
      token42: "",
    };
  },
  created() {
    let urlParams = new URLSearchParams(window.location.search);
    this.token42 = urlParams.get("code");
  },
  methods: {
    post_42() {
      axios
        .post("https://api.intra.42.fr/oauth/token", {
          grant_type: "authorization_code",
          client_id: "4b42a21a05efa463774526895b6026f4d6119d07eac916ee0670f6985f63904e",
          client_secret: "f5e657ee7b55efdf4754f7b00ae9ea2d96c18d54db453e8b0644668eebc8133e",
          code: this.token42,
          redirect_uri: "http://localhost:8080",
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
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

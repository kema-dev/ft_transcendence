<template>
  <section class="container">
    <div class="right-half">
      <article>
        <!-- Message -->
        <div class="inboxchat">
          <div id="userinfo">
            <img class="img" src="../assets/user-astronaut-solid.svg" />
            <a class="chatname">{{ name }}</a>
            <a class="chattime">{{ time }}</a>
          </div>
          <div class="msg">
            <p>{{ message }}</p>
          </div>
        </div>
        <!-- Message -->
        <div class="outboxchat">
          <div class="msg">
            <p>{{ message }}</p>
          </div>
          <div id="userinfo">
            <img class="img" src="../assets/user-astronaut-solid.svg" />
            <a class="chatname">{{ name }}</a>
            <a class="chattime">{{ time }}</a>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      name: "username",
      time: "00h00m00s",
      message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. \
      Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an \
      unknown printer took a galley of type and scrambled it to make a type specimen book. It \
      has survived not only five centuries, but also the leap into electronic typesetting, \
      remaining essentially unchanged. It was popularised in the 1960s with the release of \
      Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing \
      software like Aldus PageMaker including versions of Lorem Ipsum.",
      // message: "short message",
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
  box-sizing: border-box;
}

section {
  color: #fff;
  text-align: center;
}

div {
  height: 100%;
}

article {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  /* padding: 20px; */
}

.img {
  width: 80%;
  margin: 0 0.5rem 0 0;
}

.inboxchat {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: rgb(59, 154, 231);
  box-shadow: 0 2px 2px #ffffff;
  margin-left: 2%;
  margin-right: 15%;
  margin-top: 2%;
}

.outboxchat {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: rgb(59, 70, 231);
  box-shadow: 0 2px 2px #ffffff;
  margin-left: 15%;
  margin-right: 2%;
  margin-top: 2%;
}

.chattime {
  max-width: 8rem; /* FIXME crop remaining text */
  font-size: 0.75rem;
  margin: 0 0.5rem 0 0;
}

.chatname {
  max-width: 8rem; /* FIXME crop remaining text */
  font-size: 1.25rem;
  margin: 0 0.5rem 0 0;
}

.msg {
  font-size: 1rem;
  margin: 0 0.5rem 0 0;
  text-align: justify;
}

#userinfo {
  display: flex;
  flex-direction: column;
  justify-content: left;
  align-items: center;
}
</style>

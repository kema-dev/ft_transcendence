<template>
  <section class="container">
    <div class="right-half">
      <article> <!-- Message -->
        <img src="../assets/user-astronaut-solid.svg" alt="">
        <p>
          If your knees aren't green by the end of the day, you ought to
          seriously re-examine your life.
        </p>
      </article>
    </div>
  </section>
</template>

<script>
export default {
  name: "LeftHalf",
  props: {
    name: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
  box-sizing: border-box;
}
body {
  font-size: 1.25rem;
  font-family: sans-serif;
  line-height: 150%;
  text-shadow: 0 2px 2px #b6701e;
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

h1 {
  font-size: 1.75rem;
  margin: 0 0 0.75rem 0;
}
</style>

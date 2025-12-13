<template>
  <section class="page_404">
    <div class="container">
      <div class="four_zero_four_bg"></div>
      <div class="contant_box_404">
        <router-link to="/" class="link_404">返回主页</router-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "PageNotFound",
};
</script>

<style scoped>
.page_404 {
  background: #fff;
  height: 100%;
}

.container {
  padding: 40px 0;
  text-align: center;
}

.page_404 img {
  width: 100%;
}

.four_zero_four_bg {
  background-image: url("/404.jpg");
  height: 400px;
  background-position: center;
  background-repeat: no-repeat;
}

.four_zero_four_bg h1 {
  font-size: 80px;
  margin-top: 0px;
}

.four_zero_four_bg h3 {
  font-size: 80px;
}

.link_404 {
  color: #fff;
  background: var(--theme-color);
  text-decoration: none;
  padding: 8px 20px;
  border-radius: 5px;
  margin: 20px 0;
  display: inline-block;
}

.contant_box_404 {
  margin-top: 10px;
}
</style>

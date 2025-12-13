<template>
  <!-- 页头 -->
  <HeaderBar></HeaderBar>
  <div class="home">
    <div class="container">
      <!-- 卡片容器 -->
      <div class="home-content">
        <!-- 卡片列表 -->
        <div class="code-space-card" v-for="c in codespaceValueList" :key="c">
          <div class="preview-title">
            <span>{{ c.title }}</span>
          </div>
          <!-- 预览的gif -->
          <div class="preview-gif">
            <img :src="c.previewgif ? c.previewgif : '/404.jpg'" />
          </div>
          <div class="preview-go">
            <button @click="onGoPreview(c.url)">冲 🚀</button>
          </div>
          <div class="preview-description">
            {{ "1️⃣ 描述 📃: " + c.summary }}
          </div>
          <div class="preview-description">
            {{ "2️⃣ source link 🌐: " + `${c.sourcelink ? "" : "暂无"}` }}
            <a
              v-if="c.sourcelink"
              :href="c.sourcelink"
              target="_blank"
              rel="noopener noreferrer"
              >{{ `Click here.` }}</a
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <FootBar></FootBar>

    <!-- 滚动到顶部按钮 -->
    <BackToTop :cls="'home'"></BackToTop>
  </div>
</template>

<script setup>
import { useStore } from "vuex";

import HeaderBar from "@/components/HeaderBar.vue";
import FootBar from "@/components/FootBar.vue";
import BackToTop from "@/components/BackToTop.vue";

const store = useStore();
const codespaceAbout = store.state.codespaceAbout.data;
const codespaceValueList = Object.values(codespaceAbout);

const onGoPreview = (url) => {
  window.open(url, "_blank");
};
</script>

<style scoped>
.home {
  height: 100%;
  width: 100%;
  overflow-y: auto;
}

.container {
  padding: 40px 15px;
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  animation: fadeInUp 1s;
}

.home-content {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: row;
  align-items: center;
  min-height: 600px;
  flex-wrap: wrap;
  gap: 40px;
}

.code-space-card {
  background: white;
  border-radius: 8px;
  box-shadow: var(--card-box-shadow);
  text-align: center;
  height: 442px;
  width: 400px;
  padding: 8px;
  box-sizing: border-box;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
}
.preview-description {
  margin-top: 8px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  /* 限制最多显示2行 */
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.preview-gif img {
  height: 256px;
  width: 256px;
}

.preview-go button {
  height: 36px;
  width: 200px;
  margin-top: 8px;
  border-radius: 8px;
  cursor: pointer;
  background-color: #d5dcdc;
}

.preview-go button:hover {
  background-color: #bbc7c7;
}
</style>

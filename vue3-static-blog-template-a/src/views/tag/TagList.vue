<template>
  <!-- 页头 -->
  <HeaderBar></HeaderBar>
  <div class="home">
    <div class="container">
      <!-- 侧边栏 -->
      <div class="side-content">
        <WebSiteAuthorCard></WebSiteAuthorCard>
      </div>

      <!-- 界面的主题内容 -->
      <div class="home-content">
        <div class="tag-clouds">
          <router-link
            class="tag-item"
            v-for="tag in tagClouds"
            :key="tag.id"
            :to="`/tag/${tag.id}`"
            :style="tag.style"
            >{{ tag.name }}</router-link
          >
        </div>
      </div>
    </div>
  </div>
  <!-- 页脚 -->
  <FootBar :style="{ position: 'relative', bottom: '175px' }"></FootBar>

  <!-- 滚动到顶部按钮 -->
  <BackToTop :cls="'home'"></BackToTop>
</template>

<script setup>
import { useStore } from "vuex";
import { computed, onMounted, ref } from "vue";

import { linearColorWordCloud } from "../../utils/word-cloud";

import HeaderBar from "../../components/HeaderBar.vue";
import WebSiteAuthorCard from "../../components/WebSiteAuthorCard.vue";
import FootBar from "../../components/FootBar.vue";
import BackToTop from "../../components/BackToTop.vue";

const store = useStore();

// 通过计算属性获取 Vuex 中的标签数据
const tags = computed(() => store.state.blogsAbout.tags);

// 响应式数据：标签列表和词云数据
const tagList = ref([]);
const tagClouds = ref([]);

onMounted(() => {
  // 清空旧的 tagList 和 tagClouds
  tagList.value = [];
  tagClouds.value = [];

  // 遍历 tags 数据，生成 tagList（每个标签包含 id、name 和计数）
  tags.value.forEach((item) => {
    tagList.value.push({
      id: item, // 标签的唯一标识
      name: item, // 标签的名称
      count: 1, // 标签的计数，默认为 1
    });
  });

  // 调用工具函数生成带颜色的词云数据
  tagClouds.value = linearColorWordCloud(tagList.value);
});
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
  width: 74%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.tag-clouds {
  font-size: 14px;
  box-sizing: border-box;
}

.tag-item {
  text-decoration: none;
  display: inline-block;
  transition: all 0.4s;
  padding: 0 4px;
  overflow-wrap: break-word;
  line-height: 2;
}

.tag-item:hover {
  color: var(--theme-color) !important;
}

.side-content {
  width: 26%;
  margin-right: 20px;
}

#pagination {
  margin-top: 20px;
  justify-content: center;
}

#pagination > button {
  box-shadow: var(--card-box-shadow);
  background: white;
  border-radius: 8px;
  height: 35px;
  width: 35px;
}

#pagination li {
  box-shadow: var(--card-box-shadow);
  background-color: white;
  border-radius: 8px;
  margin: 0 6px;
  height: 35px;
  width: 35px;
}

#pagination li.active {
  color: white;
  background: var(--theme-color);
  font-weight: normal;
}

@media screen and (max-width: 900px) {
  .side-content {
    display: none;
  }

  .home-content {
    width: 100%;
  }
}

@keyframes fadeInUp {
  from {
    margin-top: 50px;
    opacity: 0;
  }

  to {
    margin-top: 0;
    opacity: 1;
  }
}
</style>

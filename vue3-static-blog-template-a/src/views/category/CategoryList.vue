<template>
  <!-- 页头 -->
  <HeaderBar></HeaderBar>
  <div class="home">
    <div class="container">
      <!-- 侧边栏 -->
      <div class="side-content">
        <WebSiteAuthorCard></WebSiteAuthorCard>
        <SideBarTag></SideBarTag>
      </div>

      <!-- 界面的主题内容 -->
      <div class="home-content">
        <div class="home-card-list">
          <HomeCard
            v-for="(article, index) in blogsCategroyList"
            :key="article.id"
            :article="article"
            :reverse="index % 2 == 1"
          ></HomeCard>
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
import { computed, onMounted, ref } from "vue";

import HeaderBar from "../../components/HeaderBar.vue";
import WebSiteAuthorCard from "../../components/WebSiteAuthorCard.vue";
import SideBarTag from "../../components/SideBarTag.vue";
import HomeCard from "../../components/HomeCard.vue";
import FootBar from "../../components/FootBar.vue";
import BackToTop from "../../components/BackToTop.vue";

const store = useStore();

// 获取博客分类数据的计算属性
const categories = computed(() => store.state.blogsAbout.categories);

// 存储分类列表
const blogsCategroyList = ref([]);

onMounted(() => {
  // 清空当前分类列表
  blogsCategroyList.value = [];

  for (const key in categories.value) {
    if (categories.value.hasOwnProperty(key)) {
      // 获取每个分类的第一个项目
      const serialNo0Item = categories.value[key][0];
      if (typeof serialNo0Item == "object") {
        blogsCategroyList.value.push({
          // 解构原始数据
          ...serialNo0Item,
          // 设置分类名称作为标签
          label: serialNo0Item.category,
          // 构建分类的URL路径
          url: `/category/${serialNo0Item.category}`,
        });
      }
    }
  }
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
  min-height: 600px;
}

.home-card-list {
  width: 74%;
}

.home-card-list .home-card {
  margin-top: 20px;
}

.home-card-list .home-card:nth-child(1) {
  margin-top: 0;
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

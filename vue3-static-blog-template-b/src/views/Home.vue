<template>
  <!-- 页头 -->
  <HeaderBar></HeaderBar>
  <div class="home-container">
    <div class="content">
      <!-- 侧边栏 -->
      <div class="side-content">
        <WebSiteAuthorCard></WebSiteAuthorCard>
        <SideBarCategory
          :title="`全部分类`"
          :category-list="categoryList"
          @on-change-category="handleChangeCategory"
        ></SideBarCategory>
      </div>

      <!-- 界面的主题内容 -->
      <div class="home-content">
        <HomeContent :all-cards="allCards"></HomeContent>
      </div>
    </div>

    <!-- 页脚 -->
    <FootBar></FootBar>

    <!-- 滚动到顶部按钮 -->
    <BackToTop :cls="'home-container'"></BackToTop>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import HeaderBar from "@/components/HeaderBar.vue";
import WebSiteAuthorCard from "@/components/WebSiteAuthorCard.vue";
import HomeContent from "@/components/HomeContent.vue";
import FootBar from "@/components/FootBar.vue";
import BackToTop from "@/components/BackToTop.vue";
import SideBarCategory from "@/components/SideBarCategory.vue";

const store = useStore();

// 获取博客全部的归档数据, 增加 url 和 type 的属性
const archives = store.state.blogsAbout.archives;
const validArchives = archives.map((item) => ({
  id: item.id,
  ctype: "blog",
  blog: {
    ...item,
    url: `/blog/${item.id}`,
  },
}));

// 得到codespace的对象数组
const codePlaygroundList = Object.entries(store.state.codespaceAbout.data).map(
  ([key, value]) => ({
    id: key,
    ctype: "codespace",
    blog: {
      ...value,
      id: key,
    },
  })
);

const allCards = ref([]);

// 公共排序函数
const sortByDateDesc = (list) =>
  [...list].sort((a, b) => new Date(b.blog.date) - new Date(a.blog.date));

// 初始化卡片列表（全部内容）
allCards.value = sortByDateDesc([...validArchives, ...codePlaygroundList]);

const categoryList = [
  { name: "All", count: validArchives.length + codePlaygroundList.length },
  { name: "Code Space", count: codePlaygroundList.length },
  { name: "Blogs", count: validArchives.length },
];

// 映射不同分类对应的数据源
const categoryMap = {
  All: [...validArchives, ...codePlaygroundList],
  "Code Space": codePlaygroundList,
  Blogs: validArchives,
};

const handleChangeCategory = (categoryName) => {
  const selectedList = categoryMap[categoryName] || [];
  allCards.value = sortByDateDesc(selectedList);
};
</script>

<style scoped>
.home-container {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  background-color: #f2f3f5;
}

.content {
  padding: 40px 15px;
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  animation: fadeInUp 1s;
}

.home-content {
  width: 74%;
}

.home-content .post-blog-card {
  margin-top: 20px;
}

.home-content .post-blog-card:nth-child(1) {
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

<template>
  <div :class="cardClass">
    <!-- 缩略图 -->
    <div :class="thumbailLinkClass" @click="navigateTo(article.url)">
      <img
        :src="article.thumbnail"
        @error.once=""
        alt="缩略图"
        class="post-article-thumbnail"
      />
    </div>

    <!-- 卡片信息 -->
    <div class="post-article-info">
      <!-- 显示卡片标题 -->
      <div @click="navigateTo(article.url)" class="post-article-title">
        {{ article.label }}
      </div>

      <!-- 基本数据 -->
      <div class="post-article-meta-data-wrap">
        <span class="post-article-meta-data" v-if="article.date">
          <font-awesome-icon :icon="['fas', 'calendar-days']" />
          创建于 {{ article.date }}
        </span>
      </div>

      <!-- 摘要 -->
      <div class="post-article-summary">
        {{ article.summary }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

// Props 接收
const props = defineProps({
  article: {
    type: Object,
    require: true,
  },
  reverse: {
    type: Boolean,
    require: false,
  },
});

// 响应式类名
const cardClass = reactive(["home-card"]);
const thumbailLinkClass = reactive(["post-article-thumbail-link"]);

if (props.reverse) {
  cardClass.push("home-card-reversed");
  thumbailLinkClass.push("post-article-thumbail-link-reversed");
}

const navigateTo = (url) => {
  window.location.href = url;
};
</script>

<style scoped>
.home-card {
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  background: white;
  border-radius: 8px;
  box-shadow: var(--card-box-shadow);
}

.home-card-reversed {
  flex-direction: row-reverse;
}

.post-article-thumbail-link {
  width: 44%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: 8px 0 0 8px;
}

.post-article-thumbail-link-reversed {
  border-radius: 0 8px 8px 0;
}

.post-article-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.4s ease;
  box-sizing: border-box;
  overflow: hidden;
  cursor: pointer;
}

.post-article-thumbnail:hover {
  transform: scale(1.1);
}

.post-article-info {
  width: 57%;
  padding: 0 40px;
}

.post-article-title {
  color: #1f2d3d;
  font-size: 24px;
  text-decoration: none;
  transition: color 0.4s;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  -webkit-line-clamp: 2;
  cursor: pointer;
}

.post-article-title:hover {
  color: var(--theme-color);
}

.post-article-meta-data-wrap {
  display: flex;
  margin: 9px 0;
}

.post-article-meta-data {
  font-size: 12px;
  color: rgb(133, 133, 133);
  box-sizing: border-box;
  line-height: 24px;
  overflow: hidden;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.post-article-meta-data-divider {
  color: rgb(133, 133, 133);
  margin: 3px 8px;
  font-size: 12px;
}

.post-article-summary {
  color: var(--text-color);
  font-size: 14px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-height: 2;
  -webkit-line-clamp: 2;
}
</style>

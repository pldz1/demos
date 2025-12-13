<template>
  <div :class="cardClass">
    <!-- 如果是博客内容的缩略图 显示路由标签 -->
    <router-link
      v-if="ctype == 'blog'"
      :to="`${blog.url}`"
      :class="thumbailLinkClass"
      ><img
        :src="blog.thumbnail"
        @error.once=""
        alt="缩略图"
        class="post-blog-thumbnail"
      />
    </router-link>

    <!-- 如果是codespace的内容缩略图, 修改点击行为 -->
    <div v-else :class="thumbailLinkClass" @click="onGoPreview(blog.url)">
      <img
        :src="blog.thumbnail"
        @error.once=""
        alt="缩略图"
        class="post-blog-thumbnail"
      />
    </div>

    <!-- 卡片信息 -->
    <div class="post-blog-info">
      <!-- 如果是博客的标题用路由表 -->
      <router-link
        v-if="ctype == 'blog'"
        :to="`${blog.url}`"
        class="post-blog-title"
        >{{ blog.title }}
      </router-link>
      <!-- 如果是codespace的的标题修改跳转行为 -->
      <div v-else class="post-blog-title" @click="onGoPreview(blog.url)">
        {{ blog.title }}
      </div>

      <!-- 基本数据 -->
      <div class="post-blog-meta-data-wrap">
        <span class="post-blog-meta-data" v-if="blog.date">
          <div class="icon-16" v-html="calendar16"></div>
          时间: {{ blog.date }}
        </span>
        <span
          class="post-blog-meta-data ml8"
          v-if="ctype == 'blog' && blog.category"
        >
          <div class="icon-16" v-html="book16"></div>
          分类: {{ blog.category }}
        </span>
        <span
          class="post-blog-meta-data ml8"
          v-if="ctype == 'blog' && blog.tags"
        >
          <div class="icon-16" v-html="tag16"></div>
          标签: {{ blog.tags }}
        </span>
      </div>

      <!-- 摘要 -->
      <div v-if="ctype == 'codespace'" class="post-blog-summary">
        {{ `体验 🚀: ${blog.summary}` }}
      </div>
      <div v-else class="post-blog-summary">
        {{ `摘要 📃: ${blog.summary}` }}
      </div>

      <div
        v-if="ctype == 'codespace'"
        v-html="codespace32"
        class="icon-32-a post-blog-type-icon"
      ></div>
      <div v-else v-html="blog32" class="icon-32-a post-blog-type-icon"></div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { calendar16, book16, tag16, blog32, codespace32 } from "@/assets/svg";
// Props 接收
const props = defineProps({
  blog: {
    type: Object,
    require: true,
  },
  ctype: {
    type: String,
    require: true,
  },
  reverse: {
    type: Boolean,
    require: false,
  },
});

// 响应式类名
const cardClass = reactive(["home-card"]);
const thumbailLinkClass = reactive(["post-blog-thumbail-link"]);

if (props.reverse) {
  cardClass.push("home-card-reversed");
  thumbailLinkClass.push("post-blog-thumbail-link-reversed");
}

const onGoPreview = (url) => {
  window.open(url, "_blank");
};
</script>

<style scoped>
.ml8 {
  margin-left: 8px;
}
</style>

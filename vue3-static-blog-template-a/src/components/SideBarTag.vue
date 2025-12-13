<template>
  <SideBarCard :icon="['fas', 'tags']" iconColor="#db669f" title="标签">
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
  </SideBarCard>
</template>

<script setup>
import { useStore } from "vuex";
import { linearColorWordCloud } from "../utils/word-cloud";
import { computed, onMounted, ref } from "vue";
import SideBarCard from "./SideBarCard.vue";

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
</style>

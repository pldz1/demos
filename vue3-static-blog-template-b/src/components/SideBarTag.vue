<template>
  <SideBarCard iconColor="#db669f" title="标签">
    <div class="tag-clouds">
      <div
        class="tag-item"
        v-for="tag in tagClouds"
        :key="tag.name"
        :style="tag.style"
        @click="onChangeTag(tag.name)"
      >
        {{ tag.name }}
      </div>
    </div>
  </SideBarCard>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import { randomColorWordCloud } from "@/utils/word-cloud";
import SideBarCard from "@/components/SideBarCard.vue";

const emit = defineEmits(["on-change-tag"]);
const store = useStore();

// 通过计算属性获取 Vuex 中的标签数据
const tags = store.state.blogsAbout.tags;

// 标签列表和词云数据
const tagList = [];
const tagClouds = ref([]);

// 遍历 tags 数据，生成 tagList（每个标签包含 id、name 和计数）
Object.keys(tags).forEach((t) => {
  const tdata = tags[t];
  const cdata = { id: t, name: t, count: tdata.length };
  tagList.push(cdata);
});

// 调用工具函数生成带颜色的词云数据
tagClouds.value = randomColorWordCloud(tagList);

const onChangeTag = (tagName) => {
  emit("on-change-tag", tagName);
};
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
  cursor: pointer;
}

.tag-item:hover {
  color: var(--theme-color) !important;
}
</style>

<template>
  <SideBarCard
    :icon="['fas', 'folder']"
    iconColor="#fcd53f"
    title="博客文章分类"
  >
    <div class="category-list">
      <router-link
        v-for="category in categoryList"
        :key="category.id"
        :to="`/category/${category.id}`"
        class="category-item"
      >
        <span class="category-name">{{ category.name }}</span>
        <span class="category-count">{{ category.count }}</span>
      </router-link>
    </div>
  </SideBarCard>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
import { useStore } from "vuex";

import SideBarCard from "./SideBarCard.vue";

const store = useStore();
const categories = computed(() => store.state.blogsAbout.categories);
const categoryList = ref([]);

onMounted(() => {
  categoryList.value = [];
  for (const key in categories.value) {
    if (categories.value.hasOwnProperty(key)) {
      const item = {
        id: key,
        name: key,
        count: categories.value[key]?.length,
      };
      categoryList.value.push(item);
    }
  }
});
</script>

<style scoped>
.category-item {
  display: flex;
  justify-content: space-between;
  text-decoration: none;
  padding: 10px 10px;
  color: var(--text-color);
  font-size: 14px;
  transition: all 0.4s;
  border-radius: 4px;
}

.category-item:hover {
  background-color: var(--theme-color);
  color: white;
  padding: 10px 17px;
}

.category-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

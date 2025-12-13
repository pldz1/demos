<template>
  <SideBarCard iconColor="#fcd53f" :title="title">
    <div class="category-list">
      <div
        v-for="category in categoryList"
        :key="category.name"
        :class="[
          'category-item',
          selectedName == category.name ? 'category-item-selected' : '',
        ]"
        @click="onChangeCategory(category.name)"
      >
        <span class="category-name">{{ category.name }}</span>
        <span class="category-count">{{ category.count }}</span>
      </div>
    </div>
  </SideBarCard>
</template>

<script setup>
import { ref } from "vue";
import SideBarCard from "./SideBarCard.vue";

const emit = defineEmits(["on-change-category"]);
const props = defineProps({
  title: {
    type: String,
    require: false,
  },
  categoryList: {
    type: Array,
    require: true,
  },
});

const selectedName = ref("");

const onChangeCategory = (categoryName) => {
  emit("on-change-category", categoryName);
  selectedName.value = categoryName;
};
</script>

<style lang="less" scoped>
.category-item {
  display: flex;
  justify-content: space-between;
  text-decoration: none;
  padding: 10px 10px;
  color: var(--text-color);
  font-size: 14px;
  transition: all 0.4s;
  border-radius: 4px;
  cursor: pointer;
}

.category-item-selected {
  font-weight: 900;
  color: #3e77bf;
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

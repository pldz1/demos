<template>
  <SideBarCard
    :icon="['fas', 'folder']"
    iconColor="#fcd53f"
    title="博客文章系列"
  >
    <div class="category-list">
      <router-link
        v-for="category in categoryList"
        :key="category.id"
        :to="`/article/${category.id}`"
        class="category-item"
      >
        <span
          class="category-name"
          :class="{ active: props.serialNo === category.serialNo }"
        >
          {{ category.name }}
        </span>
      </router-link>
    </div>
  </SideBarCard>
</template>

<script setup>
import { watch, computed, ref } from "vue";
import { useStore } from "vuex";
import SideBarCard from "../../components/SideBarCard.vue";

const props = defineProps({
  category: {
    type: String,
    default: "",
  },
  serialNo: {
    type: Number,
    default: 0,
  },
});

const store = useStore();
const categories = computed(() => store.state.blogsAbout.categories);
const categoryList = ref([]);

watch(
  () => props,
  () => {
    const clist = categories.value[props.category];
    if (typeof clist === "object") categoryList.value = clist;
  },
  { deep: true }
);
</script>

<style scoped>
.category-list {
  max-height: 200px;
  overflow-y: auto;
}
.category-item {
  display: flex;
  justify-content: space-between;
  text-decoration: none;
  padding: 4px 10px;
  color: var(--text-color);
  font-size: 14px;
  transition: all 0.4s;
  border-radius: 4px;
}

.category-item:hover {
  background-color: var(--theme-color);
  color: white;
  padding: 5px 8px;
}

.active {
  background-color: rgb(222 227 233 / 50%);
  padding: 4px 4px;
  border-radius: 4px;
  color: #000000;
  text-decoration: underline;
  font-size: 16px;
  font-weight: 600;
}

.category-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<template>
  <div class="home-content-container">
    <!-- Code Space Playground 内容 -->
    <div class="container">
      <div class="home-card-list">
        <BlogCard
          v-for="card in allCards"
          :ctype="card.ctype"
          :key="card.id"
          :blog="card.blog"
          :reverse="false"
        ></BlogCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import BlogCard from "@/components/BlogCard.vue";

const props = defineProps({
  allCards: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.home-content-container {
  height: 100%;
  width: 100%;
}

.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.container-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  color: #666;
  font-size: 24px;
}

.container-divider::before,
.container-divider::after {
  content: "";
  flex: 1;
  border-top: 2px dashed #cccccc;
  margin: 0 10px;
}

.home-card-list {
  width: 74%;
}

.home-card-list .home-card {
  margin-top: 8px;
}

.home-card-list .home-card:nth-child(1) {
  margin-top: 0;
}
</style>

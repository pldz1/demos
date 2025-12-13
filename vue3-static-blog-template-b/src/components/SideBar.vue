<template>
  <!-- 侧边栏 -->
  <div class="side-bar">
    <slot>
      <SideBarCard></SideBarCard>
    </slot>
  </div>
</template>

<script setup>
import SideBarCard from "./SideBarCard.vue";
</script>

<style scoped>
/* Sidebar style */
.side-bar {
  width: 26%;
  margin-right: 20px;
}

/* Hide sidebar on smaller screens */
@media screen and (max-width: 900px) {
  .side-bar {
    display: none;
  }
}
</style>

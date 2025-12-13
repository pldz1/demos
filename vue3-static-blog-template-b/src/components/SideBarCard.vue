<template>
  <div class="card">
    <div class="card-header">
      <span :style="headerIconStyle"></span>
      <span v-if="props.title">{{ title }}</span>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
const props = defineProps({
  title: {
    type: String,
    require: false,
    default: "",
  },
  iconColor: {
    type: String,
    require: false,
    default: "var(--text-color)",
  },
});

const headerIconStyle = reactive({
  color: props.iconColor,
});
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  box-shadow: var(--card-box-shadow);
  padding: 20px 24px;
  width: 100%;
  margin-top: 25px;
  box-sizing: border-box;
}

.card-header {
  text-align: left !important;
  margin-bottom: 20px;
}

.header-icon {
  font-size: 18px;
  margin-right: 10px;
}

.card-header span {
  font-size: 17px;
  color: var(--text-color);
}
</style>

<template>
  <div class="header">
    <router-link class="header-title" to="/"
      >✨ {{ websiteAbout.websiteName }} ✨</router-link
    >
    <div class="header-menu">
      <div v-for="item in menuItems" :key="item.name">
        <router-link :to="item.href" class="header-menu-item">
          <font-awesome-icon :icon="item.icon" class="header-icon" />{{
            item.name
          }}
        </router-link>
      </div>
    </div>

    <div id="header-menu-button" @click="drawer = !drawer">
      <font-awesome-icon :icon="['fas', 'bars']" />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from "vue";
import store from "../store";

const props = defineProps({
  blogTitle: {
    type: String,
    default: "",
  },
});

// 使用 `ref` 和 `reactive` 来声明响应式数据
const drawer = ref(false);
const menuItems = reactive([
  { name: "首页", icon: ["fas", "home"], href: "/" },
  { name: "分类", icon: ["fas", "folder"], href: "/category" },
]);

const websiteAbout = store.state.websiteAbout;

const handleResize = () => {
  const scale = window.devicePixelRatio;
  const width = document.documentElement.clientWidth * scale;
  if (width > 900 * scale) {
    drawer.value = false;
  }
};

// 在 `onMounted` 中添加事件监听器，避免内存泄漏
onMounted(() => {
  window.addEventListener("resize", handleResize);
});

// 在组件销毁前移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
@import url("../assets/font/kanit-900.css");

.header {
  position: relative;
  top: 0;
  height: 60px;
  width: 100%;
  z-index: 9999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 3%;
  box-sizing: border-box;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  --text-color: #eeeeee;
  --text-hover-color: white;
  background-color: #3b88f1;
}

.header-title {
  color: var(--text-color);
  font-size: 23px;
  font-family: "Kanit";
  text-decoration: none;
  transition: all 0.2s;
}

.header-title:hover {
  color: var(--text-hover-color);
}

.header-icon {
  margin-right: 7px;
}

.header-menu {
  display: flex;
  position: relative;
}

.header-menu-item {
  color: var(--text-color);
  text-decoration: none;
  font-size: 14px;
  margin-left: 25px;
  position: relative;
  padding-bottom: 5px;
  transition: color 0.4s ease-in-out;
}

.header-menu-item:hover {
  color: var(--text-hover-color);
}

.header-menu-item:after {
  content: "";
  width: 0;
  height: 3px;
  background: #80c8f8;
  position: absolute;
  bottom: 0;
  left: 50%;
  transition: all 0.4s ease-in-out;
  border-radius: 2px;
}

.header-menu-item:hover:after {
  left: 0%;
  width: 100%;
}

#header-menu-button {
  display: none;
  color: var(--text-color);
  cursor: pointer;
  position: relative;
  font-size: 20px;
  margin: 0;
}

#header-menu-button:hover {
  color: var(--text-hover-color);
}

:deep(.el-drawer__body) {
  padding: 0;
}

@media screen and (max-width: 900px) {
  .header-menu {
    display: none;
  }

  #header-menu-button {
    display: inline-block;
  }
}

@keyframes fadeUpIn {
  0% {
    -webkit-transform: translateY(-100%);
    transform: translateY(-100%);
    opacity: 0%;
  }
  100% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    opacity: 100%;
  }
}
</style>

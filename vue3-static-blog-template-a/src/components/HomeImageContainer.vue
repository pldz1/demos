<template>
  <div :style="coverStyle" class="cover">
    <div class="cover-word-container">
      <h1 class="cover-title particletext bubbles">{{ title }}</h1>
      <p class="cover-content">{{ content }}</p>
    </div>
    <div class="cover-arrow-down">
      <el-icon size="50px" class="arrow-down" @click="scrollToContent"
        ><ArrowDown
      /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { ArrowDown } from "@element-plus/icons-vue";
import createParticles from "../utils/text-effect";

// 定义 props
const props = defineProps({
  imgUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

// 使用 reactive 来创建响应式对象
const coverStyle = reactive({
  background: `url(${require("@/" + props.imgUrl)})`,
  backgroundSize: "cover",
});

// 定义滚动到内容的方法
function scrollToContent() {
  const h = document.getElementsByClassName("cover")[0].scrollHeight;
  window.scrollTo({ top: h, behavior: "smooth" });
}

// 在 mounted 中调用 createParticles 函数
onMounted(() => {
  createParticles();
});
</script>

<style scoped>
.cover {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  animation: fadeUpInCover 1s;
}

.cover-word-container {
  margin: 0 auto;
  text-align: center;
}

.cover-title {
  font-family: "Kanit";
  color: white;
  font-size: 65px;
  margin: 0px;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  animation: fadeUpIn 1.5s;
}

.cover-content {
  color: white;
  font-size: 24px;
  font-family: "Long Cang", sans-serif;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  animation: fadeUpInSlow 1.5s;
}

.cover-arrow-down {
  position: relative;
  height: 50px;
  width: 50px;
  top: 50px;
}
.arrow-down {
  position: absolute;
  bottom: 6%;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.2s;
  animation: bounce 4s infinite;
}

.arrow-down:hover {
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.2s;
}

@-webkit-keyframes bounce {
  0%,
  10%,
  25%,
  40%,
  50% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }

  20% {
    -webkit-transform: translateY(-10px);
    transform: translateY(-10px);
  }

  30% {
    -webkit-transform: translateY(-5px);
    transform: translateY(-5px);
  }
}

@keyframes bounce {
  0%,
  10%,
  25%,
  40%,
  50% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }

  20% {
    -webkit-transform: translateY(-10px);
    transform: translateY(-10px);
  }

  30% {
    -webkit-transform: translateY(-5px);
    transform: translateY(-5px);
  }
}

@keyframes fadeUpInCover {
  0% {
    -webkit-transform: translateY(-70px);
    transform: translateY(-70px);
    opacity: 0%;
  }
  100% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    opacity: 100%;
  }
}

@keyframes fadeUpIn {
  0% {
    -webkit-transform: translateY(-50px);
    transform: translateY(-50px);
    opacity: 0%;
  }
  100% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    opacity: 100%;
  }
}

@keyframes fadeUpInSlow {
  0% {
    -webkit-transform: translateY(-100px);
    transform: translateY(-100px);
    opacity: 0%;
  }
  100% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    opacity: 100%;
  }
}
</style>

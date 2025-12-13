<template>
  <div class="footer">
    <div class="footer-box">
      <!-- 运行时间 -->
      <div>
        <span class="blog-run-time">网站已经运行了 {{ blogRunTime }} </span>
      </div>

      <!-- 隐私数据 -->
      <div class="privacy-text">
        <div class="copyright-text" v-if="copyrightText">
          {{ copyrightText }}
        </div>
        <div class="ps-text" v-if="psNum">
          <img
            style="height: 12px; width: 12px; margin-right: 8px"
            src="https://img.alicdn.com/tfs/TB1..50QpXXXXX7XpXXXXXXXXXX-40-40.png"
          />
          <a
            href="https://beian.miit.gov.cn/?spm=5176.28426678.J_9220772140.59.30965181t5PJph#/Integrated/index"
            rel="noreferrer"
            target="_blank"
            >{{ psNum }}</a
          >
        </div>
        <div class="icp-text">
          <a v-if="icpNum" href="https://beian.miit.gov.cn/" target="_blank">{{
            icpNum
          }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { getRunTime } from "../utils/date";

const store = useStore();

const icpNum = computed(() => store.state.websiteAbout.privacyData.icp);
const psNum = computed(() => store.state.websiteAbout.privacyData.ps);
const copyrightText = computed(
  () => store.state.websiteAbout.privacyData.copyright
);

const currentTime = ref(new Date().getTime());

const timer = setInterval(() => {
  currentTime.value = new Date().getTime();
}, 1000);

const blogRunTime = computed(() => {
  const startDate = store.state.websiteAbout.startDate;
  const { day, hour, min, second } = getRunTime(startDate, currentTime.value);
  return `${day} 天 ${hour} 小时 ${min} 分 ${second} 秒`;
});

onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.footer {
  background: #232323;
  margin-top: 40px;
  padding: 15px 0 25px 0;
  width: 100%;
  color: rgb(133, 133, 133);
  text-align: center;
}

.footer-box {
  width: 70%;
  margin: 0 auto;
}

.footer-text {
  font-size: 17px;
  font-family: "Long Cang", sans-serif;
  padding-bottom: 5px;
  border-bottom: 1px dashed #333;
  margin: 0 auto 5px;
}

.footer-text-icon {
  color: red;
  font-size: 16px;
  animation: heartAni 1.4s infinite;
}

.privacy-text {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

.copyright-text,
.ps-text,
.icp-text,
.blog-run-time {
  font-size: 12px;
  a {
    text-decoration: none;
    color: rgb(133, 133, 133);
  }
}

.icp-text:link {
  color: rgb(133, 133, 133);
}

.ps-text:link {
  color: rgb(133, 133, 133);
}

.blog-run-time {
  margin-right: 5px;
}

@keyframes heartAni {
  0%,
  100% {
    transform: scale(1);
  }

  10%,
  30% {
    transform: scale(0.9);
  }

  20%,
  40%,
  50%,
  60%,
  70%,
  80% {
    transform: scale(1.1);
  }
}

@keyframes faceAni {
  2%,
  24%,
  80% {
    -webkit-transform: translate(0, 1.5px) rotate(1.5deg);
    transform: translate(0, 1.5px) rotate(1.5deg);
  }
  4%,
  68%,
  98% {
    -webkit-transform: translate(0, -1.5px) rotate(-0.5deg);
    transform: translate(0, -1.5px) rotate(-0.5deg);
  }
  38%,
  6% {
    -webkit-transform: translate(0, 1.5px) rotate(-1.5deg);
    transform: translate(0, 1.5px) rotate(-1.5deg);
  }
  8%,
  86% {
    -webkit-transform: translate(0, -1.5px) rotate(-1.5deg);
    transform: translate(0, -1.5px) rotate(-1.5deg);
  }
  10%,
  72% {
    -webkit-transform: translate(0, 2.5px) rotate(1.5deg);
    transform: translate(0, 2.5px) rotate(1.5deg);
  }
  12%,
  64%,
  78%,
  96% {
    -webkit-transform: translate(0, -0.5px) rotate(1.5deg);
    transform: translate(0, -0.5px) rotate(1.5deg);
  }
  14%,
  54% {
    -webkit-transform: translate(0, -1.5px) rotate(1.5deg);
    transform: translate(0, -1.5px) rotate(1.5deg);
  }
  16% {
    -webkit-transform: translate(0, -0.5px) rotate(-1.5deg);
    transform: translate(0, -0.5px) rotate(-1.5deg);
  }
  18%,
  22% {
    -webkit-transform: translate(0, 0.5px) rotate(-1.5deg);
    transform: translate(0, 0.5px) rotate(-1.5deg);
  }
  20%,
  36%,
  46% {
    -webkit-transform: translate(0, -1.5px) rotate(2.5deg);
    transform: translate(0, -1.5px) rotate(2.5deg);
  }
  26%,
  50% {
    -webkit-transform: translate(0, 0.5px) rotate(0.5deg);
    transform: translate(0, 0.5px) rotate(0.5deg);
  }
  28% {
    -webkit-transform: translate(0, 0.5px) rotate(1.5deg);
    transform: translate(0, 0.5px) rotate(1.5deg);
  }
  30%,
  40%,
  62%,
  76%,
  88% {
    -webkit-transform: translate(0, -0.5px) rotate(2.5deg);
    transform: translate(0, -0.5px) rotate(2.5deg);
  }
  32%,
  34%,
  66% {
    -webkit-transform: translate(0, 1.5px) rotate(-0.5deg);
    transform: translate(0, 1.5px) rotate(-0.5deg);
  }
  42% {
    -webkit-transform: translate(0, 2.5px) rotate(-1.5deg);
    transform: translate(0, 2.5px) rotate(-1.5deg);
  }
  44%,
  70% {
    -webkit-transform: translate(0, 1.5px) rotate(0.5deg);
    transform: translate(0, 1.5px) rotate(0.5deg);
  }
  48%,
  74%,
  82% {
    -webkit-transform: translate(0, -0.5px) rotate(0.5deg);
    transform: translate(0, -0.5px) rotate(0.5deg);
  }
  52%,
  56%,
  60% {
    -webkit-transform: translate(0, 2.5px) rotate(2.5deg);
    transform: translate(0, 2.5px) rotate(2.5deg);
  }
  58% {
    -webkit-transform: translate(0, 0.5px) rotate(2.5deg);
    transform: translate(0, 0.5px) rotate(2.5deg);
  }
  84% {
    -webkit-transform: translate(0, 1.5px) rotate(2.5deg);
    transform: translate(0, 1.5px) rotate(2.5deg);
  }
  90% {
    -webkit-transform: translate(0, 2.5px) rotate(-0.5deg);
    transform: translate(0, 2.5px) rotate(-0.5deg);
  }
  92% {
    -webkit-transform: translate(0, 0.5px) rotate(-0.5deg);
    transform: translate(0, 0.5px) rotate(-0.5deg);
  }
  94% {
    -webkit-transform: translate(0, 2.5px) rotate(0.5deg);
    transform: translate(0, 2.5px) rotate(0.5deg);
  }
  0%,
  100% {
    -webkit-transform: translate(0, 0) rotate(0);
    transform: translate(0, 0) rotate(0);
  }
}
</style>

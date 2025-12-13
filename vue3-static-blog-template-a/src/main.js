// src/main.js
import "./assets/css/index.css";
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/message-box/style/css";

import { createApp } from "vue";
import { getAllBlogsData, getAPIData } from "./api/get.js";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import FontAwesomeIcon from "./utils/fontawesome-icons";

// 异步初始化动作
const initializeApp = async () => {
  // 获取博客文件数据
  const blogsData = await getAllBlogsData();
  await store.dispatch("blogsAbout/update", blogsData);
  if (!blogsData) {
    alert("在项目当中没有博客文件, 只能预览网站大致样子.");
  }

  // 获取隐私数据
  const privacyData = await getAPIData("privacy.json");
  await store.dispatch("websiteAbout/setPrivacyData", privacyData);

  // 获取 codespace 数据
  const codespaceData = await getAPIData("codespace.json");
  await store.dispatch("websiteAbout/setCodeSpaceData", codespaceData);
};

// 用于所有资源都加载完毕后，把进度推到 100%、移除 loading（改为隐藏）
function handleWindowLoad() {
  // 1. 把进度推到 100%
  if (window.updateProgress) {
    // 先清除那个假进度的定时器
    if (window._fakeProgressTimer) {
      clearInterval(window._fakeProgressTimer);
      window._fakeProgressTimer = null;
    }
    window.fakeProgress = 100;
    window.updateProgress(window.fakeProgress);
  }

  // 2. 给点过渡，再隐藏蒙层、显示app
  setTimeout(() => {
    const initialLoadingEl = document.getElementById("global-initial-loading");
    if (initialLoadingEl) {
      // 不要 removeChild，只是隐藏
      initialLoadingEl.style.display = "none";
    }

    const appEl = document.getElementById("app");
    if (appEl) {
      appEl.style.display = "block";
    }

    // 3. 最后挂载 Vue
    mountVueApp();
  }, 300);
}

function mountVueApp() {
  // 做我们的异步初始化
  initializeApp().then(() => {
    // 创建并挂载 Vue
    const app = createApp(App);
    app.use(store);
    app.use(router);
    app.component("font-awesome-icon", FontAwesomeIcon);
    app.mount("#app");
  });
}

// 如果此时文档已经加载完毕，就直接执行，否则监听一次 load
if (document.readyState === "complete") {
  handleWindowLoad();
} else {
  window.addEventListener("load", handleWindowLoad, { once: true });
}

import { createStore } from "vuex";

// 博客信息
const blogsAbout = {
  namespaced: true,
  state: {
    archives: [],
    categories: {},
    tags: {},
  },
  actions: {
    // 通过 dispatch 调用这个 action，来提交 mutation
    update({ commit }, data) {
      commit("setAllBlogsData", data);
    },
  },
  mutations: {
    // mutation 来更新 allBlogsData
    setAllBlogsData(state, data) {
      if (data) {
        state.archives = data?.archives || [];
        state.categories = data?.categories || {};
        state.tags = data?.tags || {};
      }
    },
  },
};

const codespaceAbout = {
  namespaced: true,
  state: {
    // 具体数据的模板和访问的键名
    data: {
      key1: {
        titele: "",
        url: "",
        date: "",
        thumbnail: "",
        summary: "",
      },
    },
  },
  actions: {
    // 通过 dispatch 调用这个 action，来提交 mutation
    setCodeSpaceData({ commit }, data) {
      commit("setCodeSpaceData", data);
    },
  },
  mutations: {
    // mutation 来更新 code space 数据
    setCodeSpaceData(state, data) {
      if (data) {
        if (typeof data == "object") state.data = data;
      }
    },
  },
};

// 网站
const websiteAbout = {
  namespaced: true,
  state: {
    name: import.meta.env.VITE_WEBSITE_NAME,
    startDate: import.meta.env.VITE_WEB_START_TIME,
    author: {
      name: import.meta.env.VITE_WEBSITE_AUTHOR_NAME,
      signature: "",
      avatar: "/avatar.png",
      githubUrl: import.meta.env.VITE_WEBSITE_AUTHOR_GITHUB,
      csdnUrl: import.meta.env.VITE_WEBSITE_AUTHOR_CSDN,
      juejinUrl: import.meta.env.VITE_WEBSITE_AUTHOR_JUEJIN,
      giteeUrl: import.meta.env.VITE_WEBSITE_AUTHOR_GITEE,
    },
    privacyData: {
      icp: "",
      copyright: "",
      ps: "",
    },
  },
  actions: {
    setPrivacyData({ commit }, data) {
      commit("setPrivacyData", data);
    },
  },
  mutations: {
    setPrivacyData(state, data) {
      if (data) {
        state.privacyData.icp = data?.icp || "";
        state.privacyData.copyright = data?.copyright || "";
        state.privacyData.ps = data?.ps || "";
      }
    },
  },
};

export default createStore({
  modules: { websiteAbout, blogsAbout, codespaceAbout },
});

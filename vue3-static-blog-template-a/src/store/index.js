import { createStore } from "vuex";

// 博客信息
const blogsAbout = {
  namespaced: true,
  state: {
    archives: [],
    categories: {},
    tags: [],
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
        state.tags = data?.tags || [];
      }
    },
  },
};

// 网站
const websiteAbout = {
  namespaced: true,
  state: {
    websiteName: process.env.VUE_APP_WEBSITE_NAME,
    startDate: process.env.VUE_APP_WEB_START_TIME,
    websiteAuthorInfo: {
      name: process.env.VUE_APP_WEBSITE_NAME,
      signature: "",
      avatar: "/avatar.png",
      githubUrl: process.env.VUE_APP_WEBSITE_AUTHOR_GITHUB,
      csdnUrl: process.env.VUE_APP_WEBSITE_AUTHOR_CSDN,
      juejinUrl: process.env.VUE_APP_WEBSITE_AUTHOR_JUEJIN,
    },
    privacyData: {
      icp: "",
      copyright: "",
      ps: "",
    },
    codespaceData: {
      demo1: {
        url: "",
        date: "",
        thumbnail: "",
        summary: "",
      },
    },
  },
  actions: {
    setPrivacyData({ commit }, data) {
      commit("setPrivacyData", data);
    },
    setCodeSpaceData({ commit }, data) {
      commit("setCodeSpaceData", data);
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

    setCodeSpaceData(state, data) {
      if (data) {
        if (typeof data == "object") state.codespaceData = data;
      }
    },
  },
};

export default createStore({
  modules: { websiteAbout, blogsAbout },
});

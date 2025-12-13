<template>
  <div class="footer">
    <div class="footer-box">
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

const store = useStore();

const icpNum = store.state.websiteAbout.privacyData.icp;
const psNum = store.state.websiteAbout.privacyData.ps;
const copyrightText = store.state.websiteAbout.privacyData.copyright;
</script>

<style scoped>
.footer {
  background: #f2f3f5;
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

.privacy-text {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

.copyright-text,
.ps-text,
.icp-text {
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
</style>

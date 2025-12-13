<template>
  <div id="back-to-top" :class="buttonClass" @click="scrollToTop">
    <svg viewBox="0 0 24 24">
      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  cls: {
    type: String,
    default: "",
    required: false,
  },
});

const buttonClass = ref("hidden");
const scrollElem = ref(null);

const scrollToTop = () => {
  if (scrollElem.value) {
    scrollElem.value.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const scrollHandle = () => {
  if (scrollElem.value?.scrollTop && scrollElem.value.scrollTop > 300) {
    buttonClass.value = "";
  } else {
    buttonClass.value = "hidden";
  }
};

onMounted(() => {
  if (!props.cls) return;
  const el = document.querySelector(`.${props.cls}`);
  if (el) {
    scrollElem.value = el;
    scrollElem.value.addEventListener("scroll", scrollHandle);
  }
});

onUnmounted(() => {
  if (scrollElem.value) {
    scrollElem.value.removeEventListener("scroll", scrollHandle);
    scrollElem.value = null;
  }
});
</script>

<style scoped>
#back-to-top {
  position: sticky;
  bottom: 100px;
  left: calc(100vw - 85px);
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.15);
  color: var(--theme-color);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  opacity: 1;
  outline: none;
  right: 20px;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  transition: bottom 0.2s, opacity 0.2s, background-color 0.2s;
  user-select: none;
  width: 50px;
  z-index: 9999;
}

#back-to-top:hover {
  background-color: var(--theme-color);
  color: white;
  transition: all 0.2s ease;
}

#back-to-top svg {
  display: block;
  fill: currentColor;
  height: 21px;
  margin: 0px 0px;
  width: 21px;
}

#back-to-top.hidden {
  bottom: -50px;
  opacity: 0;
}
</style>

<template>
  <div class="header-cover">
    <slot></slot>
  </div>
</template>

<script setup></script>

<style scoped>
.header-cover {
  position: relative;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 150px;
  width: 100%;
  animation: fadeUpInCover 1s;
}

.header-cover::before {
  width: 100%;
  height: 150px;
  background-color: rgb(75 137 244 / 70%);
  content: "";
  position: absolute;
}

.side-content {
  width: 26%;
  margin-right: 20px;
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
</style>

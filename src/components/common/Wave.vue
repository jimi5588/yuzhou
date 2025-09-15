<template>
    <div class="wave-container">
        <svg class="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 120" preserveAspectRatio="none" shape-rendering="auto">
            <defs>
                <path id="wave" d="M-160 108c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g class="parallax">
                <use xlink:href="#wave" x="48" y="0" fill="rgba(0,0,0,0.3)" />
                <use xlink:href="#wave" x="48" y="3" fill="rgba(40,40,40,0.3)" />
                <use xlink:href="#wave" x="48" y="5" fill="rgba(80,80,80,0.3)" />
                <use xlink:href="#wave" x="48" y="7" fill="rgba(120,120,120,0.3)" />
            </g>
      </svg>
  </div>
</template>

<style lang="scss" scoped>

.wave-container {
    position: relative;
    max-width: 450px;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
}

.waves {
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
  left: 0;
}

.parallax > use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}

.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}

.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}

.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}

</style>
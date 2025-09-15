<template>
  <div>
    <van-tabbar v-model="active" @change="onChange" safe-area-inset-bottom>
      <van-tabbar-item>
        <span>{{ $t('common_home') }}</span>
        <template #icon="props">
          <img
            :class="{ 'bounce-active': props.active }"
            v-if="props.active"
            src="../../assets/images/nav-1-active.svg"
          />
          <img v-else src="../../assets/images/nav-1.svg" />
        </template>
      </van-tabbar-item>

      <van-tabbar-item>
        <span>{{ $t('common_market') }}</span>
        <template #icon="props">
          <img
            :class="{ 'bounce-active': props.active }"
            v-if="props.active"
            src="../../assets/images/nav-2-active.svg"
          />
          <img v-else src="../../assets/images/nav-2.svg" />
        </template>
      </van-tabbar-item>

      <van-tabbar-item>
        <span>{{ $t('common_trade') }}</span>
        <template #icon="props">
          <img
            :class="{ 'bounce-active': props.active }"
            src="../../assets/images/nav-3.svg"
          />
        </template>
      </van-tabbar-item>

      <van-tabbar-item>
        <span>{{ $t('order') }}</span>
        <template #icon="props">
          <img
            :class="{ 'bounce-active': props.active }"
            v-if="props.active"
            src="../../assets/images/nav-4-active.svg"
          />
          <img v-else src="../../assets/images/nav-4.svg" />
        </template>
      </van-tabbar-item>

      <van-tabbar-item>
        <span>{{ $t('assets') }}</span>
        <template #icon="props">
          <img
            :class="{ 'bounce-active': props.active }"
            v-if="props.active"
            src="../../assets/images/nav-5-active.svg"
          />
          <img v-else src="../../assets/images/nav-5.svg" />
        </template>
      </van-tabbar-item>
    </van-tabbar>

    <!-- 防遮挡 spacer -->
    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  tabIndex: {
    type: Number,
    default: 0
  }
});

const active = ref(props.tabIndex);
const subPages = ref([
  '',
  'pages/home/market',
  'pages/trade',
  'pages/home/order',
  'pages/home/assets'
]);

const onChange = (index) => {
  router.push(`/${subPages.value[index]}`);
};

watch(() => route.path, (newPath) => {
  if (newPath === '/pages/home/market') {
    active.value = 1;
  } else if (newPath === '/pages/trade') {
    active.value = 2;
  } else if (newPath === '/pages/home/order') {
    active.value = 3;
  } else if (newPath === '/pages/home/assets') {
    active.value = 4;
  } else {
    active.value = 0;
  }
});

onMounted(() => {
  const root = document.querySelector('.bottom-spacer');
  if (root) {
    root.style.height = `${60 + getSafeAreaBottom()}px`;
  }
});

function getSafeAreaBottom() {
  const inset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat'), 10);
  return isNaN(inset) ? 0 : inset;
}
</script>

<style scoped>
.van-tabbar {
  max-width: 450px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 -10px 10px -10px rgba(27, 47, 84, 0.125490);
  backdrop-filter: blur(10px);
  padding-bottom: env(safe-area-inset-bottom);
  padding-bottom: constant(safe-area-inset-bottom); /* 兼容老 WebKit */
  --van-tabbar-height: 60px;
  --van-tabbar-item-active-color: var(--color-theme);
  --van-tabbar-item-icon-margin-bottom: 2px;
}

:deep(.van-tabbar-item__icon img) {
  height: 30px;
}

/* 弹跳动画：3次弹跳 */
@keyframes bounce3 {
  0%, 100% { transform: translateY(0); }
  10%  { transform: translateY(-10px); }
  20%  { transform: translateY(0); }
  30%  { transform: translateY(-8px); }
  40%  { transform: translateY(0); }
  50%  { transform: translateY(-6px); }
  60%  { transform: translateY(0); }
  100% { transform: translateY(0); }
}

.bounce-active {
  animation: bounce3 0.9s ease;
}

:deep(.van-tabbar-item__text span) {
  font-size: 14px;
}

.bottom-spacer {
  height: 60px;
}
</style>

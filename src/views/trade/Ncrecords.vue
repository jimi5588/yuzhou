<template>
    <TopBar :title="$t('shengou_my')" />
    <van-tabs
      v-model:active="activeTab"
      :ellipsis="false"
      type="card"
      @click-tab="onTabClick"
    >
      <van-tab :title="t('shengou_myslef')" />
      <van-tab :title="t('shengou_new')" />
      <van-tab :title="t('shengou_out')" />
    </van-tabs>
  
    <div class="list">
      <van-empty
        v-if="!loading"
        style="margin-top: 60px;"
      >
        {{ $t('common_empty_data') }}
        <template #image>
          <img src="../../assets/images/empty.d67f5618.svg" />
        </template>
      </van-empty>
    </div>
  
    <FloatBubble />
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useStore } from "vuex";
  
  const { t } = useI18n();
  const store = useStore();
  
  const activeTab = ref(0);
  const loading = ref(false);
  
  const onTabClick = ({ name }) => {
    console.log("点击了 tab:", name);
    // 不做任何数据处理，永远显示暂无数据
  };
  </script>
  

<style lang="scss" scoped>

.van-tabs {
    margin: 10px;
    --van-tabs-card-height: 36px;
    --van-padding-md: 0;
    --van-border-width: 0;
    --van-tabs-nav-background: transparent;

    :deep(.van-tabs__wrap) {
        height: auto;
        background: #ECEFF4;
        border-radius: 5px;
    }

    :deep(.van-tabs__nav--card) {
        margin: 3px;
    }

    :deep(.van-tab--card) {
        color: #808080;
    }

    :deep(.van-tab--card.van-tab--active) {
        background-color: #fff;
        color: #000;
        border-radius: 5px;
    }
}

.list {
    padding: 0 12px;
}

.van-theme-dark .van-tabs {
    :deep(.van-tabs__wrap) {
        background: #1F2229;
    }

    :deep(.van-tab--card) {
        color: #fff;
    }

    :deep(.van-tab--card.van-tab--active) {
        color: #000;
    }
}

</style>
<template>
  <div>
    <!-- 列表 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      :immediate-check="false"
      finished-text=""
      :loading-text="t('common_loading')"
      @load="onLoad"
    >
      <slot :list="list"></slot>
    </van-list>

    <!-- 空数据 -->
    <van-empty v-if="!loading && list.length === 0" style="margin-top: 60px;">
      {{ t('common_empty_data') }}
      <template #image>
        <img src="../../assets/images/empty.d67f5618.svg"/>
      </template>
    </van-empty>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const loading = ref(false);
const finished = ref(false);
const pageIndex = ref(1);
const pageSize = ref(10);
const list = ref([]);
const total = ref(0);

const props = defineProps({
  listRefresh: { type: Boolean, default: false },
  enableLoadMore: { type: Boolean, default: true }
});

const emit = defineEmits(['load-data']);

// 监听外部刷新标识
watch(() => props.listRefresh, (val) => {
  if (val) onRefresh();
});

// 上拉加载
const onLoad = () => {
  loading.value = true;
  const params = { page: pageIndex.value, limit: pageSize.value };

  emit('load-data', params, (res) => {
    loading.value = false;

    // 下拉刷新清空列表
    if (pageIndex.value === 1) list.value = [];

    // 合并数据
    list.value.push(...(res.list || []));
    total.value = res.total || 0;

    // 判断是否加载完成
    finished.value = !props.enableLoadMore || list.value.length >= total.value;

    pageIndex.value += 1;
  }, (err) => {
    loading.value = false;
    finished.value = true;
    console.error(err);
  });
};

// 下拉刷新
const onRefresh = () => {
  pageIndex.value = 1;
  finished.value = false;
  list.value = [];
  onLoad();
};

// 初始化加载
onRefresh();
</script>

<style scoped lang="scss">
.van-empty {
  :deep(.van-empty__image) {
    width: 192px !important;
    height: 144px !important;
  }
}
</style>

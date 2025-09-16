<template>
    <TopBar :title="vipInfo.title"></TopBar>
    <div class="content" v-html="vipInfo.content"></div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { articl } from '@/api';
  
  const { t } = useI18n();
  const vipInfo = ref({
    title: '',
    content: ''
  });
  
  onMounted(() => {
    showLoadingToast(t('common_loading'));
    const id = 1;
    articl(id)
      .then((res) => {
        closeToast();
        vipInfo.value = res.result.data;
      })
      .catch((err) => {
        showFailToast(err.message);
      });
  });
  </script>
  
  <style lang="scss" scoped>
  .content {
    padding: 16px;
    p.desc {
      margin-bottom: 20px;
    }
  }
  </style>
  
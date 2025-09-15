<template>
    <TopBar :title="t('checkout_counter')" />
  
    <div class="channel-list">
      <div class="item" v-for="item in channelList" :key="item.id" @click="toRecharge(item)">
        <div class="item-left">
          <img :src="item.icon" alt="icon" />
          <span>{{ t(item.name) }}</span>
        </div>
      </div>
    </div>
  
    <FloatBubble />
  </template>
  
  <script setup>
  import TopBar from '../../components/common/TopBar.vue';
  import FloatBubble from '../../components/common/FloatBubble.vue';
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n';
  
  const { t } = useI18n()
  const router = useRouter()
  
  const channelList = ref([
    { id: 1, icon: new URL('@/assets/images/bank.png', import.meta.url).href, name: 'wallet_bank_tab' },
    { id: 2, icon: new URL('@/assets/images/cbi.png', import.meta.url).href, name: 'currency_crypto' }
  ])
  
  const toRecharge = (item) => {
    // 根据 id 决定 type
    let type = 1
    if (item.id === 2) type = 2
  
    router.push({
      path: '/pages/recharge/select',
      query: { type }
    })
  }
  </script>
  
  
  <style lang="scss" scoped>
  .channel-list {
    display: flex;
    flex-direction: column;
    gap: 15px; /* 行间距 */
    padding: 0 15px; /* 左右边距 */
    margin-top: 30px;
  }
  
  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    border-radius: 8px;
    padding: 10px 15px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    cursor: pointer;
    transition: all 0.2s;
  
    &:hover {
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
  
    .item-left {
      display: flex;
      align-items: center;
      gap: 10px;
  
      img {
        width: 30px;
        height: 30px;
        object-fit: contain;
      }
  
      span {
        font-size: 16px;
        color: #333;
      }
    }
  
    .van-button {
      --van-button-mini-padding: 3px 12px;
      font-size: 14px;
    }
  }
  </style>
  
<template>
  <div class="depth-chart">
    <!-- 深度图表格 -->
    <div class="depth-table">
      <div class="table-header">
        <span>{{ t('common_price') }}</span>
        <span>{{ t('common_number') }}</span>
      </div>

      <!-- 卖单区域 -->
      <div class="sell-orders">
        <div v-for="(item, index) in sellOrders" :key="index" class="order-row">
          <div class="bg-bar" :style="{ width: item.percent + '%' }"></div>
          <div class="price red">{{ item.price }}</div>
          <div class="amount">{{ item.volume }}</div>
        </div>
      </div>

      <!-- 当前价格 -->
      <div class="current-price">
        <span>{{ currency?.price }}</span>
      </div>

      <!-- 买单区域 -->
      <div class="buy-orders">
        <div v-for="(item, index) in buyOrders" :key="index" class="order-row">
          <div class="bg-bar" :style="{ width: item.percent + '%' }"></div>
          <div class="price green">{{ item.price }}</div>
          <div class="amount">{{ item.volume }}</div>
        </div>
      </div>
    </div>

    <!-- 底部按钮组 -->
    <div class="action-buttons">
      <img src="../../assets/images/pan1.svg">
      <img src="../../assets/images/pan2.svg">
      <img src="../../assets/images/pan3.svg">
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useKlineSocket } from '@/service/KlineSocket'

const { t } = useI18n()
const store = useStore()
const currency = computed(() => store.state.currencyMap[store.state.currencySymbol])

const { depthData } = useKlineSocket()

watch(depthData, (newVal) => {
  const asksTotalVolume = newVal.asks.reduce((sum, item) => sum + Number(item.volume), 0);
  const bidsTotalVolume = newVal.bids.reduce((sum, item) => sum + Number(item.volume), 0);
  sellOrders.value = newVal.asks.map((item) => ({
    ...item,
    percent: (Number(item.volume) / asksTotalVolume) * 100,
  }));
  buyOrders.value = newVal.bids.map((item) => ({
    ...item,
    percent: (Number(item.volume) / bidsTotalVolume) * 100,
  }));
})

const sellOrders = ref([])
const buyOrders = ref([])

</script>

<style lang="scss" scoped>
* {
  font-size: 12px;
}

.depth-chart {
  padding-left: 10px;

  .depth-table {
    .table-header {
      display: flex;
      justify-content: space-between;
      color: var(--text-color);
      font-size: 14px;
      margin-bottom: 5px;
    }

    .order-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      position: relative;

      .bg-bar {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        background-color: rgba(255, 95, 95, 0.2);
        z-index: 1;
        transition: width 0.3s ease;     
      }

      .price,
      .amount {
        position: relative;
        z-index: 2;
      }

      .red {
        color: #ff5f5f;
      }

      .green {
        color: #4cd964;
      }
    }

    .buy-orders .bg-bar {
          background-color: rgba(76, 217, 100, 0.2);
          // left: 0;
      }

    .current-price {
      padding: 8px 0 0;

      span {
        font-size: 18px;
        font-weight: bold;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    margin-top: 5px;

    img {
      width: 16px;
      height: 16px;
      padding: 2px;
      border: 1px solid #ccc;
      border-radius: 3px;
      cursor: pointer;
    }
  }
}
</style>
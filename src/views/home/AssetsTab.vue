<template>
  <div class="assets-page">
    <!-- 资产卡片 -->
    <div class="assets-card">
      <div class="assets-header">
        <span>{{ t('assets_convert_total') }}</span>
        <van-icon :name="showAssets ? 'eye-o' : 'closed-eye'" color="#fff" size="20px" @click="showAssets = !showAssets"/>
      </div>

      <div class="total-amount">
        <span class="amount">
          {{ showAssets ? displayBalance : '******' }}
        </span>

        <!-- 币种选择 -->
        <van-dropdown-menu active-color="#1989fa" direction="down">
          <van-dropdown-item v-model="selectedCurrency" :options="currencyOptions" @change="onCurrencyChange"/>
        </van-dropdown-menu>
      </div>

      <div class="converted-amount">
        ≈ {{ showAssets ? user?.balance : '******' }} USD
      </div>

      <div class="profit-section">
        <div class="profit-item">
          <div class="profit-label">{{ t('assets_current_profit') }}</div>
          <div class="profit-value">{{ showAssets ? (user?.todayprofit || 0).toFixed(2) : '******' }}</div>
        </div>
        <div class="profit-item">
          <div class="profit-label">{{ t('assets_profit_ratio') }}</div>
          <div class="profit-value">{{ showAssets ? ((user?.allprofit || 0) * 100).toFixed(2) + '%' : '******' }}</div>
        </div>
        <div class="profit-item">
          <div class="profit-label">{{ t('trade_margin') }}</div>
          <div class="profit-value">{{ showAssets ? (user?.frozen || 0).toFixed(2) : '******' }}</div>
        </div>
      </div>
    </div>

    <van-grid :column-num="4" :border="false" class="action-grid">
      <van-grid-item @click="toPage('wallet/financialrecords')">
        <template #icon>
          <Icon name="exchange" size="26px" color="var(--text-color)"/>
        </template>
        <template #text>
          <span class="grid-text">{{ t('assets_account_record') }}</span>
        </template>
      </van-grid-item>

      <van-grid-item @click="toPage('recharge/counter')">
        <template #icon>
          <Icon name="withdraw1" size="26px" color="var(--text-color)" style="transform: rotate(180deg);"/>
        </template>
        <template #text>
          <span class="grid-text">{{ t('assets_recharge_receive') }}</span>
        </template>
      </van-grid-item>

      <van-grid-item @click="toPage('withdraw')">
        <template #icon>
          <Icon name="withdraw1" size="26px" color="var(--text-color)"/>
        </template>
        <template #text>
          <span class="grid-text">{{ t('assets_withdraw_transfer') }}</span>
        </template>
      </van-grid-item>

      <van-grid-item @click="toPage('wallet/record')">
        <template #icon>
          <Icon name="exchange" size="26px" color="var(--text-color)"/>
        </template>
        <template #text>
          <span class="grid-text">{{ t('assets_record') }}</span>
        </template>
      </van-grid-item>
    </van-grid>

    <!-- 持有仓位 --> 
     <div class="trade-detail">
        <span class="trade-title">{{ t('today_revenue') }}({{count}})</span>
        <List :listRefresh="listRefresh" @load-data="loadData" v-slot:default="slotProps">
          <!-- 列表渲染 -->
          <div class="order-item" v-for="item in list" :key="item.id">
            <div class="order-header">
              <div class="left">
                <span class="buy-tag" :class="item.trade_type == 1 ? 'buy' : 'sell'">
                  {{ item.trade_type == 1 ? t('common_buy') : t('common_sell') }}
                </span>
                <span class="lot-size">{{ item.symbol }}</span>
                <span class="lot-size">x{{ Number(item.order_quantity) + t('trade_lots') }}</span>
              </div>
              <div class="right">
                <span class="price" :class="item.tempProfitPrice < 0 ? 'down' : 'up'">
                  {{ $t('yuji_profit') }}：{{ item.tempProfitPrice }}
                </span>
              </div>
            </div>
            <div class="item-row">
              <div class="item">
                <span class="item-title">{{ t('trade_opening_price') }}</span>
                <span class="item-value">{{ item.open_price }}</span>
              </div>
              <div class="item">
                <span class="item-title">{{ t('trade_current_price') }}</span>
                <span class="item-value">{{ item.current_price }}</span>
              </div>
            </div>
            <div class="item-row">
              <div class="item">
                <span class="item-title">{{ t('trade_margin') }}</span>
                <span class="item-value">{{ item.margin }}</span>
              </div>
              <div class="item">
                <span class="item-title">{{ t('trade_position_opening_time') }}</span>
                <span class="item-value">{{ item.order_time }}</span>
              </div>
            </div>
          </div>
        </List>

    </div>
    
  </div>
  <FloatBubble ></FloatBubble>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getUserInfo, exchangecurrency , getAllContractOrderList} from '@/api'

const { t } = useI18n()
const store = useStore()
const router = useRouter()

const user = computed(() => store.state.user)
const showAssets = ref(true)

const selectedCurrency = ref('USDT')   // 默认USDT
const currencyOptions = ref([])
const currencyRates = ref({})          // 保存 rate 映射
const listRefresh = ref(false)
const list = ref([])
const count = ref(0)


// 余额换算逻辑
const displayBalance = computed(() => {
  const base = Number(user.value?.balance ?? 0)
  if (!showAssets.value) return '******'
  if (selectedCurrency.value === 'USDT') {
    return base.toFixed(2)
  }
  const rate = currencyRates.value[selectedCurrency.value] || 1
  return (base * rate).toFixed(2)
})

const displayBalanceUSD = computed(() => {
  const base = Number(user.value?.balance ?? 0)
  if (!showAssets.value) return '******'
  // 先换算成目标币种，再折合USD（假设 rate 就是 USDT->币种 的汇率）
  const rate = currencyRates.value[selectedCurrency.value] || 1
  return (base * rate).toFixed(2)
})

getUserInfo().then(res => {
  store.commit('updateUser', res.result)
})

exchangecurrency().then(res => {
  // 转换成 van-dropdown 支持的 options
  currencyOptions.value = [
    { text: 'USDT', value: 'USDT' },  // 默认加一个 USDT
    ...res.data.map(item => ({
      text: item.cryptoprotocol,
      value: item.cryptoprotocol
    }))
  ]

  // 保存 rate 映射
  res.data.forEach(item => {
    currencyRates.value[item.cryptoprotocol] = Number(item.rate)
  })

  // 默认选择第一个非 USDT
  if (res.data.length > 0) {
    selectedCurrency.value = res.data[0].cryptoprotocol
  }
})

const onCurrencyChange = (val) => {
  selectedCurrency.value = val
}

const toPage = (path) => {
    router.push("/pages/" + path);
}

const loadData = (params, successCallback, errCallback) => {
    listRefresh.value = false
    showLoadingToast(t('common_loading'))
    params.status = 6
    getAllContractOrderList(params).then(res => {
        const data = res.result.data.map(item => {
            const currentPrice = Number(item.current_price) || 0
            const openPrice = Number(item.open_price) || 0
            const quantity = Number(item.order_quantity) || 0
            const everage = Number(item.everage) || 1  // 避免除0
            item.tempProfitPrice = ((currentPrice - openPrice) * quantity / everage).toFixed(2)
            return item
        })
        successCallback(res.result.data)
        count.value = res.result.count
        if (params.page === 1) {
            list.value = res.result.data
        } else {
            list.value.push(...res.result.data)
        }
    }).catch(err => {
        errCallback(err)
    })
}
</script>



<style lang="scss" scoped>
.assets-page {
  padding: 16px;
}

.assets-card {
  background-image: url('../../assets/images/zc-bg.png');
  background-size: 100% 100%;
  border-radius: 10px;
  color: white;
}

.assets-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 0 0 15px;
}

.total-amount {
  margin: 15px 0 0 15px;
}

.amount {
  font-size: 20px;
  font-weight: bold;
}

.currency {
  font-size: 14px;
  margin-left: 8px;
}

.converted-amount {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0 0 15px 15px;
}

.profit-section {
  display: flex;
  gap: 20px;
  padding: 15px;
  background-color: hsla(0, 0%, 100%, .1);
}

.profit-item {
  /* flex: 1; */
}

.profit-label {
  max-width: 120px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
}

.profit-value {
  font-size: 16px;
  font-weight: 500;
}

.action-grid {
  margin: 20px 0;
  border-radius: 8px;
  flex-wrap: nowrap;
  --van-grid-item-content-background: transparent;

  :deep(.van-grid-item__content--center) {
    justify-content: start;
  }

  img {
    width: 24px;
    height: 24px;
  }
}

.grid-text {
  font-size: 11px;
  color: var(--text-color);
  display: block;
  text-align: center;
  line-height: 1.2;
  margin-top: 4px;
}


.van-tabs {
  margin-bottom: 12px;
  background: #ECEFF4;
  border-radius: 5px;
  --van-tabs-card-height: 32px;
  --van-padding-md: 0;
  --van-border-width: 0;
  --van-tabs-nav-background: transparent;

  :deep(.van-tabs__wrap) {
    height: auto;
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

.total-amount {
  margin: 15px 0 0 15px;
  display: flex;
  align-items: center;
  gap: 8px;

  .van-dropdown-menu {
    --van-dropdown-menu-background: transparent;
    --van-dropdown-menu-box-shadow: none;
    --van-dropdown-menu-title-text-color: #fff;
    --van-dropdown-menu-title-font-size: 14px;
  }

  :deep(.van-dropdown-item--down) {
      width: 400px;               // 下拉箭头按钮宽度固定
      margin: 0 auto;             // 居中
    }
}

.trade-detail {
  margin-top: 20px;
}

.trade-detail span {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-color);
  margin-bottom: 8px;
  display: block;
}

.order-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-header .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.buy-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.buy-tag:nth-child(1) {
  background-color: #1989fa; /* 买 */
}

.buy-tag:nth-child(2) {
  background-color: #fa5151; /* 卖 */
}

.lot-size {
  font-weight: 500;
  font-size: 14px;
}

.order-header .right .price {
  font-weight: bold;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
}

.price.up {
  background-color: #2ecc71; /* 盈利绿色 */
}

.price.down {
  background-color: #e74c3c; /* 亏损红色 */
}

.item-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.item {
  display: flex;
  flex-direction: column;
  margin-bottom: 4px;
  min-width: 45%;
}

.item-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}

.item-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  word-break: break-word;
}
.trade-title {
  display: block;
  height: 20px;              /* 提高高度，更明显 */
  line-height: 20px;         /* 文字垂直居中 */
  font-size: 14px;           /* 字号 */
  font-weight: 500;          /* 字重 */
  color: var(--text-color);  /* 主题文字色 */
  margin-bottom: 8px;        /* 下方间距 */
  border-left: 3px solid #1989fa; /* 左边彩色条，强调标题 */
  padding-left: 8px;         /* 左边内边距 */
}
</style>

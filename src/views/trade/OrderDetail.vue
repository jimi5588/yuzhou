<template>
    <div class="order-detail">
        <!-- 顶部导航栏 -->
        <TopBar :title="t('trade_order_detail')"  />

        <!-- 订单信息卡片 -->
        <van-cell-group inset class="order-card">
            <div class="product-header">
                <div class="label">{{ t('trade_product') }}:</div>
                <div class="coin-info">
                    <van-image :src="order.coinIcon || ''" width="40" height="40" />
                    <div class="coin-text">
                        <span class="coin-name">{{ order.productName }}</span>
                        <span class="coin-full">{{ order.coinFull }}</span>
                    </div>
                </div>
            </div>

            <div class="path-row">
                <span class="label">{{ t('trade_direction') }}:</span>
                <span class="value" :class="{ 'call': order.rise, 'put': !order.rise }">
                    {{ order.rise ? t('trade_buy_more') : t('trade_buy_less') }}
                </span>
            </div>

            <van-cell :title="t('trade_open_price')+':'" :value="order.openPrice" />
            <van-cell :title="t('trade_close_price')+':'" :value="order.closePositionPrice" />
            <van-cell :title="t('common_time')+':'" :value="order.duration" />

            <div class="status-row">
                <span class="label">{{ t('trade_status') }}:</span>
                <span class="value" v-if="order.status == 0">{{ t('trade_waiting') }}</span>
                <span class="value win" v-if="order.status == 1">{{ t('trade_profit') }}</span>
                <span class="value loss" v-if="order.status == 2">{{ t('trade_loss') }}</span>
            </div>

            <van-cell :title="t('trade_position')" :value="symbol + order.amount" />
            <van-cell :title="t('trade_settlement')" :value="symbol + order.profitAmount" />
            <van-cell :title="t('common_time')" :value="order.gmtCreate" />
        </van-cell-group>
    </div>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const store = useStore()
const route = useRoute()
const router = useRouter()

const symbol = ref(store.state.symbol)
const order = ref({})

onBeforeMount(() => {
    if(route.query){
        order.value = JSON.parse(decodeURIComponent(route.query.order))
    }
})


</script>

<style lang="scss" scoped>
.order-detail {
    min-height: 100vh;
    padding-bottom: 20px;
}

.order-card {
    margin-top: 16px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.product-header {
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.coin-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.coin-text {
    display: flex;
    flex-direction: column;
}

.coin-name {
    font-size: 18px;
    font-weight: bold;
}

.coin-full {
    font-size: 14px;
    color: #999;
}

.path-row,
.status-row {
    padding: 14px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.label {
    color: #646566;
    font-size: 14px;
}

.value {
    color: var(--text-color) !important;
    font-size: 14px;
}

.call {
    color: #4CAF50;
    font-weight: bold;
}

.put {
    color: #F44336;
    font-weight: bold;
}

.loss {
    color: #F44336;
    font-weight: bold;
}

.win {
    color: #4CAF50;
    font-weight: bold;
}

:deep(.van-cell) {
    span {
        color: #646566;
        font-size: 14px;
    }
}

:deep(.van-cell__value span) {
    color: var(--text-color);
}
</style>
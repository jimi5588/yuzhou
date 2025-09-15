<template>
    <div class="page">
        <List :listRefresh="listRefresh" :enableLoadMore="false" @load-data="loadData" v-slot:default="slotProps">
            <div class="trade-records">
                <van-cell-group insert :border="false" v-for="(item, index) in slotProps.list" :key="index"
                @click="showOrderDetail(item)">
                    <van-cell :title="t('trade_trading_pair')" :value="item.product_name"/>
                    <van-cell :class="item.direction === 1 ? 'green' : 'red'" :title="t('trade_direction')" :value="item.direction === 1 ? t('trade_buy_more') : t('trade_buy_less')"/>
                    <van-cell :title="t('trade_purchase_price')" :value="item.close_price"/>
                    <van-cell :title="t('trade_quantity')" :value="item.amount"/>
                    <van-cell :title="t('common_second')" :value="`${item.trade_time} S`" />
                    <van-cell :title="t('trade_order_time')" :value="item.create_time"/>
                    <van-cell :class="item.profitloss > 0 ? 'green' : 'red'" :title="t('trade_profit_and_loss')" :value="item.profitloss"/>
                </van-cell-group>
            </div>
        </List>
    </div>

    <van-dialog v-model:show="showOrderDialog" :show-confirm-button="false" :show-cancel-button="false">
        <div class="dialog-content">
            <div class="dialog-title">
                <span>{{  order.product_name}}</span>
                <van-icon name="cross" size="20" @click="showOrderDialog = false" />
            </div>

            <div class="dialog-price" :class="{ green: profit > 0 }">
                {{ order.profitloss}}
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('common_type') }}</span>
                <span class="value" v-if="order.direction == 1">{{ t('trade_buy_up') }}</span>
                <span class="value" v-else>{{ t('trade_buy_fall') }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('common_number') }}</span>
                <span class="value">{{ order.amount }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_opening_price') }}</span>
                <span class="value">{{ order.open_price }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_actual_deal') }}</span>
                <span class="value">{{ order.close_price }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('common_second') }}</span>
                <span class="value">{{ order.trade_time_sec }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_profit_rate') }}</span>
                <span class="value">{{ order.profitrate }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_estimated_profit_and_loss') }}</span>
                <span class="value" :class="{ green: order.profitloss > 0 }">{{ order.profitloss }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_position_opening_time') }}</span>
                <span class="value">{{ order.create_time }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_close_time') }}</span>
                <span class="value">{{ order.pincang_time }}</span>
            </div>
        </div>
    </van-dialog>
</template>

<script setup>
import TopBar from '@/components/common/TopBar.vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex'
import { getOrderList, getOrderRecord } from '@/api';

const { t } = useI18n()
const store = useStore()

const listRefresh = ref(false)

const showOrderDialog = ref(false)
const order = ref({})

const props = defineProps({
    symbol: {
        type: String,
        default: null
    },
    status: {
        type: Number,
        default: 0
    }
})

const loadData = (params, successCallback, errCallback) => {
    listRefresh.value = false
    let obj = null
    showLoadingToast(t('common_loading'))
    if (props.symbol) {
        obj = getOrderList(props.symbol, props.status, params)
    } else {
        obj = getOrderRecord(params)
    }
    obj.then(res => {
        successCallback(res.result)
    }).catch(err => {
        errCallback(err)
    })
}

const showOrderDetail = (item) => {
    order.value = item
    showOrderDialog.value = true
}

</script>

<style lang="scss" scoped>

.page {

}

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

// :deep(.van-list) {
//     height: calc(100vh - 50px);
//     overflow-y: auto;
// }

.trade-records {
    .van-cell-group {
        margin: 15px 0;
        border-radius: 8px;
        --van-cell-background: transparent;

        :deep(.van-cell__title span) {
            color: #999;
        }

        :deep(.van-cell__value span) {
            color: var(--text-color);
            font-weight: bold;
            font-family: Din, puhui;
        }
        .green :deep(.van-cell__value span) {
            color: #00b578 !important;
        }

        .red :deep(.van-cell__value span){
            color: #ff3141 !important;
        }
    }
}

.dialog-content {
    padding-bottom: 10px;

    .dialog-title {
        height: 48px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #E5E7EB;
        margin-bottom: 16px;

        span {
            flex: 1;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
        }

        .van-icon {
            margin-right: 12px;
            cursor: pointer;
        }
    }

    .dialog-header {
        margin: 16px auto;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        .van-count-down,
        span {
            font-size: 24px;
            font-weight: bold;
            margin-left: 5px;
        }
    }

    .dialog-price {
        text-align: center;
        color: #4CAF50;
        font-size: 24px;
        font-weight: bold;
    }

    .dialog-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0 16px 10px;

        .label {
            color: #666;
        }

        .value {
            font-weight: 500;

            &.green {
                color: #4CAF50;
            }
        }
    }

}

</style>
<template>
    
    <div class="trade-page">
        <TopBar>
            <template #title>
                <van-icon name="bars" size="22px" @click="showCurrencyPopup = true" />
                <span class="title">{{ currency?.name }}</span>
                <span v-if="currency?.status == -1" class="change closed-bg">{{ t('common_closed') }}</span>
                <span v-else class="change" :class="['change', currency?.change >= 0 ? 'up' : 'down']">
                    {{ currency?.change > 0 ? '+' : '-' }}{{ Math.abs(currency?.change).toFixed(2) }}%</span>
            </template>
            <template #right>
                <van-icon :name="currency?.optional ? 'star' : 'star-o'" size="28" @click="onOption" />
            </template>
        </TopBar>
        <van-tabs class="top-tabs" v-model:active="activeTab" type="card">
            <van-tab :title="t('trade_contract')" />
            <van-tab :title="t('trade_options')" />
        </van-tabs>
        <div class="scroll-area" ref="scrollArea">
            <!-- 币种信息 -->
            <div class="coin-info">
                <div class="coin-header" v-if="currency?.status == -1">
                    <div class="coin-left">
                        <h3 class="change">---</h3>
                        <div class="bottom">
                            <span>---</span>
                            <span class="change"></span>
                        </div>
                    </div>
                    <div class="coin-right">
                        <div class="item">
                            <span class="title">{{ t('trade_high_today') }}</span>
                            <span class="value">---</span>
                        </div>
                        <div class="item">
                            <span class="title">{{ t('trade_low_today') }}</span>
                            <span class="value">---</span>
                        </div>
                    </div>
                </div>
                <div class="coin-header" v-else>
                    <div class="coin-left">
                        <h3 :class="['change', currency?.change >= 0 ? 'up' : 'down']">{{ currency?.price }}</h3>
                        <div class="bottom">
                            <!-- <span>{{ currency?.market?.vol?.toFixed(6) }}</span> -->
                            <span>{{ (currency?.price * fiatCurrency?.rate).toFixed(2) +
                                fiatCurrency?.cryptoprotocol
                            }}</span>
                            <span class="change" :class="['change', currency?.change >= 0 ? 'up' : 'down']">
                                {{ currency?.change > 0 ? '+' : '-' }}{{ Math.abs(currency?.change).toFixed(2)
                                }}%</span>
                        </div>
                    </div>
                    <div class="coin-right">
                        <div class="item">
                            <span class="title">{{ t('trade_high_today') }}</span>
                            <span class="value">{{ currency?.market?.high_price }}</span>
                        </div>
                        <div class="item">
                            <span class="title">{{ t('trade_low_today') }}</span>
                            <span class="value">{{ currency?.market?.low_price }}</span>
                        </div>
                    </div>
                </div>

                <div class="time-selector">
                    <span>Time</span>
                    <van-tabs v-model:active="timeActive" line-height="0" @click-tab="onTimeSwitch">
                        <van-tab v-for="period in timePeriods" :key="period" :title="period"></van-tab>
                    </van-tabs>
                </div>

                <!-- 图表区域 -->
                <div class="chart-container" v-if="currencySymbol && chartHeight" :style="'height:'+chartHeight+'px'">
                    <Chart :currencyName="currencySymbol" :period="period" @klineData="onKlineDataChange" />
                </div>
            </div>


            <!-- 市场详情 -->
            <div class="market-details" v-if="false">
                <span class="market-title">{{ t('trade_market_detail') }}</span>
                <van-row :gutter="[15, 15]">
                    <van-col span="12">
                        <div class="market-item">
                            <span class="label">{{ t('trade_open_price') }}</span>
                            <span class="value">{{ currency?.market?.open }}</span>
                        </div>
                    </van-col>
                    <van-col span="12">
                        <div class="market-item">
                            <span class="label">{{ t('trade_vol') }}</span>
                            <span class="value">{{ currency?.market?.vol?.toFixed(6) }}</span>
                        </div>
                    </van-col>
                    <van-col span="12">
                        <div class="market-item">
                            <span class="label">{{ t('trade_high') }}</span>
                            <span class="value">{{ currency?.market?.high }}</span>
                        </div>
                    </van-col>
                    <van-col span="12">
                        <div class="market-item">
                            <span class="label">{{ t('trade_low') }}</span>
                            <span class="value">{{ currency?.market?.low }}</span>
                        </div>
                    </van-col>
                </van-row>
            </div>
        </div>

        <van-popup class="popup-btns" v-model:show="showTradeBtn" position="bottom" :style="{ height: '64px' }"
            :overlay="false">
            <!-- 交易按钮 -->
            <div class="trade-buttons" ref="popupBtnArea">
                <div class="btns">
                    <van-button type="success" block :disabled="currency?.status == -1" @click="toTrade(1)">{{
                        t('trade_buy_more')
                    }}</van-button>
                    <van-button type="danger" block :disabled="currency?.status == -1" @click="toTrade(2)">{{
                        t('trade_buy_less')
                    }}</van-button>
                </div>
                <Icon name="records" size="30px" style="cursor: pointer;" color="#ccc" @click="toRecord"></Icon>
            </div>
        </van-popup>
    </div>
    
    <van-popup class="popup-trade" v-model:show="showPreOrderDialog" position="center">
        <div class="signal-confirm">
            <div class="signal-info">
                <h2>{{ t('trade_order_confirm') }}</h2>
                <div class="info-item">
                    <span class="label">{{ t('trade_trading_pair') }}</span>
                    <span class="value">{{ currency?.name }}</span>
                </div>
                <div class="info-item">
                    <span class="label">{{ t('trade_direction') }}</span>
                    <div class="direction">
                        <img v-if="direction == 1" src="../../assets/images/buy-down.svg" />
                        <img v-else-if="direction == 2" src="../../assets/images/buy-up.svg" />
                        <span class="value up" v-if="direction == 1">{{ t('trade_buy_more') }}</span>
                        <span class="value down" v-else-if="direction == 2">{{ t('trade_buy_less') }}</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="label">{{ t('trade_current_price') }}</span>
                    <span class="value">{{ currency?.price }}</span>
                </div>
            </div>

            <div class="amount-input">
                <span>{{ t('trade_select_expire_time') }}</span>
                <div class="expire-times">
                    <div class="time-item" v-for="(item, index) in timeOptions" :key="index"
                        :class="[direction === 1 ? 'more' : 'less', selectedTime === index ? 'selected' : 'normal']"
                        @click="onSelectTime(index)">
                        <span class="time">{{ item.trade_time }}s</span>
                        <span class="ratio">| {{ item.profit_loss_ratio }}%</span>
                    </div>
                </div>
            </div>

            <div class="amount-input" style="margin-bottom: 10px;}">
                <span>{{ t('trade_quantity') }}</span>
                <van-field v-model="amount" type="digit" class="amount-field" />
            </div>
            <!-- 快捷金额按钮 -->
            <div class="quick-amounts">
            <van-button
                v-for="val in quickAmounts"
                :key="val"
                type="default"
                plain
                class="quick-block"
                @click="setQuickAmount(val)"
            >
                {{ val }} 
            </van-button>
            </div>

            <!-- 交易信息 -->
            <div class="trade-info" v-if="false">
                <div class="info-row">
                    <span class="label">{{ t('wallet_balance') }}:</span>
                    <span class="value">{{ user.balance }}</span>
                </div>
                <div class="info-row">
                    <span class="label">{{ t('trade_signal_rate') }}:</span>
                    <span class="value">{{ user.tradeRatio }}%</span>
                </div>
            </div>
            <div class="trade-info2">
                <p>{{ t('trade_min_purchase_amount') }} {{ timeOptions[selectedTime].min_amount }} USDT</p>
                <div class="info-item" v-if="direction === 1">
                    <img src="../../assets/images/sy.db4977b3.svg">
                    <p>{{ t('trade_estimated_income', { amount: estimatedIncome }) }}</p>
                </div>
                <div class="info-item" v-else-if="direction === 2">
                    <img src="../../assets/images/sy_seller.f8c5ebea.svg">
                    <p style="color: #f04a5a;">{{ t('trade_estimated_income', { amount: estimatedIncome }) }}</p>
                </div>
                <div class="info-item">
                    <img src="../../assets/images/yue.baf7aa33.svg">
                    <p>{{ t('trade_balance') }}{{ (user?.balance || 0) - (user?.frozen || 0) }}USDT</p>
                </div>
            </div>

            <div class="btns">
                <van-button block type="warning" @click="showPreOrderDialog = false">
                    {{ t('common_cancel') }}
                </van-button>
                <van-button block :type="direction === 1 ? 'success' : 'danger'" @click="trandOrder">
                    {{ t('common_ok') }}
                </van-button>
            </div>
        </div>
    </van-popup>
    <van-dialog v-model:show="showOrderDialog" :show-confirm-button="false" :show-cancel-button="false">
        <div class="dialog-content">
            <div class="dialog-header" v-if="countDownTime > 0">
                <van-count-down :time="countDownTime" format="ss" @finish="onCountDownFinish" />
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_trading_pair') }}</span>
                <span class="value">{{ order.symbol }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('common_type') }}</span>
                <span class="value up" v-if="order.direction == 1">{{ t('trade_buy_more') }}</span>
                <span class="value down" v-else>{{ t('trade_buy_less') }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_quantity') }}</span>
                <span class="value">{{ order.amount }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_current_price') }}</span>
                <span class="value">{{ order.open_price }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_estimated_profit_and_loss') }}</span>
                <span class="value" :class="{ green: order.expectedprofit > 0 }">{{ order.expectedprofit }} </span>
            </div>
            <van-button class="exit" block type="primary" @click="onCountDownFinish">{{
                t('trade_continue_trading')
            }}</van-button>
        </div>
    </van-dialog>

    <!-- 订单结果弹窗 -->
    <van-dialog v-model:show="showOrderResultDialog" :show-confirm-button="false" :show-cancel-button="false">
        <div class="dialog-content">
            <div class="dialog-header">
                <div class="result-icon" :class="orderResult?.profit > 0 ? 'profit' : 'loss'">
                    <span v-if="orderResult?.profit > 0">💰</span>
                    <span v-else> {{ orderResult?.profitloss > 0 ? '+' : '-' }}{{ orderResult?.profitloss || 0 }}</span>
                </div>
            </div>
            <div class="dialog-item">
                <span class="label">{{ t('trade_trading_pair') }}</span>
                <span class="value">{{ orderResult.symbol }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('common_type') }}</span>
                <span class="value up" v-if="orderResult.direction == 1">{{ t('trade_buy_more') }}</span>
                <span class="value down" v-else>{{ t('trade_buy_less') }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_opening_price') }}</span>
                <span class="value">{{ orderResult.open_price }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_transaction_price') }}</span>
                <span class="value">{{ orderResult.close_price }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_quantity') }}</span>
                <span class="value">{{ orderResult.amount }}</span>
            </div>


            <div class="dialog-item">
                <span class="label">{{ t('trade_profit_and_loss') }}</span>
                <span class="value" :class="{ green: orderResult?.profit > 0, red: orderResult?.profit < 0 }">
                    {{ orderResult?.profitloss > 0 ? '+' : '-' }}{{ orderResult?.profitloss || 0 }} USDT
                </span>
            </div>
            <div class="dialog-item">
                <span class="label">{{ t('common_second') }}</span>
                <span class="value">{{ orderResult.trade_time }} S</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_order_time') }}</span>
                <span class="value">{{ orderResult.create_time }}</span>
            </div>


            <van-button class="exit" block type="primary" @click="showOrderResultDialog = false">
                {{ t('common_confirm') }}
            </van-button>
        </div>
    </van-dialog>

    <van-popup v-model:show="showCurrencyPopup" position="left" :style="{ width: '320px', height: '100%' }"
        v-if="showCurrencyPopup">
        <Currency :isPopupSelect="true" @closePopup="showCurrencyPopup = false"></Currency>
    </van-popup>

</template>

<script setup>
import { ref, onBeforeMount, onBeforeUnmount, watch, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n';
import { useRect } from '@vant/use';
import { useKlineSocket } from '@/service/KlineSocket';
import { getUserInfo, exchangecurrency, addoptional, getOrderInfo, createOrder,getOrderDetail } from '@/api';
import HScroll from '../../components/common/HScroll.vue';

const { t } = useI18n()
const store = useStore()
const route = useRoute()
const router = useRouter()
const user = computed(() => store.state.user)
const fiatCurrency = computed(() => store.state.fiatCurrency)
const currencySymbol = computed(() => store.state.currencySymbol)
const currency = computed(() => store.state.currencyMap[currencySymbol.value])
const { switchKline } = useKlineSocket()

const showTradeBtn = ref(true)
const container = ref(null);
const activeTab = ref(1)
const showCurrencyPopup = ref(false)
const showPreOrderDialog = ref(false)
const maxAmount = ref(0)
const direction = ref(0)
const amount = ref(0)
const minAmount = ref(0)
const showOrderResultDialog = ref(false)
const orderResult = ref({})
const currentOrder = ref(null)


const timeActive = ref(0)
//const timePeriods = ref([`1${t('time_min')}`, `5${t('time_min')}`, `30${t('time_min')}`, `1${t('time_hour')}`, `1${t('time_day')}`, `1${t('time_week')}`, `1${t('time_mon')}`])
const timePeriods = ref(['1min', '5min','30min','1hour', '1day','1week','1mon'])
const periodParams = ref(['1min', '5min', '30min', '1hour', '1day', '1week', '1mon'])
const period = ref(periodParams.value[timeActive.value])

// 定义快捷金额数组
const quickAmounts = [1000, 5000, 10000, 50000,100000, 200000, 500000, 1000000];
const setQuickAmount = (val) => {
  amount.value = val
}

const timeOptions = ref([])
const selectedTime = ref(0)

const order = ref({})
const showOrderDialog = ref(false)
const countDownTime = ref(0)
const estimatedIncome = computed(() => {
  const amt = parseFloat(amount.value) || 0
  const ratio = timeOptions.value[selectedTime.value]?.profit_loss_ratio || 0
  return ((amt * ratio) / 100).toFixed(2)
})
const scrollArea = ref(null)
const popupBtnArea = ref(null)
const chartHeight = ref(null)

onMounted(() => {
    let scrollAreaRect = useRect(scrollArea.value)
    let popupBtnRect = useRect(popupBtnArea.value)
    chartHeight.value = popupBtnRect.top - scrollAreaRect.top - 120
})

exchangecurrency().then(res => {
    let cryptoprotocol = fiatCurrency.value?.cryptoprotocol
    res.data.map(item => {
        item.text = item.cryptoprotocol
        if (cryptoprotocol && cryptoprotocol == item.cryptoprotocol) {
            store.commit('updateFiatCurrency', item)
        }
    })
    // 默认选择第一个
    if (!cryptoprotocol) {
        store.commit('updateFiatCurrency', res.data[0])
    }
}).catch((err) => { })

getOrderInfo().then(res => {
    timeOptions.value = res.result
    minAmount.value = timeOptions.value[selectedTime.value].min_amount
    countDownTime.value = timeOptions.value[selectedTime.value].trade_time * 1000
}).catch(err => { })

const updateUserInfo = () => {
    getUserInfo().then(res => {
        store.commit('updateUser', res.result)
    }).catch(err => { })
}

onBeforeMount(() => {
    updateUserInfo()
    switchKline(currencySymbol.value, period.value);
})

const onTimeSwitch = () => {
    period.value = periodParams.value[timeActive.value]
}

const toRecord = () => {
    router.push('/pages/trade/traderecords')
}

const onKlineDataChange = (data) => {
    // currency.value.market = data
}

const onSelectTime = (index) => {
    selectedTime.value = index
    minAmount.value = timeOptions.value[selectedTime.value].min_amount
    countDownTime.value = timeOptions.value[selectedTime.value].trade_time * 1000
}

const showOrderDetail = (item) => {
    console.log(item)

    currentOrder.value = item          // 倒计时结束使用

    console.log(currentOrder)
    order.value = item                 // 页面显示用
    countDownTime.value = Number(item.trade_time) * 1000  // 使用后端返回值

    showOrderDialog.value = false
    nextTick(() => {                    // 用 nextTick 替代 setTimeout
        showOrderDialog.value = true
    })
}

const onCountDownFinish = async (orderParam = null) => {
    // 优先使用传入的参数，如果没有则使用 currentOrder.value
    const orderData = orderParam || currentOrder.value
    console.log("开始请求订单详情", orderData)
    showPreOrderDialog.value = false
    showOrderDialog.value = false
    countDownTime.value = 0

    if (!orderData?.order_id) {
        console.warn("倒计时结束但没有订单数据")
        updateUserInfo()
        return
    }

    try {
        showLoadingToast(t('common_loading'))

        // 延时 100ms
        await new Promise(resolve => setTimeout(resolve, 200))

        const res = await getOrderDetail(orderData.order_id)
        closeToast()
        orderResult.value = res.result
        console.log("订单详情请求成功", orderResult.value)

        if (orderResult.value && orderResult.value.status == 1) {
            showOrderResultDialog.value = true
        }

    } catch (err) {
        showFailToast(err.message || '请求失败')
    } finally {
        updateUserInfo()
    }
}


const onOption = () => {
    if (currency.value.optional) {
        // addoptional(currencySymbol.value).then(res => {
        //     store.commit('updateCurrency', currency.value)
        // }).catch(error => {
        //     console.log(error)
        // })
    } else {
        showLoadingToast(t('common_loading'))
        addoptional({
            currency_id: currency.value.id,
        }).then(res => {
            showSuccessToast(t('common_success'))
            let map = store.state.currencyMap
            map[currencySymbol.value].optional = true
            store.commit("updateCurrencyMap", map);
        }).catch(error => {
            showFailToast(error.message)
        })
    }
}

const toTrade = (type) => {
    if (activeTab.value == 0) {
        router.push({
            path: '/pages/trade/contract',
            query: { direction: type }
        })
    } else {
        direction.value = type
        showPreOrderDialog.value = true
        // countDownTime.value = timeOptions.value[selectedTime.value].trade_time * 1000
        // trandOrder()
    }
}

const trandOrder = () => {
    if (!amount.value) {
        showToast(t('toast_input_amount'))
        return
    }
    if (Number(amount.value) < minAmount.value) {
        showToast(t('toast_input_mini_amount_is') + ' ' + minAmount.value)
        return
    }
    // 每次下单都重新设置倒计时时间
    const tradeTime = timeOptions.value[selectedTime.value].trade_time * 1000
    let params = {
        symbol: currencySymbol.value,
        currency: 'USDT',
        amount: amount.value,
        direction: direction.value,
        trade_time: timeOptions.value[selectedTime.value].trade_time
    }
    showLoadingToast(t('common_loading'))
    createOrder(params)
        .then(res => {
            closeToast()                  // 关闭加载提示
            amount.value = ''             // 清空输入金额
            order.value = res.result      // 保存返回的订单信息

            // 确保 trade_time 是数字
            countDownTime.value = Number(res.result.trade_time) || 0

            if (countDownTime.value > 0) {
                // 展示订单详情
                showOrderDetail(res.result)
            } else {
                // 倒计时为0，直接执行完成逻辑
                onCountDownFinish(res.result)
            }
        })
        .catch(err => {
            showFailToast(err.message)
        })
}


</script>

<style lang="scss" scoped>
.trade-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
}

.scroll-area {
    flex: 1;
    overflow-y: auto;
}

:deep(.van-nav-bar) {
    .van-nav-bar__title {
        display: flex;
        flex-direction: row;
        align-items: center;

        .title {
            font-size: 18px;
            margin: 0 5px;
        }

        .change {
            height: 20px;
            line-height: 20px;
            color: #FFF;
            font-size: 10px;
            padding: 0px 4px;
            border-radius: 3px;

            &.up {
                background: #00b897;
            }

            &.down {
                background: #f44336;
            }
        }

        .closed-bg {
            background: #ccc;
            color: #222;
        }
    }

    .van-nav-bar__left .van-icon {
        // color: #fff !important;
    }
}

.van-theme-light .top-tabs,
.van-theme-dark .top-tabs {
    margin: 16px 16px 0;
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

.van-theme-dark .top-tabs {
    :deep(.van-tabs__wrap) {
        background: #1F2229;
    }

    :deep(.van-tab--card) {
        color: #fff;
    }
}

.coin-info {
    display: flex;
    flex-direction: column;
}

.coin-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    padding: 15px;

    .coin-left {
        h3 {
            font-size: 20px;
        }

        span {
            color: #999;
            margin-right: 5px;
        }

        .up {
            color: #00b897;
        }

        .down {
            color: #f44336;
        }
    }

    .coin-right {
        display: flex;
        flex-direction: column;
        align-items: end;

        .title {
            font-size: 14px;
            color: #999;
            margin-right: 10px;
        }

        .value {
            font-size: 14px;
            color: var(--text-color);
        }
    }
}


.period {
    color: #666;
    font-size: 14px;
}

.time-selector {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 10px;

    .van-tabs {
        --van-tabs-nav-background: transparent;
        --van-padding-sm: 5px;
    }
}

.chart-container {

}

.market-details {
    margin-top: 10px;
}

.market-title {
    margin: 0 0 16px 0;
    padding: 0px 10px;
    border-radius: 15px;
    background: #ee0a24;
    color: #fff;
    font-size: 14px;
}

.van-row {
    margin-top: 15px;
}

.market-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    border: 1.5px solid #5f5f5f;
    border-radius: 6px;
}

.popup-btns {
    --van-popup-background: transparent;
}

.trade-buttons {
    gap: 10px;
    padding: 10px 15px;
    display: flex;
    flex-direction: row;
    align-items: center;

    .btns {
        display: flex;
        flex: 1;
        gap: 10px;
    }

    :deep(.van-button) {
        height: 44px;
        font-size: 16px;
    }

    :deep(.van-button--disabled) {
        background: #999;
        border: none;
    }
}

.popup-trade {
    width: calc(100% - 40px);
    --van-popup-background: transparent;
}

.signal-confirm {
    background: #fff;
    border-radius: 15px;
    width: calc(100% - 40px);
    margin: 0 auto;

    .signal-info {
        background-image: url(../../assets/images/ditu.90824f78.png) !important;
        background-size: 100% 100%;
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
        padding: 20px 20px 0;

        h2 {
            text-align: center;
            font-size: 18px;
            color: #000;
            margin-bottom: 10px;
        }

        .info-item {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;

            .label {
                color: #999;
            }

            .value {
                font-size: 15px;
                font-weight: bold;
                color: #333;
                margin-left: 5px;

                &.up {
                    color: #00b897;
                }

                &.down {
                    color: #f44336;
                }
            }

            .direction {
                display: flex;
                flex-direction: row;
                align-items: center;
            }
        }
    }


    .amount-input {
        margin-left: 20px;
        margin-bottom: 20px;

        .expire-times {
            margin: 10px 16px 0 0;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;

            .time-item {
                height: 48px;
                border: 1px solid #4d5563;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;

                span {
                    margin-bottom: 0 !important;
                    font-size: 15px;

                    &.time {
                        margin-right: 5px;
                        color: #000 !important;
                    }

                    &.ratio {
                        color: rgb(0, 0, 0, .5) !important;
                    }
                }

                &.selected {
                    border: none;

                    &.more {
                        background-color: #28ba98;
                        background-image: linear-gradient(120deg, #84fab0, #8fd3f4);
                    }

                    &.less {
                        background-color: #f04a5a;
                        background-image: linear-gradient(270deg, #ff0844 0, #ffb199);
                    }

                    span {
                        &.time {
                            color: #fff !important;
                        }

                        &.ratio {
                            color: #000 !important;
                        }
                    }
                }
            }
        }

        span {
            color: #999;
            margin-bottom: 10px;
        }

        .amount-field {
            width: calc(100% - 20px);
            border: 1px solid #c3c3c3;
            border-radius: 3px;
            padding: 10px 20px;
            margin-top: 10px;
            --van-cell-background: transparent;
            --van-field-input-text-color: #333 !important;

            :deep(span) {
                font-size: 24px;
                font-weight: bold;
            }
        }
    }

    .trade-info {
        display: flex;
        flex-direction: row;
        justify-content: space-around;

        .info-row {
            margin-bottom: 16px;

            .label {
                color: #999;
                margin-right: 10px;
            }

            .value {
                color: var(--color-theme);
                font-weight: 500;
            }
        }
    }

    .trade-info2 {
        margin: 0 20px;
        color: #333;

        .info-item {
            display: flex;
            align-items: center;

            p {
                font-size: 14px;
            }

            img {
                width: 24px;
                height: 24px;
                margin-right: 5px;
            }
        }
    }

    .btns {
        padding: 30px 20px;
        display: flex;
        gap: 10px;

        .van-button:first-child {
            --van-button-border-width: 0;
            background-color: rgba(51, 51, 51, .06);
            background-image: linear-gradient(0deg, #c4c5c7 0, #dcdddf 52%, #ebebeb);
        }

        .van-button--success {
            background-color: #28ba98;
            background-image: linear-gradient(0deg, #0ba360 0, #3cba92);
        }

        .van-button--danger {
            background-color: #f04a5a;
            background-image: linear-gradient(180deg, #f77062 0, #fe5196);
        }
    }

    .action {
        padding: 15px;

        .confirm-btn {
            height: 50px;
            font-size: 18px;
        }
    }
}

.dialog-content {
    background: #fff;
    width: calc(100% - 40px);
    padding: 20px;

    .dialog-header {
        margin: 0px auto 16px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        .van-count-down {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: #005bea;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            font-weight: bold;
            color: #fff;
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
        margin: 0 5px 10px;

        .label {
            color: #666;
        }

        .value {
            font-weight: 500;
            color: #222;

            &.green {
                color: #4CAF50;
            }
        }

        .up {
            color: #00b897;
        }

        .down {
            color: #f44336;
        }
    }

    .exit.van-button--primary {
        margin-top: 12px;
        height: 44px !important;
        background-image: linear-gradient(180deg, #00c6fb 0, #005bea);

        span {
            font-size: 16px;
        }
    }
}

.van-popup--left {
    left: auto !important;

    // :deep(.symbol) {
    //     color: #fff;
    // }
    // :deep(.price) {
    //     color: #fff;
    // }
    // :deep(.isSelect) {
    //     background: #353535 !important;
    // }
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;   /* 自动换行 */
  gap: 10px;         /* 方块间距 */
  //margin-top: 10px;
  padding: 0 20px;          /* 左右留白 */
}

.quick-block {
  flex: 1 0 22%;     /* 每行最多4个方块 */
  min-width: 70px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-block:hover {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}


.dialog-content {
    background: #fff;
    width: calc(100% - 40px);
    padding: 20px;

    .dialog-header {
        margin: 0px auto 16px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        .van-count-down {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: #005bea;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            font-weight: bold;
            color: #fff;
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
        margin: 0 5px 10px;

        .label {
            color: #666;
        }

        .value {
            font-weight: 500;
            color: #222;

            &.green {
                color: #4CAF50;
            }
        }

        .up {
            color: #00b897;
        }

        .down {
            color: #f44336;
        }
    }

    .exit.van-button--primary {
        margin-top: 12px;
        height: 44px !important;
        background-image: linear-gradient(180deg, #00c6fb 0, #005bea);

        span {
            font-size: 16px;
        }
    }

    .result-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        margin: 0 auto 16px;

        &.profit {
            background-color: #07a18c;
            color: #fdfdfd;
        }

        &.loss {
            background-color: #07a18c;
            color: #ffffff;
        }
    }

    .red {
        color: #dc3545 !important;
    }
}

.van-popup--left {
    left: auto !important;

    // :deep(.symbol) {
    //     color: #fff;
    // }
    // :deep(.price) {
    //     color: #fff;
    // }
    // :deep(.isSelect) {
    //     background: #353535 !important;
    // }
}
</style>

<template>
    <div class="trade-page">
        <!-- 买卖切换 -->
        <div class="trade-type">
            <div class="type-tabs">
                <div class="tab-item arrow-right" :class="{ active: tradeType === 'buy' }" @click="tradeType = 'buy'">
                    {{ t('common_buy') }}
                </div>
                <div class="tab-item arrow-left" :class="{ active: tradeType === 'sell' }" @click="tradeType = 'sell'">
                    {{ t('common_sell') }}
                </div>
            </div>
        </div>

        <!-- 交易表单 -->
        <div class="trade-form">
            <van-row gutter="5">
                <van-col span="15">
                    <van-cell :title="priceAction" is-link arrow-direction="down" @click="showPricePopup = true"/>
                </van-col>
                <van-col span="9">
                    <van-cell :title="amount" is-link arrow-direction="down" @click="showAmountPopup = true"/>
                </van-col>
            </van-row>
            <van-tabs v-model:active="priceActive" v-if="false">
                <van-tab :title="t('trade_market_price')"></van-tab>
                <van-tab :title="t('trade_limit_price')"></van-tab>
            </van-tabs>

            <van-field v-model="priceDesc" :type="priceType" :readonly="priceValue == '1'"/>

            <div class="sheet-info">
                1.00 {{ currencySymbol.toUpperCase() }}<br />{{ t('trade_trading_lots') }}
            </div>

            <van-field v-model="number" type="number" right-icon="arrow-down" @click-right-icon="showNumberPopup = true"/>

            <van-row gutter="5" class="py-scale">
                <van-col span="6" :class="numScaleIndex == 1 ? 'scale-select' : 'scale-normal'" @click="scaleSelect(1, 0.25)"><span>25%</span></van-col>
                <van-col span="6" :class="numScaleIndex == 2 ? 'scale-select' : 'scale-normal'" @click="scaleSelect(2, 0.5)"><span>50%</span></van-col>
                <van-col span="6" :class="numScaleIndex == 3 ? 'scale-select' : 'scale-normal'" @click="scaleSelect(3, 0.75)"><span>75%</span></van-col>
                <van-col span="6" :class="numScaleIndex == 4 ? 'scale-select' : 'scale-normal'" @click="scaleSelect(4, 1)"><span>100%</span></van-col>
            </van-row>

            <div class="balance-info">
                <span>{{ t('common_balance') }}: {{ (user?.balance || 0) - (user?.frozen || 0) }}</span>
            </div>

            <van-button block :class="tradeType === 'buy' ? 'trade-btn-buy' : 'trade-btn-sell'" @click="toTrade">
                {{ tradeType === 'buy' ? t('common_buy')+' ('+t('trade_go_long')+')' : t('common_sell')+' ('+t('trade_go_short')+')' }}
            </van-button>
        </div>
    </div>
    <van-action-sheet v-model:show="showPricePopup" :cancel-text="$t('common_cancel')" :actions="priceActions" @select="onSelectPriceAction" />
    <van-action-sheet v-model:show="showAmountPopup" :cancel-text="$t('common_cancel')" :actions="amountActions" @select="onSelectAmountAction" />
    <van-action-sheet v-model:show="showNumberPopup" :cancel-text="$t('common_cancel')" :actions="numberActions" @select="onSelectNumberAction" />

    <van-dialog class="dialog-order" v-model:show="showPreOrderDialog" :confirm-button-text="t('common_confirm')" :cancel-button-text="t('common_cancel')" :show-cancel-button="true" @confirm="createOrder">
        <div class="dialog-content">
            <div class="dialog-title">
                <span>{{ t('common_confirm_order') }}</span>
                <van-icon name="cross" size="20" @click="showPreOrderDialog = false" />
            </div>
            <div class="dialog-item">
                <span class="label">{{ currencySymbol.toUpperCase() }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('common_type') }}</span>
                <span class="value" v-if="tradeType === 'buy'">{{ t('trade_do_long') }}</span>
                <span class="value" v-else>{{ t('trade_do_short') }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_lots') }}</span>
                <span class="value">{{ number }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_multiple') }}</span>
                <span class="value">{{ amount }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_lot_fee') }}</span>
                <span class="value">{{ (getTargetPrice() * transaction_fee * number).toFixed(2) }}</span>
            </div>

            <div class="dialog-item">
                <span class="label">{{ t('trade_margin') }}</span>
                <span class="value">{{ ((getTargetPrice() * number) / amount).toFixed(2) }}</span>
            </div>
        </div>
    </van-dialog>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { getHome, getContractInfo,createContractOrder } from '@/api'

const { t } = useI18n()
const store = useStore()
const emit = defineEmits(['refresh']);

const user = ref(store.state.user)
const currencySymbol = computed(() => store.state.currencySymbol)
const currency = computed(() => store.state.currencyMap[store.state.currencySymbol])
const tradeType = ref('buy')

const priceActive = ref(0)
const priceDesc = ref(t('trade_order_best_price_hint'))
const priceType = ref('text')

const showPricePopup = ref(false)
const priceActions = ref([{ name: t('trade_market_price'), value: '1' },{ name: t('trade_limit_price'), value: '2' }]);
const priceAction = ref(priceActions.value[0].name)
const priceValue = ref(priceActions.value[0].value)

const showAmountPopup = ref(false)
const amountActions = ref([])
const amount = ref('')
const transaction_fee = ref(0)
const numScaleIndex = ref(0)

const showNumberPopup = ref(false)
const numberActions = ref([{name: '1'}, {name: '5'}, {name: '10'}, {name: '50'}, {name: '100'}])
const number = ref(numberActions.value[0].name)

const showPreOrderDialog = ref(false)
const order = ref({

})

const getTargetPrice = () => {
    if (priceValue.value === '1') {
        return currency.value.price
    } else {
        return priceDesc.value
    }
}

getHome().then(res => {
    //默认手续费0.02
    transaction_fee.value = res.result.fee || 0.02
}).catch(err => {})

getContractInfo().then(res => {
    amountActions.value = []
    res.data.multiple.forEach(item => {
        let value = { name: item }
        amountActions.value.push(value)
        amount.value = amountActions.value[0].name
    });
}).catch(err => {})

const onSelectPriceAction = (item) => {
    showPricePopup.value = false
    priceAction.value = item.name
    priceValue.value = item.value
    if(item.name === priceActions.value[0].name){
        priceType.value = 'text'
        priceDesc.value = t('trade_order_best_price_hint')
    }else{
        priceType.value = 'digit'
        priceDesc.value = currency.value.price
    }
}

const scaleSelect = (index, scale) => {
    numScaleIndex.value = index
    number.value = parseInt((user.value.balance / currency.value.price) * scale)
}

const onSelectAmountAction = (item) => {
    showAmountPopup.value = false
    amount.value = item.name
}

const onSelectNumberAction = (item) => {
    showNumberPopup.value = false
    number.value = item.name
}

const toTrade = () => showPreOrderDialog.value = true

const createOrder = () => {
    let params = {
        symbol: currencySymbol.value, 
        tradetype: tradeType.value === 'buy' ? 1 : 2, 
        quantity: number.value, 
        multiple: amount.value, 
        pricetype: priceValue.value, 
        target_price: getTargetPrice()
    }
    showLoadingToast(t('common_loading'))
    createContractOrder(params).then(res => {
        closeToast()
        showSuccessToast(t('common_success'))
        emit('refresh');
    }).catch(err => {
        showFailToast(err.message)
    })
}

</script>

<style lang="scss" scoped>

.trade-page {

    * {
        font-size: 12px;
    }

    .trade-type {

        .type-tabs {
            display: flex;
            border-radius: 5px;
            overflow: hidden;
            // background: #353535;
            position: relative;

            .tab-item {
                flex: 1;
                text-align: center;
                padding: 8px 0;
                cursor: pointer;
                position: relative;
                z-index: 1;

                &.active {
                    color: #fff;
                }

                // 右箭头样式
                &.arrow-right {
                    background: var(--tab-item-bg-normal);
                    clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 90% 100%, 0% 100%);
                    &.active {
                        background: #51BC86;
                    }
                }

                // 左箭头样式  
                &.arrow-left {
                    background: var(--tab-item-bg-normal);
                    clip-path: polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 100%);
                    &.active {
                        background: #F6465D;
                    }
                }
            }
        }
    }

    .trade-form {
        :deep(.van-cell) {
            margin-top: 10px;
            border: 1px solid #CCC;
            border-radius: 4px;
            --van-cell-vertical-padding: 5px;
            --van-cell-horizontal: 8px;
        }

        .sheet-info {
            padding: 10px 0 0;
            color: #666;
        }

        .py-scale {
            margin-top: 10px;

            span {
                height: 24px;
                border: 1px solid #ccc;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
            }

            .scale-select span{
                background: #ccc;
            }
        }

        .balance-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0 0;
        }

        .trade-btn-buy {
            margin-top: 15px;
            background-color: #28ba98;
            background-image: linear-gradient(0deg, #0ba360 0, #3cba92);
            border: none;
            height: 36px;
            font-size: 16px;
            color: white;
        }
        .trade-btn-sell {
            margin-top: 15px;
            background-color: #f04a5a;
            background-image: linear-gradient(180deg, #f77062 0, #fe5196);
            border: none;
            height: 36px;
            font-size: 16px;
            color: white;
        }
    }

    :deep(.van-field__right-icon) {
        color: #666;
    }
}

.dialog-content {
    padding-bottom: 10px;
    background: #fff;
    color: #000;

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
<style lang="scss">
.dialog-order {
    --van-button-default-background: #fff;
    --van-button-default-color: #333;
}

.van-theme-light {
    --tab-item-bg-normal: #FFF;
}

.van-theme-dark {
    --tab-item-bg-normal: #353535;
}

</style>
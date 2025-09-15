<template>

    <div class="trade-page">
        <TopBar>
            <template #title>
                <van-icon name="bars" size="22px" @click="showCurrencyPopup = true" />
                <span class="title">{{ currency?.name }}</span>
            </template>
            <template #right>
                <Icon name="records" size="30px" style="cursor: pointer;" color="#ccc" @click="toOrderList"></Icon>
                <!-- <van-icon :name="currency?.optional ? 'star' : 'star-o'"  size="28" @click="onOption" /> -->
            </template>
        </TopBar>
        <div class="currency-info">
            <div class="info-left">
                <div class="price-top">
                    <span :class="['price', currency?.change >= 0 ? 'up' : 'down']">{{ currency?.price }}</span>
                    <span class="change" :class="['change', currency?.change >= 0 ? 'up' : 'down']">
                        {{ currency?.change > 0 ? '+' : '-' }}{{ Math.abs(currency?.change).toFixed(2) }}%</span>
                </div>
                <span>{{ (currency?.price * fiatCurrency?.rate).toFixed(2) + fiatCurrency?.cryptoprotocol }}</span>
            </div>
            <van-icon :name="currency?.optional ? 'star' : 'star-o'" size="28" color="#F04A5A" @click="onOption" />
        </div>
        <MarginedSwaps />
    </div>
    <van-popup v-model:show="showCurrencyPopup" position="left" :style="{ width: '320px', height: '100%' }"
        v-if="showCurrencyPopup">
        <Currency :isPopupSelect="true" @closePopup="showCurrencyPopup = false"></Currency>
    </van-popup>
</template>
<script setup>
import { ref, onBeforeMount, onBeforeUnmount, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n';
import { useKlineSocket } from '@/service/KlineSocket';

const { t } = useI18n()
const store = useStore()
const route = useRoute()
const router = useRouter()
const fiatCurrency = computed(() => store.state.fiatCurrency)
const currencySymbol = computed(() => store.state.currencySymbol)
const currency = computed(() => store.state.currencyMap[currencySymbol.value])
const { switchKline } = useKlineSocket()

const showCurrencyPopup = ref(false)


const onOption = () => {
    if (currency.value.optional) {
        showLoadingToast(t('common_loading'))
        // addoptional(currencySymbol.value).then(res => {
        //     store.commit('updateCurrency', currency.value)
        // }).catch(error => {
        //     console.log(error)
        // })
    } else {
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

const toOrderList = () => {
    showLoadingToast(t('common_loading'))
    router.push({
        path: '/pages/lever/orderList',
        query: { symbol: currencySymbol.value }
    })
}

const toRecord = () => {
    showLoadingToast(t('common_loading'))
    router.push('/pages/trade/traderecords')
}

</script>

<style lang="scss" scoped>
.trade-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
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
    }

    .van-nav-bar__left .van-icon {
        // color: #fff !important;
    }
}

.currency-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 15px 5px;

    .price-top {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .price {
        font-size: 30px;
        font-weight: bold;

        &.up {
            color: #00b897;
        }

        &.down {
            color: #f44336;
        }
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
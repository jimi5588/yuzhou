<template>
    <div class="trade-container">

        <div class="trade-info">
            <div class="trade-left">
                <MSLeft @refresh="listRefresh = true"></MSLeft>
            </div>

            <div class="trade-right">
                <MSRight></MSRight>
            </div>
        </div>
        <div style="height: 10px;"></div>

        <div class="trade-record">
            <van-cell :title="t('Current_delegate')" v-if="false">
                <template #value>
                    <div class="trade-record-right" @click="toOrderList">
                        <img src="../../assets/images/record1.png" />
                        <span>{{ t('trade_hold_position') }}</span>
                    </div> 
                </template>
            </van-cell>
            <van-row class="record-title">
                <van-col span="3">{{ t('common_type') }}</van-col>
                <van-col span="5">{{ t('common_time') }}</van-col>
                <van-col span="6">{{ t('common_price') }}</van-col>
                <van-col span="6">{{ t('trade_transaction_amount') }}</van-col>
                <van-col span="4">{{ t('common_operation') }}</van-col>
            </van-row>
            <List :listRefresh="listRefresh" @load-data="loadData" v-slot:default="slotProps">
                <van-row class="record-value" v-for="item in slotProps.list">
                    <van-col span="3">{{ t('common_buy') }}</van-col>
                    <van-col span="5">{{ item.order_time }}</van-col>
                    <van-col span="6">{{ item.current_price }}</van-col>
                    <van-col span="6">{{ item.order_quantity }}</van-col>
                    <van-col span="4">
                        <van-button type="warning" @click="cancelOrder(item)">{{ t('trade_close') }}</van-button>
                    </van-col>
                </van-row>

            </List>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex'
import { useRouter } from 'vue-router';
import { getContractOrderList, closeContract } from '@/api';

const { t } = useI18n()
const store = useStore()
const router = useRouter()

const currencySymbol = computed(() => store.state.currencySymbol)

const listRefresh = ref(false)

const toOrderList = () => {
    router.push({
        path: '/pages/lever/orderList',
        query: { symbol: currencySymbol.value }
    })
}

const loadData = (params, successCallback, errCallback) => {
    showLoadingToast(t('common_loading'))
    listRefresh.value = false
    params.symbol = currencySymbol.value
    getContractOrderList(params).then(res => {
        successCallback(res.result.data)
    }).catch(err => {
        errCallback(err)
    })
}

const cancelOrder = (item) => {
    showLoadingToast(t('common_loading'))
    showConfirmDialog({
        message:t('trade_close_sure_message'),
        cancelButtonText: t('common_cancel'),
        confirmButtonText: t('common_confirm')
    })
    .then(() => {
        let params = { id: item.id }
        showLoadingToast(t('common_loading'))
        closeContract(params).then(res => {
            showSuccessToast(t('common_success'))
            listRefresh.value = true
        }).catch(err => {
            showFailToast(err.message)
        })
    })
    .catch(() => {});
};

</script>

<style lang="scss" scoped>
.trade-container {

    .trade-info {
        display: flex;
        flex-direction: row;
        padding: 10px;

        .trade-left {
            flex: 0.6;
        }

        .trade-right {
            flex: 0.4;
        }
    }

    .trade-record {
        :deep(.van-cell__value) {
            flex: none;
            cursor: pointer;
            .trade-record-right {
                display: flex;
                align-items: center;
            }  

            img {
                width: 20px;
                height: 20px;
                margin-right: 2px;
            }
        }

        .record-title,
        .record-value {
            :deep(.van-col) {
                margin-top: 5px;
                font-size: 13px;
                text-align: center;
                display: flex;
                justify-content: center;

                .van-button {
                    width: 85%;
                    background: #FFCE1C;
                    --van-button-default-height: 36px;
                    --van-button-normal-padding: 0 0px;

                    span {
                        font-size: 12px;
                        color: #000;
                    }
                }
            }
        }

        .record-value :deep(.van-col) {
            align-items: center;
        }
    }
}
</style>

<template>
    <TopBar :title="t('wallet_bind_bank_go')"></TopBar>
    <div class="content">
        <van-button type="primary" block @click="toPage('setting/addwallet')">
            <van-icon name="plus" size="16px" />
            {{t('add_wallet_address')}}
        </van-button>
        <List @load-data="loadData" v-slot:default="slotProps" class="list">
            <div v-for="(item, index) in slotProps.list" :key="index" :border="false" class="item">
                <van-cell-group :border="false" v-if="item.type === 1">
                    <van-cell :title="t('account_name')" :value="item.realname" />
                    <van-cell :title="t('bank_name')" :value="item.bankname" />
                    <van-cell :title="t('branch_name')" :value="item.bankzhiname" />
                    <van-cell :title="t('bank_code')" :value="item.ifsc" />
                    <van-cell :title="t('bank_card_number')" :value="item.cardno" />   
                </van-cell-group>
                <van-cell-group :border="false" v-if="item.type === 2">
                    <van-cell :title="t('currency_name')" :value="item.currency" />
                    <van-cell :title="t('channel_name')" :value="item.cryptoprotocol" />
                    <van-cell :title="t('wallet_address')" :value="item.wallet_address" />  
                </van-cell-group>
            </div>
        </List>
    </div>
    <List ></List>
</template>

<script setup>
import TopBar from '../../components/common/TopBar.vue';
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { getBanks, getWallets } from '@/api';

const { t } = useI18n()
const store = useStore()
const router = useRouter()
const symbol = ref(store.state.symbol)
const list = ref([])

const loadData = (params, successCallback, errCallback) => {
    list.value = []
    getBanks().then(res => {
        res.result.forEach(bank => {
            bank.type = 1
            list.value.push(bank)
        })
        getWallets().then(res => {
            res.result.forEach(wallet => {
                wallet.type = 2
                list.value.push(wallet)
            })
            successCallback(list.value)
        }).catch(err => {
            errCallback(err)
        })
        // successCallback(list.value)
    }).catch(err => {
        errCallback(err)
    })
}

const toPage = (path) => {
    router.push("/pages/" + path);
}

</script>

<style lang="scss" scoped>
.content {
    padding: 16px;

    .item {
        margin: 15px 0;
        padding: 0;
        .van-cell-group {
            border-radius: 6px;
            --van-cell-background: transparent;
        }
        
        // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .van-button--primary {
        width: 80%;
        margin: auto;
        border-radius: 30px !important;
        background-image: linear-gradient(180deg, #00c6fb 0, #005bea);
        span {
            font-size: 16px;
        }
    }
}
</style>

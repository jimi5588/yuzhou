<template>
    <TopBar :title="t('wallet_withdrawal')"></TopBar>
    <div class="content">
        <van-tabs v-model:active="activeTab" type="card">
            <van-tab :title="t('bangding')">
                <div class="title">
                    <span>{{ t('wallet_select_currency') }}</span>
                </div>
                <van-cell class="cell-form" :title="selectedWalletWay.text" is-link arrow-direction="down" @click="showWalletWay = true"/>
                <div class="title">
                    <span>{{ t('wallet_address') }}</span>
                </div>
                <van-field class="cell-form" v-model="address" :placeholder="t('wallet_enter_address')" />
                <!-- <div class="title">
                    <span>Wallet QR code</span>
                </div>
                <van-uploader v-model="fileList" upload-icon="plus" preview-size="100px" max-count="1" :after-read="afterRead" /> -->

                <van-button block type="primary" @click="submit">{{t('common_submit')}}</van-button>
            </van-tab>
        </van-tabs>
    </div>
    <BottomSelectPopup v-if="showWalletWay" :list="walletWays" :selected="selectedWalletWay"
      :title="t('wallet_select_currency_title')" @closed="showWalletWay = false" @select="onWalletWaySelect"
    />
    <FloatBubble ></FloatBubble>
</template>

<script setup>
import AddBankCard from '../../components/trade/AddBankCard.vue';
import { ref, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { getWalletWay, updatewallet } from '@/api';

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const activeTab = ref(0);
const address = ref('');
const showWalletWay = ref(false)
const walletWays = ref([])
const selectedWalletWay = ref({})
// const fileList = ref([]);

// const afterRead = (file) => {

// };

onBeforeMount(() => {
    if (route.query?.tab) {
        activeTab.value = Number(route.query?.tab)
    }
    getWalletWay().then(res => {
        walletWays.value = res.result.result.map(item => ({
            currency: item.currency,
            text: item.cryptoprotocol,
        }))
        selectedWalletWay.value = walletWays.value[0]
    }).catch(err => {
    })
})

const onWalletWaySelect = (way) => {
    showWalletWay.value = false
    selectedWalletWay.value = way
}

const submit = () => {
    if (!address.value) {
        showFailToast(t('wallet_address_required'))
        return
    }
    showLoadingToast(t('common_loading'))
    let params = {
        currency: selectedWalletWay.value.currency, 
        cryptoprotocol: selectedWalletWay.value.text, 
        wallet_address: address.value 
    }
    updatewallet(params).then(res => {
        showSuccessToast(t('common_success'))
        router.back()
    }).catch(err => {
        showFailToast(err.message)
    })
}

</script>

<style lang="scss" scoped>
.content {
    padding: 16px;
}

.van-tabs {
    margin-bottom: 15px;
    --van-tabs-card-height: 36px;
    --van-padding-md: 0;
    --van-border-width: 0;
    --van-tabs-nav-background: transparent;

    :deep(.van-tabs__wrap) {
        height: auto;
        background: #ECEFF4;
        border-radius: 5px;
        margin-bottom: 16px;
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
        color: #fff;
        background-color: #333;
    }
}

.cell-form {
    border-radius: 6px;
    --van-cell-background: rgba(0, 0, 0, .05);
}

.title {
    margin: 20px 5px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.van-uploader {
    margin: 0px 5px;
    border: 1px solid rgba(51, 51, 51, .09);
    --van-uploader-upload-background: transparent;
    --van-uploader-icon-color: #222;
    --van-uploader-icon-size: 30px
}

.van-button--primary {
    margin-top: 30px;
    height: 50px !important;
    background-image: linear-gradient(180deg, #00c6fb 0, #005bea);

    span {
        font-size: 19px;
    }
}

</style>

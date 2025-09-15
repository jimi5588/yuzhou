<template>
    <TopBar :title="$t('wallet_select_currency')">

        <template #right>
                    <Icon name="records" size="30px" style="cursor: pointer;" color="#ccc" @click="toOrderList"></Icon>
                    <!-- <van-icon :name="currency?.optional ? 'star' : 'star-o'"  size="28" @click="onOption" /> -->
        </template>
    </TopBar>
    <div class="content-wrap">
        <p class="title">{{ t('currency') }}</p>
        <van-field v-model="data.currency" readonly />

        <p class="title">{{ t('channel') }}</p>
        <van-field v-model="data.cryptoprotocol" readonly />

        <p class="title">{{ t('address') }}</p>
        <div class="field-with-copy" style="display:flex; align-items:center;">
            <van-field 
                v-model="data.address" 
                readonly 
                style="flex:1;"
            />
            <img 
                src="../../assets/images/copy.png" 
                width="24px" 
                style="margin-left:8px; cursor:pointer;" 
                @click="copyAddress" 
            />
        </div>
        <p class="title">{{ t('transfer_voucher') }}</p>    
        <van-uploader v-model="fileList" :max-count="1" :after-read="afterRead"/>


        <p class="title">{{ t('number_of_recharges') }}</p>
        <van-field v-model="num" type="number" :placeholder="t('please_enter_recharge_amount')"/>
        <span class="num-eq">≈ {{ usdAmount }} {{data.currency}}</span>

        <van-button type="primary" block @click="submit">{{ t('common_submit') }}</van-button>
    </div>
    <FloatBubble ></FloatBubble>
</template>

<script setup>

import { ref, onBeforeMount, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import BottomSelectPopup from '../../components/common/BottomSelectPopup.vue';
import { exchangecurrency, getDepositType, deposit, uploadFile } from '@/api';

const { t } = useI18n()
const store = useStore()
const route = useRoute()
const router = useRouter()

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const fiatCurrency = computed(() => store.state.fiatCurrency)
const data = ref({})
const fileList = ref([])
const tranImgUrl = ref(null)
const areas = [
    { text: 'Japan(+81)', value: 'Japan' },
    { text: 'Canada(+1)', value: 'Canada' },
    { text: 'Liechtenstein(+423)', value: 'Liechtenstein' },
    { text: 'SaintPierreandMiquelon(+508)', value: 'SaintPierreandMiquelon' },
    { text: 'China(+86)', value: 'China' },
];
const showArea = ref(false);
const areaValue = ref([areas[0].value]);

const currencys = ['USD', 'JPY'];
const showCurrency = ref(false);
const currencyValue = ref(currencys[0]);

const num = ref('0.00');
const usdAmount = computed(() => {
  if (!num.value || !data.value.rate) return '0.00'

  const rate = parseFloat(data.value.rate)
  const amount = parseFloat(num.value)

  if (isNaN(rate) || isNaN(amount) || rate === 0) return '0.00'

  // 计算美元金额（你给的是加密货币数量，美元 = 数量 / 汇率）
  return (amount * rate).toFixed(6)
})

onBeforeMount(() => {
    if(route.query.id){
        getDepositType(route.query.id).then((res) => {
            data.value = res.result;
        }).catch(err => {
            showFailToast(err.message);
        })
    }
});

const toOrderList = () => {
    showLoadingToast(t('common_loading'))
    router.push({
        path: '/pages/wallet/record',
    })
};

const afterRead = (file) => {
    showLoadingToast(t('common_loading'));
    const formData = new FormData();
    formData.append('file', file.file);
    uploadFile(formData).then((res) => {
        tranImgUrl.value = res.data.image;
        showSuccessToast(t('upload_successful'));
    }).catch((err) => {
        showFailToast(err.message);
    });
};

const copyAddress = () => {
    if (!data.value.address) {
        showFailToast(t('address_empty')); // 地址为空提示
        return;
    }
    navigator.clipboard.writeText(data.value.address)
        .then(() => {
            showSuccessToast(t('copy_success')); // 复制成功提示
        })
        .catch(() => {
            showFailToast(t('copy_failed')); // 复制失败提示
        });
};

const submit = () => {
    if(!num.value){
        showFailToast(t('please_enter_recharge_amount'));
        return
    }

    if (parseFloat(num.value) <= 0) {
        showFailToast(t('please_enter_recharge_amount')); // 金额必须大于0
        return;
    }

    let params = {
        id: data.value.id, 
        amount: num.value,
        currency: data.value.currency, 
        cryptoprotocol: data.value.cryptoprotocol, 
        tran_img: tranImgUrl.value,
    }
    showLoadingToast(t('common_loading'));
    deposit(params).then((res) => {
        showSuccessToast('Deposit order submitted successfully');
        //router.back();
        num.value = 0.00;
    }).catch(err => {
        // 如果服务端返回了 status/message
        if (err?.status === 403 && err?.message) {
        showFailToast(err.message)
            } else {
                showFailToast(t('system_error_try_again'))
            }
        showFailToast(err.message);
    });
}
</script>

<style lang="scss" scoped>
.content-wrap {
    margin: 20px;
    padding: 16px;
    background: var(--bg-sub);
    border-radius: 10px;
}

.title {
    font-size: 16px;
    font-weight: bold;
    margin-top: 16px;
}

.van-cell {
    padding: 10px 0;
    --van-cell-line-height: 32px;

    :deep(.van-field__control) {
        padding: 10px 18px;
        border-radius: 7px;
        background: #f2f6f7;   
    }
    :deep(.van-field__control:read-only) {
        background: rgba(0, 0, 0, .05);
        font-size: 16px;
    }
    :deep(.van-field__right-icon) {
        display: flex;
        align-items: center;
        img {
            width: 32px;
        }
           
    }
}

.van-uploader {
    margin-top: 12px;
    border: 1px solid rgba(51, 51, 51, .09);
    --van-uploader-upload-background: transparent;
    --van-uploader-icon-color: var(--text-color);
    --van-uploader-icon-size: 30px
}

.num-eq {
    color: #999;
    margin-top: 6px;
}

.van-button {
    margin-top: 20px;
    height: 52px !important;
    font-size: 19px !important;
    :deep(.van-button__text) {
        font-size: 19px;
    }
}

.van-theme-dark {
    .van-cell {
        :deep(.van-field__control) {
            background: #333;   
        }
    }
    .van-uploader {
        border: 1px solid #666;
    }
}

</style>

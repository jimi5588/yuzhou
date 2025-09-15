<template>
    <TopBar :title="t('common_withdraw')"></TopBar>
    <div class="content">
       
        <van-cell
        class="cell-form"
        :title="selectedCurrency.name || t('USDWithdrawal')"
        is-link
        arrow-direction="down"
        @click="showCurrency = true"
        />

        <div class="title">
            <span >{{t('withdrawal_address')}}</span>

        </div>
        <van-field class="cell-form" v-model="address" type="text" />

        <div class="title">
            <span>{{t('withdraw_amount')}}</span>
            <van-button type="primary" size="mini" @click="amount = user?.balance"></van-button>
        </div>
        <van-field class="cell-form" v-model="amount" type="number" />

        <div class="title">
            <span>{{t('Transaction_password')}}</span>
        </div>
        <van-field class="cell-form" v-model="payPassword" type="password" />

        <van-row>
            <van-col span="10">
                <span>
                    {{ t('available') }} 
                    {{ ((+user?.balance || 0) - (+user?.frozen || 0)).toFixed(3) }} USD
                </span>
            </van-col>
            <van-col span="14">
                <span>{{t('Minimum_withdrawal_amount')}} {{ selectedCurrency.min_amont || '' }} {{ selectedCurrency.cryptoprotocol || '' }}</span>
            </van-col>
        </van-row>
        <van-row>
            <van-col span="14">
            <span>
                {{ t('Number_of_accounts_received') }} 
                {{ ((+amount || 0) * (+selectedCurrency.rate || 0)).toFixed(8) }}
                {{ selectedCurrency.cryptoprotocol || '' }}
            </span>
            </van-col>
            <van-col span="10">
                <span >{{t('handling')}} {{ ((+amount || 0) * (+selectedWallet.fee || 0)).toFixed(2) }} {{ selectedCurrency.cryptoprotocol || '' }}</span>
            </van-col>
        </van-row>
        <van-button block type="primary" @click="submit">{{t('common_ok')}}</van-button>
    </div>
    <van-action-sheet v-model:show="showCurrency" :actions="currencys" :cancel-text="t('common_cancel')" close-on-click-action @select="onCurrencySelect" />
    <van-popup v-model:show="showWallet" position="bottom" class="popup-wallet">
        <div class="wallet-content">
            <van-list class="wallet-list" v-model:loading="loading"
                    :finished="finished" v-if="filteredWallets.length > 0">
                    <van-cell-group :border="false" v-for="item in filteredWallets" :key="item.id" @click="selectWallet(item)">
                    <van-cell :title="t('currency_name')" :value="item.currency" />
                    <van-cell :title="t('channel_name')" :value="item.cryptoprotocol" />
                    <van-cell :title="t('wallet_address')" :value="item.wallet_address" />
                </van-cell-group>
            </van-list>
            <div v-else class="wallet-empty">
                <van-empty description="">
                    <template #image>
                        <img src="../../assets/images/empty.d67f5618.svg" />
                    </template>
                </van-empty>    
            </div>
            <van-button block type="primary" @click="addWallet()">
                    {{ t('add_wallet_address') }}
            </van-button>
        </div>
    </van-popup>
    <FloatBubble ></FloatBubble>
</template>

<script setup>
import TopBar from '../../components/common/TopBar.vue';
import { ref, computed ,watch,onMounted } from 'vue'
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { getUserInfo, getWalletWay, getWallets, walletWithdraw } from '@/api'
import { showSuccessToast, showFailToast, showLoadingToast } from 'vant'
import { showDialog } from 'vant'

const { t } = useI18n()
const store = useStore()
const router = useRouter()

const user = computed(() => store.state.user)

const loading = ref(false)
const finished = ref(true)
const activeTab = ref(1)
const amount = ref(0)
const payPassword = ref('')
const address = ref('')

// 币种与协议相关
const showCurrency = ref(false)
const currencys = ref([])
const selectedCurrency = ref({
    id: null,
    currency: '',
    cryptoprotocol: '',
    min_amont: 0,
    fee: 0,
    rate: 0
})

// 钱包相关
const showWallet = ref(false)
const wallets = ref([])
const selectedWallet = ref({
    wallet_address: t('add_wallet_address'),
    fee: 0,
    id: null
})

watch([amount, selectedCurrency], () => {
  console.log('money', amount.value * selectedCurrency.value.rate)
})

// 页面加载时检查提现密码状态
onMounted(() => {
  if (user.value.moneypssd_status !== 1) {
    showDialog({
      title: t('user_password'),
      message: t('withdraw_set_paypassword_message'),
    }).then(() => {
      router.push({ path: '/pages/user/SetPayPassword' })
    }).catch(() => {
      router.back()
    })
  }
})

// 获取币种与协议列表（带汇率）
getWalletWay().then(res => {
    const data = res.result?.result || []
    currencys.value = data.map(item => ({
    ...item,
    rate: parseFloat(item.rate || '0'),
    min_amont: parseFloat(item.min_amont || '0'),
    fee: parseFloat(item.fee || '0'),
    name: `${item.currency} (${item.cryptoprotocol})` // 💡 必须存在，否则 van-action-sheet 无法显示
    }))
    if (currencys.value.length > 0) {
        selectedCurrency.value = currencys.value[0]
    }
}).catch(err => {
    console.error('getWalletWay error:', err)
})

const filteredWallets = computed(() => {
    return wallets.value.filter(wallet => 
        wallet.cryptoprotocol === selectedCurrency.value.cryptoprotocol
    )
})

// 获取用户绑定的钱包列表
getWallets().then(res => {
    if (res.result && res.result.length > 0) {
        wallets.value = res.result
        selectedWallet.value = wallets.value[0]
    }   
}).catch(err => {})

// 选择币种协议
const onCurrencySelect = (item) => {
  showCurrency.value = false

  selectedCurrency.value = {
    ...item,
    rate: parseFloat(item.rate || '0'),
    name: item.name || `${item.currency} (${item.cryptoprotocol})` // 防止丢失
  }
  console.log('selectedCurrency', selectedCurrency.value)
  console.log('amount', amount.value)
  const matchedWallet = wallets.value.find(w => w.cryptoprotocol === item.cryptoprotocol)
  selectedWallet.value = matchedWallet || {
    wallet_address: t('add_wallet_address'),
    fee: 0,
    id: null
  }
}

// 选择钱包
const selectWallet = (item) => {
    showWallet.value = false
    selectedWallet.value = item
}

// 添加钱包
const addWallet = () => {
    router.push({
        path: '/pages/setting/addwallet',
        query: { tab: activeTab.value === 1 ? 0 : 1 }
    })
}

// 页面跳转封装
const toPage = (path) => {
    router.push("/pages/" + path)
}

const submit = () => {
    if (!selectedWallet.value.id) {
        showFailToast(t('wallet_select_currency_title'))
        return
    } 

    if (!amount.value || amount.value < 1) {
        showFailToast(t('Minimum_withdrawal_amount'))
        return
    }

    if (!payPassword.value) {
        showFailToast(t('withdraw_pay_password_input'))
        return
    }

    showLoadingToast(t('common_loading'))

    const params = {
        address: address.value,
        amount: amount.value,
        pay_password: payPassword.value,
        currency: selectedCurrency.value.currency,
        cryptoprotocol: selectedCurrency.value.cryptoprotocol
    }

    walletWithdraw(params)
        .then(res => {
            showSuccessToast(t('common_success'))
            router.back()
        })
        .catch(err => {
            // 如果服务端返回了 status/message
            if (err?.status === 403 && err?.message) {
                showFailToast(err.message)
            } else {
                showFailToast(t('system_error_try_again'))
            }
        })
}
</script>


<style lang="scss" scoped>
.content {
    padding: 16px;
}

.van-tabs {
    margin-bottom: 15px;
    background: #ECEFF4;
    border-radius: 5px;
    --van-tabs-card-height: 36px;
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

.cell-form {
    border-radius: 6px;
}

.title {
    margin: 20px 5px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .van-button {
        height: auto !important;
        margin: 0 5px;
    }
}

.van-row {
    margin: 20px 10px;

    .van-col:last-child {
        text-align: right;
    }

    span {
        font-size: 13px;
    }
}

.van-popup--bottom {
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding: 20px;
    overflow-y: hidden;
}

.wallet-list {
    max-height : 300px;
    overflow-y: auto;
    .van-cell-group {
        margin: 10px 0;
        padding: 10px 0;
        border: 1px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        --van-cell-vertical-padding: 2px;
    }
}

.wallet-content {
    display: flex;
    flex-direction: column;
    .van-empty {
        --van-empty-padding: 0;
    }
}
</style>

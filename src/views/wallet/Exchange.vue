<template>
    <div class="exchange-page">
        <TopBar :title="t('exchange')" />

        <!-- 币种选择 -->
        <div class="currency-selector">
            <div class="currency-boxes">
                <van-dropdown-menu>
                    <van-dropdown-item v-model="fromCurrency" :options="currencyOptions" />
                </van-dropdown-menu>
                <div class="switch-icon" @click="switchCurrencies">
                    <van-icon name="exchange" color="#4cd964" size="36" />
                </div>
                <van-dropdown-menu>
                    <van-dropdown-item v-model="toCurrency" :options="currencyOptions" />
                </van-dropdown-menu>
            </div>
        </div>

        <!-- 兑换数量输入 -->
        <div class="exchange-input">
            <van-field v-model="amount" :label="t('exchange_quantity')" type="number" placeholder="0.00">
                <template #extra>
                    <div class="amount-right">
                        <span>{{ fromCurrency }}</span>
                        <span @click="setMaxAmount">{{t('exchange_all')}}</span>
                    </div>
                </template>
            </van-field>
        </div>

        <!-- 兑换信息 -->
        <div class="exchange-info">
            <div class="info-row">
                <span class="label">{{t('exchange_rate')}}</span>
                <span class="value">{{ currentRate || 'Loading...' }}</span>
            </div>
            <div class="info-row">
                <span class="label">{{t('exchange_amout')}}   {{ fromCurrency }}</span>
                <span class="value">{{ availableAmount }}</span>
            </div>
            <div class="info-row">
                <span class="label">{{t('exchange_expected')}}  {{ toCurrency }}</span>
                <span class="value">{{ expectedAmount }}</span>
            </div>

            <van-button block type="primary" class="exchange-button" color="linear-gradient(to right, #4cd964, #1989fa)"
                :disabled="!canExchange" @click="handleExchange">
                {{t('common_submit')}}
            </van-button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import TopBar from '@/components/common/TopBar.vue';
import { exchange,coinexchange } from '@/api';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter();
const store = useStore();
const user = computed(() => store.state.user);
const amount = ref('');
const fromCurrency = ref('USDT');
const toCurrency = ref('BTC');
const currentRate = ref(null);

const currencyOptions = [
    { text: 'USDT', value: 'USDT' },
    { text: 'ETH', value: 'ETH' },
    { text: 'BTC', value: 'BTC' }
];

// 计算可用余额
const availableAmount = computed(() => {
    const currencyKey = fromCurrency.value === 'JPY' ? 'bank' : fromCurrency.value.toLowerCase();
    return (parseFloat(user.value.balance[currencyKey] || 0) - parseFloat(user.value.froze[currencyKey] || 0)).toFixed(8);
})

// 计算预计获得的金额
const expectedAmount = computed(() => {
    if (!amount.value || amount.value === '0.00' || !currentRate.value) return '0.00000000';
    return (Number(amount.value) * Number(currentRate.value)).toFixed(8);
});

// 计算是否可以兑换
const canExchange = computed(() => {
    return amount.value && Number(amount.value) > 0 && Number(amount.value) <= Number(availableAmount.value);
});

// 切换币种
const switchCurrencies = () => {
    [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value];
    fetchExchangeRate();
    amount.value = '0.00';
};

// 获取当前汇率
const fetchExchangeRate = () => {
    const from = fromCurrency.value === 'JPY' ? 'bank' : fromCurrency.value;
    const to = toCurrency.value === 'JPY' ? 'bank' : toCurrency.value;

    exchange(from, to)
        .then(res => {
            if (res.result) {
                currentRate.value = res.result.rate;
            }
        })
        .catch(err => {
            console.error('API error', err);
        });
};

// 监听币种变化，更新汇率（防止重复请求）
watch([fromCurrency, toCurrency], ([newFrom, newTo], [oldFrom, oldTo]) => {
    if (newFrom !== oldFrom || newTo !== oldTo) {
        fetchExchangeRate();
    }
});

// 设置最大兑换金额
const setMaxAmount = () => {
    amount.value = availableAmount.value;
};

// 处理兑换逻辑
const isExchanging = ref(false);

const handleExchange = async () => {
    if (!amount.value || Number(amount.value) <= 0) {
        showToast('Please enter exchange amount');
        return;
    }
    if (Number(amount.value) > Number(availableAmount.value)) {
        showToast('Insufficient balance');
        return;
    }
    if (isExchanging.value) return; // 防止重复提交

    isExchanging.value = true;
    
    let params = {
        from: fromCurrency.value === 'JPY' ? 'bank' : fromCurrency.value,
        to: toCurrency.value === 'JPY' ? 'bank' : toCurrency.value,
        amount: amount.value,
    };

    try {
        const res = await coinexchange(params);
        showSuccessToast(t('common_success'));
    } catch (err) {
        console.error("Exchange failed:", err);
        showFailToast(err.message || 'Exchange failed');
    } finally {
        isExchanging.value = false;
    }
};

// 初始获取汇率
fetchExchangeRate();
</script>


<style lang="scss" scoped>
.exchange-page {
    background: #f5f5f5;
    min-height: 100vh;

    .currency-selector {
        background: #fff;
        padding: 20px;
        margin-bottom: 12px;

        .currency-boxes {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .currency-box {
                flex: 1;
                background: #f5f5f5;
                padding: 16px;
                border-radius: 8px;
                text-align: center;

                .currency-name {
                    font-size: 18px;
                    font-weight: bold;
                }
            }

            .switch-icon {
                padding: 0 20px;
                cursor: pointer;
            }

            :deep(.van-dropdown-menu) {
                width: 160px;
            }
            :deep(.van-dropdown-menu__item) {
                min-width: 150px;
                flex: 1;
            }
            /* 调整下拉内容 */
            :deep(.van-dropdown-item__content) {
            padding: 5px 30px;
            width: 430px !important;
            }
        }
    }

    .exchange-input {
        background: #fff;
        padding: 10px 16px;

        :deep(.van-cell) {
            flex-direction: column;
            --van-cell-horizontal-padding: 5px;

            .van-field__label {
                width: 100%;
                margin-bottom: 5px;

                label {
                    font-size: 20px;
                }
            }

            .van-field__value {
                line-height: 42px;
                padding-bottom: 5px;
                margin-right: 16px;
                border-bottom: 1px solid #E5E7EB;
            }

            .amount-right {
                position: absolute;
                right: 20px;
                bottom: 26px;

                span {

                    padding: 0 10px;
                    font-size: 16px;
                    cursor: pointer;

                    &:first-child {
                        color: #000;
                        border-right: 0.5px solid #ccc;
                    }

                    &:last-child {
                        color: #6B7280;
                    }
                }
            }
        }
    }

    .exchange-info {
        background: #fff;
        padding: 8px 16px 30px;

        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;

            &:last-child {
                margin-bottom: 0;
            }

            .label {
                color: #666;
            }

            .value {
                font-weight: 500;
            }
        }
    }

    .exchange-button {
        margin-top: 32px;
    }
}
</style>
<template>
    <div class="page">
        <TopBar :title="t('wallet_financial_records')"  ></TopBar>
        <List @load-data="loadData" v-slot:default="slotProps">
            <van-cell-group inset v-for="(item, index) in slotProps.list" :key="index">
                <van-cell
                    :class="item.amount > 0 ? 'add' : 'less'"
                    :title="t('common_number')"
                    :value="formatAmount(item)"
                />
                <van-cell class="time" :title="t('common_type')" :value="getTypeLabel(item.type)" />
                <van-cell class="time" :title="t('common_time')" :value="item.time" />
            </van-cell-group>
        </List>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { getMoneyChanges } from '@/api';
import { showLoadingToast } from 'vant';

const { t } = useI18n()
const store = useStore()
const router = useRouter()

// 显示类型文字
const getTypeLabel = (type) => {
  const labels = {
    1: t('type_recharge'),        // 充值
    2: t('type_withdrawal'),      // 提现
    3: t('type_withdraw_reject'),        // '提现驳回
    4: t('type_option_order'),       // 期权下单
    5: t('type_option_settlement'),  // 期权结算
    6: t('type_contract_order'), // 合约下单
    7: t('type_contract_settlement'),   // 合约结算
    8: t('type_staking_mining'),       // 质押挖矿
    9: t('type_mining_profit'),                // type_mining_profit: '挖矿收益
    10: t('type_loan'), // 贷款
    11: t('type_repayment'),              // 还款
    12: t('type_system_auto'),          // 系统自动
    13: t('type_other'),          // 其他
    14: t('type_currency_exchange'),          // 币种兑换
  }
  return labels[type] || t('type_unknown'); // 未知类型
}

// 格式化金额
const formatAmount = (item) => {
  let amount = Number(item.amount);
  // 如果是银行提现，乘以汇率
  if (item.currency === 'BANK' && item.type === 2) {
    amount = amount * 145;
  }
  return `${amount.toFixed(2)} ${item.currency === 'BANK' ? 'USDT' : 'USD'}`;
};

// 加载列表数据
const loadData = (params, successCallback, errCallback) => {
    showLoadingToast(t('common_loading'));
    getMoneyChanges(params)
        .then(res => {
            successCallback(res.result.data)
        })
        .catch(err => {
            errCallback(err)
        })
}
</script>


<style lang="scss" scoped>

:deep(.van-list) {
    height: calc(100vh - 60px);
    overflow-y: auto;
}

:deep(.van-tabs) {
    background-color: transparent;
    --van-padding-md: 0px;
    --van-border-width: 0;
    --van-tabs-card-height: 32px;
    --van-tabs-nav-background: transparent;
    --van-tabs-default-color: var(--color-theme);

    .van-tab--card {
        border: 1px solid var(--text-color);
        border-radius: 20px;
        margin: 0 10px;
        padding: 0 15px;
        color: var(--text-color);
        font-size: 14px;
    }

    .van-tab--active {
        color: var(--bg-sub);
        background-color: var(--text-color);
        border: 1px solid var(--text-color);
    }
}

.van-cell-group {
    margin-top: 15px;

    :deep(.van-cell__title span) {
        color: #999;
    }

    :deep(.van-cell__value span) {
        color: #222;
    }
}

.time :deep(.van-cell__value span) {
    color: #000;
    font-weight: bold;
}

.left-align :deep(.van-cell__value) {
    text-align: left !important;  /* 强制左对齐 */
}

.add {
    :deep(.van-cell__value span) {
        color: #00b897;
    }
}
.less {
    :deep(.van-cell__value span) {
        color: #f44336;
    }
}
</style>
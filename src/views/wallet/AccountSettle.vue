<template>
    <div class="account-settle">
        <TopBar :title="t('wallet_account_settlement').toUpperCase()" />
        
        <List @load-data="loadData" v-slot:default="slotProps" class="transaction-list">
            <van-cell v-for="(item, index) in slotProps.list" :key="index" :border="false" class="transaction-item">
                <template #title>
                    <div class="transaction-left">
                        <span :class="['type-label', item.type.toLowerCase()]">
                            {{ item.type }}
                            <span class="description">{{ item.description }}</span>
                        </span>
                        
                        <span :class="['amount', item.changeAmount < 0 ? 'debit' : 'credit']">
                            {{ symbol }}{{ Math.abs(item.changeAmount).toFixed(2) }}
                        </span>
                    </div>
                </template>

                <template #value>
                    <div class="transaction-right">
                        <div class="balance">Balance:{{ symbol }}{{ item.toAmount }}</div>
                        <div class="time">Time:{{ item.gmtCreate }}</div>
                    </div>
                </template>
            </van-cell>
        </List>
    </div>
</template>

<script setup>
import TopBar from '@/components/common/TopBar.vue';
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const store = useStore()
const router = useRouter()
const symbol = ref(store.state.symbol)

const loadData = (params, successCallback, errCallback) => {
    getAccountRecord(params).then(res => {
        successCallback(res.data.records)
    }).catch(err => {
        errCallback(err)
    })
}

</script>

<style lang="scss" scoped>
.account-settle {
    min-height: 100vh;
}

.transaction-list {
    padding: 12px 0;
}

.transaction-item {
    background: var(--bg-sub);
    border-radius: 0px;
    margin-bottom: 8px;
}

.transaction-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.type-label {
    font-size: 18px;
    font-weight: 500;
}

.type-label.dr {
    color: #8B6BFF;
}

.type-label.cr {
    color: #4CAF50;
}

.description {
    font-size: 12px;
    color: #999;
}

.amount {
    font-size: 20px;
    font-weight: bold;
}

.amount.debit::before {
    content: "-";
}

.transaction-right {
    text-align: right;
}

.balance {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
}

.time {
    font-size: 12px;
    color: #999;
}
</style>
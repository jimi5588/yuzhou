<template>
    <div class="payroll-records">
        <TopBar>
            <template #title>
                <van-tabs v-model:active="activeTab" type="card" @click-tab="onClickTab">
                    <van-tab :title="t('common_created')" />
                    <van-tab :title="t('common_withdraw')" />
                </van-tabs>
            </template>
        </TopBar>

        <div class="records-list">
            <List :listRefresh="listRefresh" @load-data="loadData" v-slot:default="slotProps">
                <van-cell v-for="(record, index) in slotProps.list" :key="index" class="record-item">
                    <template #title>
                        <div class="record-title">
                            <span class="title">Salary Balance</span>
                            <span class="time">Time:{{ record.gmtCreate }}</span>
                        </div>
                    </template>
                    <template #value>
                        <div class="record-value">
                            <span class="status" v-if="false">Created</span>
                            <span class="amount">{{ symbol }}{{ record.changeAmount || record.amount }}</span>
                        </div>
                    </template>
                </van-cell>
            </List>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const store = useStore()
const router = useRouter()
const symbol = ref(store.state.symbol)
const activeTab = ref(0)
const listRefresh = ref(false)

const loadData = (params, successCallback, errCallback) => {
    listRefresh.value = false
    let obj = null
    if (activeTab.value === 0) {
        obj = getSalaryCreatedRecord(params)
    } else {
        obj = getSalaryWithdrawRecord(params)   
    }
    obj.then(res => {
        successCallback(res.data.records)
    }).catch(err => {
        errCallback(err)
    })
}

const onClickTab = () => {
    listRefresh.value = true
}

</script>

<style lang="scss" scoped>
.payroll-records {
    min-height: 100vh;
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

.records-list {
    padding: 12px 0;
}

.record-item {
    margin-bottom: 8px;
    background: var(--bg-sub);
    border-radius: 0px;
}

:deep(.van-cell__value) {
    flex: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.record-title {
    display: flex;
    flex-direction: column;
}

.title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
}

.time {
    font-size: 12px;
    color: #999;
}

.record-value {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.status {
    font-size: 12px;
    color: var(--color-theme);
    margin-bottom: 4px;
}

.amount {
    font-size: 16px;
    font-weight: bold;
}

:deep(.van-button--plain) {
    border-color: #fff;
    color: #fff;
}

:deep(.van-button--primary) {
    background: #fff;
    color: var(--color-theme);
    border: none;
}


</style>
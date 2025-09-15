<template>
    <div class="invitation-reward-record">
        <TopBar :title="t('user_invite_records').toUpperCase()" />

        <div class="records-list">

            <List @load-data="loadData" v-slot:default="slotProps">
                <van-cell v-for="(record, index) in slotProps.list" :key="index" class="record-item">
                    <template #title>
                        <div class="record-title">
                            <span class="title">{{t('user_invited')+': '+record.newUserName }}</span>
                            <span class="time">{{t('common_time')+': '+record.gmtCreate }}</span>
                        </div>
                    </template>
                    <template #value>
                        <div class="record-value">
                            <span class="amount">TSh {{ record.reward }}</span>
                        </div>
                    </template>
                </van-cell>
            </List>

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const router = useRouter()


const loadData = (params, successCallback, errCallback) => {
    getShareRecord(params).then(res => {
        successCallback(res.data.records)
    }).catch(err => {
        errCallback(err)
    })
}
</script>

<style lang="scss" scoped>
.invitation-reward-record {
    min-height: 100vh;
}

.records-list {
    padding: 12px 0;
}

.record-item {
    margin-bottom: 8px;
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
    font-size: 14px;
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

.amount {
    font-size: 16px;
    font-weight: bold;
    color: #ff4444;
}

</style>
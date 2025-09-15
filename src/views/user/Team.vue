<template>
    <div class="team-container">
        <TopBar :title="t('common_team')" />

        <!-- 等级切换标签页 -->
        <van-tabs v-model:active="activeTab" type="card" @click-tab="onClickTab">
            <van-tab :title="t('team_level_1')" />
            <van-tab :title="t('team_level_2')" />
            <van-tab :title="t('team_level_3')" />
        </van-tabs>

        <div class="space2"></div>

        <!-- 统计数据卡片 -->
        <div class="statistics-cards">
            <van-row gutter="16">
                <van-col span="12">
                    <div class="stat-card">
                        <div class="stat-number">{{ teamData?.totalPeople }}</div>
                        <div class="stat-label">{{ t('team_reg_num') }}</div>
                    </div>
                </van-col>
                <van-col span="12">
                    <div class="stat-card">
                        <div class="stat-number">{{ teamData?.rechargers }}</div>
                        <div class="stat-label">{{ t('team_recharge_num') }}</div>
                    </div>
                </van-col>
            </van-row>

            <van-row gutter="16" style="margin-top: 16px" v-if="false">
                <van-col span="12">
                    <div class="stat-card">
                        <div class="stat-amount">TSh25212.00</div>
                        <div class="stat-label">Total recharge amount</div>
                    </div>
                </van-col>
                <van-col span="12">
                    <div class="stat-card">
                        <div class="stat-amount">TSh156451.00</div>
                        <div class="stat-label">Total withdrawal amount</div>
                    </div>
                </van-col>
            </van-row>
        </div>

        <div class="space2"></div>

        <!-- 团队成员列表 -->
        <List :listRefresh="listRefresh" @load-data="loadData" v-slot:default="slotProps" class="team-list">
            <van-cell v-for="member in slotProps.list" :key="member.uid">
                <template #title>
                    <div class="member-info">
                        <div>
                            <span class="member-name">{{ member.fullName }}</span>
                            <div class="member-uid" v-if="false">UID:{{ member.uid }}</div>
                            <div class="member-uid">{{ t('user_ref_code') }}:{{ member.refCode }}</div>
                        </div>
                        <div class="member-details">
                            <div class="withdraw-amount" v-if="false">TSh{{ member.withdrawAmount }}</div>
                            <div class="join-time">{{ member.gmtCreate }}</div>
                            <div class="join-time">{{ member.rechargedFlag ? t('team_recharged') : t('team_unrecharge') }}</div>
                        </div>
                    </div>
                </template>
            </van-cell>
        </List>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const activeTab = ref(0)
const teamData = ref(null)
const listRefresh = ref(false)

const onClickTab = () => {
    listRefresh.value = true
}

const loadData = (params, successCallback, errCallback) => {
    listRefresh.value = false
    params.level = activeTab.value+1
    getTeamData(params).then(res => {
        if(params.current == 1) {
            teamData.value = res.data
        }
        successCallback(res.data.users.records)
    }).catch(err => {
        errCallback(err)
    })
}

// getLevelData()

</script>

<style lang="scss" scoped>
.team-container {
    min-height: 100vh;
}

:deep(.van-tabs) {
    margin: 20px 0;
    --van-padding-md: 10px;
    --van-border-width: 0;
    --van-tabs-card-height: 40px;
    --van-tabs-default-color: var(--text-color);
    --van-tabs-nav-background: transparent;

    .van-tab--card {
        border: 1px solid var(--text-color);
        border-radius: 20px;
        margin: 5px;
    }

    .van-tab--active {
        background-color: var(--color-theme);
        border: 1px solid var(--color-theme);
    }
}

.statistics-cards {
    padding: 16px;
}

.stat-card {
    background: var(--bg-sub);
    padding: 16px;
    border-radius: 8px;
    text-align: center;
}

.stat-number {
    font-size: 24px;
    font-weight: bold;
    color: var(--text-color);
    margin-bottom: 8px;
}

.stat-amount {
    font-size: 20px;
    font-weight: bold;
    color: var(--text-color);
    margin-bottom: 8px;
}

.stat-label {
    font-size: 12px;
    color: #999;
}

.team-list {
    margin-top: 16px;
}

.member-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.member-name {
    font-size: 16px;
    font-weight: bold;
    color: var(--text-color);
}

.member-uid {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
}

.member-details {
    text-align: right;
}

.withdraw-amount {
    font-size: 16px;
    color: var(--text-color);
    margin-bottom: 4px;
}

.join-time {
    font-size: 12px;
    color: #999;
}

:deep(.van-cell) {
    padding: 16px;
}
</style>
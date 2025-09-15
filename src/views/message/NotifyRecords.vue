<template>
    <div class="notifications">
        <TopBar v-if="type == 1" :title="t('message_system_message')"/>
        <TopBar v-else :title="t('message_platform_announcement')"/>

        <!-- 通知类型切换 -->
        <van-tabs v-model:active="activeTab" type="card" v-if="false">
            <van-tab :title="t('message_announcement')" />
        </van-tabs>
        

        <!-- 通知列表 -->
        <List  @load-data="loadData" v-slot:default="slotProps">
            <van-cell-group :border="false">
                <van-cell v-for="(item, index) in slotProps.list" :key="index" @click="toDetail(item)">
                    <template #title>
                        <div class="notification-item">
                            <div class="notification-header">
                                <van-icon name="volume-o" color="#ff6b35" size="20" />
                                <span class="title">{{ item.title }}</span>
                            </div>
                            <div class="notification-content" v-html="item.htmls" v-if="false"></div>
                            <div class="notification-time">
                                {{ item.send_time }}
                            </div>
                        </div>
                    </template>
                </van-cell>
            </van-cell-group>
        </List>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getSystemMessages, getAnnouncementlist } from '@/api'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const type = ref(route.query.type || 1)
const activeTab = ref(0)

const loadData = (params, successCallback, errCallback) => { 
    let obj = null
    if (type.value == 1) {
        obj = getSystemMessages(params)
    } else {
        obj = getAnnouncementlist(params)   
    }
    obj.then(res => {
        successCallback(res.result.data)
    }).catch(err => {
        errCallback(err)
    })
}

const toDetail = (item) => {
    router.push({
        path: "/pages/message/detail",
        query: {
            id: item.id,
            type: type.value
        }
    })
}

</script>

<style lang="scss" scoped>
.notifications {
    min-height: 100vh;
}

:deep(.van-tabs) {
    margin-top: 20px;
    background-color: transparent;
    --van-padding-md: 30px;
    --van-border-width: 0;
    --van-tabs-card-height: 50px;
    --van-tabs-nav-background: transparent;
    --van-tabs-default-color: var(--color-theme);

    .van-tab--card {
        flex: none;
        border: 1px solid #8b8d8d;
        border-radius: 10px;
        margin: 5px;
        color: #9aa3b4;
    }

    .van-tab--active {
        color: white;
        background-color: var(--color-theme);
        border: 2px solid var(--color-theme);
    }
}

.notification-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 10px;
    background: var(--bg-sub);
    // box-shadow: 0 2px 10px 0 rgba(27, 47, 84, .125490);
}

.notification-header {
    display: flex;
    align-items: center;
    gap: 8px;
}

.title {
    font-size: 16px;
    font-weight: bold;
}

.notification-content {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
}

.notification-time {
    color: #999;
    font-size: 12px;
}

:deep(.van-button--primary) {
    --van-button-primary-background: #ff6b35;
    --van-button-primary-border-color: #ff6b35;
}

:deep(.van-cell-group) {
    --van-cell-group-background: transparent;
    --van-cell-background: transparent;
    padding: 8px 0;
}

:deep(.van-cell) {
    padding: 8px 16px;
}

:deep(.van-cell::after) {
    // border-bottom: 1px solid #eee;
}
</style>

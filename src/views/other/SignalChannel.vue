<template>
    <div class="signal-channel">
        <TopBar :title="$t('channel_signal')"  />
        <List @load-data="loadData" v-slot:default="slotProps">
            <div class="item" v-for="(item, index) in slotProps.list" :key="index">
                <div class="item-content" v-html="item.content"></div>
                <div class="item-time">{{ item.gmtModified }}</div>
            </div>
        </List>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const loadData = (params, successCallback, errCallback) => { 
    getCircleList(params).then(res => {
        successCallback(res.data.records)
    }).catch(err => {
        errCallback(err)
    })
}

</script>

<style lang="scss" scoped>
.signal-channel {
    min-height: 100vh;
}

.item:first-child {
    margin-top: 16px;
}

.item {
    padding: 0 16px 16px;

    .item-content {
        background: var(--bg-sub);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    .item-time {
        font-size: 12px;
        color: #999;
        text-align: center;
        margin-top: 10px;
    }
}
</style>
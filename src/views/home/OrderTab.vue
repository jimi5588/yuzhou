<template>
    <div class="order-page">
        <TopBar :title="t('assets_record')"></TopBar>
        <van-tabs v-model:active="typeTab" :ellipsis="false" type="card">
            <van-tab :title="t('trade_options')" />
            <van-tab :title="t('trade_contract')" />
        </van-tabs>

        <van-tabs
        v-model:active="activeTab"
        :ellipsis="false"
        type="line"
        class="custom-line-tabs"
        @click-tab="listRefresh = true"
        >
        <van-tab :title="t('trade_in_transaction')" />
        <van-tab :title="t('trade_close_position')" />
        </van-tabs>

        <div class="list">
            <OptionOrder v-if="typeTab === 0 && activeTab === 0" :status="activeTab"></OptionOrder>
            <OptionOrder v-if="typeTab === 0 && activeTab === 1" :status="activeTab"></OptionOrder>
            <ContractOrder v-if="typeTab === 1 && activeTab === 0" :status="1"></ContractOrder>
            <ContractOrder v-if="typeTab === 1 && activeTab === 1" :status="2"></ContractOrder>
        </div>
    </div>
    <FloatBubble></FloatBubble>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

const { t } = useI18n();
const store = useStore();
const typeTab = ref(0);
const activeTab = ref(0);

const currencySymbol = computed(() => store.state.currencySymbol);
const listRefresh = ref(false);
</script>

<style lang="scss" scoped>
.order-page {
    height: 100vh;
    padding-bottom: 10px;
}

.van-tabs {
    margin: 10px;
    --van-tabs-card-height: 36px;
    --van-padding-md: 0;
    --van-border-width: 0;
    --van-tabs-nav-background: transparent;

    :deep(.van-tabs__wrap) {
        height: auto;
        background: #ECEFF4;
        border-radius: 5px;
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

// 自定义线型标签页样式
.custom-line-tabs {
    :deep(.van-tabs__wrap) {
        background: transparent;
        border-radius: 0;
    }

    :deep(.van-tabs__nav) {
        padding-bottom: 0;
    }

    :deep(.van-tab) {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 44px; // 设置最小高度确保有足够空间
        line-height: 1.4; // 调整行高
        padding: 8px 16px; // 增加内边距
    }

    :deep(.van-tab__text) {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    :deep(.van-tabs__line) {
        bottom: 0;
    }
}

.list {
    padding: 0 12px 12px;
}

.van-theme-dark .van-tabs {
    :deep(.van-tabs__wrap) {
        background: #1F2229;
    }

    :deep(.van-tab--card) {
        color: #fff;
    }

    :deep(.van-tab--card.van-tab--active) {
        color: #000;
    }
}

// 暗黑模式下的自定义线型标签页
.van-theme-dark .custom-line-tabs {
    :deep(.van-tab) {
        color: #fff;
    }
    
    :deep(.van-tab--active) {
        color: var(--van-tabs-default-color, #1989fa);
    }
}
</style>
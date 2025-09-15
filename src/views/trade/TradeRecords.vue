<template>
    <TopBar :title="currency?.name" />
    <van-tabs v-model:active="activeTab" :ellipsis="false" type="card" @click-tab="listRefresh = true">
            <van-tab :title="t('trade_in_transaction')" />
            <van-tab :title="t('trade_close_position')" />
        </van-tabs>
        <div class="list">
            <OptionOrder v-if="activeTab === 0" :symbol="currencySymbol" :status="activeTab"></OptionOrder>
            <OptionOrder v-else :symbol="currencySymbol" :status="activeTab"></OptionOrder>
        </div>
    <FloatBubble ></FloatBubble>

</template>

<script setup>
import OptionOrder from '../../components/trade/OptionOrder.vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex'

const { t } = useI18n()
const store = useStore()
const activeTab = ref(0);

const currencySymbol = computed(() => store.state.currencySymbol)
const currency = computed(() => store.state.currencyMap[currencySymbol.value])
const listRefresh = ref(false)

</script>

<style lang="scss" scoped>

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

.list {
    padding: 0 12px;
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

</style>
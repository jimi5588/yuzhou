<template>
    <div class="home-container">
        <TopBar :title="tabTitles[props.tabIndex]" v-if="isShowToolbar()" :showBack="false" />
        <div :class="isShowToolbar() ? 'home-content-tab' : 'home-content'">
            <HomeTab v-if="props.tabIndex === 0" />
            <MarketTab v-if="props.tabIndex === 1" />
            <OrderTab v-if="props.tabIndex === 3"/>
            <AssetsTab v-if="props.tabIndex === 4"/>
        </div>
        <BottomBar :tabIndex="props.tabIndex" />
    </div>
</template>

<script setup>
import TopBar from '@/components/common/TopBar.vue';
import BottomBar from '@/components/common/BottomBar.vue';
import HomeTab from './HomeTab.vue';
import MarketTab from './MarketTab.vue';
import AssetsTab from './AssetsTab.vue';
import OrderTab from './OrderTab.vue';
import { useKlineSocket } from '@/service/klineSocket';

useKlineSocket().initData();

const props = defineProps({
    tabIndex: {
        type: Number,
        default: 0
    }
});

const isShowToolbar = () => {
    // return props.tabIndex === 1 || props.tabIndex === 3
    return false
}

</script>

<style lang="scss" scoped>
.home-container {
    height: 100vh;
    overflow: hidden;
    padding-bottom: env(safe-area-inset-bottom); /* 支持 iOS 底部安全区 */
    padding-bottom: constant(safe-area-inset-bottom); /* 兼容老 WebKit */
    box-sizing: border-box;
}

.home-content-tab {
    margin-bottom: 60px;
    height: calc(100vh - 106px);
    overflow: auto;
    padding-bottom: env(safe-area-inset-bottom);
    padding-bottom: constant(safe-area-inset-bottom);
    box-sizing: border-box;
}

.home-content {
    margin-bottom: 60px;
    height: calc(100vh - 60px);
    overflow: auto;
    padding-bottom: env(safe-area-inset-bottom);
    padding-bottom: constant(safe-area-inset-bottom);
    box-sizing: border-box;
}
</style>

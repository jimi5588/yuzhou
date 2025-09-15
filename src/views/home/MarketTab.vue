<template>
    
    <!-- <van-search v-model="searchValue" :placeholder="t('common_search')" shape="round"
            @update:model-value="search" /> -->
    <div class="top-wrap">
        <van-tabs v-model:active="activeTab" type="card">
            <van-tab :title="t('market_optional')" />
            <van-tab :title="t('market_all')" />
        </van-tabs>
        <van-icon name="search" size="28px" color="#808080" @click="toPage('currency/search')"/>
    </div>
            
    <div class="market-container">
        <!-- 分类标签 -->
        <van-tabs v-model:active="activeTab" type="card" :swipe-threshold="2" v-if="false">
            <van-tab :title="t('market_usdt')" />
        </van-tabs>

        <!-- 币种列表 -->
        <Currency ref="childCurrency" :showOptional="showOptional"></Currency>
    </div>
    <FloatBubble ></FloatBubble>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const router = useRouter();
const store = useStore()
const searchValue = ref('')
const activeTab = ref(1)
const showOptional = computed(() => activeTab.value == 0 ? true : false)
const coins = ref({})
const searchCoins = ref({})
const currencyMap = computed(() => store.state.currencyMap)
// const childCurrency = ref(null)

const search = () => {
    // if(childCurrency.value) {
    //     childCurrency.value.search(searchValue.value)
    // }
}

watch(currencyMap, (newVal, oldVal) => {
    if (newVal.dataType == 'kline') return
    coins.value = newVal
    search()
}, { immediate: true, deep: true })


const contains = (str, search) => {
    return str.toLowerCase().includes(search.toLowerCase());
}

const toTrade = (key) => {
    router.push({
        name: 'trade',
        params: { currencyName: key }
    })
}

const toPage = (path) => {
    router.push("/pages/" + path)
}

</script>

<style lang="scss" scoped>
.market-container {
    // background: var(--bg-sub);
}

.van-search {
    --van-search-background: transparent;
    --van-search-content-background: var(--bg-sub);
    --van-radius-sm: 20px;
}

.top-wrap {
    margin: 16px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.van-tabs {
    flex: 1;
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

:deep(.van-cell-group) {
    padding: 10px 0;
    --van-cell-group-background: transparent;
    --van-cell-background: transparent;
}

.van-cell {
    --van-cell-horizontal-padding: 0px;
    --van-cell-vertical-padding: 0px;
}

.coin-cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin: 8px 15px;
    border-radius: 10px;
    box-shadow: 0 2px 6px 0 rgba(27, 47, 84, .125490);
}

.coin-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.coin-name {
    display: flex;
    flex-direction: column;
    text-align: left;
}

.symbol {
    font-size: 14px;
    font-weight: bold;
}

.name {
    font-size: 14px;
    color: #999;
}

.price-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.price {
    font-size: 16px;
    font-weight: bold;
}

.change {
    font-size: 14px;
}

.up {
    color: #4caf50;
}

.down {
    color: #f44336;
}
</style>

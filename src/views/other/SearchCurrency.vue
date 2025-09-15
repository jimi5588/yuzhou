<template>
    <div class="page-search">
        <div class="top">
            <van-search v-model="searchValue" :placeholder="t('common_search')" shape="round"
                @update:model-value="search" />
            <van-icon name="cross" size="24px" color="#808080" @click="router.back"/>
        </div>
        <van-tabs v-model:active="activeTab" type="card">
            <van-tab :title="t('market_optional')" />
            <van-tab :title="t('market_all')" />
        </van-tabs>
        <Currency ref="childCurrency" :showOptional="showOptional"></Currency>
    </div>

</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n()
const router = useRouter();

const searchValue = ref('')
const childCurrency = ref(null)
const activeTab = ref(1)
const showOptional = computed(() => activeTab.value == 0 ? true : false)

const search = () => {
    if(childCurrency.value) {
        childCurrency.value.search(searchValue.value)
    }
}

</script>

<style lang="scss" scoped>

.page-search {
    min-height: 100vh;
    // background: var(--bg-sub);
    .top {
        padding: 5px 16px 5px 0;
        display: flex;
        align-items: center;
        gap: 5px;

        .van-search {
            flex: 1;
            --van-search-background: transparent;
            --van-search-content-background: var(--bg-sub);
            --van-radius-sm: 20px;
        }
    }
}

.van-tabs {
    margin: 0 16px;
    flex: 1;
    --van-tabs-card-height: 30px;
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


</style>
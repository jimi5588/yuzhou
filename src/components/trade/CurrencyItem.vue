<template>
    <van-cell v-for="(item, key) in currencyMap" :key="key">
        <template #icon>
            <van-image :src="item.icon" width="30" height="30" />
        </template>
        <template #title>
            <div class="coin-info">
                <span class="coin-name">{{ item.title }}</span>
                <van-tag type="primary">{{ item.name }}</van-tag>
            </div>
        </template>
        <template #value>
            <van-button size="small" type="warning" round @click="toTrade(key)">{{ t('common_detail') }}</van-button>
        </template>
        <template #label>
            <span class="price" v-if="item.change === 0">0%</span>
            <span class="price" v-else>{{ item.price }}</span>
            <span :class="{ 'up': item.change > 0, 'down': item.change < 0 }" v-if="item.change !== 0">{{ item.change }}%</span>
        </template>
    </van-cell>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex'

const { t } = useI18n()
const router = useRouter();
const store = useStore()

const currencyMap = computed(() => store.state.currencyMap)

const toTrade = (key) => {
    router.push({
        name: 'trade',
        params: { currencyName: key }
    })
}

</script>

<style lang="scss" scoped>
.van-cell {
    display: flex;
    align-items: center;
    --van-cell-border-color: #eee !important;

    .van-image {
        margin-right: 10px;
    }

    .coin-info {
        display: flex;
        align-items: center;
        gap: 10px;

        .coin-name {
            font-size: 20px;
            font-weight: bold;
        }
        .van-tag {
            background-color: #ff605c;
        }
    }

    .van-button--warning {
        margin: 5px;
        box-shadow: 0 2px 10px 0 rgba(27, 47, 84, .125490);
        background-color: var(--color-theme);
    }

    .van-cell__label span {
        font-size: 16px;
        font-weight: bold;
    }

    .price {
        color: #000;
        margin-right: 10px;
    }

    .up {
        color: #4caf50;
    }

    .down {
        color: #f44336;
    }
}
</style>

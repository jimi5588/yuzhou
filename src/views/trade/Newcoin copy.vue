<template>
    <TopBar  :title="$t('shengou_new')">
            <template #right>
                <span class="iconfont icon-shuaxin" @click="toPage('ncrecords')"> {{$t('shengou_my')}}</span>
            </template>
    </TopBar>
    <List :listRefresh="listRefresh" @load-data="loadData" v-slot:default="slotProps">
          <!-- 列表渲染 -->
          <div class="order-item" v-for="item in list" :key="item.id">
            <div class="item-row">
              <div class="item">
                <span class="item-title">{{ t('trade_opening_price') }}</span>
                <span class="item-value">{{ item.open_price }}</span>
              </div>
              <div class="item">
                <span class="item-title">{{ t('trade_current_price') }}</span>
                <span class="item-value">{{ item.current_price }}</span>
              </div>
            </div>
            <div class="item-row">
              <div class="item">
                <span class="item-title">{{ t('trade_margin') }}</span>
                <span class="item-value">{{ item.margin }}</span>
              </div>
              <div class="item">
                <span class="item-title">{{ t('trade_position_opening_time') }}</span>
                <span class="item-value">{{ item.order_time }}</span>
              </div>
            </div>
          </div>
        </List>
    <FloatBubble ></FloatBubble>

</template>

<script setup>
import OptionOrder from '../../components/trade/OptionOrder.vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { subscription} from '@/api'

const { t } = useI18n()
const store = useStore()
const activeTab = ref(0);
const router = useRouter()

const currencySymbol = computed(() => store.state.currencySymbol)
const currency = computed(() => store.state.currencyMap[currencySymbol.value])
const listRefresh = ref(false)

const loadData = (params, successCallback, errCallback) => {
    listRefresh.value = false
    subscription(params).then(res => {
        successCallback(res.result.data)
        count.value = res.result.count
        if (params.page === 1) {
            list.value = res.result.data
        } else {
            list.value.push(...res.result.data)
        }
    }).catch(err => {
        errCallback(err)
    })
}

const toPage = (path) => {
    router.push("/pages/" + path);
}
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
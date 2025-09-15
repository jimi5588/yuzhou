<template>
    <van-tabs v-if="showType" v-model:active="activeType" color="var(--color-theme)" @click-tab="onTypeChange" :ellipsis="false">
        <van-tab v-for="item in currencyTypes" :title="getTypeText(item)" :name="item"></van-tab>
    </van-tabs>
    <van-row v-if="!isPopupSelect" class="row-title">
        <van-col span="11">
            <div class="header-item" @click="sort('name')">
                {{ $t('currency_name') }}
                <div class="sort-arrows" :class="{ active: sortField === 'name' }" v-if="showSort">
                    <i class="arrow up" :class="{ active: sortField === 'name' && sortDirection === 'asc' }"></i>
                    <i class="arrow down" :class="{ active: sortField === 'name' && sortDirection === 'desc' }"></i>
                </div>
            </div>
        </van-col>
        <van-col span="7">
            <div class="header-item" @click="sort('price')">
                {{ $t('currency_latest_price') }}
                <div class="sort-arrows" :class="{ active: sortField === 'price' }" v-if="showSort">
                    <i class="arrow up" :class="{ active: sortField === 'price' && sortDirection === 'asc' }"></i>
                    <i class="arrow down" :class="{ active: sortField === 'price' && sortDirection === 'desc' }"></i>
                </div>
            </div>
        </van-col>
        <van-col span="6">
            <div class="header-item" @click="sort('change')">
                {{ $t('currency_rise_and_fall') }}
                <div class="sort-arrows" :class="{ active: sortField === 'change' }" v-if="showSort">
                    <i class="arrow up" :class="{ active: sortField === 'change' && sortDirection === 'asc' }"></i>
                    <i class="arrow down" :class="{ active: sortField === 'change' && sortDirection === 'desc' }"></i>
                </div>
            </div>
        </van-col>
    </van-row>

    <!-- 修改币种列表样式 -->
    <van-cell-group v-if="searchTypeCurrencys && searchTypeCurrencys.length > 0">
        <van-cell v-for="(item, key) in searchTypeCurrencys" :key="key" :border="false" :class="{ 'isPopup': isPopupSelect, 'isSelect': isPopupSelect && currencySymbol === item.jiaoyidui.toLowerCase() }" @click="onSelect(item)">
            <template #default>
                <van-row>
                    <van-col :span="isPopupSelect ? '12' : '11'">
                        <div class="coin-info">
                            <div class="coin-icon-name">
                                <img v-if="!showSort" :src="baseUrl + item.image" />
                                <span class="symbol">{{ item.name }}</span>
                            </div>
                            <span v-if="showSort" class="volume">{{ $t('common_volume') }} {{ item.market?.volume }}</span>
                        </div>
                    </van-col>
                    <van-col :span="isPopupSelect ? '12' : '7'">
                        <span class="price close-text" v-if="item.status == -1">---</span>
                        <span class="price" v-else>{{ item.price }}</span>
                    </van-col>
                    <van-col span="6" v-if="!isPopupSelect">
                        <span class="change close-bg" v-if="item.status == -1">{{ t('common_closed') }}</span>
                        <span v-else :class="['change', item.change >= 0 ? 'up' : 'down']">
                            {{ item.change > 0 ? '+' : '-' }}{{ Math.abs(item.change).toFixed(2) }}%
                        </span>
                    </van-col>
                </van-row>
            </template>
        </van-cell>
    </van-cell-group>
    <van-empty v-else :description="$t('common_empty_data')" />
</template>

<script setup>
import { ref, computed, watch, defineExpose } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useKlineSocket } from '@/service/klineSocket';
import { optional } from '@/api'

const { t } = useI18n()
const store = useStore()
const router = useRouter()

const klineSocket = useKlineSocket()
const sortField = ref('')
const sortDirection = ref('asc')

const baseUrl = ref(store.state.baseUrl)
const currencyMap = computed(() => store.state.currencyMap)
const currencyTypes = computed(() => store.state.currencyTypes)
const currencySymbol = computed(() => store.state.currencySymbol)
const activeType = ref('')
const typeCurrencys = ref([])
const searchTypeCurrencys = ref([])
const searchText = ref('')
const searchNum = ref(0)
const showType = ref(true)

const emit = defineEmits(['closePopup']);

const props = defineProps({
    showSort: {
        type: Boolean,
        default: false
    },
    isPopupSelect: {
        type: Boolean,
        default: false
    },
    showOptional: {
        type: Boolean,
        default: false
    },
})

const filterCurrencyType = () => {
    showLoadingToast(t('common_loading'))
    if (!currencyMap.value) return
    typeCurrencys.value = Object.values(currencyMap.value).sort((a, b) => {
        return b.sort - a.sort
    })
    if (showType.value) {
        typeCurrencys.value = typeCurrencys.value.filter(item => item.type === activeType.value)
    }
    if (props.showOptional) {
        typeCurrencys.value = typeCurrencys.value.filter(item => item.optional === true)
    }
    searchTypeCurrencys.value = typeCurrencys.value
    if (searchText.value) {
        searchTypeCurrencys.value = typeCurrencys.value.filter(item => item.name.toLowerCase().includes(searchText.value.toLowerCase()))
    }
}

watch(currencyTypes, (newVal, oldVal) => {
    activeType.value = newVal[0]
    filterCurrencyType()
}, { immediate: true, deep: true });

watch(() => props.showOptional, (newVal, oldVal) => {
    filterCurrencyType()
}, { immediate: true, deep: true });

watch(currencyTypes, (newVal, oldVal) => {
    activeType.value = newVal[0]
    filterCurrencyType()
}, { immediate: true, deep: true });

const onTypeChange = () => {
    filterCurrencyType()
}

const search = (text) => {
    searchText.value = text
    if (searchText.value) {
        searchNum.value = 0
        searchTypeCurrencys.value = typeCurrencys.value.filter(item => item.name.toLowerCase().includes(searchText.value.toLowerCase()))
    } else {      
        searchNum.value = 10
        searchTypeCurrencys.value = typeCurrencys.value
    }
}

// 暴露方法给父组件
defineExpose({ search })

const getTypeText = (type) => {
    if (type === 'Crypto') {
        return t('currency_crypto')
    } else if (type === 'Metals') {
        return t('currency_metals')
    } else if (type === 'Forex') {
        return t('currency_forex')
    } else if (type === 'Energy') {
        return t('currency_energy')
    } else if (type === 'Indexes') {
        return t('currency_indexes')
    }else if (type === 'Stock') {
        return t('currency_stock')
    } else {
        return type
    }
}

const sort = (field) => {
    if (!props.showSort) return
    if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortField.value = field
        sortDirection.value = 'asc'
    }

    typeCurrencys.value.sort((a, b) => {
        const aValue = a[field]
        const bValue = b[field]
        const modifier = sortDirection.value === 'asc' ? 1 : -1

        return aValue > bValue ? modifier : -modifier
    })
}

const onSelect = (item) => {
    if(props.isPopupSelect){
        store.commit("updateCurrencySymbol", item.jiaoyidui.toLowerCase());
        klineSocket.switchKline()
        emit('closePopup', {});
    } else {
        store.commit("updateCurrencySymbol", item.jiaoyidui.toLowerCase());
        router.push('/pages/trade')
    }
}

</script>

<style lang="scss" scoped>
.van-tabs {
    --van-tabs-nav-background: transparent;
    --van-tab-text-color: var(--text-color);
}
.header-item {
    padding: 10px 0;
    color: var(--text-color);
    font-size: 14px;

    position: relative;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;


    .sort-arrows {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-left: 4px;
        opacity: 0.3;

        &.active {
            opacity: 1;
        }
    }

    .arrow {
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;

        &.up {
            border-bottom: 4px solid #666;

            &.active {
                border-bottom-color: #333;
            }
        }

        &.down {
            border-top: 4px solid #666;

            &.active {
                border-top-color: #333;
            }
        }
    }
}

.row-title {
    padding: 0 15px;
    // border-bottom: 1px solid #f0f0f0;
    .van-col {
        .header-item {
            justify-content: flex-start !important;
        }
        &:last-child {
            .header-item {
                justify-content: flex-end !important;
            }
        }
    }
}

// 修改币种单元格样式
.van-cell {
    cursor: pointer;
    .van-col {
        display: flex;
        align-items: center;
        justify-content: center;

        &:first-child {
            text-align: left;
            justify-content: flex-start;
        }
    }
}

.van-row {
    .van-col {
        text-align: left;
        justify-content: flex-start;

        &:last-child {
            text-align: right;
            justify-content: flex-end;
        }
    }
}

.isPopup {
    cursor: pointer;
    --van-cell-line-height: 45px;
}

.isSelect {
    background: #F0F0F0 !important;
}

.coin-info {
    display: flex;
    flex-direction: column;
    gap: 0px;

    .coin-icon-name {
        display: flex;
        align-items: center;

        img {
            width: 36px;
            height: 36px;
            margin-right: 10px;
        }
    }
}

.symbol {
    font-size: 16px;
    font-weight: bold;
    color: var(--text-color);
}

.volume {
    font-size: 12px;
    color: #999;
}

.price {
    font-size: 16px;
    color: var(--text-color);
}

.close-text {
    color: #999
}

.change {
    width: 60px;
    padding: 4px 5px;
    border-radius: 4px;
    font-size: 14px;
    text-align: center;

    &.up {
        background: #00b897;
        color: #fff;
    }

    &.down {
        background: #f44336;
        color: #fff;
    }
}

.close-bg {
    background: #eee;
}

.van-theme-dark {
    .isSelect {
        background: #353535 !important;
    }
}
</style>
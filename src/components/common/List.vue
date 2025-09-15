<template>
    <van-list v-if="list != null && list.length > 0" v-model:loading="loading" :finished="finished"
        :immediate-check="false" finished-text="" :loading-text="t('common_loading')" @load="onLoad">

        <slot :list="list"></slot>

    </van-list>
    <van-empty v-else-if="(list == null || list.length == 0) && !loading"
        style="margin-top: 60px;">
        {{ $t('common_empty_data') }}
        <template #image>          
            <img src="../../assets/images/empty.d67f5618.svg"/>
        </template>
    </van-empty>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const loading = ref(false)
const finished = ref(false)
const pageIndex = ref(1)
const pageSize = ref(20)
const list = ref([])

const props = defineProps({
    listRefresh: {
        type: Boolean,
        default: false
    },
    enableLoadMore: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['load-data']);

watch(() => props.listRefresh, (val) => {
    if (val) onRefresh()
})

const onLoad = () => {
    loading.value = true
    if (pageIndex.value == 1) showLoadingToast('loading')
    let params = { "page": pageIndex.value, "limit": pageSize.value }
    triggerLoadData(params, data => {
        closeToast()
        loading.value = false
        if (data.length < pageSize.value || !props.enableLoadMore) {
            finished.value = true
        } else {
            finished.value = false
        }
        pageIndex.value += 1
        list.value.push(...data)
    }, err => {
        closeToast()
        loading.value = false
        finished.value = true
    })
}

const triggerLoadData = (params, successCallback, errCallback) => {
    emit('load-data', params, successCallback, errCallback);
};

const onRefresh = () => {
    pageIndex.value = 1
    list.value = []
    onLoad()
};

onRefresh()

</script>

<style lang="scss" scoped>

.van-empty {
    :deep(.van-empty__image) {
        width: 192px !important;
        height: 144px !important;
    }
}
</style>
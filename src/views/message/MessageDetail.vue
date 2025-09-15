<template>
    <TopBar title="Detail" />
    <div class="container">
        <p class="title">{{ data?.title }}</p>
        <p class="time">{{ data?.create_time || data?.send_time }}</p>
        <p class="detail" v-html="data?.content"></p>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { getSystemMsgDetail, getAnnounceMsgDetail, articl } from '@/api'
import { closeToast, showFailToast, showLoadingToast } from 'vant'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const type = ref(route.query.type || 1)
const id = ref(route.query.id || 0)
const data = ref({})

onMounted(() => {
    showLoadingToast(t('common_loading'))
    let obj = null
    if(type.value == 1) {
        obj = getSystemMsgDetail(id.value)
    }else if(type.value == 2){
        obj = getAnnounceMsgDetail(id.value)
    }else{
        obj = articl(id.value)
    }
    obj.then(res => {
        closeToast()
        data.value = res.result.data
    }).catch(err => {
        showFailToast(err.message)
    })
})

</script>

<style lang="scss" scoped>

.container {
    min-height: calc(100vh - 60px);
    overflow-y: auto;
}

.title {
    margin: 20px 20px 0;
    font-size: 20px;
    font-weight: bold;
}

.time {
    margin: 10px 20px 0;
    font-size: 13px;
}

.detail {
    margin: 30px 20px;
    :deep(img) {
        width: 100%;
        max-width: 100%;
        height: auto;
    }

    :deep(*) {
        white-space: pre-wrap;  /* 保留空白符，同时允许换行 */
        word-wrap: break-word;  /* 允许长单词或 URL 换行 */
        overflow-wrap: break-word;  /* 更现代的属性，效果与 word-wrap 相同 */
    }
}
</style>
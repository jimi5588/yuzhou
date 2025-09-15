<template>
    <div class="signal-channel">
        <TopBar :title="$t('welfarecenter')"  />
        <div class="find-container" v-html="findHtml"></div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n';
import { getFindHtml } from '@/api';

const { t } = useI18n()
const findHtml = ref(null)

const getFindData = () => {
    showLoadingToast(t('common_loading'))
    getFindHtml().then(res => {
        closeToast()
        findHtml.value = res.data
    }).catch(err => {
        closeToast()
    })
}

getFindData()

</script>

<style lang="scss" scoped>
.find-container {
    padding: 10px 10px 0;

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

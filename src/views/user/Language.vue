<template>  
    <div class="content">
        <van-icon name="cross" size="24px" @click="router.back"/>
        <div class="title">{{t('select_language') }}</div>
        <van-cell v-for="item in langList" :title="item.text" @click="select(item)" :class="lang === item.value ? 'selected' : 'normal'">
            <template #right-icon>
                <van-icon name="success" size="24px" color="#07c160" v-if="lang === item.value"/>
            </template>
        </van-cell>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t, locale } = useI18n()
const router = useRouter()
const lang = ref(localStorage.getItem('language') || "en")
const langList = ref([
    { text: "English", value: "en" },
    { text: "Español", value: "es" },
    { text: "Français", value: "fr" },
    { text: "Deutsch", value: "de" },  
    { text: "日本語", value: "ja" },
    { text: "한국인", value: "ko" },
    { text: "Tiếng Việt", value: "vi" },
    { text: "简体中文", value: "zh" },

]);

const select = (item) => {
    localStorage.setItem('language', item.value)
    locale.value = item.value
    lang.value = item.value
    router.back()
}

</script>

<style lang="scss" scoped>

.content {
    min-height: 100vh;
    background: var(--bg-sub);
    display: flex;
    flex-direction: column;
    align-items: center;

    .van-icon-cross {
        align-self: flex-end;
        margin: 15px 15px 0 0;
    }

    .title {
        margin: 10px 15px 15px;
        font-size: 19px;
    }

    .van-cell {
        align-items: center;
        --van-cell-line-height: 44px;
        
        :deep(.van-cell__title span) {
            font-size: 19px;
        }

        &.selected {
            background-color: #f2f6ff;
        }
    }
}

.van-theme-dark {
    .van-cell.selected {
        background-color: #333;
    }
}

</style>
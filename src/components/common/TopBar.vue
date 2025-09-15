<template>
    <van-nav-bar>
        <template #left>
            <slot name="left">
                <van-icon name="down" size="24" :color="isDark? '#FFF' : '#000'" @click="onBack" />
            </slot>
                <!-- 返回主页按钮 -->
            <van-icon
                name="wap-home-o"
                size="24"
                class="ml-2"
                :color="isDark ? '#FFF' : '#000'"
                @click="goHome"
            />
        </template>
        <template #title>
            <slot name="title">
                <span>{{ props.title }}</span>
            </slot>
        </template>
        <template #right>
            <slot name="right">
                <span v-if="showLanguage" @click="showLanguagePopup = true">{{ languageText }}</span>
            </slot>
        </template>
    </van-nav-bar>

    <van-popup v-model:show="showLanguagePopup" position="right" :style="{ width: '240px', height: '100%' }" >
        <van-cell-group>
            <van-cell v-for="(item, index) in languages" :key="index" :title="item.name" @click="selectLanguage(item)"></van-cell>
        </van-cell-group>
    </van-popup>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const { t, locale } = useI18n()
const store = useStore()
const router = useRouter()
const isDark = computed(() => store.state.theme === "dark")
const languageText = computed(() => getLanguageText())
const showLanguagePopup = ref(false)

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    showLanguage: {
        type: Boolean,
        default: false
    },
});
const goHome = () => {
    router.push({ path: '/' }) // 根据你的路由配置调整路径
}
const languages = ref([
    { name: 'English', value: 'en' },
    { name: '简体中文', value: 'zh' },
    { name: '日本語', value: 'ja' },
    { name: '한국인', value: 'ko' },
    { name: 'แบบไทย', value: 'ta' },
    { name: 'Melayu', value: 'ma' },
])

const selectLanguage = (item) => {
    showLanguagePopup.value = false
    localStorage.setItem('language', item.value)
    locale.value = item.value;
}

const getLanguageText = () => {
    return languages.value.find(item => item.value == locale.value)?.name || 'English'
}

const onBack = () => {
    router.back();
}

</script>

<style lang="scss" scoped>
.van-nav-bar {
    --van-nav-bar-background: transparent;
    --van-nav-bar-icon-color: var(--text-color);
    --van-border-width: 0;
    box-shadow: 0 0 7px 0 rgba(0, 0, 0, .1);

    :deep(.van-icon-down) {
        transform: rotate(90deg);
    }
}

.van-popup {
    :deep(.van-cell__title) {
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }
}

.van-popup--right {
    right: calc((100% - 450px) / 2) !important;
}

.ml-2 {
    margin-left: 8px;
}
</style>

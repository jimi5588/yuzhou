<template>
    <div class="kefu-page">
        <TopBar :title="t('user_kefu_title1')" />
        <div class="kefu-bg"></div>

        <!-- 动态生成客服按钮 -->
        <van-cell 
            v-for="(item, index) in kefus" 
            :key="index" 
            :title="item.name"
            is-link 
            @click="openUrl(item.url, item.type)"
            class="kefu-cell">
            <template #icon>
                <img 
                    :src="baseUrl + item.image" 
                    class="custom-icon"/>
            </template>
        </van-cell>


        <!-- 全屏 iframe 客服弹窗 -->
        <van-popup 
            v-model:show="showIframe" 
            :style="{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, width: '100%' }"
            position="bottom" 
            :overlay="true"
            :close-on-click-overlay="false"
            round="false"
        >
            <div class="iframe-wrapper">
                <!-- 顶部标题栏 -->

                <!-- iframe -->
                <iframe 
                    :src="iframeUrl" 
                    class="iframe-box" 
                    allow="clipboard-write"
                    allowfullscreen
                    frameborder="0">
                </iframe>
            </div>
        </van-popup>
    </div>
</template>

<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { customerservice } from '@/api';

const { t } = useI18n();
const store = useStore();
const isDark = computed(() => store.state.theme === "dark");
const baseUrl = computed(() => store.state.baseUrl);

const kefus = ref([]);

const showIframe = ref(false);
const iframeUrl = ref('');

onBeforeMount(() => {
    showLoadingToast(t('common_loading'));
    customerservice().then(res => {
        closeToast();
        kefus.value = res.result.data;
    }).catch(err => {
        showFailToast(err.message);
    });
});

const openUrl = (url, type = '') => {
    if (type === 'online') {
        iframeUrl.value = url;
        showIframe.value = true;
    } else {
        window.open(url, '_blank');
    }
};
</script>

<style lang="scss" scoped>
.kefu-page {
    min-height: 100vh;
}

.kefu-bg {
    background: url(../../assets/images/kefubgimage.png) 50% no-repeat;
    background-size: 60% 60%;
    background-position: 50%;
    height: 325px;
}

.kefu-cell {
    margin: 10px 20px;
    width: calc(100% - 40px);
    border-radius: 10px;
    align-items: center;
    display: flex;
}

.custom-icon {
    width: 30px;
    height: 30px;
    margin-right: 8px;
}

.iframe-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #fff;
}

.iframe-box {
    flex: 1;
    width: 100%;
    border: none;
}
</style>

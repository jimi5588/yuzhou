<template>
    <div class="page">
        <TopBar :title="t('appdownload_title')"></TopBar>
        <div class="page-content">
            <div class="top">
                <span class="title">{{ t('appdownload_top_title') }}</span>
                <span class="desc">{{ t('appdownload_top_desc') }}</span>
            </div>
            <div class="item">
                <span class="item-title">{{ t('appdownload_item1_title') }}</span>
                <span class="item-desc">{{ t('appdownload_item1_desc') }}</span>
                <img src="../../assets/images/img_1.png" />
            </div>
            <div class="item">
                <span class="item-title">{{ t('appdownload_item2_title') }}</span>
                <span class="item-desc">{{ t('appdownload_item2_desc') }}</span>
                <img src="../../assets/images/img_2.png" />
            </div>
            <div class="item">
                <span class="item-title">{{ t('appdownload_item3_title') }}</span>
                <span class="item-desc">{{ t('appdownload_item3_desc') }}</span>
                <img src="../../assets/images/img_3.png" />
            </div>
        </div>
        <div class="bottom-btn">
            <div class="android" @click="openUrl(androidUrl)">
                <img src="../../assets/images/android.svg">
                <span>{{ t('common_download') }}</span>
            </div>
            <div class="ios" @click="openUrl(iosUrl)">
                <img src="../../assets/images/ios.svg">
                <span>{{ t('common_download') }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import TopBar from '@/components/common/TopBar.vue';
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const androidUrl = ref("https://traderslwl.s3.ap-south-1.amazonaws.com/apps/dia.apk")

const iosUrl = ref("https://apps.apple.com/sg/app/bowxopc/id6742078425")

const openUrl = (url) => {
    window.open(url, '_blank');
}

</script>

<style lang="scss" scoped>
.page {
    overflow: hidden;
    background: #fff;
}

:deep(.van-nav-bar) {
    .van-icon {
        color: #333 !important;
    }
    span {
        color: #333 !important;
    }
}
.page-content {
    padding-bottom: 80px;
    height: calc(100vh - 120px);
    overflow: auto;

    .top {
        background: url(../../assets/images/bg_1.png) no-repeat 50% / 100%;
        overflow: hidden;
        padding: 20px;
        min-height: 150px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-right: 150px;
        color: #fff;

        .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .desc {
            font-size: 13px;
        }
    }

    .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 20px;
        gap: 20px;

        .item-title {
            font-size: 17px;
            font-weight: 500;
            margin-top: 20px;
            color: #333;
        }

        .item-desc {
            font-size: 12px;
            font-weight: 500;
            color: #333;
        }

        img {
            width: 208px;
            height: 208px;
            max-width: 208px;
        }
    }
}

.bottom-btn {
    position: fixed;
    max-width: 450px;
    width: 100%;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    background: #fff;

    .android {
        flex: 1;
        margin: 15px;
        height: 40px;
        background: var(--color-theme);
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        color: #fff;
        cursor: pointer;
    }

    .ios {
        flex: 1;
        margin: 15px;
        margin-left: 0;
        height: 40px;
        border: 1px solid var(--color-theme);
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        color: #333;
        cursor: pointer;
    }
}
</style>

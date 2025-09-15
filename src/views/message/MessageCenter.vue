<template>
    <TopBar :title="t('message_center_title')" />
    <div class="container">
        <van-cell :title="t('message_customer_service')" is-link @click="toKefu">
            <template #icon>
                <div class="icon-container">
                    <img src="../../assets/images/icon_msg_kefu.svg" />
                </div>
            </template>
        </van-cell>
        <van-cell :title="t('message_system')" is-link @click="toMessageList(1)">
            <template #icon>
                <div class="icon-container">
                    <img src="../../assets/images/icon_msg_system.svg" />
                </div>
            </template>
        </van-cell>
        <van-cell :title="t('message_platform_announcement')" :label="t('message_detail')" is-link @click="toMessageList(2)">
            <template #icon>
                <div class="icon-container">
                    <img src="../../assets/images/icon_msg_bulletin.svg" />
                </div>
            </template>
        </van-cell>
    </div>

</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const toKefu = () => {
    router.push("/pages/user/kefu");
};

const toMessageList = (type) => {
    router.push({
        path: "/pages/message/notifyrecords",
        query: { type: type }
    });
};

</script>

<style lang="scss" scoped>

.container {
    padding-top: 15px;
}

.van-cell {
    align-items: center;
    --van-cell-background: transparent;

    .icon-container {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #003FE6;
        margin-right: 10px;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
            width: 26px;
            height: 26px;
        }
    }
}
</style>

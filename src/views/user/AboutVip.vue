<template>
    <TopBar :title="vipInfo.title"></TopBar>
    <div class="content" v-html="vipInfo.content"></div>
    <!-- <div class="content">
        <p class="desc">When the accumulated stored value reaches a certain amount, the VIP level will be automatically upgraded. After the VIP level is upgraded, the corresponding part of the funds will be given according to the VIP level according to the amount of each stored value.</p>

        <p>Accumulated stored value VIP level Gift ratio</p>
        <van-row v-for="item in vips">
            <van-col span="4">{{ item.amount }}</van-col>
            <van-col span="4">USDT</van-col>
            <van-col span="4">{{ item.level }}</van-col>
            <van-col span="4">{{ item.giftRatio }}</van-col>
        </van-row>
    </div> -->
</template>

<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { viplevelinfo } from '@/api';

const { t } = useI18n();
const vipInfo = ref({});

onBeforeMount(() => {
    showLoadingToast(t('common_loading'));
    viplevelinfo().then((res) => {
        closeToast();
        vipInfo.value = res.data;
    }).catch((err) => {
        showFailToast(err.message);
    });
});

const vips = ref([
    { level: 'VIP1', amount: 3888, giftRatio: '1.00%' },
    { level: 'VIP2', amount: 8888, giftRatio: '3.00%' },
    { level: 'VIP3', amount: 18888, giftRatio: '5.00%' },
    { level: 'VIP4', amount: 38888, giftRatio: '7.00%' },
    { level: 'VIP5', amount: 88888, giftRatio: '10.00%' },
    { level: 'VIP5', amount: 188888, giftRatio: '13.00%' },
    { level: 'VIP5', amount: 388888, giftRatio: '17.00%' },
    { level: 'VIP5', amount: 588888, giftRatio: '21.00%' },
    { level: 'VIP5', amount: 888888, giftRatio: '25.00%' },
]);
</script>

<style lang="scss" scoped>
.content {
    padding: 16px;
    p.desc {
        margin-bottom: 20px;
    }
}
</style>
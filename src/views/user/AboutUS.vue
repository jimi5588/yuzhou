
<template>
    <TopBar ></TopBar>
    <div class="content">
        <p class="title">{{t('about') }}</p>
        <p v-html="about.content"></p>
        <!-- <p>LHEX is a decentralised financial exchange using high performance block transaction aggregation technology. The platform is operated by a team of professionals with extensive experience in the financial industry and blockchain technology. lHEX currently has 18 million users in over 170 countries worldwide, which is a significant milestone. We are becoming the platform of choice for new and existing investors.</p>
        <p><br/></p>
        <p>LHEX operates in every continent and jurisdiction and is regulated by some of the most prominent jurisdictions, either directly or through subsidiaries.LHEX also provides localised language support for investors from different countries to help make it easier for them to trade.LHEX's exchange is a high performance trading engine, developed by developers with banking expertise, capable of completing 1.6 million transactions per second, providing ground-breaking efficiency and performance. User security is paramount to LHEX and our servers are independently hosted in multiple countries to ensure optimal data integrity and security.</p> -->
    </div>
</template>

<script setup>
import TopBar from '../../components/common/TopBar.vue';
import { onBeforeMount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { aboutme } from '@/api';

const { t } = useI18n();
const about = ref({});

onBeforeMount(() => {
    showLoadingToast(t('common_loading'));
    aboutme().then((res) => {
        closeToast();
        about.value = res.result.data;
    }).catch((err) => {
        showFailToast(err.message);
    });
});

</script>

<style lang="scss" scoped>
.content {
    padding: 16px;
    p.title {
        font-size: 17px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
    }
}
</style>

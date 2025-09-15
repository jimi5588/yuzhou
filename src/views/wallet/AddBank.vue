<template>
    <TopBar :title="t('bank_withdrawal')"></TopBar>
    <div class="content">
        <AddBankCard></AddBankCard>
    </div>
</template>

<script setup>
import TopBar from '../../components/common/TopBar.vue';
import AddBankCard from '../../components/trade/AddBankCard.vue';
import { ref } from 'vue'
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

</script>

<style lang="scss" scoped>
.content {
    padding: 16px;
}
 

</style>
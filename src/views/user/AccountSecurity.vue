<template>
    <div class="account-security">
        <van-cell-group :border="true">
            <TopBar :title="t('user_account_security')" />
            <van-cell :title="t('user_modify_login_password')" is-link @click="changePassword" />
            <van-cell :title="t('withdraw_password_modify_title')" is-link @click="toPage('user/setPayPassword')" />
        </van-cell-group>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();

const changePassword = () => {
    router.push({
        path: '/pages/user/findpassword',
        query: { type: 1 }
    })
}

const toPage = (path) => {
    router.push("/pages/" + path);
}

</script>

<style lang="scss" scoped>
.account-security {
    min-height: 100vh;
}

.van-cell {
    --van-cell-line-height: 40px;
    --van-cell-border-color: #999;
}
</style>

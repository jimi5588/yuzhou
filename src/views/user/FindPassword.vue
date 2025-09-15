<template>

    <TopBar :title="t('user_modify_login_password')"></TopBar>

    <van-form :validate-first="true" :show-error-message="false" @submit="onSubmit" @failed="onFailed">

        <van-field v-model="formData.oldPassword" :type="passwordType" name="old_password" :label="t('user_oldpassword')"
            :placeholder="$t('user_old_password')"
            @click-right-icon="passwordType === 'password' ? passwordType = 'text' : passwordType = 'password'"
            :rules="[{ required: true, message: $t('toast_input_old_password') }]">
            <template #right-icon>
                <van-icon :name="passwordType === 'password' ? 'eye-o' : 'closed-eye'" />
            </template>
        </van-field>

        <van-field v-model="formData.newPassword" :type="newPasswordType" name="new_password" :label="t('user_new_login_password')"
            :placeholder="$t('user_new_password')"
            @click-right-icon="newPasswordType === 'password' ? newPasswordType = 'text' : newPasswordType = 'password'"
            :rules="[{ required: true, message: $t('toast_input_new_password') }]">
            <template #right-icon>
                <van-icon :name="newPasswordType === 'password' ? 'eye-o' : 'closed-eye'" />
            </template>
        </van-field>

        <van-field v-model="formData.confirmPassword" :type="confirmPasswordType" :label="t('user_confirm_new_password')"
            :placeholder="$t('user_repeat_newpassword')"
            @click-right-icon="confirmPasswordType === 'password' ? confirmPasswordType = 'text' : confirmPasswordType = 'password'"
            :rules="[{ required: true, message: $t('toast_input_repeat_password') }]">
            <template #right-icon>
                <van-icon :name="confirmPasswordType === 'password' ? 'eye-o' : 'closed-eye'" />
            </template>
        </van-field>

        <van-button block type="primary" native-type="submit">
            {{ t('common_ok') }}
        </van-button>

    </van-form>

</template>

<script setup>
import TopBar from '@/components/common/TopBar.vue';
import { useI18n } from 'vue-i18n';
import { onBeforeMount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { updatepassword } from '@/api';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const passwordType = ref('password');
const newPasswordType = ref('password');
const confirmPasswordType = ref('password');
const passwordVisible = ref(false);
const confirmPasswordVisible = ref(false);

const formData = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
});


const onFailed = (errorInfo) => {
    showFailToast(errorInfo.errors[0].message);
};

const onSubmit = (values) => {
    if(formData.value.newPassword !== formData.value.confirmPassword) {
        showFailToast(t('toast_input_repeat_password_nosame'));
        return;
    }
    showLoadingToast(t('common_loading'));
    updatepassword(values).then((res) => {
        showSuccessToast(t('common_modify_success'));
        if(localStorage.getItem("password")){
            localStorage.setItem("password", formData.value.newPassword);
        }  
        router.back();
    }).catch(err => {
        showFailToast(err.message);
    });
};

</script>

<style lang="scss" scoped>
.van-form {
    margin: 16px;
    --van-cell-background: transparent;

    .van-cell {
        flex-direction: column;
        padding: 0 !important;
        margin-bottom: 20px;
        :deep(.van-field__label) {
            width: 80%;
            label {
                font-weight: bold;
            }
        }
        :deep(.van-field__value){
            background: rgba(0, 0, 0, .05);
            line-height: 52px;
            padding: 0 16px;
            margin-top: 10px;
            border-radius: 6px;
        }
        :deep(.van-field__right-icon .van-icon) {
            font-size: 24px;
            color: var(--text-color)
        }
    }
}

.van-button--primary {
    margin-top: 30px;
    height: 50px !important;
    background-image: linear-gradient(180deg, #00c6fb 0, #005bea);

    span {
        font-size: 19px;
    }
}

.van-theme-dark {
  .van-field :deep(.van-field__value){
    background: #454545;
  }
}

</style>

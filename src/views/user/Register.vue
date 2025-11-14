<template>
  <div class="register-page">
    <TopBar :showLanguage="false">
      <template #left>
        <div class="language" @click="toPage('language')">
          <Icon name="earth" />
        </div>
      </template>
      <template #right>
        <Icon name="kefu" @click="toPage('user/kefu')" />
      </template>
    </TopBar>

    <div class="logo-container">
      <img src="../../assets/images/tsfxo-logo.svg" alt="dia" class="logo">
    </div>
    
    <div class="logo-container">
      {{ $t('welcome_title') }}
    </div>

    <van-form :validate-first="true" :show-error-message="false" @submit="onSubmit" @failed="onFailed">
      <van-field v-model="formData.username" name="username" :placeholder="t('user_email')" clearable
        :rules="[{ required: true, message: $t('toast_input_email') }]">
        <template #left-icon>
          <img src="../../assets/images/icon_email.png" />
        </template>
      </van-field>

      <van-field v-model="formData.password" type="password" name="password" :placeholder="t('user_password')"
        clearable :rules="[{ required: true, message: $t('toast_input_password') }]">
        <template #left-icon>
          <img src="../../assets/images/icon_password.png" />
        </template>
      </van-field>

      <van-field v-model="formData.confirmPassword" type="password" name="confirmPassword" :placeholder="t('user_repeat_password')"
        clearable :rules="[{ required: true, message: $t('toast_input_password') }]">
        <template #left-icon>
          <img src="../../assets/images/icon_password.png" />
        </template>
      </van-field>
      <div class="footer" style="text-align: center;
        margin: 10px 0;
        font-size: 14px;
        color: #666;">
        <p><span class="sign-up" @click="toPage('user/agreement')"  style="color: var(--color-theme); font-weight: normal;"><< {{ $t('tiaokuan') }} >></span>
        </p>
      </div>
      <div class="submit-btn">
        <van-button block type="primary" native-type="submit">
          {{ $t('user_sign_up') }}
        </van-button>
      </div>

      <div class="footer">
        <p>{{ $t('register_have_account') }} <span class="sign-up" @click="goToLogin">{{ $t('user_sign_in') }}</span>
        </p>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { onBeforeMount, ref, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { userRegister,articl } from '@/api';

const { t } = useI18n();
const store = useStore();
const route = useRoute();
const router = useRouter();

const isNeedCheckCode = ref(false);
const formData = ref({
  username: '',
  password: '',
  moneypassword: '',
  invite_code: '',
  nickname: ''
});

const sendBtnDisabled = ref(false); // 控制按钮是否禁用
const sendBtnText = ref(t('common_send')); // 按钮的文本
const timer = ref(null)
const showPlaceholder = ref(true); // 控制是否显示 "0用户手机号"


onBeforeMount(() => {
  if (route.query?.refcode) {
    formData.value.invite_code = route.query.refcode
  }
})

const toPage = (path) => {
  router.push("/pages/" + path);
}

const goToLogin = () => {
  console.log('🚀 正在跳转到 login 页面'); 
  router.push('/pages/login');
}

const onFailed = (errorInfo) => {
  showFailToast(errorInfo.errors[0].message);
}


const onSubmit = (values) => {
    userRegister(values).then(res => {
    if (res.status === 200) {
      showSuccessToast(res.message || t('common_success'));
      goToLogin();
    } else {
      showFailToast(res.message || 'register fail');
    }
  }).catch(err => {
    showFailToast(err.message);
  });
}

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
})

</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--bg-main);
}

:deep(.van-nav-bar) {
  margin: 10px;
  box-shadow: none;
  .language {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 5px;
  }
}

.logo-container {
  text-align: center;
  margin: 20px 0;

  .logo {
    width: 200px;
    height: auto;
  }
}

.van-form {
  flex: 1;
  background: var(--bg-sub);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 40px 20px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, .08);
  margin-top: 30px;

  .van-cell {
    --van-cell-background: transparent;
    --van-cell-border-color: #c3c3c3;
    --van-cell-line-height: 36px;
    --van-field-placeholder-text-color: #999;
    // padding: 8px 0;
  }

  :deep(.van-field__left-icon) {
    display: flex;
    align-items: center;
    margin-right: 8px;

    img {
      width: 25px;
      height: 25px;
    }
  }

  .send-code-btn {
    font-size: 14px;
    color: var(--color-theme);
    border: none;
    background: transparent;
    padding: 5px 10px;
    cursor: pointer;
  }

  .submit-btn {
    margin-top: 25px;

    .van-button {
      font-size: 16px;
      border-radius: 8px;
      padding: 12px;
    }
  }

  .footer {
    text-align: center;
    margin: 20px 0;
    font-size: 14px;
    color: #666;
  }

  .sign-up {
    color: var(--color-theme);
    font-weight: bold;
    cursor: pointer;
  }
}

</style>

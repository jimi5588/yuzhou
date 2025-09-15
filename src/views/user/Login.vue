<template>
  <div class="login-page">
    <div class="logo-container" style="color: aliceblue;margin-top: 130px;">
        -
      </div>
    <van-form :validate-first="true" :show-error-message="false" @submit="onSubmit" @failed="onFailed">
      <div class="logo-title" style="color: black;font-size: 13px;">
        {{ $t('welcome_title') }}
      </div>
      <TopBar :showLanguage="false">
      <template #left>
          <div class="language" @click="toPage('language')">
            <Icon name="earth" />
          </div>
        </template>
        <template #right>
          <Icon name="kefu" @click="toPage('user/kefu')"/>
        </template>
      </TopBar>
      <van-field v-model="formData.userName" name="userName" :placeholder="$t('user_email')" clearable
        :rules="[{ required: true, message: $t('toast_input_email') }]">
        <template #left-icon>
          <img src="../../assets/images/icon_email.png" />
        </template>
      </van-field>

      <van-field v-model="formData.password" :type="passwordType" name="password" :placeholder="$t('user_password')"
        @click-right-icon="toggleEyeVisible" :rules="[{ required: true, message: $t('toast_input_password') }]">
        <template #left-icon>
          <img src="../../assets/images/icon_password.png" />
        </template>
        <template #right-icon v-if="formData.password?.length > 0">
          <van-icon :name="passwordVisible ? 'eye-o' : 'closed-eye'" />
        </template>
      </van-field>

      <div class="forget-password">
        <van-checkbox v-model="savePassword" shape="square" checked-color="var(--color-theme)">{{
          $t('user_remember_password')
        }}</van-checkbox>
        <span @click="onForgetPassword">{{ $t('user_forget_password') }}</span>
      </div>

      <div class="submit-btn">
        <van-button block type="primary" native-type="submit">
          {{ $t('user_sign_in') }}
        </van-button>
      </div>

      <div class="signup-link">
        <p>{{ $t('login_no_account') }} <span class="sign-up" @click="goToRegister">{{ $t('user_sign_up') }}</span></p>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { userLogin } from '@/api';
import { useStore } from 'vuex';

const store = useStore();
const router = useRouter();

const savePassword = ref(false)

const formData = ref({
  userName: localStorage.getItem("userName") || '',
  password: localStorage.getItem("password") || '',
  type: 'username',
});
const passwordType = ref('password');
const passwordVisible = ref(false);

const toggleEyeVisible = () => {
  passwordVisible.value = !passwordVisible.value;
  passwordType.value = passwordVisible.value ? 'text' : 'password';
}


const toPage = (path) => {
    router.push("/pages/" + path);
}

const goToRegister = () => {
  router.push('/pages/user/register');
}

const onForgetPassword = () => {
  router.push('/pages/user/findpassword');
}

const onFailed = (errorInfo) => {
  showFailToast(errorInfo.errors[0].message);
}

const onSubmit = (values) => {
  values.userName = values.userName.trim()
  values.type = formData.value.type; 
  userLogin(values).then(res => {
    localStorage.setItem("token", res.data.token)
    localStorage.setItem("userId", res.data.user.id)
    //localStorage.setItem("topProxyId", res.data.user.topProxyId)
    localStorage.setItem("userName", values["userName"])
    localStorage.setItem("password", savePassword.value ? values["password"] : '')
    store.commit('updateUser', res.data.user)
    router.push('/');
  }).catch(err => {
    showFailToast(err.message);
  })
}

</script>

<style lang="scss" scoped>
.login-page {
  //width: 100vw; /* 横向铺满整个屏幕 */
  min-height: 100vh; /* 高度铺满屏幕 */
  display: flex;
  flex-direction: column;
  background-image: url('/src/assets/images/loginbg.png'); /* 背景图片路径 */
  background-size: 100% auto; /* 宽度100%，高度自适应 */
  background-position: top center; /* 居中显示顶部 */
  background-repeat: no-repeat; /* 不重复 */
}

:deep(.van-nav-bar) {
  margin: 10px;
  box-shadow: none;
  .language {
    display: flex;
    align-items: center;
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
.logo-title {
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
  padding: 10px 20px 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  margin-top: 30px;
  
  // @media (max-width: 375px) {
  //   padding: 30px 15px;
  //   margin-top: 20px;
  // }

  .van-cell {
    --van-cell-background: transparent;
    --van-cell-border-color: #c3c3c3;
    --van-cell-line-height: 44px;
    --van-field-placeholder-text-color: #{rgba(var(--text-color-rgb), 0.6)};
    border-radius: 8px;
    transition: all 0.3s ease;

    &:focus-within {
      border-color: var(--color-theme);
      box-shadow: 0 2px 8px rgba(var(--color-theme-rgb), 0.15);
    }

    :deep(.van-field__left-icon) {
      display: flex;
      align-items: center;
      margin-right: 10px;

      img {
        width: 25px;
        height: 25px;
      }
    }
  }

  .forget-password {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }

  .van-checkbox {
    margin: 20px;
  }

  .submit-btn {
    margin-top: 40px;
    
    .van-button {
      height: 50px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      //background: linear-gradient(45deg, var(--color-theme), var(--color-theme-light));
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:active {
        transform: scale(0.98);
      }
      
      &:hover {
        box-shadow: 0 4px 12px rgba(var(--color-theme-rgb), 0.3);
      }
    }
  }
}

.signup-link {
  text-align: center;
  margin: 30px 0;
}

.sign-up {
  color: var(--color-theme);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:active {
    opacity: 0.6;
  }
}
</style>

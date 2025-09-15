<template>
  <TopBar :title="t('auth_title')" />

  <div class="authed" v-if="localUser.realauth_status == 1">
    <p>{{ t('auth_authed') }}</p>
  </div>

  <div class="content" v-else>
    <h3>{{ t('auth_basic_auth') }}</h3>
    <van-field v-model="phone" :label="t('renzheng_phone')" />

    <van-button class="submit-btn" block type="primary" @click="submit">
      {{ t('auth_submit') }}
    </van-button>
  </div>

  <van-popup v-model:show="showIDType" destroy-on-close round position="bottom">
    <van-picker :columns="idTypes" @cancel="showIDType = false" @confirm="onSelectIDType" />
  </van-popup>
</template>

<script setup>
import TopBar from '../../components/common/TopBar.vue';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { authverify, getUserInfo } from '@/api';
import { showLoadingToast, showSuccessToast, showFailToast } from 'vant';

const { t } = useI18n();
const store = useStore();
const router = useRouter();

const localUser = ref({ realauth_status: null });

onMounted(async () => {
  try {
    const res = await getUserInfo();
    store.commit('updateUser', res.result);
    localUser.value = res.result;
  } catch (err) {
    console.error('Failed to get user info:', err);
  }
});

const phone = ref('');
const showIDType = ref(false);

const onSelectIDType = ({ selectedOptions }) => {
  idType.value = selectedOptions[0];
  showIDType.value = false;
};


const submit = async () => {
  if (!phone.value) return showFailToast(t('auth_error_name'));
  const authType = 1;
  const params = {
    phone: phone.value,
  }
  showLoadingToast(t('common_loading'))
  authverify(authType,params).then(res => {
      showSuccessToast(t('common_success'))
      router.back()
  }).catch(err => {
      showFailToast(t('system_error_try_again'))
  })

};
</script>


<style lang="scss" scoped>

.authed {
    min-height: calc(100vh - 100px);
    display: flex;
    justify-content: center;
    align-items: center;
    p {
        font-size: 20px;
    }
}
.content {
    margin: 16px;
    padding: 16px;
    background: var(--bg-sub);
    border-radius: 10px;
}

.van-cell {
    flex-direction: column;
    padding: 0 !important;

    :deep(.van-field__label) {
        width: 80%;
        margin-top: 15px;

        label {
            font-size: 16px;
        }
    }

    :deep(.van-field__value) {
        line-height: 42px;
        border-bottom: 1px solid #c3c3c3;

        input {
            font-size: 19px;
        }
    }
}

.submit-btn {
  margin-top: 20px;
}

.van-row {
    margin: 20px 0;

    .van-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;

        .van-uploader {
            border: 1px solid rgba(51, 51, 51, .09);
            --van-uploader-upload-background: transparent;
            --van-uploader-icon-color: var(--text-color);
            --van-uploader-icon-size: 30px
        }

        span {
            text-align: center;
        }
    }
}

.van-theme-dark {
  .van-uploader {
    border: 1px solid #666 !important;
  }
}
</style>

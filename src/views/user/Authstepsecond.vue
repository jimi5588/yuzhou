<template>
    <TopBar :title="t('auth_title')" />
    
    <div class="authed" v-if="localUser.certification_status == 1">
      <p>{{ t('auth_authed') }}</p>
    </div>
    
    <div class="content" v-else>
      <h3>{{ t('auth_basic_auth') }}</h3>
  
      <van-field v-model="idType.text" :label="t('auth_id_type')" readonly @click="showIDType = true" />
      <van-field v-model="name" :label="t('auth_name')" />
      <van-field v-model="idNumber" :label="t('auth_id_number')" />
      <van-row>
        <van-col span="12">
          <van-uploader v-model="frontFiles" upload-icon="plus" preview-size="144px" max-count="1" :after-read="file => handleUpload(file, 'front')" />
          <span>{{ t('auth_upload_front') }}</span>
        </van-col>
        <van-col span="12">
          <van-uploader v-model="backFiles" upload-icon="plus" preview-size="144px" max-count="1" :after-read="file => handleUpload(file, 'back')" />
          <span>{{ t('auth_upload_back') }}</span>
        </van-col>
      </van-row>
  
      <van-button block type="primary" @click="submit">{{ t('auth_submit') }}</van-button>
    </div>
  
    <van-popup v-model:show="showIDType" destroy-on-close round position="bottom">
      <van-picker :columns="idTypes" @cancel="showIDType = false" @confirm="onSelectIDType" />
    </van-popup>
  </template>
  
  <script setup>
  import TopBar from '../../components/common/TopBar.vue';
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import { uploadFile, authverify, getUserInfo } from '@/api';
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
  
  const showIDType = ref(false);
  const idTypes = [
    { text: t('idCard'), value: '1' },
    { text: t('passport'), value: '2' },
    { text: t('driverLicense'), value: '3' },
  ];
  const idType = ref(idTypes[0]);
  const name = ref('');
  const idNumber = ref('');
  const frontFiles = ref([]);
  const backFiles = ref([]);
  const frontUrl = ref(null);
  const backUrl = ref(null);
  
  const onSelectIDType = ({ selectedOptions }) => {
    idType.value = selectedOptions[0];
    showIDType.value = false;
  };
  
  const handleUpload = async (file, type) => {
    showLoadingToast(t('common_loading'));
    const formData = new FormData();
    formData.append('file', file.file);
  
    try {
      const res = await uploadFile(formData);
      if (type === 'front') {
        frontUrl.value = res.data.image;
      } else {
        backUrl.value = res.data.image;
      }
      showSuccessToast(t('upload_successful'));
    } catch (err) {
      showFailToast(err.message || 'Upload failed');
    }
  };
  
  const submit = async () => {
    if (!name.value) return showFailToast(t('auth_error_name'));
    if (!idNumber.value) return showFailToast(t('auth_error_id_number'));
    if (!frontUrl.value) return showFailToast(t('auth_error_front'));
    if (!backUrl.value) return showFailToast(t('auth_error_back'));
  
    const params = {
      type: idType.value.value,
      fullname: name.value,
      cardid: idNumber.value,
      front_img: frontUrl.value,
      back_img: backUrl.value,
    };
  
    showLoadingToast(t('common_loading'));
    try {
      const authType = 2;
      await authverify(authType,params);
      showSuccessToast(t('auth_success'));
      router.back();
    } catch (err) {
      showFailToast(err.message || 'Submit failed');
    }
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

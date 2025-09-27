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
    
    <!-- 修改后的上传部分 - 上下排列 -->
    <div class="upload-section">
      <h3>{{ t('auth_upload_front') }}</h3>
      <div class="upload-item">
        <div class="upload-area">
          <!-- 四角边框装饰 -->
          <div class="corner-decoration top-left"></div>
          <div class="corner-decoration top-right"></div>
          <div class="corner-decoration bottom-left"></div>
          <div class="corner-decoration bottom-right"></div>
          
          <!-- 占位符图标 -->
          <div v-if="frontFiles.length === 0" class="upload-placeholder">
            <div class="card-icon">
              <div class="card-outline">
                <div class="avatar-circle"></div>
                <div class="info-lines">
                  <div class="line"></div>
                  <div class="line"></div>
                  <div class="line"></div>
                </div>
              </div>
            </div>
          </div>
          
          <van-uploader 
            v-model="frontFiles" 
            upload-icon="plus" 
            preview-size="160px" 
            max-count="1" 
            :after-read="file => handleUpload(file, 'front')"
          />
        </div>
        <span class="upload-label"></span>
      </div>
      <h3>{{ t('auth_upload_back') }}</h3>
      <div class="upload-item">
        <div class="upload-area">
          <!-- 四角边框装饰 -->
          <div class="corner-decoration top-left"></div>
          <div class="corner-decoration top-right"></div>
          <div class="corner-decoration bottom-left"></div>
          <div class="corner-decoration bottom-right"></div>
          
          <!-- 占位符图标 -->
          <div v-if="backFiles.length === 0" class="upload-placeholder">
            <div class="card-icon">
              <div class="card-outline">
                <div class="emblem-circle"></div>
                <div class="info-lines">
                  <div class="line short"></div>
                  <div class="line"></div>
                </div>
              </div>
            </div>
          </div>
          
          <van-uploader 
            v-model="backFiles" 
            upload-icon="plus" 
            preview-size="160px" 
            max-count="1" 
            :after-read="file => handleUpload(file, 'back')"
          />
        </div>
        <span class="upload-label"></span>
      </div>
    </div>

    <van-button block type="primary" @click="submit">{{ t('auth_submit') }}</van-button>
  </div>

  <van-popup v-model:show="showIDType" destroy-on-close round position="bottom">
    <van-picker
      :columns="idTypes"
      :confirm-button-text="$t('common_confirm')"
      :cancel-button-text="$t('common_cancel')"  
      @cancel="showIDType = false"
      @confirm="onSelectIDType"
    />
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

// 新的上传样式 - 上下排列
.upload-section {
margin: 20px 0;
display: flex;
flex-direction: column;
gap: 24px;

.upload-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .upload-area {
    position: relative;
    width: 280px;
    height: 160px;
    border: 2px dashed #ffd700;
    border-radius: 8px;
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
      border-color: #ffed4e;
      background: #fffef7;
    }

    // 四角装饰
    .corner-decoration {
      position: absolute;
      width: 16px;
      height: 16px;
      border: 3px solid #ffd700;
      z-index: 2;

      &.top-left {
        top: -3px;
        left: -3px;
        border-right: none;
        border-bottom: none;
      }

      &.top-right {
        top: -3px;
        right: -3px;
        border-left: none;
        border-bottom: none;
      }

      &.bottom-left {
        bottom: -3px;
        left: -3px;
        border-right: none;
        border-top: none;
      }

      &.bottom-right {
        bottom: -3px;
        right: -3px;
        border-left: none;
        border-top: none;
      }
    }

    .van-uploader {
      border: none !important;
      background: transparent !important;
      
      :deep(.van-uploader__upload) {
        border: none !important;
        background: transparent !important;
        width: 280px;
        height: 160px;
      }
      
      :deep(.van-uploader__upload-icon) {
        color: #ffd700 !important;
        font-size: 32px !important;
      }

      :deep(.van-uploader__preview) {
        width: 280px !important;
        height: 160px !important;
        margin: 0 !important;
      }

      :deep(.van-uploader__preview-image) {
        width: 280px !important;
        height: 160px !important;
        object-fit: cover;
        border-radius: 6px;
      }

      :deep(.van-uploader__preview-delete) {
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
      }
    }

    .upload-placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -70%);
      pointer-events: none;
      z-index: 1;
    }

    .card-icon {
      .card-outline {
        width: 100px;
        height: 60px;
        border: 2px solid #ddd;
        border-radius: 6px;
        background: white;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);

        .avatar-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #e0e0e0;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .emblem-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e0e0e0;
          margin: 0 auto 8px;
        }

        .info-lines {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;

          .line {
            height: 3px;
            background: #e0e0e0;
            border-radius: 2px;

            &.short {
              width: 70%;
              margin: 0 auto;
            }
          }
        }
      }
    }
  }

  .upload-label {
    text-align: center;
    font-size: 14px;
    color: var(--van-text-color-2);
    font-weight: 500;
  }
}
}

// 暗色主题适配
.van-theme-dark {
.upload-area {
  background: #1a1a1a !important;
  border-color: #ffd700 !important;

  &:hover {
    background: #2a2a2a !important;
  }

  .corner-decoration {
    border-color: #ffd700 !important;
  }

  .card-icon .card-outline {
    background: #333 !important;
    border-color: #666 !important;

    .avatar-circle,
    .emblem-circle {
      background: #666 !important;
    }

    .info-lines .line {
      background: #666 !important;
    }
  }
}
}
</style>
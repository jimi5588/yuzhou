<template>
  <div class="page-wrap">
    <TopBar :title="t('common_share')" />

    <span class="title">{{ t('qrcode') }}</span>
    <div class="page-content base-shadow">
      <div class="userinfo">
        <van-image v-if="user.avatar" round width="72" height="72" :src="baseUrl + user.avatar" />
        <img v-else src="../../assets/images/avatar/10.png" width="72px" height="72px"/>
        <div class="info">
          <span class="username">{{ user.nickname }}</span>
          <span class="userid">ID:{{ user.id }}</span>
          <span class="userid">Score:{{ user.credit_score }}</span>
        </div>
      </div>
      <div class="qrcode" ref="qrcode"></div>    
      <div class="url-copy" v-if="false">
        <span> {{ url }}</span>
        <Icon name="copy" size="20px" @click="copy"></Icon>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import QRCode from 'qrcode';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

const { t } = useI18n();
const store = useStore();
const qrcode = ref(null);
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const user = ref(store.state.user)
const code = ref(user.value.invite_code);
const url = ref('');

onMounted(() => {
  url.value = window.location.origin + "/#/pages/user/register?refcode=" + code.value
  generateCode()
})

const generateCode = () => {
  QRCode.toCanvas(url.value, {
    width: 300,
    margin: 0,
    errorCorrectionLevel: 'H'
  }, (error, canvas) => {
    if (error) {
      console.error(error);
      return
    }
    qrcode.value.appendChild(canvas);
  });
}

const copy = async () => {
  let text = url.value;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    showSuccessToast(t('common_copy_success'));
  } else {
    // 回退方案：创建一个临时的文本输入元素来复制文本
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showSuccessToast(t('common_copy_success'));
  }
}

</script>

<style lang="scss" scoped>
.page-wrap {
  min-height: 100vh;

  span.title {
    display: block;
    text-align: center;
    margin: 30px 0;
    font-size: 30px;
  }

  .page-content {
    margin: 0 16px;
    padding: 16px;
    border-radius: 10px;
    background: var(--bg-sub);
    display: flex;
    flex-direction: column;
    align-items: center;

    .userinfo {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;

      .info {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .username {
          font-size: 21px;
          font-weight: bold;
        }
        .userid {
          font-size: 13px;
          color: #999;
        }
      }
    }

    .qrcode {
      margin: 30px 0;
      padding: 20px;
      background: #f2f6f7;
      border-radius: 10px;
    }

    // .url-copy {
    //   line-height: 30px;
    //   vertical-align: middle;
    // }
  }
}
</style>
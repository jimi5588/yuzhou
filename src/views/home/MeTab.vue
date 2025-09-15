<template>
  <div class="me-container">
    <!-- 顶部用户信息卡片 -->
    <div class="user-card">
      <div class="user-info">
        <van-uploader :after-read="afterRead">
          <template #default>
            <van-image round width="60" height="60" :src="user.avatar" />
          </template>
        </van-uploader>
        <div class="user-details">
          <span class="username">{{ user.fullName }}</span>
          <span class="user-id">{{ t('user_ref_code') }}:{{ user.refCode }}</span>
        </div>
      </div>

      <div class="balance-wrap">
        <div class="balance-item">
          <div class="top">
            <Icon name="balance"></Icon>
            <span class="value">TSh {{ user.balance }}</span>
          </div>
          <span class="title">{{ t('wallet_balance') }}</span>
        </div>
        <div class="balance-item">
          <div class="top">
            <Icon name="Salary" size="22px"></Icon>
            <span class="value">TSh {{ user.salary }}</span>
          </div>
          <span class="title">{{ t('wallet_salary_balance') }}</span>
        </div>
      </div>
    </div>

    <!-- 菜单列表 -->
    <div class="scroll-area">
      <van-cell :title="t('common_language')" is-link @click="toPage('language')" />
      <van-cell :title="t('common_share')" is-link @click="toPage('user/share')" />
      <van-cell :title="t('wallet_update_bank')" is-link @click="toPage('withdraw/updatebank')" />
      <van-cell :title="t('wallet_account_settlement')" is-link @click="toPage('accountsettle')" />
      <van-cell :title="t('wallet_payroll_records')" is-link @click="toPage('wallet/payrollrecords')" />
      <van-cell :title="t('wallet_financial_records')" is-link @click="toPage('wallet/financialrecords')" />
      <van-cell :title="t('user_invite_records')" is-link @click="toPage('user/inviterecords')" />
      <van-cell :title="t('wallet_trade_history')" is-link @click="toPage('trade/traderecords')" />
      <van-cell :title="t('user_security_protect')" is-link @click="toPage('user/accountsecurity')" />
      <van-button class="btn-logout" @click="logout">{{ t('common_logout') }}</van-button>
    </div>

    <van-popup v-model:show="showLangPopup" round position="bottom">
      <van-picker :confirm-button-text="t('common_confirm')" :cancel-button-text="t('common_cancel')"
        :columns="langList" @cancel="showLangPopup = false" @confirm="langSelected" />
    </van-popup>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { getUserInfo, uploadFile, saveUser } from '@/api';
import { useKlineSocket } from '@/service/KlineSocket';
import { showFailToast } from 'vant';

const KlineSocket = useKlineSocket()
const { t, locale } = useI18n()
const store = useStore();
const router = useRouter();
const symbol = ref(store.state.symbol)
const user = computed(() => store.state.user)

const showLangPopup = ref(false);
const langList = ref([
  { text: "English", value: "en" },
  { text: "हिंदी", value: "yd" },
  //{ text: "Kiswahili", value: "sw" },

  // { text: "简体中文", value: "zh" },
  // { text: "日本語", value: "ja" },
  // { text: "한국인", value: "ko" },
  // { text: "Melayu", value: "ma" },
  // { text: "แบบไทย", value: "th" },
]);

const emit = defineEmits(['switch-language']);

const langSelected = (obj) => {
  showLangPopup.value = false;
  var lang = obj.selectedValues[0];
  localStorage.setItem('language', lang)
  locale.value = lang;
  emit('switch-language', {});
}

const toPage = (path) => {
  router.push("/pages/" + path);
}

const logout = () => {
  localStorage.removeItem('token');
  KlineSocket.close()
  router.push("/pages/login");
}

const getUserData = () => {
  getUserInfo().then(res => {
    store.commit('updateUser', res.data)
  }).catch(err => { })
}

getUserData()

const afterRead = (file) => {
  const formData = new FormData();
  formData.append('file', file.file);
  uploadFile(formData).then(res => {
    let params = {
      id: user.value.id,
      avatar: res.data.thumbUrl
    }
    saveUser(params).then(res => {
      getUserData()
    }).catch(error => {
      showFailToast(error.message)
    })
  }).catch(error => {
    showFailToast(error.message)
  })
};

</script>

<style lang="scss" scoped>
.user-card {
  background-image: url('@/assets/images/zc-bg.508ae7d3.png');
  background-size: cover;
  margin: 15px;
  padding: 15px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .user-info {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }

}

.user-details {
  height: 60px;
  align-items: center;

  .username {
    font-size: 20px;
    font-weight: bold;
    display: block;
    color: white;
  }

  .user-id {
    padding: 2px 4px;
    font-size: 13px;
    font-weight: bold;
    color: #fff;
    background: rgb(255, 255, 255, 0.1);
  }
}

.balance-wrap {
  display: flex;
  gap: 12px;

  .balance-item {
    flex: 1;
    background: var(--bg-sub);
    border-radius: 10px;
    padding: 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 5px;

    .top {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .value {
      font-size: 16px;
      font-weight: bold;
    }
  }
}

.recharge-withdraw {
  display: flex;
  justify-content: space-around;
  margin: -10px 0;

  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    img {
      width: 100px;
    }

    span {
      margin: -10px 0 10px;
    }
  }
}

.bonus-card {
  margin: 15px;
  background: linear-gradient(to right, #ff8c42, #ff6b35);
  border-radius: 12px;
  padding: 15px;
  color: white;
}

.bonus-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bonus-title {
  font-size: 18px;
  font-weight: bold;
}

.bonus-subtitle {
  font-size: 14px;
  opacity: 0.8;
}

:deep(.van-cell) {
  /* width: calc(100% - 30px);
  margin: 0 15px;
  border-radius: 8px; */
  --van-cell-line-height: 36px;
  --van-cell-border-color: #ccc;
  --van-cell-border-width: 2px;
}

.btn-logout {
  display: block;
  width: 60%;
  margin: 15px auto;
  --van-button-default-background: var(--bg-sub);
}
</style>
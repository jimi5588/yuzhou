<template>
  <div class="user-center">
    <TopBar>

    </TopBar>

    <div class="user-info">
      <div class="user-avatar" >
        <img :src="user?.avatar ? baseUrl + user?.avatar : defaultAvatar" />
      </div>
      <div class="user-detail">
        <div class="username">
          HI, {{ user?.username }}
        </div>
        <div class="user-id">
          {{ t('user_ref_code') }}: {{ user?.invite_code || t('user_not_available') }}
          <Icon name="copy" @click="copyInviteCode" />
        </div>
        <div class="user-id">
          {{$t('credit_score')}}:{{ user?.credit_score }}
        </div>
      </div>
      
    </div>

    <!-- VIP等级 -->
    <div class="vip-card" @click="toPage('user/vip')">
      <div class="vip-info">
        <img src="../../assets/images/zs.png" />
        <span>{{ t('user_vip_level') }} {{ user?.vip_level }}</span>
      </div>
      <div class="vip-link">
        {{ t('user_about_vip') }}
        <van-icon name="arrow" />
      </div>
    </div>

    <div class="user-section">
      <!-- 服务菜单 -->
      <div class="service-section">
        <div class="section-title">{{ t('user_service') }}</div>
        <div class="service-items">
          <div class="service-item"  @click="toPage('userinfo')">
            <img src="../../assets/images/anquan.png" />
            <span>{{ t('user_security_settings') }}</span>
          </div>
          <div class="service-item" @click="toPage('user/auth')">
            <img src="../../assets/images/index-pop-2.png" />
            <span>{{ t('user_kyc') }}</span>
          </div>
          <div class="service-item" @click="toPage('wallet')" v-if="false">
            <img src="../../assets/images/index-pop-3.png" />
            <span>{{ t('user_wallet') }}</span>
          </div>
        </div>
      </div>

      <!-- 通用设置 -->
      <div class="general-section">
        <div class="section-title">{{ t('user_general') }}</div>
        <van-cell-group :border="false">
          <van-cell :title="t('user_auth')" is-link @click="toPage('user/auth')">
            <template #icon>
              <img src="../../assets/images/index-pop-5.png" />
            </template>
          </van-cell>
          <van-cell :title="t('user_language')" is-link @click="toPage('language')">
            <template #icon>
              <img src="../../assets/images/yy.png" />
            </template>
          </van-cell>
          <van-cell :title="t('user_default_fiat_currency')"
            :value="'1USD ≈ ' + (fiatCurrency?.rate ? Number(fiatCurrency.rate).toFixed(2) : '--') + (fiatCurrency?.cryptoprotocol || '')"
            is-link @click="showCurrency = true">
            <template #icon>
              <img src="../../assets/images/index-pop-7.png" />
            </template>
          </van-cell>

          <van-cell :title="t('user_about_us')" is-link @click="toPage('user/aboutus')">
            <template #icon>
              <img src="../../assets/images/index-pop-8.png" />
            </template>
          </van-cell>

          <van-cell :title="t('common_logout')" is-link @click="logout">
            <template #icon>
              <img src="../../assets/images/logout.png" />
            </template>
          </van-cell>

        </van-cell-group>
      </div>

      <!-- 最新活动 -->
      <div class="welfare-section">
        <div class="welfare-content">
          <div>
            <h3>{{ t('user_latest_welfare_activities') }}</h3>
            <p>
              {{ t('user_latest_welfare') }}
            </p>
          </div>
          <img src="../../assets/images/yaoqing.png" />
        </div>
      </div>
    </div>
  </div>

  <BottomSelectPopup v-if="showCurrency" :list="fiatCurrencys" :selected="fiatCurrency"
    :title="t('user_please_select_currency')" @closed="showCurrency = false" @select="onCurrencySelect" />
</template>

<script setup>
import { onMounted, ref, reactive, onBeforeMount, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useKlineSocket } from '@/service/klineSocket';
import { getUserInfo, exchangecurrency } from '@/api'

const { t } = useI18n()
const store = useStore()
const router = useRouter()
const klineSocket = useKlineSocket()

const baseUrl = import.meta.env.VITE_API_BASE_URL;
// 默认头像
const defaultAvatar = ref(new URL(`../../assets/images/avatar/1.png`, import.meta.url).href)

// 实时响应 store 中的 user
const user = computed(() => store.state.user)

// 页面跳转
const toPage = (path) => {
  router.push('/pages/' + path)
}

// 货币选择
const showCurrency = ref(false)
const fiatCurrencys = ref([])
const fiatCurrency = ref(store.state.fiatCurrency)


exchangecurrency().then((res) => {
  fiatCurrencys.value = []
  res.data.map(item => {
    item.text = item.cryptoprotocol
    fiatCurrencys.value.push(item)
  })
  // 默认选择第一个
  if (!fiatCurrency.value || fiatCurrency.value.length == 0) {
    fiatCurrency.value = fiatCurrencys.value[0]
    store.commit('updateFiatCurrency', fiatCurrency.value)
  } else {
    fiatCurrencys.value.forEach(item => {
      if (fiatCurrency.value.cryptoprotocol === item.cryptoprotocol) {
        fiatCurrency.value = item
        store.commit('updateFiatCurrency', fiatCurrency.value)
      }
    });
  }
}).catch((err) => {

})

// 复制邀请码
const copyInviteCode = () => {
  if (user.value?.invite_code) {
    navigator.clipboard
      .writeText(user.value.invite_code)
      .then(() => {
        showSuccessToast('Copied')
      })
      .catch(() => {
        showFailToast('Replication failed')
      })
  }
}

// 货币选择后回调
const onCurrencySelect = (currency) => {
  showCurrency.value = false
  fiatCurrency.value = currency
  store.commit('updateFiatCurrency', fiatCurrency.value)
}

// 可选：onMounted 拉取最新用户信息
onMounted(async () => {
  try {
    const res = await getUserInfo()
    store.commit('updateUser', res.result) // 根据你实际 store 的写法
  } catch (err) {
  }
})

// Logout function
const logout = () => {
  localStorage.removeItem('token')
  klineSocket.close()
  toPage('login')
}

</script>


<style scoped>
.user-center {
  min-height: 100vh;
  background: #f2f6f7;
}

.user-info {
  padding: 20px 16px;
  display: flex;
  align-items: center;
}

.user-avatar img {
  width: 75px;
  height: 75px;
}

.user-detail {
  flex: 1;
  margin-left: 16px;
}

.username {
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-id {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.vip-card {
  margin: 0 16px;
  padding: 12px;
  background: #1a1f2e;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.vip-info {
  display: flex;
  align-items: center;
  gap: 8px;

  img {
    width: 24px;
    height: 24px;
  }
}

.vip-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  opacity: 0.8;
}

.user-section {
  background: #fff;
  padding: 16px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.section-title {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
}

.service-section {
  /* background: #fff; */
  border: 1px solid rgba(0, 0, 0, .05);
  border-radius: 10px;
  padding: 15px;

  .service-items {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 50px;

    .service-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      img {
        width: 32px;
        height: 32px;
      }

      span {
        font-size: 14px;
      }
    }
  }
}

.van-cell-group {
  --van-cell-group-background: transparent;
  --van-cell-background: transparent;
}

.general-section {
  margin-top: 12px;
  border: 1px solid rgba(0, 0, 0, .05);
  border-radius: 10px;
  padding: 15px;

  img {
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }
}

.welfare-section {
  margin-top: 12px;
  border: 1px solid rgba(0, 0, 0, .05);
  border-radius: 10px;
  padding: 15px;
}

.welfare-content {
  display: flex;
  justify-content: space-between;
  align-items: center;

  img {
    width: 80px;
    height: 80px;
  }
}

.welfare-content h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.welfare-content p {
  font-size: 12px;
  color: #666;
}

:deep(.van-cell) {
  align-items: center;
  padding: 10px 0 !important;
}

:deep(.van-cell__left-icon) {
  margin-right: 8px;
}

.van-theme-dark {
  .user-center {
    background: var(--bg-sub);
  }
  .vip-card {
    background: #454545;
  }
  .user-section {
    background: #333;
  }

  .service-section, 
  .general-section, 
  .welfare-section {
    border: 1px solid #454545;
  }

}
</style>

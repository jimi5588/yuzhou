<template>
  <TopBar :title="t('auth_title')" />
  <div class="container">
    <div class="verification-list">
      <div 
        v-for="item in verificationItems" 
        :key="item.id"
        class="verification-item"
        :class="{ disabled: item.status === 1 || item.status === 3 }"
        @click="handleItemClick(item)"
      >
        <div class="item-header">
          <div class="item-content">
            <span class="item-text">{{ t(item.nameKey) }}</span>
          </div>
          <div class="item-right">
            <div v-if="item.status === 1" class="status-badge verified">
              <div class="status-icon">✓</div>
              <span>{{ t('verified') }}</span>
            </div>
            <div v-else-if="item.status === 3" class="status-badge pending">
              <div class="status-icon pending">⏱</div>
              <span>{{ t('pending') }}</span>
            </div>
            <div v-else class="status-badge unverified">
              <span>{{ t('unverified') }}</span>
            </div>
            <span class="arrow">›</span>
          </div>
        </div>
        <p class="item-description">{{ t(item.descriptionKey) }}</p>
      </div>
    </div>

    <div v-if="allVerified" class="authed">
      <p>{{ t('all_verified') }}</p>
    </div>
  </div>
</template>

<script setup>
import TopBar from '../../components/common/TopBar.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { getUserInfo } from '@/api';
import { showFailToast } from 'vant';

const { t } = useI18n();
const store = useStore();
const router = useRouter();

// 认证项配置
const verificationItems = ref([
  {
    id: 1,
    nameKey: 'real_name_auth',
    descriptionKey: 'real_name_auth_desc', // 完成基本的电子邮件或手机身份验证，系统将自动以电邮或手机通知资金交易并立即追踪市场动态。
    status: 0, // 0: 未验证, 1: 已验证, 2: 拒绝, 3: 审核中
    type: 'real-name'
  },
  {
    id: 2,
    nameKey: 'advanced_auth',
    descriptionKey: 'advanced_auth_desc', // 通过真实身份信息认证后，我们将为您安排7×24小时专属VIP客服服务。
    status: 0,
    type: 'advanced'
  }
]);

const allVerified = computed(() => {
  return verificationItems.value.every(item => item.status === 1);
});

// 更新用户认证状态
const fetchUserAuthStatus = async () => {
  try {
    const res = await getUserInfo();
    const user = res.result;
    store.commit('updateUser', user);

    verificationItems.value = [
      {
        id: 1,
        nameKey: 'real_name_auth',
        descriptionKey: 'real_name_auth_desc',
        status: user.realauth_status,
        type: 'real-name'
      },
      {
        id: 2,
        nameKey: 'advanced_auth',
        descriptionKey: 'advanced_auth_desc',
        status: user.certification_status,
        type: 'advanced'
      }
    ];
  } catch (err) {
    showFailToast(t('fetch_user_info_failed'));
  }
};

// 认证页面点击跳转
const handleItemClick = (item) => {
  if (item.status === 1 || item.status === 3) {
    return;
  }

  const realNameItem = verificationItems.value.find(i => i.type === 'real-name');

  if (item.type === 'advanced' && realNameItem?.status !== 1) {
    showFailToast(t('please_complete_realname_first'));
    return;
  }

  switch (item.type) {
    case 'real-name':
      router.push('/pages/auth/authstepone');
      break;
    case 'advanced':
      router.push('/pages/auth/authstepsecond');
      break;
  }
};

// 自动刷新认证状态
let timer = null;

onMounted(() => {
  fetchUserAuthStatus();
  timer = setInterval(fetchUserAuthStatus, 5000); // 每5秒更新一次认证状态
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.container {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.verification-list {
  padding: 16px;
}

.verification-item {
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  margin-bottom: 12px;
  background: var(--bg-sub);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    background-color: #f8f8f8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }

  &.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 12px;
}

.item-content {
  display: flex;
  align-items: center;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-text {
  font-size: 16px;
  color: var(--text-color);
  font-weight: 500;
  line-height: 1.4;
}

.item-description {
  font-size: 13px;
  color: #999;
  line-height: 1.5;
  margin: 0;
  padding: 8px 12px;
  background: rgba(255, 0, 0, 0.05);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 6px;
  //width: 100%;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #52c41a;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: rgba(82, 196, 26, 0.1);

  &.pending {
    color: #faad14;
    background-color: rgba(250, 173, 20, 0.1);
  }

  &.unverified {
    color: #999;
    background-color: rgba(153, 153, 153, 0.1);
  }
}

.status-icon {
  width: 16px;
  height: 16px;
  background-color: #52c41a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;

  &.pending {
    background-color: #faad14;
  }
}

.arrow {
  color: #ccc;
  font-size: 16px;
  font-weight: bold;
}

.authed {
  min-height: calc(100vh - 200px);
  display: flex;
  justify-content: center;
  align-items: center;
  
  p {
    font-size: 20px;
    color: #52c41a;
    text-align: center;
    padding: 20px;
    background: #fff;
    border-radius: 10px;
    margin: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.van-theme-dark {
  .container {
    background-color: transparent;
  }

  .verification-item {
    background: #333;
  }

  .item-description {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
    color: #ccc;
  }
}
</style>
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
    status: 0, // 0: 未验证, 1: 已验证, 2: 拒绝, 3: 审核中
    type: 'real-name'
  },

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
        status: user.realauth_status,
        type: 'real-name'
      },
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
  align-items: center;
  justify-content: space-between;
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
}

.verification-item.disabled {
  opacity: 0.6;
  pointer-events: none;
}
.item-content {
  display: flex;
  align-items: center;
}

.item-text {
  font-size: 16px;
  color: var(--text-color);
  font-weight: 500;
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

// 保留原有样式
.content {
  margin: 16px;
  padding: 16px;
  background: #fff;
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

.van-theme-dark {
  .container {
    background-color: transparent;
  }

  .verification-item {
    background: #333;
  }
}
</style>
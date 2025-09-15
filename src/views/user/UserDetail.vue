<template>
    <TopBar :title="t('user_detail_title')"></TopBar>
    <van-cell-group :border="false">
      <van-cell :title="t('user_avatar')" is-link @click="showAvatar = true">
        <template #value>
          <img :src="user?.avatar ? baseUrl + user?.avatar : defaultAvatar" style="width: 40px; height: 40px; border-radius: 50%;" />
        </template>
      </van-cell>
      <van-cell :title="t('user_nickname')" :value="user?.nickname" is-link @click="showNickname = true" />
      <van-cell :title="t('user_email')" :value="user?.username" />
      <van-cell :title="t('user_score')" :value="user?.credit_score" />
      <van-cell :title="t('user_change_login_password')" is-link @click="toPage('user/findpassword')" />
      <van-cell :title="t('user_change_fund_password')" is-link @click="toPage('user/SetPayPassword')" />
  
      <van-button class="exit" type="primary" @click="logout">{{ t('user_exit') }}</van-button>
    </van-cell-group>
  
    <!-- Avatar Selection Popup -->
    <van-popup v-model:show="showAvatar" position="bottom">
      <div class="avatar-grid">
        <img
          v-for="(item, index) in avatarList"
          :key="index"
          :src="item.src"
          :class="{ selected: selectedAvatarIndex === index, normal: selectedAvatarIndex !== index }"
          @click="selectedAvatarIndex = index"
        />
      </div>
      <div class="buttons" style="padding: 10px;">
        <van-button class="cancel" type="primary" @click="showAvatar = false">{{ t('common_cancel') }}</van-button>
        <van-button type="primary" @click="onSelectAvatar">{{ t('common_ok') }}</van-button>
      </div>
    </van-popup>
  
    <!-- Nickname Edit Popup -->
    <van-popup class="popup-nickname" v-model:show="showNickname" position="bottom">
      <div class="nickname-top" style="display: flex; justify-content: space-between; padding: 10px;">
        <span>{{ t('user_nickname_edit') }}</span>
        <span @click="showNickname = false" style="color: red;">{{ t('common_cancel') }}</span>
      </div>
      <van-field v-model="nickname" :placeholder="t('user_nickname_placeholder')" />
      <span class="nickname-hint">{{ t('user_nickname_hint') }}</span>
      <van-button block type="primary" @click="onEditName">{{ t('common_ok') }}</van-button>
    </van-popup>
</template>

<script setup>
import TopBar from '../../components/common/TopBar.vue'
import { onMounted, ref, reactive, onBeforeMount, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useKlineSocket } from '@/service/klineSocket';
import { getUserInfo, updateAvatar, updateNickname,uploadFile } from '@/api'

const klineSocket = useKlineSocket()
// Internationalization and routing
const { t } = useI18n()
const router = useRouter()
const store = useStore()
const user = computed(() => store.state.user)
const baseUrl = ref(store.state.baseUrl)
// 实时响应 store 中的 user
// console.log('user:', user.value)  // 正确打印


// 默认头像
const defaultAvatar = ref(new URL(`../../assets/images/avatar/1.png`, import.meta.url).href)

// Popup visibility states
const showAvatar = ref(false)
const showNickname = ref(false)

// Avatar selection state
const avatarList = []
const selectedAvatarIndex = ref(-1)

// Nickname input
const nickname = ref('')

// Building avatar list
onBeforeMount(() => {
  for (let i = 0; i < 30; i++) {
    avatarList.push({
      id: i,
      src: new URL(`../../assets/images/avatar/${i + 1}.png`, import.meta.url).href
    })
  }
})

// Fetch user details
const fetchUserDetail = () => {
  getUserInfo().then(res => {
    if (res.status === 200 && res.result) {
      const data = res.result
      user.avatar = data.avatar
      user.nickname = data.nickname
      user.mail = data.mail
      user.credit_score = data.credit_score
      nickname.value = data.nickname // Initial nickname setup
      store.commit('updateUser', res.result)
    }
  }).catch(err => {
    console.error('Failed to fetch user data:', err)
    showFailToast('Failed to fetch user data.')
  })
}

onMounted(() => {
  fetchUserDetail()
})

// 更新头像
const onSelectAvatar = async () => {
  if (selectedAvatarIndex.value >= 0) {
    const selectedAvatar = avatarList[selectedAvatarIndex.value].src
    const response = await fetch(selectedAvatar);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type });
    const formData = new FormData();
    formData.append('file', file);

    showAvatar.value = false
    showLoadingToast(t('common_loading'))
    uploadFile(formData).then(res => {
      if (res.status === 200) {
        const avatarUrl = res.data.image
        user.avatar = avatarUrl

        updateAvatar({ avatar: avatarUrl }).then(res => {
          if (res.status === 200) {
            showSuccessToast(t('user_avatar_update_success'))
            fetchUserDetail() // ✅ 重新获取用户数据
          } else {
            showFailToast('Avatar update failed')
            
          }
        }).catch(err => {
          showFailToast('Avatar update failed')
        })
      } else {
        showFailToast('Avatar upload failed')
      }
    }).catch(err => {
      showFailToast('Avatar upload failed')
      console.error('Avatar upload request failed:', err)
    })
  } else {
    showFailToast('Please select an avatar.')
  }
}

// 更新昵称
const onEditName = () => {
  const newNickname = nickname.value.trim()
  if (newNickname.length >= 2 && newNickname.length <= 18) {
    user.nickname = newNickname
    showNickname.value = false

    showLoadingToast(t('common_loading'))
    updateNickname({ nickname: newNickname }).then(res => {
      if (res.status === 200) {
        showSuccessToast(t('user_nickname_update_success'))
        fetchUserDetail() // ✅ 重新获取用户数据
      } else {
        showFailToast(t('user_nickname_update_failed'))
      }
    }).catch(err => {
      showFailToast(t('user_nickname_update_failed'))
      console.error('Nickname update request failed:', err)
    })
  } else {
    showFailToast(t('user_nickname_length_error'))
  }
}

// Navigation function
const toPage = (path) => {
  router.push('/pages/' + path)
}

// Logout function
const logout = () => {
  localStorage.removeItem('token')
  klineSocket.close()
  toPage('login')
}
</script>


<style lang="scss" scoped>
.van-cell-group {
    margin-top: 10px;
    --van-cell-group-background: transparent;
    --van-cell-background: transparent;
    --van-cell-line-height: 66px;
    --van-cell-vertical-padding: 0;

    :deep(.van-cell) {
        align-items: center;
    }

    :deep(.van-cell__title span) {
        font-size: 16px;
        color: var(--text-color2);
    }

    :deep(.van-cell__value span) {
        font-size: 16px;
        color: var(--text-color);
    }

    :deep(.van-icon-arrow) {
        font-size: 18px;
        margin-left: 10px;
    }

    img {
        width: 40px;
        height: 40px;
        vertical-align: middle;
    }
}

.exit.van-button--primary {
    width: calc(100% - 32px);
    margin: 50px 16px 0;
    height: 50px !important;
    background-image: linear-gradient(180deg, #00c6fb 0, #005bea);

    span {
        font-size: 19px;
    }
}

.van-popup--bottom {
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    overflow-y: hidden;
}

.avatar-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 5px;
    max-height: 300px;
    overflow-y: auto;

    img {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      cursor: pointer;
      transition: border-color 0.3s;

        &.normal {
            border: 3px solid transparent;
        }

        &.selected {
          border: 3px solid #1989fa;
          box-shadow: 0 0 5px rgba(25, 137, 250, 0.6);
        }
    }
}

.buttons {
    display: flex;
    margin: 10px 0;
    gap: 20px;

    .van-button {
        flex: 1;

        &.cancel {
            background-color: #C7C7C7;
        }
    }

    span {
        font-size: 19px;
    }
}

.popup-nickname {
    padding: 10px 20px;
    .van-cell {
        border-radius: 7px;
        margin: 10px 0;
        --van-cell-background: rgba(0, 0, 0, .05);
        --van-cell-line-height: 32px
    }
    .nickname-hint {
        margin: 0 15px;
        font-size: 13px;
        color: #999;
    }

    .van-button--primary {
        margin: 15px 0;
        background-image: linear-gradient(180deg, #00c6fb 0, #005bea);
    }
}

.nickname-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    span {
        font-size: 19px;
        color: var(--text-color);
        &:last-child {
            color: #999;
        }
    } 
}

.selected {
  border: 2px solid #1989fa;
}
.normal {
  border: 2px solid #ccc;
}
.avatar-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.van-theme-dark {
  .van-field {
    background: #454545;
  }
}

</style>

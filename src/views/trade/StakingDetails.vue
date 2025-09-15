<template>
  <div class="staking-details">
    <TopBar :title="t('subscribe_title')" />

    <!-- 项目信息 -->
    <div class="project-info" v-if="data">
      <van-image width="100" height="100" :src="fullImageUrl(data.img)" fit="contain" alt="staking product image" />
      <div class="info-text">
        <span class="title">{{ data.name }}</span>
        <div class="token-info">

          <van-tag>{{ t('mining_interest') }} {{ formatInterest(data.interest) }}%</van-tag>
        </div>
      </div>
    </div>

    <div class="mail-info" v-if="data">
      <van-cell-group :border="false">
        <!-- 金额范围，改用模板字符串显示 -->
        <van-cell :title="t('mining_range_amount')"
          :value="`${formatAmount(data.min_amount)} - ${formatAmount(data.max_amount)}`" />
        <van-cell :title="t('mining_lock')" :value="`${data.day} ${t('time_day')}`" />

        <van-divider :hairline="false"/>

        <van-cell :title="t('rebate_method')" :value="rebateMethodText" />
        <van-cell :title="t('mining_dayinterest')" :value="`${formatInterest(data.interest)}%`" /> <van-cell
          :title="t('expected_interest')" :value="expectedInterest" />
        <!-- 金额输入 -->
        <van-field v-model="amount" type="number" :label="t('amount_range_warning')"
          :placeholder="`${formatAmount(data.min_amount)} - ${formatAmount(data.max_amount)}`" input-align="right"
          clearable />

        <van-divider :hairline="false"/>

        <!-- 动态钱包余额 -->
        <van-cell :title="t('wallet_balance')" :value="user?.balance" />
      </van-cell-group>

      <div class="bottom-button">
        <van-button type="primary" block round @click="buy" :loading="loadingSubmit">
          {{ t('staking_the_submit') }}
        </van-button>
      </div>

      <div class="product-intro" v-if="data.description">
        <span class="title">{{ t('product_description') }}</span>
        <div class="content" v-html="data.description"></div>
      </div>
    </div>

    <div v-if="!data && !loadingData" class="empty-list">
      <van-empty :description="t('no_data')" />
    </div>
  </div>
</template>

<script setup>
import TopBar from '@/components/common/TopBar.vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { stakingdetail, stakingsubmit } from '@/api'
import { showLoadingToast, closeToast, showToast, showFailToast, showSuccessToast } from 'vant'

const { t } = useI18n()
const store = useStore()
const route = useRoute()
const router = useRouter()
const user = computed(() => store.state.user)

const baseUrl = ref(store.state.baseUrl || '')
const id = ref(route.query.id || '')
const data = ref(null)
const amount = ref('')
const loadingData = ref(false)
const loadingSubmit = ref(false)

const walletBalance = computed(() => user.value?.balance || 0)

// 处理图片完整路径
const fullImageUrl = (url) => {
  if (!url) return '/default-image.png'
  if (/^(http|https):\/\//.test(url)) return url
  return baseUrl.value + url
}

// 格式化金额，保留两位小数
const formatAmount = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0.00'
  return parseFloat(val).toFixed(2)
}

// 格式化利率，保留两位小数（百分比）
const formatInterest = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0.00'
  return (parseFloat(val)).toFixed(2)
}

const expectedInterest = computed(() => {
  const num = parseFloat(amount.value)
  const interest = parseFloat(data.value?.interest || 0)
  const day = parseInt(data.value?.day || 0)
  if (isNaN(num) || num <= 0) return '0.00'
  const val = num * interest * day / 100
  return formatAmount(val)
})

// 返利方式文本
const rebateMethodText = computed(() => {
  const method = data.value?.type
  if (method === 1) return t('rebate_daily')   // 请在语言文件添加对应key
  if (method === 2) return t('rebate_at_expiry')
  return t('rebate_unknown')
})

// 获取详情数据
const getDetail = () => {
  if (!id.value) {
    showToast(t('invalid_id'))
    return
  }
  loadingData.value = true
  showLoadingToast(t('common_loading'))
  stakingdetail(id.value)
    .then((res) => {
      closeToast()
      if (res.status === 200 && res.result?.data) {
        data.value = res.result.data
      } else {
        showToast(t('no_data'))
      }
    })
    .catch((err) => {
      showFailToast(err.message || t('load_failed'))
    })
    .finally(() => {
      loadingData.value = false
    })
}

onMounted(() => {
  getDetail()
})

const buy = () => {
  if (!data.value) {
    showToast(t('no_data'))
    return
  }

  const min = parseFloat(data.value.min_amount || 0)
  const max = parseFloat(data.value.max_amount || 0)
  const num = parseFloat(amount.value)

  if (!amount.value) {
    showToast(t('subscription_input_amout'))
    return
  }
  if (isNaN(num) || num < min) {
    showToast(`${t('staking_mill_rental')} ${formatAmount(min)}`)
    return
  }
  if (num > max) {
    showToast(`${t('staking_mill_mrental')} ${formatAmount(max)}`)
    return
  }

  // 判断余额是否足够（根据需求可选）
  if (num > walletBalance.value) {
    showToast(t('insufficient_balance'))
    return
  }

  loadingSubmit.value = true
  showLoadingToast(t('common_loading'))

  const params = {
    plan_id: id.value,
    amount: amount.value,
  }

  stakingsubmit(params)
    .then(() => {
      closeToast()
      showSuccessToast(t('common_success'))
      router.back()
    })
    .catch((err) => {
      closeToast()
      showFailToast(err.message || t('submit_failed'))
    })
    .finally(() => {
      loadingSubmit.value = false
    })
}
</script>

<style lang="scss" scoped>
.staking-details {
  min-height: 100vh;
  background: var(--bg-sub);
}

.project-info {
  padding: 16px;
  background: var(--bg-sub);
  display: flex;
  gap: 12px;
  align-items: center;

  .info-text {
    height: 84px;
    margin-left: 15px;

    .title {
      font-size: 21px;
    }

    .token-info {
      margin-top: 15px;
      display: flex;
      align-items: center;
      gap: 8px;

      .token-name {
        font-size: 24px;
        font-weight: bold;
      }

      .van-tag {
        height: 24px !important;
        border-radius: 12px !important;
        background: linear-gradient(138deg, #67e1ab, #28c2c8);

        :deep(span) {
          font-size: 14px;
        }
      }
    }
  }
}

.mail-info {
  background: #F3F4F6;
  border-radius: 6px;
  margin: 16px;
  padding: 16px;

  :deep(.van-cell-group) {
    --van-cell-group-background: transparent;

    .van-cell {
      padding: 10px 0 !important;
      --van-cell-background: transparent;
      --van-field-label-width: fit-content;
    }

    .van-field {
      input {
        font-size: 14px;
      }
    }

    span {
      font-size: 14px;
    }

    .van-cell__title span {
      color: #9CA3AF;
    }

    .van-cell__value span {
      color: #000;
    }

  }

  .bottom-button {
    margin-top: 20px;

    .van-button {
      border-radius: 30px !important;
    }
  }

  .product-intro {
    margin: 20px 0;

    .title {
      font-size: 19px;
    }

    .content {
      margin-top: 15px;
      font-size: 14px;
    }
  }

  .van-divider {
    --van-divider-border-color: #D1D5DB;
  }
}

.van-theme-dark {
  
  .mail-info {
    background: #333;
  }

  .van-cell-group {
    --van-field-label-color: #aaa;
    
    :deep(.van-field) {
      // border-bottom: 1px solid #666;
    }

    :deep(.van-cell__title span) {
      color: #aaa;
    }

    :deep(.van-cell__value span) {
      color: #fff;
    }
  }

  .van-divider {
    --van-divider-border-color: #666;
  }
}
</style>
<template>
    <TopBar :title="t('mining')" />
    <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
      <!-- 矿机产品 Tab -->
      <van-tab :title="$t('mining_product_tab')">
        <div v-if="loadingMills" class="loading">{{ t('loading') }}...</div>
        <div v-else>
          <div v-if="mills.length > 0" class="mill-list">
            <div class="miner-list">
              <div v-for="mill in mills" :key="mill.id" class="miner-card">

                  <div class="miner-info">
                    <div class="miner-img">
                    <img :src="fullImageUrl(mill.img)" :alt="mill.name || t('miner_image')" />
                    </div>
                  <h3 class="miner-name">{{ mill.name }}</h3>
                  <p>{{ t('mining_min_amount') }}: {{ formatAmount(mill.min_amount) }} - {{ formatAmount(mill.max_amount) }}</p>
                  <p>{{ t('mining_interest') }}: {{ formatInterest(mill.interest) }}%</p>
                  <p>{{ t('mining_day') }}: {{ mill.day }} {{ t('days') }}</p>
  
                  <div class="progress-bar">
                    <div class="progress" :style="{ width: getProgressWidth(mill.progress*100) }"></div>
                  </div>
                  <p class="progress-text">{{ formatProgress(mill.progress) }}%</p>
  
                  <van-button 
                    type="success" 
                    size="small" 
                    @click="toPage('trade/stakingdetails', mill.id)" 
                    :loading="mill.locking"
                  >
                    {{ t('mining_lock') }}
                  </van-button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-list">
            <van-empty :description="t('no_data')" />
          </div>
        </div>
      </van-tab>
  
      <!-- 矿机订单 Tab -->
      <van-tab :title="$t('mining_order_tab')">
        <div v-if="loadingOrders && page === 1 && !refreshing" class="loading">{{ t('loading') }}...</div>
        <div v-else>
          <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <van-list
              v-model:loading="loadingMore"
              :finished="!hasMore"
              :finished-text="t('no_more_data')"
              @load="onLoadMore"
              :immediate-check="false"
            >
              <div v-if="mingorders.length > 0" class="mill-list">
                <div class="minger-list">
                  <div v-for="order in mingorders" :key="order.id" class="minger-card order-card">
                    <div class="minger-info">
                      <div class="order-header">
                        <h3 class="minger-name">{{ getOrderTitle(order) }}</h3>
                        <span class="status-badge" :class="getStatusClass(order.status)">
                          {{ getStatusText(order.status) }}
                        </span>
                      </div>                     
                      <div class="order-details">
                        <p>{{ t('quantity') }}: {{ formatAmount(order.amount) }}</p>
                        <p>{{ t('expected_interest_rate') }}: {{ formatInterest(order.interest_rate) }}%</p>
                        <p>{{ t('start_date') }}: {{ formatDate(order.start_date) }}</p>
                        <p>{{ t('end_date') }}: {{ formatDate(order.end_date) }}</p>
                        <p>{{ t('total_reward') }}: {{ formatAmount(order.total_reward) }}</p>
                        <p>{{ t('earned_reward') }}: {{ formatAmount(order.earned_reward) }}</p>
                        <p v-if="parseFloat(order.cancel_fee) > 0">
                          {{ t('cancel_fee') }}: {{ formatAmount(order.cancel_fee) }}
                        </p>
                      </div>
  
                      <div class="progress-section">
                        <div class="progress-bar">
                          <div class="progress" :style="{ width: getOrderProgress(order) + '%' }"></div>
                        </div>
                        <p class="progress-text">{{ getOrderProgress(order).toFixed(2) }}%</p>
                      </div>
  
                      <div class="order-actions">
                        <van-button 
                          v-if="canCancelOrder(order)" 
                          type="warning" 
                          size="small" 
                          :loading="order.cancelling"
                        >
                          {{ t('cancel_order') }}
                        </van-button>
                        
                        <van-button 
                          v-if="canClaimReward(order)" 
                          type="success" 
                          size="small" 
                          :loading="order.claiming"
                        >
                          {{ t('claim_reward') }}
                        </van-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="!loadingOrders" class="empty-list">
                <van-empty :description="t('no_orders')" />
              </div>
            </van-list>
          </van-pull-refresh>
        </div>
      </van-tab>
    </van-tabs>
  </template>
  
  <script setup>
  import TopBar from '@/components/common/TopBar.vue'
  import { ref, onMounted, computed } from 'vue'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  import { stakinginfo, stakinghistory } from '@/api'
  import { useI18n } from 'vue-i18n'
  import { showToast, showConfirmDialog } from 'vant'
  
  const store = useStore()

  const router = useRouter()
  const { t } = useI18n()
  const baseUrl = ref(store.state.baseUrl)
  
  // 数据状态
  const mills = ref([])
  const mingorders = ref([])
  
  // 加载状态
  const loadingMills = ref(false)
  const loadingOrders = ref(false)
  const loadingMore = ref(false)
  
  // Tab状态
  const activeTab = ref(0) // 0: 产品列表，1: 订单列表
  
  // 分页参数
  const page = ref(1)
  const perPage = 10
  const total = ref(0)
  const hasMore = ref(true)
  
  // 刷新状态
  const refreshing = ref(false)
  
  // 工具函数
  const fullImageUrl = (url) => {
    if (!url) return ''
    return url.startsWith('http') ? url : `${baseUrl.value}${url}`
  }
  
  const formatAmount = (amount) => {
    if (!amount) return '0.00'
    return parseFloat(amount).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 8 
    })
  }
  
  const formatInterest = (interest) => {
    if (!interest) return '0.000'
    return parseFloat(interest).toFixed(3)
  }
  
  const formatProgress = (progress) => {
    if (!progress) return '0.00'
    return parseFloat(progress *100).toFixed(2)
  }
  
  const getProgressWidth = (progress) => {
    const progressValue = parseFloat(progress) || 0
    return Math.min(Math.max(progressValue, 0), 100) + '%'
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString()
  }
  
  const getOrderTitle = (order) => {
    return order.name || `${t('order')} #${order.id}`
  }
  
  const getStatusClass = (status) => {
    const statusMap = {
      0: 'status-pending',
      1: 'status-active',
      2: 'status-completed',
      3: 'status-cancelled'
    }
    return statusMap[status] || 'status-unknown'
  }
  
  const getStatusText = (status) => {
    const statusMap = {
      0: t('status_pending'),
      1: t('status_active'),
      2: t('status_completed'),
      3: t('status_cancelled')
    }
    return statusMap[status] || t('status_unknown')
  }
  
  // 业务逻辑函数
  const canCancelOrder = (order) => {
    return order.status === 1 // 只有活跃状态的订单可以取消
  }
  
  const canClaimReward = (order) => {
    const now = new Date()
    const endDate = new Date(order.end_date)
    return order.status === 1 && now >= endDate && parseFloat(order.earned_reward) > 0
  }
  
  // 加载矿机产品数据
  const loadMills = async () => {
    loadingMills.value = true
    try {
      const res = await stakinginfo()
      if (res.status === 200 && res.result && Array.isArray(res.result.data)) {
        mills.value = res.result.data.map(mill => ({
          ...mill,
          locking: false // 添加锁定状态
        }))
      } else {
        mills.value = []
        console.warn('矿机产品数据格式异常:', res)
      }
    } catch (error) {
      console.error('加载矿机产品失败:', error)
      mills.value = []
      showToast(t('load_failed'))
    } finally {
      loadingMills.value = false
    }
  }
  
  // 加载矿机订单数据（修复关键问题）
  const loadOrders = async (reset = false) => {
    if (reset) {
      page.value = 1
      hasMore.value = true
      mingorders.value = []
    }
    
    if (!hasMore.value) return
  
    if (page.value === 1 && !refreshing.value) {
      loadingOrders.value = true
    } else if (page.value > 1) {
      loadingMore.value = true
    }
  
    try {
      const res = await stakinghistory({ page: page.value, perPage })
      console.log('订单接口返回:', res)
  
      // 修复：直接使用 res.result 而不是 res.data.result
      if (res.status === 200 && Array.isArray(res.result)) {
        const newOrders = res.result.map(order => ({
          ...order,
          cancelling: false,
          claiming: false
        }))
  
        if (reset || page.value === 1) {
          mingorders.value = newOrders
        } else {
          mingorders.value = [...mingorders.value, ...newOrders]
        }
        
        // 修复：使用正确的分页信息
        total.value = parseInt(res.total) || 0
        hasMore.value = page.value < parseInt(res.last_page || 1)
        
        if (newOrders.length > 0) {
          page.value++
        } else {
          hasMore.value = false
        }
      } else {
        console.warn('订单数据格式异常:', res)
        if (reset || page.value === 1) {
          mingorders.value = []
        }
        hasMore.value = false
      }
    } catch (error) {
      console.error('加载矿机订单失败:', error)
      if (reset || page.value === 1) {
        mingorders.value = []
      }
      hasMore.value = false
      showToast(t('load_failed'))
    } finally {
      loadingOrders.value = false
      loadingMore.value = false
      refreshing.value = false
    }
  }
  
  // 计算订单进度
  const getOrderProgress = (order) => {
    const earned = parseFloat(order.replaydays) || 0
    const total = parseFloat(order.lockdays) || 0
    
    if (total === 0) return 0
    
    const progress = (earned / total) * 100
    return Math.min(Math.max(progress, 0), 100)
  }
  
  // 事件处理函数
  const onTabChange = (index) => {
    activeTab.value = index
    if (index === 0 && mills.value.length === 0) {
      loadMills()
    } else if (index === 1) {
      if (mingorders.value.length === 0) {
        loadOrders(true)
      }
    }
  }
  
  const onRefresh = () => {
    if (activeTab.value === 0) {
      loadMills()
    } else {
      loadOrders(true)
    }
  }
  
  const onLoadMore = () => {
    if (activeTab.value === 1) {
      loadOrders(false)
    }
  }
  
  // 业务操作函数
  const toPage = (path, id) => {
      router.push(`/pages/${path}?id=${id}`)
    }
  
  const handleCancelOrder = async (order) => {
    try {
      await showConfirmDialog({
        title: t('confirm'),
        message: t('confirm_cancel_order')
      })
      
      order.cancelling = true
      // TODO: 实现取消订单逻辑
      console.log('取消矿机订单:', order)
      showToast(t('cancel_success'))
      
      // 刷新订单列表
      loadOrders(true)
    } catch (error) {
      if (error !== 'cancel') {
        console.error('取消订单失败:', error)
        showToast(t('cancel_failed'))
      }
    } finally {
      order.cancelling = false
    }
  }
  
  const handleClaimReward = async (order) => {
    try {
      order.claiming = true
      // TODO: 实现领取奖励逻辑
      console.log('领取奖励:', order)
      showToast(t('claim_success'))
      
      // 刷新订单列表
      loadOrders(true)
    } catch (error) {
      console.error('领取奖励失败:', error)
      showToast(t('claim_failed'))
    } finally {
      order.claiming = false
    }
  }
  
  // 生命周期
  onMounted(() => {
    loadMills()
  })
  </script>
<style lang="scss" scoped>
.miner-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px;
}

.miner-card {
  display: flex;
  background: var(--bg-sub);
  border-radius: 12px;
  padding: 15px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.miner-img img {
  width: 100%;
  border-radius: 12px;
  object-fit: contain;
  margin-right: 16px;
}

.miner-info {
  flex: 1;
}

.miner-name {
  font-weight: 700;
  margin-bottom: 6px;
}

.miner-info p {
  margin: 2px 0;
  font-size: 14px;
  color: var(--text-color);
}

.progress-bar {
  background: #eee;
  border-radius: 8px;
  height: 6px;
  width: 100%;
  margin: 8px 0 4px 0;
  overflow: hidden;
  position: relative;
}

.progress {
  background: #d9534f; /* 红色 */
  height: 100%;
  border-radius: 8px 0 0 8px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.van-button {
  min-width: 70px;
  font-size: 14px;
}


/* 列表整体 */
.mill-list {
  padding: 12px;
}

.minger-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 单个订单卡片 */
.minger-card.order-card {
  background: var(--bg-sub);
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s ease;
}

.minger-card.order-card:hover {
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

/* 信息区 */
.minger-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 标题和状态 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .minger-name {
    font-weight: 600;
    font-size: 16px;
    color: var(--text-color);
  }

  .status-badge {
    padding: 4px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
    color: #fff;
    white-space: nowrap;
    &.status-0 { background: #6c757d; } // 待处理
    &.status-1 { background: #28a745; } // 进行中
    &.status-2 { background: #ffc107; } // 待领取
    &.status-3 { background: #dc3545; } // 已取消
  }
}

/* 订单详情文字 */
.order-details p {
  font-size: 13px;
  color: var(--text-color2);
  margin: 3px 0;
  line-height: 1.4;
}

/* 进度条 */
.progress-section {
  margin-top: 4px;

  .progress-bar {
    background: #eee;
    border-radius: 6px;
    height: 6px;
    width: 100%;
    overflow: hidden;
    position: relative;
  }

  .progress {
    background: linear-gradient(90deg, #4caf50, #81c784);
    height: 100%;
    border-radius: 6px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 12px;
    color: var(--text-color2);
    margin-top: 4px;
    text-align: right;
  }
}

/* 操作按钮 */
.order-actions {
  margin-top: 8px;
  display: flex;
  gap: 10px;

  .van-button {
    flex: 1;
    font-size: 13px;
  }
}

/* 空列表提示 */
.empty-list {
  padding: 40px 0;
  text-align: center;
  color: #999;
}
</style>
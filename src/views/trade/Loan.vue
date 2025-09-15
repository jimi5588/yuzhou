<template>
  <TopBar :title="t('loan')" />
  <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
    <!-- 贷款产品 Tab -->
    <van-tab :title="$t('loan_product_tab')">
      <div class="loan-container">
        <!-- 可借额度 -->
        <van-cell-group class="custom-cell-group">
          <van-cell :title="$t('loan_limit')" :value="loanAmount + ' USD'" />
          <van-cell :title="$t('loaned_limit')" :value="loaned + ' USD'" />
        </van-cell-group>

        <!-- 贷款期限 -->

        <!-- 输入金额 -->
        <van-cell-group class="custom-cell-group">
          <van-field
            v-model.number="amount"
            :label="$t('amount')"
            :placeholder="$t('input_amount')"
            type="number"
          />
        </van-cell-group>

        <!-- 日利率 -->
        <van-cell-group class="custom-cell-group">
          <van-cell
            :title="$t('daily_interest')"
            :value="selectedTerm ? (selectedTerm.daily_interest_rate * 100).toFixed(2) + '%' : ''"
          />
        </van-cell-group>

        <!-- 总利息 -->
        <van-cell-group class="custom-cell-group">
          <van-cell
            :value="formattedInterest"
            :title="$t('total_interest')"
            readonly
          />
        </van-cell-group>
        <!-- 产品说明 -->
        <div v-if="content" class="product-description">
          <h4>{{ t('product_description') }}</h4>
          <div v-html="content"></div>
        </div>
        <!-- 借款按钮 -->
        <div class="button-wrapper">
          <van-button type="primary" block round @click="onBorrow">
            {{ $t('borrow_now') }}
          </van-button>
        </div>

      </div>
    </van-tab>

    <!-- 贷款记录 Tab -->
    <van-tab :title="$t('loan_history_tab')">
      <div class="loan-history-container">
        <!-- 加载状态 -->
        <van-loading v-if="historyLoading" class="loading-center" type="spinner" size="24px">
          {{ $t('common_loading') }}
        </van-loading>
        
        <!-- 有记录时显示 -->
        <div v-else-if="previousLoans.length" class="loan-history-list">
          <div
            v-for="(loan, index) in previousLoans"
            :key="index"
            class="loan-card"
            :class="{ 'active': isActiveLoan(loan.daikuan_status) }"
          >
            <!-- 卡片头部 -->
            <div class="card-header">
              <div class="amount-section">
                <span class="amount-label">{{ $t('amount') }}</span>
                <span class="amount-value">${{ formatAmount(loan.loan_amount) }}</span>
              </div>
              <div class="status-badge" :class="getStatusClass(loan.daikuan_status)">
                {{ getLoanStatus(loan.status) }}
              </div>
            </div>
            
            <!-- 卡片内容 -->
            <div class="card-content">
              <div class="info-grid">
                <div class="info-cell">
                  <div class="info-label">{{ $t('daily_interest') }}</div>
                  <div class="info-value highlight">{{ (loan.daily_interest_rate * 100).toFixed(2) }}%</div>
                </div>
                <div class="info-cell">
                  <div class="info-label">{{ $t('total_interest') }}</div>
                  <div class="info-value">${{ formatAmount(loan.total_interest_amount) }}</div>
                </div>
                <div class="info-cell">
                  <div class="info-label">{{ $t('loan_time') }}</div>
                  <div class="info-value">{{ formatDate(loan.create_time) }}</div>
                </div>
              </div>
            </div>
            

            <!-- 操作按钮 -->
            <div v-if="isActiveLoan(loan.status)" class="card-actions">
              <van-button size="small" type="primary" round @click="onRepay(loan)">
                {{ $t('repay_now') }}
              </van-button>
            </div>
          </div>
        </div>
        
        <!-- 无记录时显示 -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 64 64" fill="none">
              <path d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zM32 16c8.837 0 16 7.163 16 16s-7.163 16-16 16-16-7.163-16-16 7.163-16 16-16z" fill="#E5E7EB"/>
              <path d="M24 28h16v8H24z" fill="#9CA3AF"/>
            </svg>
          </div>
          <h3 class="empty-title">{{ $t('no_history') }}</h3>
          <p class="empty-description">{{ $t('no_history_desc') }}</p>
          <van-button type="primary" size="small" round @click="goToLoan" class="empty-action">
            {{ $t('borrow_now') }}
          </van-button>
        </div>

        <!-- 下拉刷新提示 -->
        <van-pull-refresh v-model="refreshing" @refresh="onRefreshHistory">
          <div v-if="previousLoans.length" class="refresh-trigger"></div>
        </van-pull-refresh>
      </div>
    </van-tab>

  </van-tabs>
</template>

<script setup>
import TopBar from '@/components/common/TopBar.vue';
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { loaninfo, loanhistory, loan } from '@/api';
import { showToast, showLoadingToast, closeToast, showFailToast } from 'vant';

const router = useRouter();
const { t } = useI18n();

const activeTab = ref(0); // Tab 切换状态
const historyLoading = ref(false); // 历史记录加载状态
const refreshing = ref(false); // 下拉刷新状态

const loanAmount = ref(0);
const loaned = ref(0);
const loanPeriodLabel = ref(''); 
const amount = ref(null);
const selectedTerm = ref(null);   
const content = ref(null);   
const totalInterest = ref(null);
const previousLoans = ref([]);
const periodOptions = ref([]);    
const showPeriodPicker = ref(false);
const defaultTermId = ref(1); // 默认选择第一个期限

function getLoanStatus(status) {
  const map = {
    0: t('status_pending'),
    1: t('status_repaymenting'),
    2: t('status_settled'),
    3: t('status_broken'),
    4: t('status_settled'),
    5: t('status_broken')
  };
  return map[status] || '-';
}

function getStatusClass(status) {
  const statusMap = {
    0: 'status-pending',
    1: 'status-approved', 
    2: 'status-rejected',
    3: 'status-active',
    4: 'status-completed',
    5: 'status-overdue'
  };
  return statusMap[status] || 'status-pending';
}

function isActiveLoan(status) {
  return status === 1 || status === 3; // 已批准或还款中
}

function formatAmount(amount) {
  return Number(amount).toLocaleString();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function calculateProgress(loan) {
  // 计算还款进度（示例逻辑，需要根据实际业务调整）
  const total_amount = loan.total_repayment_amount;
  const repaid_amount = loan.repaid_amount;

  const progress = Math.min((repaid_amount / total_amount) * 100, 100);
  return Math.round(progress);
}

const toloaninfo = () => {
  router.push({ path: '/pages/mine/messeage', query: { id: 2 } });
};

const formattedInterest = computed(() => {
  if (amount.value && selectedTerm.value) {
    return (amount.value * selectedTerm.value.daily_interest_rate * selectedTerm.value.days).toFixed(2) + ' USD';
  }
  return '';
});

// Tab 切换事件处理
function onTabChange(index) {
  if (index === 1) { // 切换到贷款记录 Tab
    getLoanHistory();
  }
}

async function getloaninfo() {
  try {
    const res = await loaninfo();
    closeToast();
    if (res.status === 200 && res.result) {
      const { user_loanall, user_alreadyloan, loan_terms } = res.result;
      loanAmount.value = user_loanall - user_alreadyloan;
      loaned.value = user_alreadyloan;

      periodOptions.value = loan_terms.map(term => ({
        text: term.label,
        value: term.id,
        ...term,
        min_amount: Number(term.min_amount),
        max_amount: term.max_amount != null ? Number(term.max_amount) : null,
        daily_interest_rate: Number(term.daily_interest_rate),
        days: Number(term.days),
        content: term.content
      }));

      // 设置默认期限
      if (loan_terms.length > 0) {
        selectedTerm.value = {
          text: loan_terms[0].label,
          value: loan_terms[0].id,
          ...loan_terms[0]
        };
        loanPeriodLabel.value = loan_terms[0].label;
        content.value = loan_terms[0].content || '';
      }
    }
  } catch (err) {
    closeToast();
    showFailToast(err.message);
  }
}

async function getLoanHistory() {
  try {
    historyLoading.value = true;
    const res = await loanhistory();
    if (res.status === 200 && res.result) {
      previousLoans.value = res.result;
    }
  } catch (err) {
    showFailToast(err.message);
  } finally {
    historyLoading.value = false;
  }
}

// 下拉刷新
async function onRefreshHistory() {
  try {
    await getLoanHistory();
    showToast({ message: t('refresh_success'), type: 'success' });
  } catch (err) {
    showFailToast(err.message);
  } finally {
    refreshing.value = false;
  }
}

// 跳转到借款Tab
function goToLoan() {
  activeTab.value = 0;
}

// 还款操作
function onRepay(loan) {
  // 处理还款逻辑
  showToast(t('repay_notcie'));
}

// 初始化加载
getloaninfo();

function onConfirmPeriod(pickerEvent) {
  const selected = pickerEvent.selectedOptions[0];
  selectedTerm.value = selected;
  loanPeriodLabel.value = selected.text;
  showPeriodPicker.value = false;
  content.value = selected.content || '';
}

async function onBorrow() {
  if (!selectedTerm.value && periodOptions.value.length > 0) {
    selectedTerm.value = periodOptions.value[0];
    loanPeriodLabel.value = periodOptions.value[0].text;
  }

  if (!selectedTerm.value) {
    return showFailToast(t('loan_terms_not_available'));
  }
  if (!amount.value) {
    return showFailToast(t('input_amount'));
  }

  const amt = Number(amount.value);
  const term = selectedTerm.value;

  if (amt < term.min_amount || (term.max_amount != null && amt > term.max_amount)) {
    return showFailToast(`${t('amount_range_warning')} ${term.min_amount} ~ ${term.max_amount || '∞'}`);
  }

  try {
    showLoadingToast(t('common_loading'));
    const res = await loan({ id: term.id, amount: amt });
    closeToast();

    if (res.status === 200) {
      showToast({ message: t('loan_success'), type: 'success' });
      getLoanHistory();
      amount.value = null;
      selectedTerm.value = null;
      loanPeriodLabel.value = '';
      totalInterest.value = null;
      activeTab.value = 1;
    } else {
      // 如果接口返回的是 message 而不是 result
      showFailToast(res.message || res.result || t('loan_failed'));
    }
  } catch (err) {
    closeToast();
    // 优先使用接口返回的 message，再 fallback 到 result
    const msg = err?.response?.data?.message || err?.response?.data?.result || t('loan_failed');
    showFailToast(msg);
  }
}

</script>

<style scoped>
.top-bar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loan-container {
  padding: 16px;
  padding-top: 20px;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.custom-cell-group {
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.button-wrapper {
  margin: 24px 16px 16px;
}

.right-info {
  text-align: right;
  font-size: 12px;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 贷款记录样式 */
.loan-history-container {
  background: #f8f9fa;
  min-height: calc(100vh - 200px);
  padding: 16px;
}

.loading-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  flex-direction: column;
  gap: 12px;
  color: #999;
}

.loan-history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loan-card {
  background: var(--bg-sub);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  overflow: hidden;
}

.loan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.loan-card.active {
  border-left: 4px solid #10b981;
}

.card-header {
  padding: 20px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.amount-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.amount-section .amount-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.amount-section .amount-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.status-approved {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.status-active {
  background: #d1fae5;
  color: #059669;
}

.status-badge.status-completed {
  background: #e0e7ff;
  color: #4f46e5;
}

.status-badge.status-rejected {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.status-overdue {
  background: #fecaca;
  color: #b91c1c;
}

.card-content {
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 480px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-cell .info-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-cell .info-value {
  font-size: 16px;
  color: #374151;
  font-weight: 600;
}

.info-cell .info-value.highlight {
  color: #10b981;
  font-weight: 700;
}

.progress-section {
  padding: 0 20px 16px;
}

.progress-section .progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.progress-section .progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-section .progress-bar .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.card-actions {
  padding: 0 20px 20px;
  border-top: 1px solid #f3f4f6;
  margin-top: 16px;
  padding-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
}

.empty-state .empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-state .empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px;
}

.empty-state .empty-description {
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 24px;
  max-width: 300px;
  line-height: 1.5;
}

.empty-state .empty-action {
  margin-top: 16px;
}

.refresh-trigger {
  height: 1px;
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .loan-history-container {
    padding: 12px;
  }
  
  .card-header {
    padding: 16px 16px 0;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .amount-section .amount-value {
    font-size: 24px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .loan-history-container {
    background: #111827;
  }
  
  .loan-card {
    background: #1f2937;
    border-color: #374151;
  }
  
  .loan-card.active {
    border-left-color: #10b981;
  }
  
  .amount-section .amount-value {
    color: #f9fafb;
  }
  
  .info-value {
    color: #e5e7eb;
  }
  
  .info-value.highlight {
    color: #34d399;
  }
  
  .empty-title {
    color: #f9fafb;
  }
}

.van-theme-dark .loan-container {
  background-color: #111827;
}

.van-theme-dark .loan-history-container {
  background: #111827;
}

.van-theme-dark .loan-card {
  background: #1f2937;
  border-color: #374151;
}

.van-theme-dark .loan-card.active {
  border-left-color: #10b981;
}

.van-theme-dark .amount-section .amount-value {
  color: #f9fafb;
}

.van-theme-dark .info-value {
  color: #e5e7eb;
}

.van-theme-dark .info-value.highlight {
  color: #34d399;
}

.van-theme-dark .empty-title {
  color: #f9fafb;
}
</style>

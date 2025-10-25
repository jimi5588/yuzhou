<template>
  <div class="trade-detail">
    <List :listRefresh="props.listRefresh" @load-data="loadData" v-slot:default="{ list }">
      <div class="order-item" v-for="item in list" :key="item.id">
        <div class="order-header">
          <div class="left">
            <span class="buy-tag" v-if="item.trade_type == 1">{{ t('common_buy') }}</span>
            <span class="sell-tag" v-else>{{ t('common_sell') }}</span>
            <span class="lot-size">{{ item.symbol }}</span>
            <span class="lot-size">x{{ item.order_quantity + t('trade_lots') }}</span>
          </div>
          <div class="right">
            <span class="price" :class="item.tempProfitPrice < 0 ? 'down' : 'up'">{{ item.tempProfitPrice }}</span>
          </div>
        </div>

        <div class="item-row">
          <div class="item">
            <span class="item-title">{{ t('trade_opening_price') }}</span>
            <span class="item-value">{{ item.open_price }}</span>
          </div>
          <div class="item">
            <span class="item-title">{{ t('trade_take_profit_price') }}</span>
            <span class="item-value">{{ item.take_profit_price }}</span>
          </div>
          <div class="item">
            <span class="item-title">{{ t('trade_current_price') }}</span>
            <span class="item-value">{{ item.current_price }}</span>
          </div>
        </div>

        <div class="item-row">
          <div class="item">
            <span class="item-title">{{ t('trade_stop_loss_price') }}</span>
            <span class="item-value">{{ item.stop_loss_price }}</span>
          </div>
          <div class="item">
            <span class="item-title">{{ t('trade_margin') }}</span>
            <span class="item-value">{{ item.margin }}</span>
          </div>
          <div class="item">
            <span class="item-title">{{ t('trade_overnight_fee') }}</span>
            <span class="item-value">{{ item.overnight_fee }}</span>
          </div>
        </div>

        <div class="item-row">
          <div class="item">
            <span class="item-title">{{ t('trade_lot_fee') }}</span>
            <span class="item-value">{{ item.fee }}</span>
          </div>
          <div class="item">
            <span class="item-title">{{ t('trade_position_opening_time') }}</span>
            <span class="item-value">{{ item.order_time }}</span>
          </div>
        </div>

        <div class="button-group" v-if="item.status === 1">
          <van-button type="primary" class="action-btn" @click="showProfitDialog(item)">
            {{ t('trade_set_profit_and_stop_loss') }}
          </van-button>
          <van-button type="danger" class="action-btn" @click="cancelOrder(item)">
            {{ t('trade_cancel_order') }}
          </van-button>
        </div>
      </div>
    </List>

    <!-- 止盈止损弹窗 -->
    <van-dialog
      v-model:show="setProfitDialog"
      :confirm-button-text="t('common_confirm')"
      :cancel-button-text="t('common_cancel')"
      show-cancel-button
      @confirm="setProfitAndStopLoss"
    >
      <div class="dialog-content">
        <div class="dialog-title">
          <span>{{ t('trade_set_profit_and_stop_loss') }}</span>
          <van-icon name="cross" size="20" @click="setProfitDialog = false" />
        </div>

        <van-row :gutter="[0, 15]">
          <van-col span="12" class="label">
            <span>{{ t('trade_take_profit_price') }}：</span>
          </van-col>
          <van-col span="12">
            <van-stepper v-model="profitPrice" input-width="70px" />
          </van-col>

          <van-col span="12" class="label">
            <span>{{ t('trade_stop_loss_price') }}：</span>
          </van-col>
          <van-col span="12">
            <van-stepper v-model="lossPrice" input-width="70px" />
          </van-col>
        </van-row>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { getAllContractOrderList, setContract, closeContract } from '@/api'
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant'

const { t } = useI18n()
const store = useStore()

// ✅ 接收父组件的 props
const props = defineProps({
  status: { type: [Number, String], default: null },
  listRefresh: { type: Boolean, default: false }
})

const setProfitDialog = ref(false)
const profitPrice = ref(0)
const lossPrice = ref(0)
const selectOrder = ref(null)
const currencyMap = computed(() => store.state.currencyMap)

// ✅ 数据加载方法
const loadData = (params, successCallback, errCallback) => {
  getAllContractOrderList({ ...params, status: props.status })
    .then(res => {
      successCallback({
        list: res.result.list || [],
        total: res.result.count || 0
      })
    })
    .catch(err => {
      errCallback(err)
      console.error('加载失败', err)
    })
}

// ✅ 盈亏计算
const getTempProfitPrice = (item) => {
  const diff = (item.current_price - item.open_price) * item.order_quantity
  const profit = item.trade_type == 1 ? diff : -diff
  const risk = Math.abs((diff / item.open_price) * 100)
  return {
    price: profit.toFixed(2),
    fengxian: risk.toFixed(2)
  }
}

// ✅ 弹窗处理
const showProfitDialog = (item) => {
  selectOrder.value = item
  profitPrice.value = item.take_profit_price || item.current_price
  lossPrice.value = item.stop_loss_price || item.current_price
  setProfitDialog.value = true
}

const setProfitAndStopLoss = () => {
  const params = {
    id: selectOrder.value.id,
    stop_loss_price: lossPrice.value,
    target_profit_price: profitPrice.value
  }
  setContract(params).then(() => {
    showSuccessToast(t('common_success'))
  }).catch(err => {
    showFailToast(err.message)
  })
}

const cancelOrder = (item) => {
  showConfirmDialog({
    message: t('trade_close_sure_message'),
    cancelButtonText: t('common_cancel'),
    confirmButtonText: t('common_confirm')
  })
    .then(() => {
      closeContract({ id: item.id }).then(() => {
        showSuccessToast(t('common_success'))
        // ✅ 直接刷新整个页面
          setTimeout(() => {
            window.location.reload()
          }, 500) // 给 toast 一点时间显示
      })
    })
    .catch(() => {})
}
</script>


<style lang="scss" scoped>
.trade-detail {
    //   background: #f5f5f5;
    min-height: 100vh;
}

.van-nav-bar {
    --van-nav-bar-height: 66px;
    --van-line-height-lg: 18px;
}

.title-left {
    display: flex;
    flex-direction: column;
    margin-left: 20px;

    span {
        font-size: 15px;
        text-align: left;
    }

    .rate-wrap {
        text-align: left;
    }

    .profit {
        color: #07c160;
    }

}

.close-all-btn {
    background: linear-gradient(180deg, #f77062 0, #fe5196);
    border: none;
    border-radius: 5px !important;
    backdrop-filter: blur(10px);
    height: 35px !important;
    font-size: 14px !important; // 直接统一这里
}


.value.profit {
    color: #07c160;
}

.order-item {
    background: var(--bg-sub);
    padding: 12px;
    border-top: 1px solid #E5E7EB;



    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .left {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .sell-tag {
            color: #07c160;
            font-weight: bold;
        }

        .lot-size {
            color: #666;
            font-size: 14px;
        }

        .price {
            font-size: 16px;
            font-weight: bold;
            color: #07c160;
        }
    }

    .item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 8px 0;

        .item {
            flex: 1;
            display: flex;
            flex-direction: column;
            text-align: center;

            &:first-child {
                text-align: left;
            }

            &:last-child {
                text-align: right;
            }

            .item-title {
                font-size: 13px;
                color: #999;
            }

            .item-value {
                font-size: 15px;
            }
        }
    }

    .button-group {
        display: flex;
        justify-content: end;
        margin: 10px;

        .action-btn {
            background: #07c160;
            border-color: #07c160;
            font-size: 14px
        }

        .van-button--primary{
            height: 44px !important;
        }
        .van-button--primary van-button__text {
            font-size: 14px !important;
            height: 30px !important;
        }

        .action-btn:last-child {
            margin-left: 10px;
            background: #3eaf7c;
            border-color: #3eaf7c;
        }
    }
}

:deep(.van-tabs__line) {
    background-color: #07c160;
}

:deep(.van-tab--active) {
    color: #07c160;
}

.dialog {
    :deep(.van-dialog) {
        --van-dialog-width: 380px;
        --van-dialog-radius: 6px;
        --van-button-default-background: #F5F5F5;

        .van-dialog__cancel {
            border-right: 1px solid #CCC;
        }
    }
}

.dialog-content {

    .dialog-title {

        display: flex;
        align-items: center;
        border-bottom: 1px solid #E5E7EB;
        padding: 16px;

        span {
            flex: 1;
            font-size: 14px;
            text-align: center;
        }

        .van-icon {
            cursor: pointer;
        }
    }

    .button-group {
        display: flex;
        margin: 20px 12px;
        gap: 10px;

        .action-btn {
            flex: 1;
            height: 60px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            cursor: pointer;
            font-size: 14px;
            padding: 5px;
        }

        /* 未选中状态 */
        .action-btn:nth-child(1) {
            border: 1px solid #1989fa;
            color: #1989fa;
            font-size: 14px;
        }

        .action-btn:nth-child(2) {
            border: 1px solid #07c160;
            color: #07c160;
            font-size: 14px;
        }

        .action-btn:nth-child(3) {
            border: 1px solid #ee0a24;
            color: #ee0a24;
            font-size: 14px;
        }

        /* 选中状态 */
        .action-btn:nth-child(1).active {
            background-color: #1989fa;
            color: white;
        }

        .action-btn:nth-child(2).active {
            background-color: #07c160;
            color: white;
        }

        .action-btn:nth-child(3).active {
            background-color: #ee0a24;
            color: white;
        }
    }

    .van-row {
        padding: 20px 12px;

        span {
            font-size: 14px;
        }

        .label {
            text-align: right;
        }

        .expect {
            text-align: center;
        }
    }

}

.up {
    color: #00b897 !important;
}

.down {
    color: #f44336 !important;
}

.van-theme-dark {
    .order-item {
        border-top: 1px solid #333;
    }

    .dialog :deep(.van-dialog) {
        --van-button-default-background: #333 !important;

        .van-dialog__cancel {
            border-right: 1px solid #454545;
        }
    }

    .dialog-content .dialog-title {
        border-bottom: 1px solid #454545;
    }
}
</style>
<template>
    <div class="order-page">
      <TopBar :title="t('trade_order_record')"></TopBar>
      <van-tabs v-model:active="activeTab" :ellipsis="false" @click-tab="listRefresh = true">
        <van-tab :title="t('trade_pending_order')" />
        <van-tab :title="t('trade_in_transaction')" />
        <van-tab :title="t('trade_close_position')" />
        <van-tab :title="t('trade_order_cancelled')" />
      </van-tabs>
  
      <List :listRefresh="listRefresh" @load-data="loadData" v-slot:default="slotProps">
        <div class="order-item" v-for="item in slotProps.list" :key="item.id">
          <div class="order-header">
            <div class="left">
              <span class="sell-tag">{{ tradeTypeText(item) }}</span>
              <span class="lot-size">{{ item.symbol }}</span>
              <span class="lot-size">x{{ item.order_quantity }}{{ t('trade_lots') }}</span>
            </div>
            <div class="right">
              <span class="price">{{ item.profit_loss }}</span>
            </div>
          </div>
          <div class="item-row">
            <div class="item">
              <span class="item-title">{{ t('trade_delegated_price') }}</span>
              <span class="item-value">{{ item.open_price }}</span>
            </div>
            <div class="item">
              <span class="item-title">{{ t('trade_take_profit_price') }}</span>
              <span class="item-value">{{ item.take_profit_price }}</span>
            </div>
            <div class="item">
              <span class="item-title">{{ t('trade_leverage') }}</span>
              <span class="item-value">{{ item.leverage }}</span>
            </div>
          </div>
          <div class="item-row">
            <div class="item">
              <span class="item-title">{{ t('trade_current_price') }}</span>
              <span class="item-value">{{ item.current_price }}</span>
            </div>
            <div class="item">
              <span class="item-title">{{ t('trade_stop_loss_price') }}</span>
              <span class="item-value">{{ item.stop_loss_price }}</span>
            </div>
            <div class="item">
              <span class="item-title">{{ t('trade_margin') }}</span>
              <span class="item-value">{{ item.margin }}</span>
            </div>
          </div>
          <div class="item-row">
            <div class="item">
              <span class="item-title">{{ t('trade_fee') }}</span>
              <span class="item-value">{{ item.fee }}</span>
            </div>
            <div class="item">
              <span class="item-title">{{ t('trade_overnight_fee') }}</span>
              <span class="item-value">{{ item.overnight_fee }}</span>
            </div>
            <div class="item">
              <span class="item-title">{{ t('trade_profit_loss_ratio') }}</span>
              <span class="item-value">{{ item.margin !== 0 ? ((item.profit_loss / item.margin) * 100).toFixed(2) + '%' : 'N/A' }}</span>
            </div>
          </div>
          <div class="item-row">
            <div class="item">
              <span class="item-title">{{ t('trade_order_time') }}</span>
              <span class="item-value">{{ item.order_time }}</span>
            </div>
            <div class="item"></div>
            <div class="item">
              <span class="item-title">{{ t('trade_close_time') }}</span>
              <span class="item-value">{{ item.close_time }}</span>
            </div>
          </div>
  
          <div class="button-group" v-if="activeTab === 0 || activeTab === 1">
            <van-button type="primary" class="action-btn" @click="showProfitDialog(item)">
              {{ t('trade_set_profit_and_stop_loss') }}
            </van-button>
            <van-button type="primary" class="action-btn" @click="cancelOrder(item)">
              {{ t('trade_cancel_order') }}
            </van-button>
          </div>
        </div>
      </List>
    </div>
  
    <div class="dialog">
      <van-dialog v-model:show="setProfitDialog" :confirm-button-text="t('common_confirm')"
        :cancel-button-text="t('common_cancel')" :show-cancel-button="true" @confirm="setProfitAndStopLoss">
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
              <van-stepper v-model="profitPrice" input-width="100px" />
            </van-col>
            <van-col span="24" class="expect">
              <span>{{ t('trade_expected_profit') }}：{{ expectProfit }}</span>
            </van-col>
            <van-col span="12" class="label">
              <span>{{ t('trade_stop_loss_price') }}：</span>
            </van-col>
            <van-col span="12">
              <van-stepper v-model="lossPrice" input-width="100px" />
            </van-col>
            <van-col span="24" class="expect">
              <span>{{ t('trade_expected_loss') }}：{{ expectLoss }}</span>
            </van-col>
          </van-row>
  
        </div>
      </van-dialog>
    </div>
  </template>
  
  <script setup>
  import TopBar from '@/components/common/TopBar.vue';
  import { ref, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { getAllContractOrderList, setContract, cancelContractOrder, closeContract } from '@/api';
  
  const { t } = useI18n();
  const activeTab = ref(0);
  const listRefresh = ref(false);
  
  const setProfitDialog = ref(false);
  const profitPrice = ref(99414.2);
  const expectProfit = ref(13352595.90);
  const lossPrice = ref(99414.2);
  const expectLoss = ref(0.00);
  const selectOrder = ref(null);
  
  const loadData = (params, successCallback, errCallback) => {
      listRefresh.value = false;
      params.status = activeTab.value;
      getAllContractOrderList(params).then(res => {
          successCallback(res.result.data);
      }).catch(err => {
          errCallback(err);
      });
  }
  
  const showProfitDialog = (item) => {
      selectOrder.value = item;
      profitPrice.value = item.take_profit_price;
      lossPrice.value = item.stop_loss_price;
      setProfitDialog.value = true;
  }
  
  const setProfitAndStopLoss = () => {
      let params = {
          id: selectOrder.value.id,
          stop_loss_price: lossPrice.value,
          target_profit_price: profitPrice.value,
      };
      showLoadingToast(t('common_loading'));
      setContract(params).then(res => {
          showSuccessToast(t('common_success'));
          listRefresh.value = true;
      }).catch(err => {
          showFailToast(err.message);
      });
  };
  
  const cancelOrder = (item) => {
      showConfirmDialog({
          message: t('trade_close_sure_message'),
          cancelButtonText: t('common_cancel'),
          confirmButtonText: t('common_confirm'),
      })
      .then(() => {
          let params = { id: item.id };
          showLoadingToast(t('common_loading'));
          let api = activeTab.value === 0 ? cancelContractOrder : closeContract;
          api(params).then(res => {
              showSuccessToast(t('common_success'));
              listRefresh.value = true;
          }).catch(err => {
              showFailToast(err.message);
          });
      })
      .catch(() => {});
  };
  
  const tradeTypeText = (item) => {
      if (item.trade_type === 1) {
          return t('common_buy');  // "买入"
      } else if (item.trade_type === 2) {
          return t('common_sell');  // "卖出"
      }
      return t('common_unknown');  // "未知"
  }
  </script>
  
<style lang="scss" scoped>
.order-page {
    min-height: 100vh;
    // background: #f5f5f5;
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
            color: #ee0a24;
            font-weight: bold;
        }

        .lot-size {
            color: #666;
            font-size: 14px;
        }

        .price {
            font-size: 16px;
            font-weight: bold;
            color: #333;
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
        margin-top: 10px;

        .action-btn {
            background: #07c160;
            border-color: #07c160;
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
            font-size: 18px;
            text-align: center;
        }

        .van-icon {
            cursor: pointer;
        }
    }

    .van-row {
        padding: 20px 12px;

        span {
            font-size: 16px;
        }

        .label {
            text-align: right;
        }

        .expect {
            text-align: center;
        }
    }

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
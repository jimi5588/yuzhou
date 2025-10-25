<template>
    <TopBar :title="$t('assets_record')"></TopBar>
    <van-tabs v-model:active="activeTab" type="card" @click-tab="onClickTab">
        <van-tab :title="$t('common_deposit')" />
        <van-tab :title="$t('common_withdraw')" />
    </van-tabs>
    <List class="list" :listRefresh="listRefresh" @load-data="loadData" v-slot:default="slotProps">
        <div class="item" v-for="item in slotProps.list">
            <div class="item-top">
                <p>{{ item.currency }}</p>
                <p>{{ item.money }}<br /></p>

            </div>
            <div class="item-bottom">
                <span class="time"></span>
                <div class="item-bright">
                    <span class="status">
                        <!-- 充值状态 -->
                        <template v-if="activeTab == 0">
                            <span :class="[
                                item.status === 0 ? 'status-pending' :
                                    item.status === 1 ? 'status-success' :
                                        item.status === 2 ? 'status-failed' : 'status-unknown'
                            ]">
                                {{
                                    item.status == 0 ? $t('review_pending') :
                                        item.status == 1 ? $t('review_success') :
                                            item.status == 2 ? $t('review_failed') :
                                                $t('status_unknown')
                                }}
                            </span>
                        </template>
                        <!-- 提现状态 -->
                        <template v-else>
                            <span :class="[
                                item.status === 1 ? 'status-pending' :
                                    item.status === 2 ? 'status-success' :
                                        item.status === 3 ? 'status-failed' :
                                            'status-unknown'
                            ]">
                                {{
                                    item.status == 1 ? $t('review_pending') :
                                        item.status == 2 ? $t('review_success') :
                                            item.status == 3 ? $t('review_failed') :
                                                $t('status_unknown')
                                }}
                            </span>
                        </template>
                    </span>
                </div>
            </div>

            <div class="item-bottom">
                <span class="time">{{ activeTab == 0 ? $t('recharge') : $t('common_withdraw') }}({{ $t('common_time') }})</span>
                <div class="item-bright">
                    <span class="status">
                        {{ item.time }}
                    </span>
                    <span class="time">
                        <template v-if="activeTab == 0">
                            {{ item.remark }}
                        </template>
                        <!-- 提现状态 -->
                        <template v-else>
                            {{ item.remark }}
                        </template>

                    </span>
                    <span class="time">
                        <template v-if="activeTab == 0">
                            {{ item.paytime }}
                        </template>
                        <!-- 提现状态 -->
                        <template v-else>
                            {{ item.paymentime }}
                        </template>
                    </span>

                </div>
            </div>
            <div class="item-bottom" v-if="activeTab === 0 ">
                <span class="time">{{ $t('Number_of_accounts_received') }}</span>
                <div class="item-bright">
                    <span class="time">
                        {{  item.money  }}
                    </span>
                </div>
            </div>
            <div class="item-bottom" v-if="activeTab === 1 && item.currency !== 'BANK'">
                <span class="time">{{ $t('user_wallet') }}</span>
                <div class="item-bright">
                    <span class="time">
                        {{ item.address }}
                    </span>
                </div>
            </div>
            <div class="item-bottom" v-if="activeTab === 1 && item.currency === 'BANK'">
                <span class="time">{{ $t('bank_card_number') }}</span>
                <div class="item-bright">
                    <span class="time">
                        {{ item.cardno }}
                    </span>
                </div>
            </div>            
            <div class="item-bottom" v-if="activeTab === 1 ">
                <span class="time">{{ $t('handling') }}</span>
                <div class="item-bright">
                    <span class="time">
                        {{ item.fee }}
                    </span>
                </div>
            </div>
        </div>
    </List>
</template>

<script setup>
import TopBar from '../../components/common/TopBar.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { getDepositRecord, getWithdrawRecord } from '@/api'

const { t } = useI18n();
const router = useRouter();

const activeTab = ref(0);
const listRefresh = ref(false);

const list = ref([]);

const onClickTab = () => {
    listRefresh.value = true
}

const loadData = (params, successCallback, errCallback) => {
  listRefresh.value = false;

  const requestFn = activeTab.value === 0 ? getDepositRecord : getWithdrawRecord;

  requestFn(params)
    .then(res => {
    console.log('接口返回', res);
      successCallback({
        list: res.result.list || [],
        total: res.result.total || 0
      });
    })
    .catch(err => {
      errCallback(err);
    });
};

</script>

<style lang="scss" scoped>
.van-tabs {
    margin: 16px 16px 0;
    flex: 1;
    --van-tabs-card-height: 36px;
    --van-padding-md: 0;
    --van-border-width: 0;
    --van-tabs-nav-background: transparent;

    :deep(.van-tabs__wrap) {
        height: auto;
        background: #ECEFF4;
        border-radius: 5px;
    }

    :deep(.van-tabs__nav--card) {
        margin: 3px;
    }

    :deep(.van-tab--card) {
        color: #808080;
    }

    :deep(.van-tab--card.van-tab--active) {
        background-color: #fff;
        color: #000;
        border-radius: 5px;
    }
}


.list {
    padding: 16px;

    .item {
        margin-bottom: 16px;
        padding: 16px;
        background: var(--bg-sub);
        border-radius: 10px;
        display: flex;
        flex-direction: column;

        .item-top {
            display: flex;
            justify-content: space-between;
            align-items: center;

            p {
                font-size: 19px;

                &:last-child {
                    color: #28BA99;
                    text-align: right;
                }
            }
        }

        .item-bottom {
            display: flex;
            justify-content: space-between;
            align-items: end;
            margin-top: 5px;

            span {
                font-size: 13px;

                &.type {
                    color: #28BA99;
                    ;
                }

                &.status {
                    color: red;
                    font-size: 13px;
                }

                &.time {
                    color: #999;
                }
            }

            .item-bright {
                display: flex;
                flex-direction: column;
                align-items: end;
            }
        }
    }
}

.status-pending {
    color: blue; // 橙色
}

.status-success {
    color: green; // 绿色
}

.status-failed {
    color: #dc3545; // 红色
}

.status-unknown {
    color: #6c757d; // 灰色
}

.van-theme-dark {
    .van-tabs {
        :deep(.van-tabs__wrap) {
            background: #1F2229;
        }

        :deep(.van-tab--card) {
            color: #fff;
        }

        :deep(.van-tab--card.van-tab--active) {
            color: #000;
        }
    }

    .status-pending {
        color: yellow; // 橙色
    }

    .status-success {
        color: lightgreen; // 绿色
    }
}
</style>

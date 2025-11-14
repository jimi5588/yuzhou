<template>
    <div class="head">
        <img src="../../assets/images/headimage.504f68d5.svg" width="30px" @click="toPage('usercenter')" />
        <van-search v-model="searchText" :placeholder="t('common_search')" @click="toPage('currency/search')"/>
        <Icon class="icon-right" name="kefu" size="22px" @click="toPage('user/kefu')" />
        <Icon class="icon-right" name="notice" size="26px" @click="toPage('message/center')" />
        <Icon class="icon-right" name="earth" size="22px" @click="toPage('language')" />
        <Icon class="icon-right" :name="isDark ? 'light' : 'dark'" size="24px" @click="switchTheme" />
        <Icon v-if="false" class="icon-right" name="download1" size="24px" @click="toPage('appdownload')" />
    </div>
    <van-list>
        <div class="home-container">
            <van-swipe class="banner" :autoplay="3000" :show-indicators="false" lazy-render>
                <van-swipe-item v-for="item in banners">
                    <img :src="baseUrl + item.image" />
                </van-swipe-item>
            </van-swipe>
            <van-notice-bar :scrollable="false" mode="link" @click="toPage('message/center')" >
                <template #left-icon>
                    <img src="../../assets/images/favicon.ico" width="25px" />
                </template>
                <template #right-icon>
                    <img src="../../assets/images/notify.7457eaf5.svg" width="20px" />
                </template>

                <div class="notice-marquee">
                    <div class="notice-marquee-content">
                    <span v-for="(item, index) in noticeList.length > 0 ? noticeList : noNoticeList" :key="index">
                        {{ noticeList.length > 0 ? item.title : item }}
                        <span v-if="index !== (noticeList.length > 0 ? noticeList.length : noNoticeList.length) - 1"> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; </span>
                    </span>
                    </div>
                </div>
            </van-notice-bar>

            <van-grid :border="false" :column-num="4">
                <van-grid-item :text="t('common_deposit')" @click="toPage('recharge/counter')">
                    <template #icon>
                        <img src="../../assets/images/home-nav-1.png" width="30px" />
                    </template>
                </van-grid-item>
                <van-grid-item :text="t('common_withdraw')" @click="toPage('withdraw')">
                    <template #icon>
                        <img src="../../assets/images/home-nav-2.png" width="30px" />
                    </template>
                </van-grid-item>

                <van-grid-item :text="$t('loan')" @click="toPage('trade/loan')">
                    <template #icon>
                        <img src="../../assets/images/loan.png" width="30px" />
                    </template>
                </van-grid-item>

                <van-grid-item :text="$t('mining')" @click="toPage('trade/staking')">
                    <template #icon>
                        <img src="../../assets/images/kuang.png" width="30px" />
                    </template>
                </van-grid-item>

                <van-grid-item :text="$t('shouquan')" @click="toPage('newcoin')" v-if="true">
                    <template #icon>
                        <img src="../../assets/images/shouquan.png" width="30px" />
                    </template>
                </van-grid-item>

                <van-grid-item :text="$t('user_kyc')" @click="toPage('user/auth')">
                    <template #icon>
                        <img src="../../assets/images/kyc.png" width="30px" />
                    </template>
                </van-grid-item>

                <van-grid-item :text="$t('common_share')" @click="toPage('user/share')" v-if="false">
                    <template #icon>
                        <img src="../../assets/images/home-nav-16.png" width="30px" />
                    </template>
                </van-grid-item>

                <van-grid-item :text="$t('trade_order_record')" @click="toPage('home/order')">
                    <template #icon>
                        <img src="../../assets/images/exchange.png" width="30px" />
                    </template>
                </van-grid-item>

                <van-grid-item :text="$t('home_contact_us')" @click="toPage('user/kefu')">
                    <template #icon>
                        <img src="../../assets/images/home-nav-6.png" width="30px" />
                    </template>
                </van-grid-item>

            </van-grid>
            <!-- 货币列表 -->
            <div class="currency-wrapper">

                <div class="quick-buy" @click="toPage('message/detail?id=4&type=3')">
                    <img src="../../assets/images/consumeOne.0b8000f1.svg" />
                    <div class="text">
                        <span class="title">{{ $t('pingtai_tiaokuan_title') }}</span>
                        <span class="desc">{{ $t('pingtai_tiaokuan_desc') }}</span>
                    </div>
                </div>
                <div class="currency-hor-wrap">
                    <HScroll>
                        <div class="currency-hor-item" v-for="(item, key) in currencyList" :key="key" @click="toTrade(item)">
                            <span class="symbol">{{ item.name }}</span>

                            <span v-if="item.status == -1" class="change close-text">{{ t('common_closed') }}</span>
                            <span v-else class="change" :class="['change', item.change >= 0 ? 'up' : 'down']">{{ item.change >
                                0 ?
                                '+' : '-'
                            }}{{ Math.abs(item.change).toFixed(2) }}%</span>

                            <span v-if="item.status == -1" class="close close-text">---</span>
                            <span v-else class="close" :class="['change', item.change >= 0 ? 'up' : 'down']">{{ item.price
                                }}</span>
                        </div>
                    </HScroll>
                </div>
                <Currency ref="childCurrency"></Currency>
            </div>
        </div>
    </van-list>
    <!-- <van-popup v-model:show="showUserCenterPopup" position="left" :style="{ width: '100%', height: '100%' }">
        <UserCenter @close="showUserCenterPopup = false"></UserCenter>
    </van-popup> -->
    <van-popup class="popup-mess" v-model:show="showDialog" closeable position="center">
        <h2 class="popup-title">{{ dialogMess.title }}</h2>
        <div v-html="dialogMess.content"></div>
    </van-popup>

    <FloatBubble ></FloatBubble>
</template>

<script setup>
import HScroll from '@/components/common/HScroll.vue';
import FloatBubble from '../../components/common/FloatBubble.vue';
import UserCenter from '../user/UserCenter.vue';
import { onMounted, ref, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { useKlineSocket } from '@/service/KlineSocket';
import { getBanners, getNoticeList, getHomePopup } from '@/api'

const { t } = useI18n()
const store = useStore()
const router = useRouter()
const noNoticeList = ref([
    t('home_no_notice')
])
const { message } = useKlineSocket()
const symbol = ref(store.state.symbol)
const baseUrl = ref(store.state.baseUrl)
const user = ref(store.state.user)
const currencyMap = computed(() => store.state.currencyMap)
const currencyList = computed(() => 
    Object.values(store.state.currencyMap).sort((a, b) => {
        return b.sort - a.sort
    })
)
const projectName = ref('')
const notice = ref({
    title: '',
    htmls: '',
    gmtModified: ''
})
const showDialog = ref(false)
const dialogMess = ref('')
const isDark = computed(() => store.state.theme === "dark")
const searchText = ref('')
const noticeList = ref([]) 
const isNoticeLoaded = ref(false)
const childCurrency = ref(null)
// const showUserCenterPopup = ref(false)

const banners = ref([])

const search = () => {
    // if (childCurrency.value) {
    //     childCurrency.value.search(searchText.value)
    // }
}

const toTrade = (item) => {
    store.commit("updateCurrencySymbol", item.jiaoyidui.toLowerCase());
    router.push('/pages/trade')
}

const switchTheme = () => {
    let theme = isDark.value ? "light" : "dark"
    store.commit("updateTheme", theme)
}

const toPage = (path) => {
    router.push("/pages/" + path);
}

getBanners().then(res => {
    banners.value = res.data
}).catch(err => {})

getNoticeList().then(res => {
    noticeList.value = res.data
}).catch(err => {})

</script>

<style lang="scss" scoped>
.head {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 15px;

    .van-search {
        flex: 1;
        --van-search-background: transparent;
        --van-search-content-background: var(--bg-sub);
        --van-radius-sm: 20px;
    }

    .icon-right {
        margin-left: 10px;
    }

    svg {
        cursor: pointer;
    }
}

.banner {
    margin: 0 15px;

    img {
        width: 100%;
        height: 135px;
        border-radius: 10px;
    }
}

.van-notice-bar {
    --van-notice-bar-background: transparent;
    --van-notice-bar-text-color: var(--text-color);
    --van-notice-bar-height: 50px;
    --van-notice-bar-line-height: 50px;
    --van-notice-bar-icon-size: 20px;

    .notice-swipe {
        height: 50px;
        line-height: 50px;
        padding-left: 10px;
    }
}

:deep(.van-grid) {
    margin: 0 15px;
    border-radius: 10px;
    background: var(--bg-sub);
    --van-grid-item-text-font-size: 13px;
    --van-grid-item-content-padding: 16px 5px;
    --van-grid-item-content-background: transparent;

    .van-grid-item__content--center {
        justify-content: start;
    }

    .van-grid-item__text {
        margin-top: 6px;
    }
}


.currency-wrapper {
    background: var(--bg-sub);
    margin: 10px 0 0 0;
    padding: 10px 0;

    .currency-hor-wrap {
        padding: 20px;

        .currency-hor-item {
            padding: 0 30px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .symbol {
                color: var(--text-color);
                font-size: 14px;
                white-space: nowrap;
            }

            .close {
                color: var(--color-theme);
                font-size: 26px !important;
                font-weight: bold;
            }

            .change {
                color: rgba(233, 84, 99);
                font-size: 14px;
                margin-top: 3px;
            }

            .up {
                color: #00b897;
            }

            .down {
                color: #f44336;
            }

            .close-text {
                color: #999;
            }
        }
    }

    .follow-order {
        position: relative;
        padding: 30px;
        display: flex;
        flex-direction: column;

        .title {
            font-size: 15px;
            color: var(--text-color);
        }

        .desc {
            width: 75%;
            font-size: 12px;
            color: #70819F;
            margin-top: 5px;
        }

        .van-button {
            width: fit-content;
            height: 32px !important;
            margin-top: 30px;
            margin-bottom: 20px;
        }

        img {
            width: 150px;
            position: absolute;
            bottom: 30px;
            right: 30px;
        }
    }

    .quick-buy {
        height: 80px;
        background-image: url('../../assets/images/bg_home_buy.png');
        background-size: 100% 100%;

        color: var(--text-color);
        margin: 10px 15px;
        border-radius: 5px;
        display: flex;
        align-items: center;

        img {
            margin-left: 10px;
        }

        .text {
            display: flex;
            flex-direction: column;
            margin: 10px 50px 10px 20px;

            .title {
                font-size: 16px;
                font-weight: bold;
                color: #333;
            }

            .desc {
                font-size: 11px;
                color: #999;
            }

            .unit {
                font-size: 11px;
                color: #999;
            }
        }

        img {
            width: 70px;
            height: 70px;
        }
    }
}


.popup-mess {
    width: 320px;
    min-height: 80px;
    border-radius: 10px;
    padding: 36px 16px 16px;
    --van-popup-close-icon-margin: 8px;
    --van-popup-close-icon-size: 18px;

    :deep(.popup-title) {
        max-width: 250px;
        margin: 10px auto;
        margin-top: -25px;
        text-align: center;
    }

    :deep(img) {
        width: 100%;
        max-width: 100%;
        height: auto;
    }

    :deep(*) {
        white-space: pre-wrap;
        /* 保留空白符，同时允许换行 */
        word-wrap: break-word;
        /* 允许长单词或 URL 换行 */
        overflow-wrap: break-word;
        /* 更现代的属性，效果与 word-wrap 相同 */
    }
}
</style>

<style lang="scss">
.van-theme-light {
    .follow-order {
        background: #dcebff;
    }

    .welfare-activity {
        background: #fff;
    }
}

.van-theme-dark {
    .follow-order {
        background: #333c5d !important
    }

    .welfare-activity {
        background: #16191e !important
    }
}

.notice-marquee {
  overflow: hidden;
  white-space: nowrap;
}

.notice-marquee-content {
  display: inline-block;
  padding-left: 100%; /* 从右边开始 */
  animation: marquee 15s linear infinite;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}
.van-notice-bar__wrap {
    padding-left: 10px;
}
</style>

<template>
    <TopBar  :title="$t('shouquanxinxi')">
            <!-- <template #right>
                <span class="iconfont icon-shuaxin" @click="toPage('ncrecords')"> {{$t('shengou_my')}}</span>
            </template> -->
    </TopBar>
    <div class="content">  
        <div class="feature-card">
            <img src="../../assets/images/ss3.webp" class="feature-img" />
            <div class="feature-text">
                <p>
                We do the work for you. We partner with experts at the Gates Foundation
                to identify vetted projects where additional funding from our community
                of donors can complement and accelerate work that is already under way.
                </p>
                <a
                class="feature-btn"
                href="https://www.gatesphilanthropypartners.org/"
                target="_blank"
                >
                Learn how you can give with us
                </a>
            </div>
        </div>
        <p class="title"><img src="../../assets/images/s1.png" /></p>
        <p class="title"><img src="../../assets/images/s2.png" /></p>
    </div>
    <FloatBubble ></FloatBubble>

</template>

<script setup>
import OptionOrder from '../../components/trade/OptionOrder.vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { subscription} from '@/api'

const { t } = useI18n()
const store = useStore()
const activeTab = ref(0);
const router = useRouter()

const currencySymbol = computed(() => store.state.currencySymbol)
const currency = computed(() => store.state.currencyMap[currencySymbol.value])
const listRefresh = ref(false)

const loadData = (params, successCallback, errCallback) => {
    listRefresh.value = false
    subscription(params).then(res => {
        successCallback(res.result.data)
        count.value = res.result.count
        if (params.page === 1) {
            list.value = res.result.data
        } else {
            list.value.push(...res.result.data)
        }
    }).catch(err => {
        errCallback(err)
    })
}

const toPage = (path) => {
    router.push("/pages/" + path);
}
</script>

<style lang="scss" scoped>

.van-tabs {
    margin: 10px;
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
    padding: 0 12px;
}

.van-theme-dark .van-tabs {
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

.content {
    padding: 16px;

    p.title {
        font-size: 17px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;

        img {
            display: block;
            max-width: 100%;   // 限制宽度
            height: auto;      // 等比缩放
            margin: 0 auto;    // 居中
            border-radius: 6px; // 看起来更美观，可选
        }
    }
}

.feature-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 24px;
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  .feature-img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
  }

  .feature-text {
    padding: 16px;

    p {
      font-size: 15px;
      line-height: 1.6;
      color: #444;
      margin-bottom: 16px;
    }

    .feature-btn {
      display: inline-block;
      padding: 10px 20px;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: #fff;
      font-weight: bold;
      border-radius: 25px;
      text-decoration: none;
      transition: background 0.3s ease;

      &:hover {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }
  }
}


</style>
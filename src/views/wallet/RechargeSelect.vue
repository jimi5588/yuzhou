<template>
    <TopBar :title="t('wallet_select_currency')" />
    <van-search v-model="searchValue" placeholder="" />
    <div class="item" v-for="item in channelList" @click="toRecharge(item)">
        <div class="item-left">
            <img :src="baseUrl + item.icon">
            <span>{{ t(item.currency) }}</span>
        </div>
        <van-button round type="success" size="mini">Go</van-button>
    </div>
    <FloatBubble ></FloatBubble>
</template>

<script setup>
import TopBar from '../../components/common/TopBar.vue';
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { getChannelList } from '@/api'


const { t } = useI18n()
const store = useStore()
const router = useRouter()
const route = useRoute()

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const searchValue = ref('');
const channelList = ref([])

onBeforeMount(() => {
  const type = route.query.type ? Number(route.query.type) : 1
  showLoadingToast(t('common_loading'))

  getChannelList(type)
    .then(res => {
      closeToast()
      const result = res.result
      const isEmpty =
        result == null || // null 或 undefined
        (Array.isArray(result) && result.length === 0) || // 空数组
        (typeof result === "object" && !Array.isArray(result) && Object.keys(result).length === 0) // 空对象

      console.log("result:", result, "isEmpty:", isEmpty)

      if (res.status === 200 && isEmpty) {
        showFailToast(t('no_chargeways'))
        setTimeout(() => {
          router.push({ path: "/pages/user/kefu" })
        }, 1500)
      } else {
        channelList.value = result || []
      }

    })
    .catch(err => {
      closeToast()
      showFailToast(err.message || t('system_error_try_again'))
    })
})


const toRecharge = (item) => {
    router.push({
        path: `/pages/recharge`,
        query: { id: item.id }
    });
}

</script>

<style lang="scss" scoped>

.van-search {
    --van-search-background: transparent;
}

.item {
    margin: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-left {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    img {
        width: 25px;
    }
    .van-button {
        --van-button-mini-padding: 3px 10px;
    }
}
</style>
<template>
    <TopBar title="Detail" />
    <div class="container">
      <p class="title">
        <van-icon name="description" class="icon" />
        {{ data?.title }}
      </p>
      <p class="time">
        <van-icon name="clock-o" class="icon small" />
        {{ data?.create_time || data?.send_time }}
      </p>
      <div class="detail">
        <div v-html="data?.content"></div>
      </div>
    </div>
  </template>
  

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { getSystemMsgDetail, getAnnounceMsgDetail, articl } from '@/api'
import { closeToast, showFailToast, showLoadingToast } from 'vant'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const type = ref(route.query.type || 1)
const id = ref(route.query.id || 0)
const data = ref({})

onMounted(() => {
    showLoadingToast(t('common_loading'))
    let obj = null
    if(type.value == 1) {
        obj = getSystemMsgDetail(id.value)
    }else if(type.value == 2){
        obj = getAnnounceMsgDetail(id.value)
    }else{
        obj = articl(id.value)
    }
    obj.then(res => {
        closeToast()
        data.value = res.result.data
    }).catch(err => {
        showFailToast(err.message)
    })
})

</script>

<style lang="scss" scoped>
.container {
  min-height: calc(100vh - 60px);
  padding: 20px;
  background: #f9f9fb;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.title {
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 10px;
  line-height: 1.4;
  color: #333;
  border-bottom: 1px solid #e6e6e6;
  padding-bottom: 10px;

  .icon {
    margin-right: 6px;
    vertical-align: middle;
    font-size: 22px;
    color: #409EFF;
  }
}

.time {
  font-size: 13px;
  color: #999;
  text-align: center;
  margin-bottom: 20px;
  display: flex;              /* 改成flex布局 */
  align-items: center;        /* 垂直居中 */
  justify-content: center;    /* 水平居中 */

  .icon.small {
    margin-right: 6px;        /* 增加右间距 */
    font-size: 14px;
    color: #999;
  }
}
.detail {
  font-size: 15px;
  line-height: 1.8;
  color: #444;
  position: relative;

  .content-icon {
    position: absolute;
    left: -25px;
    top: 0;
    font-size: 18px;
    color: #67c23a;
  }

  :deep(img) {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
    margin: 15px 0;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }

  :deep(p) {
    margin-bottom: 15px;
  }

  :deep(*) {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
}

</style>
<template>
  <div class="kefu-card">   
    <!-- Header -->
    <div class="kefu-header">
      <van-icon name="down" size="24" :color="isDark ? '#FFF' : '#000'" @click="onBack" style="transform: rotate(90deg);" />
      <div class="kefu-header-text">
        <div class="kefu-hello">{{ t('kefu_hello') }}</div>
        <div class="kefu-question">{{ t('kefu_help') }}</div>
      </div>
      <svg class="kefu-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Start a live conversation -->
    <section class="kefu-section">
      <h3 class="kefu-section-title">{{ t('kefu_title') }}</h3>

      <div class="kefu-grid kefu-grid--full">
  <button
    v-for="item in kefus"
    :key="item.id"
    class="kefu-item kefu-item--line"
    :class="{ 'kefu-item--highlight': isHighlighted(item) }"
    @click="handleKefuClick(item)"
  >
    <div class="kefu-line-left">
      {{ t('customer_service_contact_message') }} →
    </div>

    <div class="kefu-line-right">
      <img :src="baseUrl + item.image" :alt="item.name" />
    </div>
  </button>
</div>
    </section>

    <!-- Send us a request -->
    <section class="kefu-section kefu-section--border">
      <h3 class="kefu-section-title">{{ t('kefu_section') }}</h3>
      <button class="kefu-message" @click="openUrl('')">
        <div class="kefu-message-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 8l7.9 4.3a2 2 0 0 0 2.2 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5A2 2 0 0 0 3 7v10a2 2 0 0 0 2 2z" />
          </svg>
        </div>
        <div class="kefu-message-text">
          <div>{{ t('kefu_message') }}</div>
          <div>{{ t('kefu_message_hint') }}</div>
        </div>
        <svg class="kefu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>

    <!-- FAQ -->
    <section class="kefu-section kefu-section--border kefu-faq-section">
      <h3 class="kefu-section-title">{{ t('kefu_ask_text') }}</h3>

      <div class="kefu-search">
        <svg class="kefu-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
        </svg>
        <input v-model="searchQuery" type="text" placeholder="Search for help" />
      </div>

      <ul class="kefu-faq">
        <li v-for="(q, i) in filteredFaqs" :key="i">
          <div class="faq-question" @click="toggleFaq(i)">
            <span>• {{ q.question }}</span>
            <svg class="kefu-arrow" :class="{ 'faq-open': openFaq === i }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <transition name="faq">
            <div v-if="openFaq === i" class="faq-answer">
              {{ q.answer }}
            </div>
          </transition>
        </li>
      </ul>
    </section>
  </div>

  <!-- H5: 在线客服 iframe 弹窗 -->
  <van-popup
    v-model:show="showIframe"
    :style="{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, width: '100%', height: '100%' }"
    position="bottom"
    :overlay="true"
    :close-on-click-overlay="false"
  >
    <div class="iframe-wrapper">
      <div class="iframe-topbar">
        <div class="iframe-title">{{ t('kefu_iframe') }}</div>
        <button class="iframe-close" @click="showIframe = false">✕</button>
      </div>
      <iframe
        :src="iframeUrl"
        class="iframe-box"
        allow="clipboard-write"
        allowfullscreen
        frameborder="0"
      />
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { customerservice } from '@/api'

const { t } = useI18n()
const store = useStore()
const router = useRouter()
const baseUrl = computed(() => store.state.baseUrl)

const kefus = ref([])
const showIframe = ref(false)
const iframeUrl = ref('')
const searchQuery = ref('')
const openFaq = ref(null)
const faqs = ref([
  { question: t('kefu_ask_text1'), answer: t('kefu_answer_text1') },
  { question: t('kefu_ask_text2'), answer: t('kefu_answer_text2') },
  { question: t('kefu_ask_text3'), answer: t('kefu_answer_text3') },
])

// ✅ 判断是否是移动端
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

const filteredFaqs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return faqs.value
  return faqs.value.filter(v => v.question.toLowerCase().includes(q))
})

onBeforeMount(() => {
  customerservice()
    .then(res => {
      kefus.value = Array.isArray(res?.result?.data) ? res.result.data : []
    })
    .catch(() => {
      kefus.value = []
    })
})

const handleKefuClick = (item) => {
  if (!item?.url) return

  if (item.type === 'online') {
    // ✅ 美洽客服
    if (isMobile) {
      iframeUrl.value = item.url
      showIframe.value = true
    } else {
      window.open(item.url, '_blank')
    }
  } else {
    // 其他客服（Telegram、WhatsApp）
    window.open(item.url, '_blank')
  }
}

const isHighlighted = (item) => {
  const name = (item?.name || '').toLowerCase()
  const type = (item?.type || '').toLowerCase()
  return name.includes('line') || type === 'line'
}

const toggleFaq = (i) => {
  openFaq.value = openFaq.value === i ? null : i
}

const onBack = () => {
  router.push("/")
}
</script>


<style scoped>
/* 页面整体始终满屏 */
.kefu-card {
flex: 1;
display: flex;
flex-direction: column;
max-width: 450px;
margin: 0 auto;
background: #fff;
border-radius: 14px;
overflow: hidden;
box-shadow: 0 6px 20px rgba(0,0,0,0.08);
min-height: 100vh;
box-sizing: border-box;
}

/* Header */
.kefu-header {
background: #1f60f0;
color: #fff;
padding: 16px 16px 18px;
display: flex;
align-items: flex-start;
justify-content: space-between;
}
.kefu-hello {
opacity: 0.95;
font-size: 15px;
font-weight: 600;
}
.kefu-question {
margin-top: 4px;
font-size: 22px;
font-weight: 800;
}
.kefu-chevron {
width: 22px;
height: 22px;
opacity: 0.9;
}

/* Section */
.kefu-section {
padding: 16px;
}
.kefu-section--border {
border-top: 1px solid #eef0f3;
}
.kefu-section-title {
color: #1f2937;
font-size: 15px;
font-weight: 700;
margin-bottom: 12px;
}

/* 两列卡片 */
.kefu-grid {
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 12px;
}
.kefu-item {
border: 1px solid #e5e7eb;
border-radius: 14px;
background: #fff;
padding: 16px 8px;
text-align: center;
cursor: pointer;
transition: box-shadow .2s ease, transform .05s ease;
}
.kefu-item:hover {
box-shadow: 0 4px 14px rgba(0,0,0,.08);
}
.kefu-item:active {
transform: translateY(1px);
}
.kefu-item--highlight {
border: 2px solid #ef4444;
background: #fef2f2;
}
.kefu-item-icon {
width: 44px;
height: 44px;
margin: 0 auto 8px;
border-radius: 50%;
overflow: hidden;
background: #f3f4f6;
display: flex;
align-items: center;
justify-content: center;
}
.kefu-item-icon img {
width: 100%;
height: 100%;
object-fit: contain;
}
.kefu-item-text {
font-size: 13px;
font-weight: 600;
color: #374151;
}

/* Message 行卡片 */
.kefu-message {
width: 100%;
display: flex;
align-items: center;
border: 1px solid #e5e7eb;
border-radius: 12px;
padding: 12px;
background: #fff;
cursor: pointer;
transition: box-shadow .2s ease, transform .05s ease;
}
.kefu-message:hover {
box-shadow: 0 4px 14px rgba(0,0,0,.08);
}
.kefu-message:active { transform: translateY(1px); }
.kefu-message-icon {
width: 42px;
height: 42px;
border-radius: 10px;
background: #f3f4f6;
display: flex;
align-items: center;
justify-content: center;
margin-right: 12px;
}
.kefu-message-icon svg { width: 22px; height: 22px; color: #6b7280; }
.kefu-message-text { flex: 1; }
.kefu-message-text div:first-child { font-size: 14px; font-weight: 700; color: #1f2937; }
.kefu-message-text div:last-child { font-size: 12px; color: #6b7280; margin-top: 2px; }
.kefu-arrow {
width: 18px; height: 18px; color: #9ca3af;
}

/* 搜索与 FAQ */
.kefu-search {
display: flex;
align-items: center;
border: 1px solid #e5e7eb;
border-radius: 10px;
padding: 8px 10px;
margin-bottom: 12px;
background: #fff;
}
.kefu-search-icon {
width: 18px; height: 18px; color: #9ca3af;
}
.kefu-search input {
border: none;
outline: none;
font-size: 14px;
margin-left: 8px;
width: 100%;
background: transparent;
}
.kefu-faq { list-style: none; margin: 0; padding: 0; }
.kefu-faq li {
display: flex;
align-items: center;
justify-content: space-between;
padding: 10px 2px;
border-bottom: 1px solid #eef0f3;
font-size: 14px;
color: #374151;
cursor: pointer;
transition: color .15s ease;
}
.kefu-faq li:last-child { border-bottom: none; }
.kefu-faq li:hover { color: #1f60f0; }

/* iframe 弹窗 */
.iframe-wrapper {
position: fixed;
inset: 0;
background: #fff;
display: flex;
flex-direction: column;
}
.iframe-topbar {
height: 48px;
padding: 0 12px;
display: flex;
align-items: center;
justify-content: space-between;
background: #1f60f0;
color: #fff;
}
.iframe-title { font-weight: 700; }
.iframe-close {
appearance: none;
border: 0; background: transparent; color: #fff;
font-size: 18px; line-height: 1; cursor: pointer;
}
.iframe-box {
flex: 1; width: 100%; border: none;
}

/* FAQ 样式 */
.kefu-faq li {
border-bottom: 1px solid #eef0f3;
}
.faq-question {
display: flex;
justify-content: space-between;
align-items: center;
padding: 12px 2px;
font-size: 14px;
color: #374151;
cursor: pointer;
}
.faq-answer {
padding: 0 2px 12px;
font-size: 13px;
color: #6b7280;
line-height: 1.5;
}
.kefu-arrow {
width: 18px;
height: 18px;
color: #9ca3af;
transition: transform 0.2s ease;
}
.faq-open {
transform: rotate(90deg);
}

/* 下拉动画 */
.faq-enter-active,
.faq-leave-active {
transition: all 0.2s ease;
}
.faq-enter-from,
.faq-leave-to {
opacity: 0;
transform: translateY(-4px);
}

.kefu-grid--full {
  grid-template-columns: 1fr !important; /* 单列 */
}

.kefu-item--line {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  border: 1px solid #d1d5db !important;
  background: #fff !important;

  padding: 14px 16px;
  border-radius: 12px;
  box-sizing: border-box;

  transition: box-shadow .2s ease, transform .05s ease;
}

.kefu-item--line:hover {
  box-shadow: 0 4px 14px rgba(0,0,0,.05);
}

.kefu-line-left {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  flex: 1;
  text-align: left;
  padding-right: 4px;   /* 更紧凑 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 防止超出换行 */
}

.kefu-line-right {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;

  /* 关键新增：向左移动 5px */
  margin-left: -5px;
}
.kefu-line-right img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

</style>

<template>
  <div class="kefu-card">   
    <!-- Header -->
    <div class="kefu-header">
      <van-icon name="down" size="24" :color="isDark? '#FFF' : '#000'" @click="onBack" style="transform: rotate(90deg);"/>
      <div class="kefu-header-text">
        <div class="kefu-hello">{{ t('kefu_hello') }}</div>
        <div class="kefu-question">{{ t('kefu_help') }}</div>
      </div>
      <svg class="kefu-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </div>

    <!-- Start a live conversation -->
    <section class="kefu-section">
      <h3 class="kefu-section-title">{{ t('kefu_title') }}</h3>

      <div class="kefu-grid">
        <button
          v-for="item in kefus"
          :key="item.id"
          class="kefu-item"
          :class="{ 'kefu-item--highlight': isHighlighted(item) }"
          @click="openUrl(item.url, item.type)"
        >
          <div class="kefu-item-icon">
            <img :src="baseUrl + item.image" :alt="item.name" />
          </div>
          <div class="kefu-item-text">{{ item.name }}</div>
        </button>
      </div>

      <!-- 打不开提示 -->
      <div v-if="showTip" class="tg-tip">
        <p>If you can't open {{ tipType }}, long press the link and select "Open in system browser"</p>
        <p>Or copy this link into your browser:</p>
        <div class="copy-box" @click="copyLink(currentUrl)">
          {{ currentUrl }}
          <span class="copy-text">Click Copy</span>
        </div>
      </div>
    </section>

    <!-- Send us a request -->
    <section class="kefu-section kefu-section--border">
      <h3 class="kefu-section-title">{{ t('kefu_section') }}</h3>
      <button class="kefu-message" @click="openUrl('')">
        <div class="kefu-message-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.9 4.3a2 2 0 0 0 2.2 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5A2 2 0 0 0 3 7v10a2 2 0 0 0 2 2z"/>
          </svg>
        </div>
        <div class="kefu-message-text">
          <div>{{ t('kefu_message') }}</div>
          <div>{{ t('kefu_message_hint') }}</div>
        </div>
        <svg class="kefu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </section>

    <!-- FAQ / Search -->
    <section class="kefu-section kefu-section--border kefu-faq-section">
      <h3 class="kefu-section-title">{{ t('kefu_ask_text') }}</h3>

      <div class="kefu-search">
        <svg class="kefu-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for help"
        />
      </div>

      <ul class="kefu-faq">
        <li v-for="(q, i) in filteredFaqs" :key="i">
          <div class="faq-question" @click="toggleFaq(i)">
            <span>• {{ q.question }}</span>
            <svg
              class="kefu-arrow"
              :class="{ 'faq-open': openFaq === i }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5l7 7-7 7"/>
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

  <!-- 在线客服 iframe 弹窗 -->
  <van-popup
    v-model:show="showIframe"
    :style="{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, width: '100%' }"
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
import { computed, onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { customerservice } from '@/api'

const { t } = useI18n()
const store = useStore()
const router = useRouter()
const baseUrl = computed(() => store.state.baseUrl)
const showTip = ref(false)
const tipType = ref('')
const currentUrl = ref('')

const kefus = ref([])
const showIframe = ref(false)
const iframeUrl = ref('')
const searchQuery = ref('')
const openFaq = ref(null)

// 复制文本到剪贴板
const copyLink = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('Link copied!')
  } catch (err) {
    alert('Copy failed, please copy manually')
  }
}

/**
 * 检测指定网页是否可访问（超时后视为不可达）
 * 返回 true = 可访问，false = 不可访问
 * 注意：在某些 CORS 场景 fetch 可能被拦截，抛错或返回非 ok -> 视为不可访问
 */
const checkUrlAvailable = async (url, timeout = 1500) => {
  try {
    const controller = new AbortController()
    const signal = controller.signal
    const timer = setTimeout(() => controller.abort(), timeout)

    // 使用 HEAD 请求尽量减少流量
    const res = await fetch(url, { method: 'HEAD', mode: 'no-cors', signal })
    clearTimeout(timer)

    // 当 mode: 'no-cors' 时，浏览器会返回一个 opaque response，这时无法判断 ok，
    // 所以如果没有抛错，我们认为可访问（环境差异大，但对内置浏览器通常是可用的信号）。
    // 为了稳妥：如果 res.type === 'opaque' 或 res.ok === true，则视为可访问。
    if (!res) return false
    if (res.type === 'opaque') return true
    return !!res.ok
  } catch (e) {
    return false
  }
}

// 简单判断平台
const ua = navigator.userAgent || ''
const isAndroid = /Android/i.test(ua)
const isIOS = /iPhone|iPad|iPod/i.test(ua)

// ====== Telegram 打开逻辑（先检测网页可达，再按平台尝试 scheme/intent/fallback） ======
const openTelegram = async (url) => {
  const domain = url.replace(/^https?:\/\/(www\.)?t\.me\//, '')
  currentUrl.value = url
  tipType.value = 'Telegram'
  showTip.value = false

  const canOpenWeb = await checkUrlAvailable(url, 1500)

  if (canOpenWeb) {
    // 正常浏览器或能访问 t.me: 直接打开网页（新标签）
    try {
      window.open(url, '_blank')
      return
    } catch (e) {
      // 若 window.open 被拦截，继续尝试唤起 app
    }
  }

  // 若到这里说明网页不可达或被内置浏览器限制：尝试唤醒 App
  const tgScheme = `tg://resolve?domain=${domain}`
  const intentUrl = `intent://t.me/${domain}#Intent;package=org.telegram.messenger;scheme=https;end`
  const fallback = url
  const start = Date.now()
  let attemptedApp = false

  // iOS: 优先用 tg://
  if (isIOS) {
    try {
      window.location.href = tgScheme
      attemptedApp = true
    } catch (e) {}
  } else if (isAndroid) {
    // Android: 尝试 intent first, 然后 tg://
    try {
      window.location.href = intentUrl
      attemptedApp = true
    } catch (e) {}
    // 延迟尝试 tg://（有些设备/浏览器更接受 scheme）
    setTimeout(() => {
      try {
        window.location.href = tgScheme
        attemptedApp = true
      } catch (e) {}
    }, 300)
  } else {
    // 其他平台先试 scheme
    try {
      window.location.href = tgScheme
      attemptedApp = true
    } catch (e) {}
  }

  // 在尝试唤起后 1s ~ 1.5s 内视为唤起成功，否则打开 fallback（网页）并显示提示
  setTimeout(() => {
    // 如果 1.2s 内没有离开当前页面（即可能未唤起 app），就打开网页 fallback，并显示提示
    if (Date.now() - start < 1200) {
      // 先尝试用 window.open 打开网页（若 app 未装）
      try {
        window.open(fallback, '_blank')
      } catch (e) {
        window.location.href = fallback
      }
      // 显示帮助提示，让用户手动在系统浏览器打开或复制
      showTip.value = true
    }
  }, 1000)
}

// ====== WhatsApp 打开逻辑（同样先检测 wa.me 可达，再用 scheme/intent） ======
const openWhatsApp = async (url) => {
  // 支持 https://wa.me/<phone> 或 https://api.whatsapp.com/send?phone=...
  currentUrl.value = url
  tipType.value = 'WhatsApp'
  showTip.value = false

  const canOpenWeb = await checkUrlAvailable(url, 1500)
  if (canOpenWeb) {
    try {
      window.open(url, '_blank')
      return
    } catch (e) {}
  }

  // 解析 phone 参数
  let phone = ''
  try {
    const u = new URL(url)
    if (u.hostname.includes('wa.me')) {
      phone = u.pathname.replace('/', '')
    } else {
      // 处理 api.whatsapp.com/send?phone=xxx
      phone = u.searchParams.get('phone') || ''
    }
  } catch (e) {
    // 兜底：尝试从字符串提取数字
    phone = (url.match(/(\d{6,})/) || [''])[0]
  }

  const waScheme = phone ? `whatsapp://send?phone=${phone}` : 'whatsapp://send'
  const intentUrl = phone
    ? `intent://send?phone=${phone}#Intent;package=com.whatsapp;scheme=whatsapp;end`
    : `intent://send#Intent;package=com.whatsapp;scheme=whatsapp;end`
  const fallback = url
  const start = Date.now()

  // iOS 优先 scheme，Android 尝试 intent
  if (isIOS) {
    try {
      window.location.href = waScheme
    } catch (e) {}
  } else if (isAndroid) {
    try {
      window.location.href = intentUrl
    } catch (e) {}
    setTimeout(() => {
      try {
        window.location.href = waScheme
      } catch (e) {}
    }, 300)
  } else {
    try {
      window.location.href = waScheme
    } catch (e) {}
  }

  setTimeout(() => {
    if (Date.now() - start < 1200) {
      try {
        window.open(fallback, '_blank')
      } catch (e) {
        window.location.href = fallback
      }
      showTip.value = true
    }
  }, 1000)
}

const faqs = ref([
{
  question: t('kefu_ask_text1'),
  answer: t('kefu_answer_text1'),
},
{
  question: t('kefu_ask_text2'),
  answer: t('kefu_answer_text2'),
},
{
  question: t('kefu_ask_text3'),
  answer: t('kefu_answer_text3'),
},
])

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

const openUrl = (url, type) => {
  showTip.value = false
  currentUrl.value = url
  tipType.value = type === 'telegram' ? 'Telegram' : 'WhatsApp'

  if (type === 'telegram') {
    openTelegram(url)
  } else if (type === 'whatsapp') {
    openWhatsApp(url)
  } else {
    // 如果是你们内部在线客服 iframe，可能要打开弹窗；这里保持原行为
    if (!url) {
      showIframe.value = true
      iframeUrl.value = '' // 若有 url 填充
    } else {
      try {
        window.open(url, '_blank')
      } catch (e) {
        window.location.href = url
      }
    }
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
// 页面跳转封装
const toPage = (path) => {
    router.push("/pages/" + path)
}
const onBack = () => {
   router.push("/");
    
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

.tg-tip {
  margin-top: 20px;
  background: #fff5f5;
  border: 1px solid #ffc6c6;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  color: #444;
}

.copy-box {
  margin-top: 6px;
  background: #f6f6f6;
  padding: 8px;
  border-radius: 6px;
  word-break: break-all;
  cursor: pointer;
}

.copy-text {
  font-size: 12px;
  color: #007bff;
  margin-left: 8px;
}
</style>

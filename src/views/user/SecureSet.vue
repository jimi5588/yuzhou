<template>
    <TopBar></TopBar>
    <div class="content">
        <div v-if="!isAuth">
            <p class="p1">{{ t('secure_set_personal_auth') }}</p>
            <div class="toauth-wrap">
                <van-button block type="primary" @click="toPage('user/auth')">
                    {{ t('secure_set_go_auth') }}
                </van-button>
            </div>
            <p class="p2">{{ t('secure_set_auth_permissions') }}</p>
        </div>
        
        <div v-else>

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const store = useStore()
const router = useRouter()

const isAuth = ref(false)

const toPage = (path) => {
    router.push("/pages/" + path);
}

</script>

<style lang="scss" scoped>

.content {
    padding: 16px;

    p {
        font-size: 19px;
        &.p1 {
            margin-bottom: 12px;
        }
        &.p2 {
            margin-top: 10px;
            font-weight: bold;
        }
    }
    .toauth-wrap {
        padding: 40px 24px;
        background: #fff;
        border-radius: 12px;
    }
}

</style>

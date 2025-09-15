<template>
    <van-config-provider :theme="theme">      
        <RouterView></RouterView>    
    </van-config-provider>
</template>

<script setup>
import { computed, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useKlineSocket } from '@/service/klineSocket';

const store = useStore()
const theme = computed(() => store.state.theme)
useKlineSocket().initSocket()

onUnmounted(() => {
    useKlineSocket().close()
})

</script>

<style scoped>

</style>

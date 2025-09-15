<template>
    <div id="chart" style="height:100%" />
</template>

<script setup>
import { ref, defineProps, onMounted, onUnmounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { init, dispose } from 'klinecharts'
import { config } from '@/utils/klineConfig.js'
import { useKlineSocket } from '@/service/klineSocket';
import { getKlineData } from '@/api';

const { t } = useI18n()
const store = useStore()

const { klineList } = useKlineSocket()
const currencySymbol = computed(() => store.state.currencySymbol)
const currency = computed(() => store.state.currencyMap[currencySymbol.value])
const theme = computed(() => store.state.theme)

const emit = defineEmits(['klineData'])

const props = defineProps({
    currencyName: String,
    period: String
});

const chartIsInited = ref(false)

const chart = ref(null)

// const klineDatas = ref([])

// const lastKineData = ref({})

// const klineData = ref({
//     close: 0,
//     high: 0,
//     low: 0,
//     open: 0,
//     timestamp: 0,
//     volume: 0
// })

watch(currencySymbol, (newVal, oldVal) => {
    getKlineDatas()
})

watch(() => props.period, (newVal, oldVal) => {
    getKlineDatas()
})

watch(klineList, (newVal, oldVal) => {
    if (!chartIsInited.value) return
    if (!newVal) return
    let data = {
        close: parseFloat(newVal.close_price),
        high: parseFloat(newVal.high_price),
        low: parseFloat(newVal.low_price),
        open: parseFloat(newVal.open_price),
        volume: parseFloat(newVal.volume) * 1000,
        timestamp: newVal.timestamp * 1000
    }
    chart.value?.updateData(data)
}, { immediate: true, deep: true })

onMounted(() => {
    getKlineDatas()
    chart.value = init('chart')
    config.xAxis.axisLine.color = getChartLineColor()
    config.yAxis.axisLine.color = getChartLineColor()
    config.separator.color = getChartLineColor()
    chart.value.setStyles(config)
    chart.value?.createIndicator(
        {
            name: 'MA',
            calcParams: [5, 10, 30],
        },
        false,
        { id: 'candle_pane' }
    )
    chart.value?.createIndicator({
        name: 'VOL',
        calcParams: [5, 10],
    })
    chart.value?.createIndicator({
        name: 'MACD',
    })
})

const getChartLineColor = () => {
    return theme.value === 'dark' ? '#333' : '#d5d5d5'
}

const getKlineDatas = () => {
    showLoadingToast(t('common_loading'))
    getKlineData(currencySymbol.value, props.period).then(res => {
        let data = [];
        res.kline_list.forEach(item => {
            let timestamp = item.timestamp * 1000
            let open = parseFloat(item.open_price)
            let close = parseFloat(item.close_price)
            let high = parseFloat(item.high_price)
            let low = parseFloat(item.low_price)
            let volume = parseFloat(item.volume) * 1000
            data.push({timestamp, open, high, low, close, volume});
        })
        chart.value.applyNewData(data)
        chartIsInited.value = true 
    }).catch(err => {
        console.log(err)
        closeToast()
        chartIsInited.value = true
    })
}

onUnmounted(() => {
    dispose('chart')
})

</script>

<style scoped></style>
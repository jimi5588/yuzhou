<template>
    <svg aria-hidden="true" :style="{ width: size, height: size, }" class="icon" :fill="getFillColor()">
        <use :xlink:href="`#${prefix}-${name}`" />
    </svg>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex';

const store = useStore()
const isDark = computed(() => store.state.theme === "dark")
const props = defineProps({
    name: {
        type: String,
        required: true
    },
    prefix: {
        type: String,
        default: 'icon'
    },
    size: {
        type: String,
        default: '20px'
    },
    color: {
        type: String,
        default: null
    }
});

const getFillColor = () => {
    if(props.color) {
        return props.color
    }
    return isDark.value ? "#999" : "#666"
}
</script>

<style scoped>

</style>
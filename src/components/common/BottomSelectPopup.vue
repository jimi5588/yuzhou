<template>
<van-popup v-model:show="showBottom" position="bottom" @closed="onClosed">
    <div class="content">
        <van-icon name="cross" size="24px" @click="showBottom = false"/>
        <div class="block"></div>
        <div class="title">{{ title }}</div>
        <van-cell v-for="item in list" :title="item.text" @click="select(item)" :class="selected?.text === item?.text ? 'selected' : 'normal'">
            <template #right-icon>
                <van-icon name="success" size="24px" color="#07c160" v-if="selected?.text === item?.text"/>
            </template>
        </van-cell>
    </div>
</van-popup>

</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    list: {
        type: Array,
        required: true
    },
    selected: {
        type: Object,
        required: true
    },
})

const emit = defineEmits(['select', 'closed'])

const showBottom = ref(true)

const select = (item) => {
    emit('select', item)
    showBottom.value = false
}

const onClosed = () => {
    emit('closed')
}

</script>

<style lang="scss" scoped>

.content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    .van-icon-cross {
        position: absolute;
        top: 15px;
        right: 15px;
    }

    .block {
        width: 73px;
        height: 8px;
        margin: 15px auto;
        background-color: rgba(0, 0, 0, .1);
        border-radius: 4px;
    }
    .title {
        margin: 15px;
        font-size: 19px;
    }

    .van-cell {
        align-items: center;
        --van-cell-line-height: 44px;
        
        :deep(.van-cell__title span) {
            font-size: 19px;
        }

        &.selected {
            background-color: #f2f6ff;
        }
    }
}

.van-theme-dark {
    .van-cell.selected {
        background-color: #333;
    }
}
</style>
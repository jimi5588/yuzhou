<template>
    <van-floating-bubble
        axis="xy"
        icon="chat"
        magnetic="x"
        @offset-change="onOffsetChange" @click="toKeFu" class="btn_floating"
        >
        <template #default>
            <img width="34px" height="34px" src="../../assets/images/kefu.png"> 
        </template>
    </van-floating-bubble>

</template>

<script>
export default {
    methods: {
        toKeFu(){
            this.$router.push({
                path: '/pages/user/kefu',
            })
        }
    }
}
</script>

<style>
.btn_floating {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  --van-floating-bubble-background: #fff;
  --van-floating-bubble-size: 60px;
  border-radius: 50%;
  transition: box-shadow 0.3s ease;
}


</style>
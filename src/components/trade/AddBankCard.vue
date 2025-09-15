<template>
    <van-form>
        <div class="form-content">
            <van-field
                v-if="false"
                v-model="selectedBankWay.text"
                :label="t('bank_way_select')"
                placeholder=""
                readonly
                is-link
                arrow-direction="down"
                @click="showBankWay = true"
                />
            <van-field v-model="accountName" :label="t('account_name')" placeholder="" />
            <van-field v-model="bankName" :label="t('bank_name')" placeholder="" />
            <van-field v-model="branchName" :label="t('branch_name')" placeholder="" />
            <van-field v-model="bankCardno" :label="t('bank_card_number')" placeholder="" />
            <van-field v-model="bankCode" :label="t('bank_code_bic_swift')" placeholder="" />
        </div>
        <van-button block type="primary" @click="submit">{{ t('common_ok') }}</van-button>
    </van-form>
    <BottomSelectPopup v-if="showBankWay" :list="bankWays" :selected="selectedBankWay"
      :title="t('select_bank_way')" @closed="showBankWay = false" @select="onBankWaySelect"
    />
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router'
import { getBankWay, updatebank } from '@/api'

const { t } = useI18n()
const router = useRouter()

const showBankWay = ref(false)
const bankWays = ref([])
const selectedBankWay = ref({})

const accountName = ref('')
const bankName = ref('')
const branchName = ref('')
const bankCardno = ref('')
const bankCode = ref('')

onBeforeMount(() => {
    showLoadingToast(t('common_loading'))
    getBankWay().then(res => {
        closeToast()
        bankWays.value = res.result.result.map(item => ({
            text: item.cryptoprotocol,
        }))
        selectedBankWay.value = bankWays.value[0]
    }).catch(err => {
        showFailToast(err.message)
    })
})

const onBankWaySelect = (way) => {
    showBankWay.value = false
    selectedBankWay.value = way
}

const submit = () => {
    if (!accountName.value) {
        showFailToast(t('toast_input_account_name'))
        return
    }
    if (!bankName.value) {
        showFailToast(t('toast_input_bank_name'))
        return
    }
    if (!branchName.value) {
        showFailToast(t('toast_input_country'))
        return
    }
    if (!bankCardno.value) {
        showFailToast(t('toast_input_bank_address'))
        return
    }
    if (!bankCode.value) {
        showFailToast(t('toast_input_bank_code'))
        return
    }
    showLoadingToast(t('common_loading'))
    const params = {
        cryptoprotocol: selectedBankWay.value.text,
        realname: accountName.value,
        bankname: bankName.value,
        bankzhiname: branchName.value,
        cardno: bankCardno.value,
        code: bankCode.value,
    }
    updatebank(params).then(res => {
        showSuccessToast(t('common_success'))
        router.back()
    }).catch(err => {
        showFailToast(err.message)
    })
}

</script>

<style lang="scss" scoped>
.form-content {
    padding: 15px 0;
    background: #fff;
    border-radius: 10px;

    .van-cell {
        flex-direction: column;
        --van-field-label-width: 100%;

        :deep(label) {
            font-size: 14px;
            color: #222;
        }
        :deep(input) {
            height: 40px;
            border-bottom: 1px solid #E4E7EC;
        }
        :deep(.van-cell__right-icon) {
            position: absolute;
            top: 50%;
            right: 30px;
        }
    }
}

.van-button {
    margin: 20px 0;
    span {
        font-size: 19px;
    }
}

</style>

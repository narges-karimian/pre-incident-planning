<template>
  <q-page class="bg-grey-1">
    <div class="q-pa-md">
      <div class="text-center q-my-xl">
        <div class="row items-center justify-center q-mb-md">
          <div class="col-auto">
            <img src="../../assets/logo-blue.png" alt="Logo" style="height: 40px" />
            <div class="text-primary text-h6">سامانه برنامه ریزی پیش از حادثه</div>
          </div>
        </div>
      </div>

      <div class="q-mx-auto" style="max-width: 400px">
        <q-form class="row q-mb-md" @submit="sendCode">
          <div class="col-8 q-pr-md">
            <q-input
              v-model="phoneNumber"
              outlined
              dense
              input-class="text-center border-radius-md"
              class="text-right"
              dir="rtl"
              placeholder="09xxxxxxxxx"
              label="شماره همراه"
              :rules="[(val) => !!val || 'شماره همراه الزامی است']"
            />
          </div>
          <div class="col-4">
            <q-btn
              outline
              color="primary"
              :label="
                isTimerRunning ? `(${remainTime.minutes}:${remainTime.seconds})` : 'دریافت کد'
              "
              class="full-width border-radius-md"
              type="submit"
              :disable="isTimerRunning"
            />
          </div>
        </q-form>
        <q-form @submit="verifyCode">
          <div class="q-mb-lg text-body2 text-grey-7 text-center">
            کد 6 رقمی که برای شما پیامک شده را وارد نمایید.
          </div>

          <div class="row q-mb-lg justify-center q-gutter-sm">
            <OtpInput v-model="verificationCode" />
          </div>

          <q-btn
            color="primary"
            label="تایید کد"
            class="full-width q-mb-lg border-radius-md"
            size="md"
            type="submit"
            :disable="!isCodeComplete"
          />
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import OtpInput from 'src/components/OtpInput.vue'
import { useAuthStore } from 'src/stores/auth'
import useTimer from 'src/composables/useTimer.composable'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const phoneNumber = ref(authStore.userInfo?.phoneNumber || '')
const verificationCode = ref('')

const {
  start: startTimer,
  stop: stopTimer,
  formattedTime: remainTime,
  isRunning: isTimerRunning,
} = useTimer({
  timeRange: { min: 0, max: 120 },
  storageKey: phoneNumber.value,
})

const isCodeComplete = computed(() => {
  return verificationCode.value.length === 6
})

const sendCode = async () => {
  if (phoneNumber.value) {
    try {
      verificationCode.value = ''
      await authStore.sendOtp({ phoneNumber: phoneNumber.value })
      startTimer()
    } catch (error) {
      console.error('Failed to send OTP:', error)
    }
  }
}

const verifyCode = async () => {
  if (isCodeComplete.value) {
    try {
      await authStore.verifyOtp({
        phoneNumber: phoneNumber.value,
        otp: verificationCode.value,
      })
      stopTimer()
      router.push('/')
    } catch (error) {
      console.error('Failed to verify OTP:', error)
    }
  }
}

// // Watch for phone number changes to update timer storage key
// watch(phoneNumber, (newPhone) => {
//   if (newPhone) {
//     // Update timer storage key when phone number changes
//     stopTimer()
//   }
// })

onMounted(() => {
  authStore.$reset()
})
</script>

<style scoped>
.verification-input input {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  text-decoration: underline;
}
</style>

<template>
  <q-page class="bg-grey-1">
    <div class="q-pa-md">
      <div class="text-center q-my-xl">
        <div class="row items-center justify-center q-mb-md">
          <div class="col-auto">
            <img src="../../assets/logo-blue.png" alt="Logo" style="height: 40px" />
            <div class="text-green-6 text-h6">سامانه برنامه ریزی پیش از حادثه</div>
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
              color="green-6"
              label="دریافت کد"
              class="full-width border-radius-md"
              type="submit"
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

          {{ verificationCode }}

          <q-btn
            color="green-6"
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
import { ref, computed } from 'vue'
import OtpInput from 'src/components/OtpInput.vue'

const phoneNumber = ref('')
const verificationCode = ref('')

const isCodeComplete = computed(() => {
  return verificationCode.value.length === 6
})

const sendCode = () => {
  if (phoneNumber.value) {
    console.log('Sending code to:', phoneNumber.value)
    // Add your SMS sending logic here
  }
}

const verifyCode = () => {
  if (isCodeComplete.value) {
    // const code = verificationCode.value.join('')
    console.log('Verifying code:', verificationCode.value)
    // Add your verification logic here
  }
}
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

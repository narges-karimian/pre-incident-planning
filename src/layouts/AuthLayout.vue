<template>
  <q-layout view="hHh lpR fFf" class="row">
    <q-page-container class="col-xs-12 col-sm-6 my-font">
      <q-header class="bg-green-6 text-white">
        <q-toolbar>
          <div class="text-h6">ورود</div>
        </q-toolbar>
      </q-header>
      <router-view />
      <div class="fixed-bottom bg-grey-3 q-pa-sm text-center text-caption">
        <div class="text-grey-7">کلیه حقوق این سایت متعلق به شهرداری مشهد می باشد.</div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<template>
  <q-layout view="lHh Lpr lFf" class="my-font">
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-grey-3">
      <FooterMenu />
    </q-footer>
  </q-layout>
</template>

<script setup>
import FooterMenu from 'src/components/FooterMenu.vue'
</script>

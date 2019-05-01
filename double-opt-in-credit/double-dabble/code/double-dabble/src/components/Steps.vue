<template>
  <v-layout>
    <v-flex md12>
      <v-stepper alt-labels v-model="step" >
        <v-stepper-header>
          <v-stepper-step :complete="step > 1" step="1" color="teal">Authorize</v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step :complete="step > 2" step="2" color="teal">Review</v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step :complete="step > 3" step="3" color="teal">Share</v-stepper-step>
          <v-flex md12 px-5 py-3 class="text-xs-center">
            <h3>{{ step === 1 ? "Select which info you would like to share with Credit Rating Agency" : step === 2 ? "You are about to share the following datas with Credit Rating Agency" : "Share your credit score with Lending Company" }}</h3>
          </v-flex>
        </v-stepper-header>
      </v-stepper>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: {
    step: Number
  }
}
</script>

<style>

</style>

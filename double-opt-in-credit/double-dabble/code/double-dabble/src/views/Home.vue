<template>
  <div class="text-xs-center">
    <Logo class="mt-4" />
    <v-container  grid-list-md style="margin-bottom: 5em;">
      <Steps :step="step"/>
      <Step1 v-if="step === 1" :items="items" @update="calculateScore()"/>
      <Step2 v-if="step === 2" :items="items" />
      <Step3 v-if="step === 3" :score="score" :shared="shared" />
    </v-container>
      <vue-metamask 
          userMessage="Double Dabble Demo" 
          @onComplete="onComplete"
      >
      </vue-metamask>
    <v-footer fixed class="pa-5" color="blue-grey lighten-3" v-if="!shared">
      <v-btn color="warning" large @click="step--" v-if="step > 1 ">
        Back
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn color="error" large @click="step++" v-if="step < 3">
        {{ step === 2 ? "Confirm" : "Continue" }}
      </v-btn>
      <v-btn color="error" large v-else-if="step === 3" @click="shared = true">
        Share the score
      </v-btn>
    </v-footer>
  </div>
</template>

<script>
  import Logo from '../components/Logo'
  import Steps from '../components/Steps'
  import Step1 from '../components/Step1'
  import Step2 from '../components/Step2'
  import Step3 from '../components/Step3'
  import VueMetamask from 'vue-metamask';

  export default {
    components: {
      Logo,
      Steps,
      Step1,
      Step2,
      Step3,
      VueMetamask
    },
    data() {
      return {
        step: 1,
        score: 0,
        shared: false,
        items: [
            {
              title: "uPort",
              logo:  "uport_logo.png",
              authorized: true,
              type: "Identification"
            },
            {
              title: "Bloom",
              logo:  "bloom_logo.png",
              authorized: false,
              type: "Identification"
            },
            {
              title: "N26",
              logo:  "n26_logo.png",
              authorized: true,
              type: "Finance"
            },
            {
              title: "Bank Of America",
              logo:  "bank_of_america_logo.png",
              authorized: false,
              type: "Finance"
            },
            {
              title: "Paypal",
              logo:  "paypal_logo.png",
              authorized: false,
              type: "Finance"
            },
            {
              title: "Github",
              logo:  "github_logo.png",
              authorized: true,
              type: "Professional"
            },
            {
              title: "GitCoin",
              logo:  "gitcoin_logo.png",
              authorized: true,
              type: "Professional"
            },
            {
              title: "Linkedin",
              logo:  "linkedin_logo.png",
              authorized: false,
              type: "Professional"
            },
            {
              title: "Amazon",
              logo:  "amazon_logo.png",
              authorized: true,
              type: "Reputation"
            },
            {
              title: "Uber",
              logo:  "uber_logo.png",
              authorized: false,
              type: "Reputation"
            },
            {
              title: "Instacart",
              logo:  "instacart_logo.png",
              authorized: false,
              type: "Reputation"
            },
            {
              title: "Health",
              logo:  "apple_health_logo.png",
              authorized: true,
              type: "Medical"
            },
            {
              title: "Nike Running",
              logo:  "nike_running_logo.png",
              authorized: true,
              type: "Medical"
            }
        ]
      }
    },
    mounted() {
      this.calculateScore()
    },
    methods: {
      onComplete(data){
        console.log('data:', data);
      },
      calculateScore(){
        if (this.score === 0) {
          this.score = Math.floor(Math.random() * (750 - 450) + 450)
        } else {
          if (this.score <= 960) {
            let percentage = Math.random() * (1.15 - 1.005) + 1.005
            this.score = Math.floor(this.score * percentage)
          }
        }
      }
    }
  }
</script>

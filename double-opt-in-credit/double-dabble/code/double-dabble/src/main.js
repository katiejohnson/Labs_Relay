import Vue from "vue";
import './plugins/vuetify'
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueLodash from 'vue-lodash'

Vue.config.productionTip = false;
Vue.use(VueLodash)


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

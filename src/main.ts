import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'

import Particles from '@tsparticles/vue2'
import { loadSlim } from '@tsparticles/slim'

Vue.config.productionTip = false

Vue.use(ElementUI)

Vue.use(Particles, {
  init: async (engine: any) => {
    await loadSlim(engine)
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import 'vue-sonner/style.css'
import './style.css'

import App from '@/App.vue'
import { queryClient } from '@/api/queryClient'
import { router } from '@/router'

createApp(App).use(createPinia()).use(router).use(VueQueryPlugin, { queryClient }).mount('#app')

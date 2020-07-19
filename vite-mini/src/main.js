


import {ref,createApp,watchEffect} from 'vue'
import App from './App.vue'
import {log} from './log.js'
import './style.css'
let count = ref(0)
watchEffect(()=>{
    console.log(count++)
},1000)

console.log('=====', App)

log('testing log!')

createApp(App).mount('#app')
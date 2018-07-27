import Vue from "vue"
import App from "./App.vue"

var a = new Vue({
    el: "#app",
    components: { App },
    render: h => h(App)
})

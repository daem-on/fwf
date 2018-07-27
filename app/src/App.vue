<template>
    <div id="app">
        Heyho
        <TimeView />
    </div>
</template>

<script>
import TimeView from "./components/TimeView.vue";

export default {
    name: 'App',
    data () {
        return {}
    },
    methods: {},
    components: {
        TimeView
    }
}
</script>

<style>
    @font-face {
        font-family: SourceSansRegular;
        src: url(fonts/SourceSansPro-Regular.ttf);
    }
    #app {
        font-family: SourceSansRegular;
    }
</style>

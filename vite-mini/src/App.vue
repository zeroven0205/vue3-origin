<template>
    <div>
        <div id="btn" @click="add">click</div>
        <h3 class="red">{{count}}*2 = {{double}} </h3>
    </div>
</template>
<script>
import {ref,computed} from 'vue'
export default {
    setup(){
        let count = ref(1)
        function add(){
            // console.log("add is called!")
            return count.value ++;
        }
        const double = computed(()=>{
            return count.value*2
        })
        return {count,double,add}
    }
}
</script>
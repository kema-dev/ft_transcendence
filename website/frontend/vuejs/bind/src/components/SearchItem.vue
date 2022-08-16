<template>
    <form class="search_groupe center row stack">
        <input
            type="text"
            placeholder="Search"
            id="search"
			v-model="search"
			@input="$emit('searchInput', search)"
        />
        <!-- <input
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target!.value)"
        /> -->
        <button v-if="search.length > 0" @click="changeInput('')" class="reset_button center">
            <img src="~@/assets/clear_button.png" alt="clear button" class="reset_button_img">
        </button>
    </form>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue';
// const props = defineProps({
//   search: String
// })

// defineProps(['modelValue'])
// defineEmits(['update:modelValue'])

const emit = defineEmits(['searchInput']);

let search = ref("");

function changeInput(value : string) {
    search.value = value;
    emit('searchInput', search.value);
}



</script>

<style scoped>
.search_groupe {
	margin-top: 5px;
	width: 70%;
}
#search {
	top: 0px;
	width: 90%;
	height: 40px;
    background-image: url('~@/assets/logo_search.png') ;
    background-position: left 10px top 50%;
    background-size: 20px 20px;
    background-repeat:no-repeat;
	border: solid 1px #ccc;
	border-radius: 12px;
	padding-left: 40px;
	margin: 15px 0;
	margin-right: 2%;
	font-size: 1rem;
	outline: none;
	box-shadow: 0px 0px 4px #aaa;
}
.reset_button {
    position: absolute;
    right: 14%;
}
.reset_button_img {
    height: 15x;
    width: 15px;
}
</style>
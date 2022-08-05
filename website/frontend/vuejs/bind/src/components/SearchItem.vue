<template>
    <form class="search_groupe center row stack">
        <!-- <input
            type="text"
            placeholder="Recherche"
            id="search"
            ref="props.search"
        />
        <button>
            <span class="material-symbols-outlined icon_search">
                search
            </span>
        </button> -->
        <!-- <div class="material-symbols-outlined icon_search">search</div> -->
        <input
            type="text"
            placeholder="Search"
            id="search"
			v-model="search"
			@input="$emit('searchInput', search)"
        />
        <button v-if="search.length > 0" @click="restet_input" class="reset_button center">
            <img src="~@/assets/clear_button.png" alt="clear button" class="reset_button_img">
        </button>
        <!-- <button v-if="search.length > 0" type="reset" class="reset_button center">
            <img src="~@/assets/clear_button.png" alt="clear button" class="reset_button_img">
        </button> -->
    </form>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, Ref, ref } from 'vue';

// const props = defineProps({
//   search: String,
// })

const emit = defineEmits(['searchInput']);

let search = ref("");

function restet_input() {
    search.value = '';
    emit('searchInput', search.value);
}

</script>

<style scoped>
.search_groupe {
	margin-top: 5px;
	width: 90%;
}
#search {
	/* position: absolute; */
	top: 0px;
	width: 80%;
    /* width: clamp(250px, 80%, 400px); */
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

    /* background-image: url('~@/assets/clear_button.png');
    background-position: left 10px top 50%;
    background-size: 20px 20px;
    background-repeat:no-repeat; */
}
.reset_button_img {
    height: 15x;
    width: 15px;
}
</style>
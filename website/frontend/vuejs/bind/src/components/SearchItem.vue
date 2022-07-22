<template>
    <div class="search_groupe center row">
        <input
            type="text"
            placeholder="Recherche"
            id="search"
            ref="props.search"
        />
        <button>
            <span class="material-symbols-outlined icon_search">
                search
            </span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { defineProps, Ref, ref } from 'vue';

const props = defineProps({
  search: String,
})

</script>

<style>
.search_groupe {
	margin-top: 5px;
	width: 90%;
}
#search {
	/* position: absolute; */
	top: 0px;
	width: 80%;
	height: 40px;
	background: #fff;
	border: solid 1px #ccc;
	border-radius: 12px;
	padding-left: 10px;
	margin: 15px 0;
	margin-right: 2%;
	font-size: 1.2rem;
	outline: none;
	box-shadow: 0px 0px 4px #aaa;
}
.icon_search {
	font-size: 2rem;
}
</style>
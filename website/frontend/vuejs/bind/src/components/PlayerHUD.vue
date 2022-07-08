<template>
    <div class="HUD-container">
        <div class="name"> {{name}}</div>
        <div class="octagon-container">
            <div class='octagonWrap'>
                 <div class='octagon' id="avatar"></div>
            </div>
            <div class="rectangle"></div>
            <div class="points">{{points}}</div>
            <div class='octagonWrap' id="right-octagon">
                <div class='octagon' ></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { numberLiteralTypeAnnotation } from '@babel/types';
import { onMounted, defineProps, reactive, ref, Ref } from 'vue';

defineProps({
  name: String,
  points: Number
})


onMounted( () => {
    // let hexaWidth = document.getElementById('1')!.clientWidth;
    // console.log(hexaWidth);
    // let hexaHeight = document.getElementById('2')!.clientHeight;
    // console.log(hexaHeight);

	
})
</script>

<style scoped>

* {
    --border: 3px;
    --height: 100px;
    font-family: "Orbitron", sans-serif;
}

.HUD-container {
    flex-direction: column;
    justify-content: flex-start;
    width: calc( var(--height) * 2);
    margin: 5% 0;
}
.octagon-container {
    /* display: flex; */
    position: relative;
    height: var(--height);
    width: calc( var(--height) * 2);
    margin: auto;
}

.name {
    font-size: 1em;
    font-weight: bold;
    margin-bottom: 5px;
}
.points {
    position:absolute;
    font-size: 2.5em;
    left: 75%;
    top: 50%;
    z-index: 1;
    transform: translate(-50%, -50%)
}

#avatar {
    background-image: url(http://placekitten.com/240/240);
    background-size: contain;
    z-index: 1;
}

#right-octagon {
    position: absolute;
    left: var(--height);
    z-index: -1;
}

.octagonWrap {
    width: var(--height);
    height: var(--height);
    float: left;
    position: relative;
    overflow: hidden;
}
.octagon {
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    overflow: hidden;
    transform: rotate(45deg);
    border: solid var(--border) #16638d;
}
.octagon:before {
    position: absolute;
    /* There needs to be a negative value here to cancel
     * out the width of the border. It's currently -3px,
     * but if the border were 5px, then it'd be -5px.
     */
    top: -3px; right: -3px; bottom: -3px; left: -3px;
    transform: rotate(45deg);
    content: '';
    border: inherit;
}

.rectangle {
    position: absolute;
    z-index: 0;
    left: 50%;
    transform: translate( -50%);
    height: var(--height);
    background-color: white;
    width: var(--height);
    /* margin-left: -100px; */
    border-top: solid var(--border) #16638d;
    border-bottom: solid var(--border) #16638d;

}

</style>
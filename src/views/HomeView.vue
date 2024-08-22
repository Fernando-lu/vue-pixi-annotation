<template>
  <div>
    hello, this is an annotation platform!

    <button @click="scale(0.1)">放大</button>
    <button @click="scale(-0.1)">缩小</button>
  </div>

  <div ref="annoWrapper" class="anno-wrapper"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Anno from '@/lib/Anno'

const annoWrapper = ref()
onMounted(async () => {
  Anno.init(annoWrapper.value)
  await Anno.loadImage()
  const list = [{ xmin: 300, ymin: 300, xmax: 500, ymax: 500, desc: '红球' }]
  Anno.load(list)
})

function scale(step) {
  const scale = Anno.scale + step
  Anno.scaleTo(scale)
}
</script>

<style lang="scss" scoped>
.anno-wrapper {
  border: 1px solid #ddd;
  width: 100%;
  height: 600px;
}
</style>

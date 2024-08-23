<template>
  <div>
    hello, this is an annotation platform!
    <br>

    <div style="font-size: 13px; margin-bottom: 10px;">
      1. 按住alt键，点击鼠标可进行拖拽重置图片的位置 <br>
      2. 按住shift，点击鼠标拖拽，可以新增标注框<br>
      3. 右键删除框<br>
      4. (代办)修改框大小<br>
      5. (代办)修改框的描述<br>
      6. (代办)读取标注框<br>
    </div>

    <button @click="zoomOut">放大</button>
    <button @click="zoomIn">缩小</button>
    <button @click="changeMode('select')">选择</button>
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
  const list = [
    {xmin: 300, ymin: 300, xmax: 500, ymax: 500, desc: '红球' },
    {xmin: 600, ymin: 300, xmax: 900, ymax: 500, desc: '红球' },
  ]
  Anno.load(list)
})

function zoomIn() {
  Anno.onZoomIn()
}
function zoomOut() {
  Anno.onZoomOut()
}

function changeMode(val) {
  Anno.changeMode(val)
}


</script>

<style lang="scss" scoped>
.anno-wrapper {
  border: 1px solid #ddd;
  width: 100%;
  height: 600px;
}
</style>

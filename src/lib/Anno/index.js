import { Assets, Sprite, Application, Container } from 'pixi.js'
import LabelAnno from './Label'

class Anno {
  constructor() {
    this.app = undefined
    // 标注框信息
    this.annoLabelList = []
    // 标注的列表
    this.labelList = []
    this.scale = 1
    this.imgHeight = 0
    this.imgWidth = 0
    this.domWidth = 0
    this.domHeight = 0
    this.container = undefined

    this.mode = 'Add' // add
  }

  async init(dom) {
    const app = new Application()
    this.domWidth = dom.clientWidth
    this.domHeight = dom.clientHeight
    await app.init({ background: '#1099bb', resizeTo: dom })
    dom.appendChild(app.canvas)
    this.app = app
  }

  async loadImage() {
    if (this.container) {
      this.container.destroy()
    }
    this.container = new Container({
      isRenderGroup: true
    })

    this.initEvents()
    const texture = await Assets.load('imgs/test.png')
    const { width, height } = texture
    this.imgWidth = width
    this.imgHeight = height
    const sprite = new Sprite(texture)
    this.container.addChild(sprite)
    this.app.stage.addChild(this.container)
    const scale = Math.min(this.domWidth / this.imgWidth, this.domHeight / this.imgHeight)
    this.scaleTo(scale)
  }

  // 加载标注信息
  load(list) {
    // 根据当前anno的信息，全部更新
    this.labelList = list
    for (var label of this.labelList) {
      const labelAnno = new LabelAnno(label, this.container)
      this.annoLabelList.push(labelAnno)
    }
  }

  scaleTo(x) {
    this.scale = x
    this.container.scale = this.scale
    this.annoLabelList.forEach((annoLabel) => {
      annoLabel.draw(x)
    })
  }

  // 初始化事件
  initEvents() {
    // 初始化新增框
    const _this = this
    this.container.eventMode = 'dynamic'

    // this.container.onmousedown = function (event) {
    //   console.log(...arguments)
    // }
    this.container.on('pointerdown', function (event) {
      console.log(event)
      const { x, y } = event.global
      // const pointer =
      console.log(x / _this.scale, y / _this.scale)
    })
  }
}

export default new Anno()

<template>
  <div>
    <canvas id="mycanvas-2"></canvas>
    <a-image :src="imageSrc" :preview="false" :alt="'errorCenterImage'" />
  </div>
</template>
<script lang="ts">
import { ref } from '@vue/reactivity'
import { onMounted, defineComponent, Ref } from 'vue'

export default defineComponent({
  components: {},
  name: 'MapInfoWindow2',
  props: {
    device: {
      type: Object,
      require: true,
    },
    refresh: {
      type: Boolean,
      require: false,
    },
  },
  setup (props) {
    interface Node {
      xmin: number;
      ymin: number;
      xmax: number;
      ymax: number;
      confidence: number;
      class: number;
      name: string;
    }
    const deviceInfo = ref(props.device)
    const imageSrc = ref<string>(deviceInfo.value.all_url_file)
    const canvasWidth = ref<number>()
    const canvasHeight = ref<number>()

    const updateCanvasSize = (
      image: HTMLImageElement,
      canvas: HTMLCanvasElement,
      nodeList: Node[]
    ) => {
      if (image && canvas) {
        console.log('---error---')
        console.log(canvas)
        console.log(image)
        canvas.width = image.clientWidth
        canvas.height = image.clientHeight
        const ctx = canvas.getContext('2d')
        console.log(canvas)
        if (ctx) {
          ctx.clearRect(0, 0, image.clientWidth, image.clientHeight)
          for (let i = 0; i < nodeList.length; i++) {
            const node = nodeList[i]
            // 在此处对每个节点进行操作
            drawRect(
              ctx,
              image.naturalHeight,
              image.naturalWidth,
              image.clientHeight,
              image.clientWidth,
              node.xmax,
              node.ymax,
              node.xmin,
              node.ymin,
              node.name
            )
          }
        }
      }
    }

    const drawRect = (
      ctx: CanvasRenderingContext2D,
      imageNaturalHeight: number,
      imageNaturalWidth: number,
      imageClientHeigth: number,
      imageClientWidth: number,
      maxX: number,
      maxY: number,
      minX: number,
      minY: number,
      text: string
    ) => {
      // 绘制矩形
      ctx.strokeStyle = 'red'
      ctx.strokeRect(
        (imageClientWidth / imageNaturalWidth) * minX,
        (imageClientWidth / imageNaturalWidth) * minY,
        (imageClientWidth / imageNaturalWidth) * (maxX - minX),
        (imageClientHeigth / imageNaturalHeight) * (maxY - minY)
      )

      ctx.fillStyle = 'red'
      ctx.font = '16px Arial'
      ctx.fillText(
        text,
        (imageClientWidth / imageNaturalWidth) * minX + 5,
        (imageClientWidth / imageNaturalWidth) * minY + 20
      )
    }

    function drawCanvas () {
      const canvas = document.getElementById('mycanvas-2') as HTMLCanvasElement
      const imageList = document.getElementsByClassName('ant-image-img')

      const filteredElements = []
      for (let i = 0; i < imageList.length; i++) {
        if (imageList[i].alt === 'errorCenterImage') {
          filteredElements.push(imageList[i])
        }
      }

      const imageOne = filteredElements[0] as HTMLImageElement
      if (imageOne.complete) {
        updateCanvasSize(
          imageOne,
          canvas,
          JSON.parse(deviceInfo.value.position_json)
        )
      } else {
        imageOne.onload = () => {
          updateCanvasSize(
            imageOne,
            canvas,
            JSON.parse(deviceInfo.value.position_json)
          )
        }
      }
    }

    onMounted(() => {
      drawCanvas()
    })
    return {
      updateCanvasSize,
      deviceInfo,
      imageSrc,
      canvasWidth,
      canvasHeight,
      drawCanvas,
    }
  },
  watch: {
    device (newVal, oldVal) {
      if (newVal.all_url_file !== this.imageSrc) {
        console.log('---reload--')
        this.imageSrc = newVal.all_url_file

        this.drawCanvas()
      }
    },
  },
})
</script>

<style lang="scss" scoped>
canvas {
  //border: 1px solid #000; // 给Canvas加个边框
  position: absolute;
  z-index: 5;
  margin-top: 5px;
}
.info-main {
  padding-top: 10px;
  min-width: 300px;
  max-width: 300px;
  max-height: 290px;
  overflow: overlay;
  border-top: 1px solid #959595;
  :deep(.el-carousel__container) {
    height: calc(100% - 20px);
    .img-body {
      display: flex;
      flex-direction: column;
      position: relative;
      background: rgba(6, 41, 39, 0.5);
      height: 100%;
      img {
        height: 70%;
        object-fit: scale-down;
      }
      .none-title {
        height: 70%;
        line-height: 70%;
        font-size: 16px;
        font-weight: bold;
        align-items: center;
        display: flex;
        justify-content: center;
      }
      .card-img-title {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        position: absolute;
        height: 30%;
        bottom: 0;
        background: #353d4d;
        width: 100%;
        font-size: 12px;
        color: #cfcfcf;

        .title-div {
          display: flex;
          flex-direction: row;
          justify-content: space-around;

          span {
            text-align: center;
            width: 50%;
          }
        }
      }
    }
  }
}
</style>

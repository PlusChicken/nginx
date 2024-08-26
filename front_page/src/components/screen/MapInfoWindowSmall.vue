<template>
  <div id="errorListImageId">
    <canvas id="mycanvasSmall"></canvas>
    <a-image :src="imageSrc" :preview="false" :alt="'errorSmallImage'" />
  </div>
</template>
<script lang="ts">
import { ref } from '@vue/reactivity'
import { onMounted, defineComponent, Ref } from 'vue'

export default defineComponent({
  components: {},
  name: 'MapInfoWindowSmall',
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
        console.log(canvas)
        // canvas.width = image.clientWidth;
        // canvas.height = image.clientHeight;
        canvas.width = 752
        canvas.height = 563
        const ctx = canvas.getContext('2d')

        if (ctx) {
          console.log(nodeList)
          console.log('--clean--')
          console.log(image.clientWidth)
          console.log(image.clientHeight)
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          console.log(ctx)
          for (let i = 0; i < nodeList.length; i++) {
            const node = nodeList[i]
            // 在此处对每个节点进行操作
            drawRect(
              ctx,
              image.naturalHeight,
              image.naturalWidth,
              canvas.height,
              canvas.width,
              node.xmax,
              node.ymax,
              node.xmin,
              node.ymin,
              node.name
            )
          }
          console.log(ctx)
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
      const canvas = document.getElementById(
        'mycanvasSmall'
      ) as HTMLCanvasElement
      const imageList = document.getElementsByClassName('ant-image-img')

      const filteredElements = []
      for (let i = 0; i < imageList.length; i++) {
        if (imageList[i].alt === 'errorSmallImage') {
          filteredElements.push(imageList[i])
        }
      }

      const imageOne = filteredElements[0] as HTMLImageElement
      // while (imageOne.clientHeight === 0) {}
      // if (imageOne.complete) {
      console.log('---实现complete---')
      console.log('--------当前的图片是--------')
      console.log(imageOne)
      console.log(imageOne.clientHeight)
      updateCanvasSize(
        imageOne,
        canvas,
        JSON.parse(deviceInfo.value.position_json)
      )
      // }
      // imageOne.onload = () => {
      //   console.log('----onload---')
      //   updateCanvasSize(
      //     imageOne,
      //     canvas,
      //     JSON.parse(deviceInfo.value.position_json)
      //   )
      // }
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
      this.deviceInfo = newVal
      this.imageSrc = newVal.all_url_file
      // this.drawCanvas()
    },
    refresh (newVal, oldVal) {
      if (newVal) {
        this.drawCanvas()
        // const canvas = document.getElementById(
        //   'mycanvasSmall'
        // ) as HTMLCanvasElement
        // const ctx = canvas.getContext('2d')
        // ctx.clearRect(0, 0, canvas.width, canvas.height)
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

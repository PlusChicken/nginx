<template>
  <div ref="main" class="main" :style="{ width: width, height: height }" />
</template>

<script lang="ts" setup>
import {
  ref,
  defineProps,
  watch,
  onMounted,
  onBeforeUnmount,
  withDefaults,
} from 'vue'
import * as echarts from 'echarts'
import { ECBasicOption, EChartsType } from 'echarts/types/dist/shared'
import { EventParams } from '../../utils/echarts'
interface EchartsProps {
  options: ECBasicOption | null;
  width?: string;
  height?: string;
  handlerClick?: (params: EventParams) => void | null;
}
let instance: EChartsType = null as unknown as EChartsType
// withDefaults可以设置默认值 这里我们需要初始化就设置子组件的默认宽度高度
const props = withDefaults(defineProps<EchartsProps>(), {
  width: '100%',
  height: '100%',
})
// 搭配写法一
const main = ref(null)
// 初始化图表
const initEcharts = () => {
  if (props.options == null) return
  // 写法一 as unknown as HTMLElement 定义的是document.getElementById 类似于这种方式拿值 的 数据类型
  instance = echarts.init(
    main.value as unknown as HTMLElement
  ) as unknown as EChartsType
  instance.setOption(props.options as ECBasicOption)
  instance.on('click', handlerClick)
  window.onresize = handlerSize
}
function handlerSize () {
  instance.resize()
}
function handlerClick (params: EventParams | any): void {
  if (props.handlerClick != null) {
    props.handlerClick(params)
  }
}
onMounted(() => {
  initEcharts()
})
onBeforeUnmount(() => {
  if (instance) {
    instance.dispose()
    window.removeEventListener('onresize', handlerSize)
  }
})
watch(props, () => {
  if (instance) {
    instance.setOption(props.options as ECBasicOption)
  } else {
    initEcharts()
  }
})
</script>

<style scoped lang="scss">
.main {
  width: 100%;
  height: 100%;
}
</style>

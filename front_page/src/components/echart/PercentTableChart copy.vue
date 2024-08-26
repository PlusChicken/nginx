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
  shallowRef,
} from "vue";
import { merge, debounce } from "lodash";
import * as echarts from "echarts";
import { ECharts } from "echarts";
import { ECBasicOption, EChartsType } from "echarts/types/dist/shared";
import { EventParams } from "../../utils/echarts";
interface EchartsProps {
  options: ECBasicOption | null;
  width?: string;
  height?: string;
  option?: any;
  handlerClick?: (params: EventParams) => void | null;
}
let myChart = shallowRef<ECharts>();
// withDefaults可以设置默认值 这里我们需要初始化就设置子组件的默认宽度高度
const props = withDefaults(defineProps<EchartsProps>(), {
  width: "100%",
  height: "100%",
});

watch(
  () => props,
  () => {
    console.log(props.option);
    drawChart();
  },
  {
    deep: true,
  }
);
const drawChart = debounce(() => {
  myChart.value = echarts.init(document.getElementById("main") as HTMLElement);
  myChart.value.setOption(merge(option));
}, 500);
let option = {
  tooltip: {
    trigger: "item",
  },
  legend: {
    top: "5%",
    left: "center",
  },
  series: [
    {
      name: "Access From",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 1048, name: "Search Engine" },
        { value: 735, name: "Direct" },
        { value: 580, name: "Email" },
        { value: 484, name: "Union Ads" },
        { value: 300, name: "Video Ads" },
      ],
    },
  ],
};
onMounted(() => {
  drawChart();
});
</script>

<style scoped lang="scss">
.main {
  width: 100%;
  height: 100%;
}
</style>

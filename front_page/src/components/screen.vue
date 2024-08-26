<template>
  <div class="g-map-wrapper">
    <!-- 地图区域 -->
    <div id="g-container" :style="{ width: '100%', height: '100%' }" />
    <a-modal
      v-model:visible="showModel"
      @ok="handleOk"
      :closable="false"
      :footer="null"
      :width="800"
      style="top: 10px"
    >
      <MapInfoWindow2 :device="devicePoint" :refresh="showModel" />
    </a-modal>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import {
  generateLineContent,
  generatePointContent,
  generatePolyContent,
} from '../utils/map-layer-utils'
import { postElementsReq } from '/@/api/layer'
import { MapDoodleType, MapElementEnum } from '/@/constants/map'
import { useGMapManage } from '/@/hooks/use-g-map-screen'
import { useGMapCover } from '/@/hooks/use-g-map-cover'
import { useMouseTool } from '/@/hooks/use-mouse-tool'
import { getApp, getRoot } from '/@/root'
import { useMyStore } from '/@/store'
import { GeojsonCoordinate } from '/@/types/map'
import { MapDoodleEnum } from '/@/types/map-enum'
import { PostElementsBody } from '/@/types/mapLayer'
import { uuidv4 } from '/@/utils/uuid'
import { gcj02towgs84, wgs84togcj02 } from '/@/vendors/coordtransform'
import { deviceTsaUpdate } from '/@/hooks/use-g-map-tsa'
import {
  DeviceOsd,
  DeviceStatus,
  DockOsd,
  EGear,
  EModeCode,
  GatewayOsd,
  EDockModeCode,
  NetworkStateQualityEnum,
  NetworkStateTypeEnum,
  RainfallEnum,
  DroneInDockEnum,
} from '/@/types/device'
import pin from '/@/assets/icons/pin-2d8cf0.svg'
import M30 from '/@/assets/icons/m30.png'
import {
  BorderOutlined,
  LineOutlined,
  CloseOutlined,
  ControlOutlined,
  TrademarkOutlined,
  ArrowDownOutlined,
  ThunderboltOutlined,
  SignalFilled,
  GlobalOutlined,
  HistoryOutlined,
  CloudUploadOutlined,
  RocketOutlined,
  FieldTimeOutlined,
  CloudOutlined,
  CloudFilled,
  FolderOpenOutlined,
  RobotFilled,
  ArrowUpOutlined,
  CarryOutOutlined,
} from '@ant-design/icons-vue'
import { EDeviceTypeName } from '../types'
import DockControlPanel from './g-map/DockControlPanel.vue'
import { useDockControl } from './g-map/use-dock-control'
import DroneControlPanel from './g-map/DroneControlPanel.vue'
import { useConnectMqtt } from './g-map/use-connect-mqtt'
import LivestreamOthers from './livestream-others.vue'
import LivestreamAgora from './livestream-agora.vue'
import FlightAreaActionIcon from './flight-area/FlightAreaActionIcon.vue'
import { EFlightAreaType } from '../types/flight-area'
import { useFlightArea } from './flight-area/use-flight-area'
import { useFlightAreaDroneLocationEvent } from './flight-area/use-flight-area-drone-location-event'
import { ScreenDeviceErrorFile } from '/@/types/error-file'
import { mapLayers } from '../constants/mock-layers'
import AMapLoader from '@amap/amap-jsapi-loader'
import MapInfoWindow2 from '/@/components/screen/MapInfoWindowCenter.vue'

export default defineComponent({
  components: {
    BorderOutlined,
    LineOutlined,
    CloseOutlined,
    ControlOutlined,
    TrademarkOutlined,
    ThunderboltOutlined,
    SignalFilled,
    GlobalOutlined,
    HistoryOutlined,
    CloudUploadOutlined,
    FieldTimeOutlined,
    CloudOutlined,
    CloudFilled,
    FolderOpenOutlined,
    RobotFilled,
    ArrowUpOutlined,
    ArrowDownOutlined,
    DockControlPanel,
    DroneControlPanel,
    CarryOutOutlined,
    RocketOutlined,
    LivestreamOthers,
    LivestreamAgora,
    FlightAreaActionIcon,
    MapInfoWindow2,
  },
  name: 'ScreenMap',
  props: {
    device: {
      type: Object,
      required: false,
    },
  },
  setup (props) {
    const devicePoint = ref(props.device)
    const useMouseToolHook = useMouseTool()
    const useGMapManageHook = useGMapManage()
    const deviceTsaUpdateHook = deviceTsaUpdate()
    const root = getRoot()

    const showModel = ref(false)
    const mouseMode = ref(false)
    const store = useMyStore()
    const state = reactive({
      currentType: '',
      coverIndex: 0,
      isFlightArea: false,
    })
    const str: string = '--'
    const deviceInfo = reactive({
      gateway: {
        capacity_percent: str,
        transmission_signal_quality: str,
      } as GatewayOsd,
      dock: {} as DockOsd,
      device: {
        gear: -1,
        mode_code: EModeCode.Disconnected,
        height: str,
        home_distance: str,
        horizontal_speed: str,
        vertical_speed: str,
        wind_speed: str,
        wind_direction: str,
        elevation: str,
        position_state: {
          gps_number: str,
          is_fixed: 0,
          rtk_number: str,
        },
        battery: {
          capacity_percent: str,
          landing_power: str,
          remain_flight_time: 0,
          return_home_power: str,
        },
        latitude: 0,
        longitude: 0,
      } as DeviceOsd,
    })
    const shareId = computed(() => {
      return store.state.layerBaseInfo.share
    })
    const defaultId = computed(() => {
      return store.state.layerBaseInfo.default
    })
    const drawVisible = computed(() => {
      return store.state.drawVisible
    })
    const livestreamOthersVisible = computed(() => {
      return store.state.livestreamOthersVisible
    })
    const livestreamAgoraVisible = computed(() => {
      return store.state.livestreamAgoraVisible
    })
    const osdVisible = computed(() => {
      return store.state.osdVisible
    })
    const qualityStyle = computed(() => {
      if (
        deviceInfo.dock.basic_osd?.network_state?.type ===
          NetworkStateTypeEnum.ETHERNET ||
        (deviceInfo.dock.basic_osd?.network_state?.quality || 0) >
          NetworkStateQualityEnum.FAIR
      ) {
        return 'color: #00ee8b'
      }
      if (
        (deviceInfo.dock.basic_osd?.network_state?.quality || 0) ===
        NetworkStateQualityEnum.FAIR
      ) {
        return 'color: yellow'
      }
      return 'color: red'
    })

    function draw (
      type: MapDoodleType,
      bool: boolean,
      flightAreaType?: EFlightAreaType
    ) {
      state.currentType = type
      mouseMode.value = bool
      state.isFlightArea = !!flightAreaType
      useMouseToolHook.mouseTool(type, getDrawCallback, flightAreaType)
    }

    // dock 控制面板
    const {
      dockControlPanelVisible,
      setDockControlPanelVisible,
      onCloseControlPanel,
    } = useDockControl()

    // 连接或断开drc
    useConnectMqtt()

    onMounted(() => {
      const app = getApp()
      useGMapManageHook.globalPropertiesConfig(app)
    })

    const { getDrawFlightAreaCallback, onFlightAreaDroneLocationWs } =
      useFlightArea()
    useFlightAreaDroneLocationEvent(onFlightAreaDroneLocationWs)

    function selectFlightAreaAction ({
      type,
      isCircle,
    }: {
      type: EFlightAreaType;
      isCircle: boolean;
    }) {
      draw(isCircle ? MapDoodleEnum.CIRCLE : MapDoodleEnum.POLYGON, true, type)
    }

    function getDrawCallback ({ obj }: { obj: any }) {
      if (state.isFlightArea) {
        getDrawFlightAreaCallback(obj)
        return
      }
      switch (state.currentType) {
        case MapDoodleEnum.PIN:
          postPinPositionResource(obj)
          break
        case MapDoodleEnum.POLYLINE:
          postPolylineResource(obj)
          break
        case MapDoodleEnum.POLYGON:
          postPolygonResource(obj)
          break
        default:
          break
      }
    }
    async function postPinPositionResource (obj) {
      const req = getPinPositionResource(obj)
      setLayers(req)
      const coordinates = req.resource.content.geometry.coordinates
      updateCoordinates('gcj02-wgs84', req);
      (req.resource.content.geometry.coordinates as GeojsonCoordinate).push(
        (coordinates as GeojsonCoordinate)[2]
      )
      const result = await postElementsReq(shareId.value, req)
      obj.setExtData({ id: req.id, name: req.name })
      store.state.coverMap[req.id] = [obj]
    }
    async function postPolylineResource (obj) {
      const req = getPolylineResource(obj)
      setLayers(req)
      updateCoordinates('gcj02-wgs84', req)
      const result = await postElementsReq(shareId.value, req)
      obj.setExtData({ id: req.id, name: req.name })
      store.state.coverMap[req.id] = [obj]
    }
    async function postPolygonResource (obj) {
      const req = getPoygonResource(obj)
      setLayers(req)
      updateCoordinates('gcj02-wgs84', req)
      const result = await postElementsReq(shareId.value, req)
      obj.setExtData({ id: req.id, name: req.name })
      store.state.coverMap[req.id] = [obj]
    }

    function getPinPositionResource (obj) {
      const position = obj.getPosition()
      const resource = generatePointContent(position)
      const name = obj._originOpts.title
      const id = uuidv4()
      return {
        id,
        name,
        resource,
      }
    }
    function getPolylineResource (obj) {
      const path = obj.getPath()
      const resource = generateLineContent(path)
      const { name, id } = getBaseInfo(obj._opts)
      return {
        id,
        name,
        resource,
      }
    }
    function getPoygonResource (obj) {
      const path = obj.getPath()
      const resource = generatePolyContent(path)
      const { name, id } = getBaseInfo(obj._opts)
      return {
        id,
        name,
        resource,
      }
    }
    function getBaseInfo (obj) {
      const name = obj.title
      const id = uuidv4()
      return { name, id }
    }
    function setLayers (resource: PostElementsBody) {
      const layers = store.state.Layers
      const layer = layers.find((item) => item.id.includes(shareId.value))
      // layer.id = 'private_layer' + uuidv4()
      // layer?.elements.push(resource)
      if (layer?.elements) {
        (layer?.elements as any[]).push(resource)
      }
      console.log('layers', layers)
      store.commit('SET_LAYER_INFO', layers)
    }
    function closeLivestreamOthers () {
      store.commit('SET_LIVESTREAM_OTHERS_VISIBLE', false)
    }
    function closeLivestreamAgora () {
      store.commit('SET_LIVESTREAM_AGORA_VISIBLE', false)
    }
    function updateCoordinates (transformType: string, element: any) {
      const geoType = element.resource?.content.geometry.type
      const type = element.resource?.type as number
      if (element.resource) {
        if (MapElementEnum.PIN === type) {
          const coordinates = element.resource?.content.geometry
            .coordinates as GeojsonCoordinate
          if (transformType === 'wgs84-gcj02') {
            const transResult = wgs84togcj02(
              coordinates[0],
              coordinates[1]
            ) as GeojsonCoordinate
            element.resource.content.geometry.coordinates = transResult
          } else if (transformType === 'gcj02-wgs84') {
            const transResult = gcj02towgs84(
              coordinates[0],
              coordinates[1]
            ) as GeojsonCoordinate
            element.resource.content.geometry.coordinates = transResult
          }
        } else if (MapElementEnum.LINE === type) {
          const coordinates = element.resource?.content.geometry
            .coordinates as GeojsonCoordinate[]
          if (transformType === 'wgs84-gcj02') {
            coordinates.forEach((coordinate, i, arr) => {
              arr[i] = wgs84togcj02(
                coordinate[0],
                coordinate[1]
              ) as GeojsonCoordinate
            })
          } else if (transformType === 'gcj02-wgs84') {
            coordinates.forEach((coordinate, i, arr) => {
              arr[i] = gcj02towgs84(
                coordinate[0],
                coordinate[1]
              ) as GeojsonCoordinate
            })
          }
          element.resource.content.geometry.coordinates = coordinates
        } else if (MapElementEnum.POLY === type) {
          const coordinates = element.resource?.content.geometry
            .coordinates[0] as GeojsonCoordinate[]
          if (transformType === 'wgs84-gcj02') {
            coordinates.forEach((coordinate, i, arr) => {
              arr[i] = wgs84togcj02(
                coordinate[0],
                coordinate[1]
              ) as GeojsonCoordinate
            })
          } else if (transformType === 'gcj02-wgs84') {
            coordinates.forEach((coordinate, i, arr) => {
              arr[i] = gcj02towgs84(
                coordinate[0],
                coordinate[1]
              ) as GeojsonCoordinate
            })
          }
          element.resource.content.geometry.coordinates = [coordinates]
        }
      }
    }
    const handleOk = (e: MouseEvent) => {
      showModel.value = false
    }

    return {
      draw,
      mouseMode,
      drawVisible,
      livestreamOthersVisible,
      livestreamAgoraVisible,
      osdVisible,
      pin,
      state,
      M30,
      deviceInfo,
      EGear,
      EModeCode,
      str,
      EDockModeCode,
      dockControlPanelVisible,
      setDockControlPanelVisible,
      onCloseControlPanel,
      NetworkStateTypeEnum,
      NetworkStateQualityEnum,
      RainfallEnum,
      DroneInDockEnum,
      closeLivestreamOthers,
      closeLivestreamAgora,
      qualityStyle,
      selectFlightAreaAction,
      handleOk,
      showModel,
      devicePoint,
    }
  },
  watch: {
    device (newVal, oldVal) {
      const root = getRoot()
      const map = root.$map
      const media = ref<any>(newVal)
      if (map === undefined) {
        return
      }
      if (
        this.devicePoint !== undefined &&
        this.devicePoint.file_id === newVal.file_id
      ) {
        return
      }
      AMapLoader.load({
        plugins: ['AMap.Marker', 'AMap.InfoWindow'],
      })
        .then((AMap) => {
          const marker = new AMap.Marker({
            position: [media.value.longitude, media.value.latitude],
            clickable: true,
            anchor: 'top-center',
          })
          marker.on('click', () => {
            this.showModel = true
          })
          map.add(marker)
          map.setFitView()
        })
        .catch((e) => {
          console.log(e)
        })
      this.devicePoint = newVal
    },
  },
})
</script>

<style lang="scss" scoped>
.g-map-wrapper {
  height: 100%;
  width: 100%;

  .g-action-panel {
    position: absolute;
    top: 16px;
    right: 16px;
    .g-action-item {
      width: 28px;
      height: 28px;
      background: white;
      color: $primary;
      border-radius: 2px;
      line-height: 28px;
      text-align: center;
      margin-bottom: 2px;
    }
    .g-action-item:hover {
      border: 1px solid $primary;
      border-radius: 2px;
    }
  }
  .selection {
    border: 1px solid $primary;
    border-radius: 2px;
  }

  // antd button 光晕
  &:deep(.ant-btn) {
    &::after {
      display: none;
    }
  }
}
.osd-panel {
  position: absolute;
  margin-left: 10px;
  left: 0;
  top: 10px;
  width: 480px;
  background: #000;
  color: #fff;
  border-radius: 2px;
  opacity: 0.8;
}
.osd > div:not(.dock-control-panel) {
  margin-top: 5px;
  padding-left: 5px;
}

.circle {
  border-radius: 50%;
  width: 10px;
  height: 10px;
}

.battery-slide {
  .capacity-percent {
    background: #00ee8b;
  }
  .return-home {
    background: #ff9f0a;
  }
  .landing {
    background: #f5222d;
  }
  .white-point {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: white;
    bottom: -0.5px;
  }
  .battery {
    background: #141414;
    color: #00ee8b;
    margin-top: -10px;
    height: 20px;
    width: auto;
    border-left: 1px solid #00ee8b;
    padding: 0 5px;
  }
}
.battery-slide > div {
  position: absolute;
  min-height: 2px;
  border-radius: 2px;
}

.liveview {
  position: absolute;
  color: #fff;
  z-index: 1;
  left: 0;
  margin-left: 10px;
  top: 10px;
  text-align: center;
  width: 800px;
  height: 720px;
  background: #232323;
}
</style>

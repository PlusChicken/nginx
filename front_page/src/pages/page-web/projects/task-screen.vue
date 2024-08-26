<template>
  <div class="container">
    <div
      style="position: absolute; z-index: 4; margin-top: 4px; margin-left: 2cap"
    >
      <a-tooltip
        title="Back to home"
        placement="right"
        style="width: 100%; height: 100%"
      >
        <a @click="goHome">
          <ImportOutlined
            style="font-size: 35px; color: rgb(67 134 151); opacity: 0.8"
          />
        </a>
      </a-tooltip>
    </div>
    <div class="home-color-left"></div>
    <div class="home-color-right"></div>
    <div class="time"></div>
    <div class="overlay-header">
      <div style="width: 30%; margin-top: 40px">
        <decoration8 style="width: 100%; height: 30px; z-index: 3" />
      </div>
      <div style="width: 40%; text-align: center; margin-top: 48px">
        <decoration5 :dur="20" style="width: 100%; height: 30px; z-index: 3" />
      </div>
      <div style="width: 30%; margin-top: 40px">
        <decoration8
          :reverse="true"
          style="width: 100%; height: 30px; z-index: 3"
        />
      </div>
      <div
        class="title"
        style="
          width: 100%;
          margin-top: 5px;
          position: absolute;
          text-align: center;
        "
      >
        灵宙飞行巡检平台
      </div>
      <div
        class="title-job-name"
        style="
          width: 100%;
          margin-top: 38px;
          position: absolute;
          text-align: center;
        "
      >
        {{ screenJob?.name }}
      </div>
    </div>
    <div class="overlay-left">
      <div class="overlay-left-one">
        <div
          style="position: absolute; z-index: 3; margin-top: 10px; right: 12px"
        >
          <ReloadOutlined @click="onStart" />
        </div>
        <BorderBox7>
          <video
            :style="{
              marginTop: '10px',
              width: '100%',
              height: '90%',
              paddingLeft: '5px',
              paddingRight: '5px',
            }"
            id="video-webrtc"
            ref="videowebrtc"
            controls
            autoplay
          ></video>
        </BorderBox7>
      </div>
      <div class="overlay-left-two">
        <BorderBox7 :color="['rgb(20, 38, 140)']">
          <div
            style="
              position: absolute;
              z-index: 5;
              display: flex;
              align-items: center;
              padding-top: 20px;
            "
          >
            <img
              :src="warningImageUrl"
              style="height: 30px; width: hv; margin-left: 30px"
            />
            <div
              style="
                margin-left: 18px;
                color: red;
                font-weight: bold;
                font-size: 16px;
                margin-top: 2px;
              "
            >
              发现异常
            </div>
          </div>

          <div>
            <a-empty
              v-if="showImage === undefined"
              :image="simpleImage"
              style="padding-top: 80px"
            />
            <a-spin :spinning="showSpinning">
              <a-image
                v-if="showImage !== undefined"
                :src="showImage?.all_url_file"
                :width="320"
                :height="190"
                :preview="false"
                :alt="'smallShowImg'"
                @click="showJobTotalFile"
              />
            </a-spin>
          </div>
          <a-button
            :size="buttonSize"
            style="
              position: absolute;
              z-index: 5;
              top: 5px;
              right: 5px;
              background-color: black;
              color: white;
            "
            @click="showJobFile()"
            >图片列表</a-button
          >
          <a-button
            :size="buttonSize"
            style="
              position: absolute;
              z-index: 5;
              bottom: 7px;
              right: 5px;
              background-color: black;
              color: white;
            "
            @click="showJobErrorFile()"
            >异常列表</a-button
          >
          <div
            style="
              position: absolute;
              left: 0;
              top: 0;
              z-index: 5;
              height: 100%;
              display: flex;
              align-items: center;
              width: 50px;
              padding-left: 10px;
            "
          >
            <LeftCircleOutlined
              @click="iconLeft"
              :style="{ fontSize: '25px', color: showLeftColor }"
            />
          </div>
          <div
            style="
              position: absolute;
              right: 0;
              top: 0;
              z-index: 5;
              height: 100%;
              display: flex;
              align-items: center;
              padding-right: 10px;
            "
          >
            <RightCircleOutlined
              @click="iconRight"
              :style="{ fontSize: '25px', color: showRightColor }"
            />
          </div>
        </BorderBox7>
      </div>

      <div id="overlay-left-three" class="overlay-left-three">
        <BorderBox7 :color="['rgb(20, 38, 140)']">
          <div class="dashboard-card">
            <div class="header">任务统计</div>
          </div>
          <div style="margin-top: 30px; margin-left: 20px">
            <div style="display: flex">
              <div class="device-font" style="width: 50%">
                成功任务数: {{ deviceJobInfo?.success_task }}
              </div>
              <div class="device-font" style="width: 50%">
                全部任务数: {{ deviceJobInfo?.total_task }}
              </div>
            </div>
            <div style="display: flex; margin-top: 20px">
              <div class="device-font" style="width: 50%">
                失败任务数: {{ deviceJobInfo?.error_task }}
              </div>
              <div class="device-font" style="width: 50%">
                预执行任务数: {{ deviceJobInfo?.pare_task }}
              </div>
            </div>
          </div>
        </BorderBox7>
      </div>
    </div>
    <div class="overlay-right">
      <div id="overlay-right-one" class="overlay-right-one">
        <BorderBox7 :color="['rgb(20, 38, 140)']">
          <div class="dashboard-card">
            <div class="header">无人机概览</div>
          </div>
          <div
            style="
              height: 100px;
              width: 100%;
              padding-left: 20px;
              display: flex;
            "
          >
            <img :src="imageImageUrl" style="height: 100%; width: hv" />
            <div style="width: 100%; margin-left: 20px">
              <div class="device-font">
                无人机名称: {{ screenDevice?.device_name }}
              </div>
              <div class="device-font">
                工作空间: {{ screenDevice?.workspace_name }}
              </div>
              <div class="device-font">无人机状态: {{ deviceStatus }}</div>
            </div>
          </div>
          <div style="height: auto; padding-left: 20px; padding-right: 20px">
            <div style="display: flex; width: 100%">
              <div class="device-font" style="width: 70%">
                固件版本: {{ screenDevice?.firmware_version }}
              </div>
              <div class="device-font" style="width: 40%">
                类型: {{ screenDevice?.type }}
              </div>
            </div>
            <div style="display: flex">
              <div class="device-font" style="width: 100%">
                最新上线时间: {{ screenDevice?.login_time }}
              </div>
            </div>
          </div>
        </BorderBox7>
      </div>
      <div class="overlay-right-two">
        <BorderBox7 :color="['rgb(20, 38, 140)']">
          <div style="width: 100%; height: 30px">
            <div class="dashboard-card">
              <div class="header">任务进度</div>
            </div>
            <div style="margin-top: 10px; margin-left: 20px">
              <div class="device-font" style="width: 100%">
                执行时间: {{ screenJob?.begin_time }}
              </div>
              <div style="display: flex; margin-top: 10px">
                <div class="device-font" style="width: 50%">
                  任务状态: {{ TaskStatusMapString[screenJob?.status] }}
                </div>
              </div>
              <div style="display: flex; margin-top: 10px">
                <div class="device-font" style="width: 40%">
                  失控后行为:
                  {{ OutOfControlActionMap[screenJob?.out_of_control_action] }}
                </div>
              </div>
              <div class="device-font" style="width: 100%; margin-top: 10px">
                相对机场返航高度: {{ screenJob?.rth_altitude }}m
              </div>
            </div>
          </div>
        </BorderBox7>
      </div>
      <div class="overlay-right-three">
        <BorderBox7 :color="['rgb(20, 38, 140)']">
          <div class="dashboard-card">
            <div class="header">任务详情</div>
          </div>
          <div style="margin-top: 30px; margin-left: 20px">
            <div style="display: flex">
              <div class="device-font" style="width: 50%">
                任务名称: {{ screenJob?.name }}
              </div>
              <div class="device-font" style="width: 50%">
                任务类型: {{ TaskTypeMap[screenJob?.task_type] }}
              </div>
            </div>
            <div style="display: flex; margin-top: 20px">
              <div class="device-font" style="width: 50%">
                航线名称: {{ screenWayline?.name }}
              </div>
              <div class="device-font" style="width: 50%">
                航线类型: {{ WaylineTypeMap[screenJob?.wayline_type] }}
              </div>
            </div>
          </div>
        </BorderBox7>
      </div>
    </div>
    <ScreenMap :device="mapPoint" class="screen-map" />
  </div>
  <div>
    <a-modal
      v-model:visible="showJobFileType"
      @ok="handleOk"
      :closable="false"
      :footer="null"
      :width="1300"
      style="top: 10px"
    >
      <fileShow
        :deviceSn="deviceSn"
        :jobId="jobId"
        :refresh="showJobFileType"
      />
    </a-modal>
  </div>
  <div>
    <a-modal
      v-model:visible="showJobErrorFileType"
      @ok="handleOk"
      :closable="false"
      :footer="null"
      :width="1300"
      style="top: 10px"
    >
      <fileShowError
        :deviceSn="deviceSn"
        :jobId="jobId"
        :refresh="showJobErrorFileType"
      />
    </a-modal>
  </div>
  <div>
    <a-modal
      v-model:visible="showJobTotalFileType"
      @ok="handleOk"
      :closable="false"
      :footer="null"
      :width="800"
      style="top: 10px"
    >
      <MapInfoWindowSmall :device="showImage" :refresh="showJobTotalFileType" />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { Decoration5, Decoration8, BorderBox7 } from '@kjgl77/datav-vue3'
import ScreenMap from '/@/components/screen.vue'
import { h, onMounted, onUnmounted, reactive, ref, UnwrapRef } from 'vue'
import {
  getScreenDevice,
  startLivestream,
  getDevicePayload,
} from '/@/api/manage'
import {
  getScreenJob,
  getScreenWayline,
  getDeviceJobInfo,
} from '/@/api/wayline'
import {
  getScreenDeviceErrorFile,
  getScreenLatestErrorFile,
} from '/@/api/error-file'
import { ELocalStorageKey, ERouterName } from '/@/types'
import {
  ReloadOutlined,
  ImportOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
} from '@ant-design/icons-vue'
import warningImageUrl from '/@/assets/icons/waring.png'
import imageImageUrl from '/@/assets/icons/image.png'
import { ScreenDevice } from '/@/types/device'
import { message, Empty } from 'ant-design-vue'
import { getRoot } from '/@/root'
import { ScreenDeviceErrorFile } from '/@/types/error-file'
import { CURRENT_CONFIG as config } from '/@/api/http/config'
import jswebrtc from '/@/vendors/jswebrtc.min.js'
import srs from '/@/vendors/srs.sdk.js'
import { ScreenJob, ScreenWayline, DeviceJobInfo } from '/@/types/screen'
import { TableState } from 'ant-design-vue/lib/table/interface'
import fileShow from '/@/components/screen/file-show.vue'
import fileShowError from '/@/components/screen/file-show-error.vue'
import {
  OutOfControlActionMap,
  TaskTypeMap,
  TaskStatusMapString,
} from '/@/types/task'
import { WaylineTypeMap } from '/@/types/wayline'
import MapInfoWindowSmall from '/@/components/screen/MapInfoWindowSmall.vue'

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

const root = getRoot()

const workspaceId: string =
  localStorage.getItem(ELocalStorageKey.WorkspaceId) || ''

const deviceSn = ref<string>('')
const jobId = ref<string>('')
const waylineId = ref<string>('')
const dockSn = ref<string>('')
const screenDevice = ref<ScreenDevice>()
const screenJob = ref<ScreenJob>()
const screenWayline = ref<ScreenWayline>()
const deviceJobInfo = ref<DeviceJobInfo>()

const videowebrtc = ref(null)
const deviceStatus = ref<string>('Offline')

const videoId = ref()
const livetypeSelected = ref<number>(1)
const droneSelected = ref<string>(deviceSn.value)
const cameraSelected = ref<string>()
const videoSelected = ref<string>()
const claritySelected = ref<number>(1)
const nonSwitchable = 'normal'
const rtspData = ref()
const liveState = ref<boolean>(false)
let webrtc: any = null
const buttonSize = ref<string>('middle')

// 地图点信息
const mapPoint = ref<ScreenDeviceErrorFile>()

// 数组
const errorImgList = ref<ScreenDeviceErrorFile[]>()
const errorImg = ref<string>()
const showImage = ref<ScreenDeviceErrorFile>()
const indexImg = ref<number>(0)
const showSpinning = ref<boolean>(false)
const showRightColor = ref<string>('white')
const showLeftColor = ref<string>('white')

function goHome () {
  root.$router.push('/' + ERouterName.TASKCENTER)
}
const showJobFileType = ref<boolean>(false)
const showJobErrorFileType = ref<boolean>(false)
const showJobTotalFileType = ref<boolean>(false)
function showJobFile () {
  showJobFileType.value = true
}
function showJobErrorFile () {
  showJobErrorFileType.value = true
}
function showJobTotalFile () {
  showJobTotalFileType.value = true
}
const handleOk = (e: MouseEvent) => {
  showJobFileType.value = false
  showJobErrorFileType.value = false
  showJobTotalFileType.value = false
}

// 定时任务
// 定义定时器的间隔时间（单位：毫秒）
const intervalTime = 5000

// 发送接口请求的函数
const fetchData = async () => {
  getScreenLatestErrorFile(workspaceId, deviceSn.value, jobId.value).then(
    (res) => {
      if (res.code !== 0) {
        return
      }
      const oldFileId = mapPoint.value?.file_id
      mapPoint.value = res.data
      if (
        res.data.all_url_file !== undefined &&
        res.data.file_id !== oldFileId
      ) {
        console.log('---add---')
        errorImg.value = res.data.all_url_file
        errorImgList.value.push(res.data)
      }
    }
  )
}

onMounted(() => {
  deviceSn.value = root.$router.currentRoute.value.query.deviceSn
  jobId.value = root.$router.currentRoute.value.query.jobId
  waylineId.value = root.$router.currentRoute.value.query.waylineId
  dockSn.value = root.$router.currentRoute.value.query.dockSn

  getScreenDevice(deviceSn.value).then((res) => {
    if (res.code !== 0) {
      return
    }
    screenDevice.value = res.data
    if (screenDevice.value?.status) {
      deviceStatus.value = 'Online'
    }
  })
  getScreenDeviceErrorFile(workspaceId, deviceSn.value, jobId.value).then(
    (res) => {
      if (res.code !== 0) {
        return
      }
      errorImgList.value = res.data
      if (errorImgList.value.length > 0) {
        showImage.value = errorImgList.value[0]
      }
    }
  )
  getScreenJob(jobId.value).then((res) => {
    if (res.code !== 0) {
      return
    }
    screenJob.value = res.data
  })
  getScreenWayline(workspaceId, waylineId.value).then((res) => {
    if (res.code !== 0) {
      return
    }
    screenWayline.value = res.data
  })
  getDeviceJobInfo(workspaceId, deviceSn.value).then((res) => {
    if (res.code !== 0) {
      return
    }
    deviceJobInfo.value = res.data
  })

  getDevicePayload(deviceSn.value).then((res) => {
    if (res.code !== 0) {
      return
    }
    cameraSelected.value = res.data
  })

  // 定时
  fetchData()
  // 每隔 intervalTime 时间执行一次 fetchData
  const timerId = setInterval(fetchData, intervalTime)

  // 在组件卸载时清除定时器，避免内存泄漏
  onUnmounted(() => {
    clearInterval(timerId)
  })
})

const iconLeft = () => {
  console.log(errorImgList.value)
  if (indexImg.value - 1 < 0) {
    indexImg.value = errorImgList.value.length - 1
  } else {
    indexImg.value = indexImg.value - 1
  }
  showImage.value = errorImgList.value[indexImg.value]
  console.log(indexImg)
  console.log(showImage)
  showLeftColor.value = 'blue'
  const imageList = document.getElementsByClassName('ant-image-img')

  const filteredElements = []
  for (let i = 0; i < imageList.length; i++) {
    if (imageList[i].alt === 'smallShowImg') {
      filteredElements.push(imageList[i])
    }
  }

  const imageOne = filteredElements[0] as HTMLImageElement
  showSpinning.value = true
  imageOne.onload = () => {
    showSpinning.value = false
    showLeftColor.value = 'white'
  }
}

const iconRight = () => {
  console.log(errorImgList)
  if (indexImg.value + 1 > errorImgList.value.length - 1) {
    indexImg.value = 0
  } else {
    indexImg.value = indexImg.value + 1
  }
  console.log(indexImg.value)
  showImage.value = errorImgList.value[indexImg.value]
  showRightColor.value = 'blue'
  console.log(indexImg)
  console.log(showImage)
  const imageList = document.getElementsByClassName('ant-image-img')

  const filteredElements = []
  for (let i = 0; i < imageList.length; i++) {
    if (imageList[i].alt === 'smallShowImg') {
      filteredElements.push(imageList[i])
    }
  }

  const imageOne = filteredElements[0] as HTMLImageElement
  showSpinning.value = true
  imageOne.onload = () => {
    showSpinning.value = false
    showRightColor.value = 'white'
  }
}

const onStart = async () => {
  console.log(
    'Param:',
    livetypeSelected.value,
    droneSelected.value,
    cameraSelected.value,
    videoSelected.value,
    claritySelected.value
  )
  const timestamp = new Date().getTime().toString()
  if (
    livetypeSelected.value == null ||
    droneSelected.value == null ||
    cameraSelected.value == null ||
    claritySelected.value == null
  ) {
    message.warn('waring: not select live para!!!')
    return
  }
  videoId.value =
    droneSelected.value +
    '/' +
    cameraSelected.value +
    '/' +
    (videoSelected.value || nonSwitchable + '-0')

  let liveURL = ''
  switch (livetypeSelected.value) {
    case 1: {
      // RTMP
      liveURL = config.rtmpURL + timestamp
      break
    }
    case 2: {
      // RTSP
      liveURL = `userName=${config.rtspUserName}&password=${config.rtspPassword}&port=${config.rtspPort}`
      break
    }
    case 3: {
      liveURL = `serverIP=${config.gbServerIp}&serverPort=${config.gbServerPort}&serverID=${config.gbServerId}&agentID=${config.gbAgentId}&agentPassword=${config.gbPassword}&localPort=${config.gbAgentPort}&channel=${config.gbAgentChannel}`
      break
    }
    case 4: {
      break
    }
    default:
      console.warn('warning: live type is not correct!!!')
      break
  }
  await startLivestream({
    url: liveURL,
    video_id: videoId.value,
    url_type: livetypeSelected.value,
    video_quality: claritySelected.value,
  })
    .then((res) => {
      if (res.code !== 0) {
        return
      }
      if (livetypeSelected.value === 3) {
        const url = res.data.url
        const videoElement = videowebrtc.value
        // gb28181,it will fail if not wait.
        message.loading({
          content: 'Loding...',
          duration: 4,
          onClose () {
            const player = new jswebrtc.Player(url, {
              video: videoElement,
              autoplay: true,
              onPlay: (obj: any) => {
                console.log('start play livestream')
              },
            })
          },
        })
      } else if (livetypeSelected.value === 2) {
        console.log(res)
        rtspData.value = 'url:' + res.data.url
      } else if (livetypeSelected.value === 1) {
        const url = res.data.url
        const videoElement = videowebrtc.value
        console.log('start live:', url)
        console.log(videoElement)
        const player = new jswebrtc.Player(url, {
          video: videoElement,
          autoplay: true,
          onPlay: (obj: any) => {
            console.log('start play livestream')
          },
        })
      } else if (livetypeSelected.value === 4) {
        const videoElement = videowebrtc.value as unknown as HTMLMediaElement
        videoElement.muted = true
        playWebrtc(videoElement, res.data.url)
      }
      liveState.value = true
    })
    .catch((err) => {
      console.error(err)
    })
}
const playWebrtc = (videoElement: HTMLMediaElement, url: string) => {
  if (webrtc) {
    webrtc.close()
  }
  webrtc = new srs.SrsRtcWhipWhepAsync()
  videoElement.srcObject = webrtc.stream
  webrtc
    .play(url)
    .then(function (session: any) {
      console.info(session)
    })
    .catch(function (reason: any) {
      webrtc.close()
      console.error(reason)
    })
}
</script>

<style lang="scss" scoped>
.device-table-wrap {
  .editable-row-operations {
    div > span {
      margin-right: 10px;
    }
  }
}
</style>

<style lang="scss">
.ant-empty-normal {
  margin: 0;
}
.table {
  background-color: white;
  margin: 20px;
  padding: 20px;
  height: 88vh;
}
.table-striped {
  background-color: #f7f9fa;
}
.ant-table {
  border-top: 1px solid rgb(0, 0, 0, 0.06);
  border-bottom: 1px solid rgb(0, 0, 0, 0.06);
}
.ant-table-tbody tr td {
  border: 0;
}
.ant-table td {
  white-space: nowrap;
}
.ant-table-thead tr th {
  background: white !important;
  border: 0;
}
th.ant-table-selection-column {
  background-color: white !important;
}
.ant-table-header {
  background-color: white !important;
}
.child-row {
  height: 70px;
}
.notice {
  background: $success;
  overflow: hidden;
  cursor: pointer;
}
.caution {
  background: orange;
  cursor: pointer;
  overflow: hidden;
}
.warn {
  background: red;
  cursor: pointer;
  overflow: hidden;
}
.container {
  position: relative;
  width: 100%;
  height: 100%;
}
.home-color-left {
  position: absolute;
  width: 25%;
  height: 100%;
  background: linear-gradient(to right, rgb(2, 16, 27), rgba(0, 0, 0, 0) 80%);
  z-index: 2;
}
.home-color-right {
  position: absolute;
  right: 0;
  width: 25%;
  height: 100%;
  background: linear-gradient(to left, rgb(2, 16, 27), rgba(0, 0, 0, 0) 80%);
  z-index: 2;
}
.overlay {
  position: absolute;
  z-index: 3;
  opacity: 0.8; /* Adjust transparency */
  color: black; /* Adjust text color if needed */
  // border-radius: 5px;
}
.overlay-header {
  @extend .overlay;
  display: flex;
  width: 100%;
  height: 80px;
  background-color: black;
}

.overlay-left {
  position: absolute;
  z-index: 3;
  color: black; /* Adjust text color if needed */
  margin-left: 20px;
  height: 100%;
}
.overlay-left-one {
  position: absolute;
  z-index: 3;
  color: black; /* Adjust text color if needed */
  margin-top: 85px;
  width: 334px;
  height: 200px;
  background-color: rgb(2, 16, 27);
}
.overlay-left-two {
  @extend .overlay;
  margin-top: 295px;
  width: 334px;
  height: 200px;
  text-align: center;
  background-color: rgb(2, 16, 27);
}
.overlay-left-three {
  @extend .overlay;
  margin-top: 505px;
  width: 334px;
  height: 200px;
  background-color: rgb(2, 16, 27);
}
.overlay-left-three-2 {
  @extend .overlay;
  margin-top: 505px;
  width: 334px;
  height: 200px;
  margin-left: 1065px;
  background-color: rgb(2, 16, 27);
}

.overlay-left-three-3 {
  @extend .overlay;
  margin-top: 505px;
  width: 334px;
  height: 200px;
  background-color: rgb(2, 16, 27);
}

.overlay-right {
  @extend .overlay;
  margin-right: 20px;
  height: 100%;
  width: 334px;
  right: 0;
}
.overlay-right-one {
  @extend .overlay;
  margin-top: 85px;
  width: 100%;
  height: 200px;
  display: flex;
  background-color: rgb(2, 16, 27);
}
.overlay-right-two {
  @extend .overlay;
  margin-top: 295px;
  width: 334px;
  height: 200px;
  background-color: rgb(2, 16, 27);
}
.overlay-right-three {
  @extend .overlay;
  margin-top: 505px;
  width: 334px;
  height: 200px;
  background-color: rgb(2, 16, 27);
}
.overlay-down {
  @extend .overlay;
  bottom: 0;
  width: 100%;
  height: 100px;
  background-color: rgb(0, 0, 0);
}
.title {
  font-family: "Microsoft YaHei", Arial, sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
  text-align: center;
}
.title-job-name {
  font-family: "Microsoft YaHei", Arial, sans-serif;
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
  text-align: center;
}
.screen-map {
  z-index: 1;
}
.dashboard-card {
  background: #1b2735;
  border-radius: 5px;
  color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  margin-top: 5px;
  margin-left: 5px;
  width: 120px;
  height: 30px;
  .header {
    font-size: 16px;
    font-weight: bold;
    padding-top: 2px;
    padding-bottom: 2px;
    width: 100%;
  }
}
.device-font {
  font-size: 15px;
  font-weight: bold;
  color: white;
  margin-top: 2px;
}

.ant-carousel :deep(.slick-slide) {
  text-align: center;
  height: 160px;
  line-height: 160px;
  background: #364d79;
  overflow: hidden;
}

.ant-carousel :deep(.slick-arrow.custom-slick-arrow) {
  width: 25px;
  height: 25px;
  font-size: 25px;
  color: #fff;
  background-color: rgba(31, 45, 61, 0.11);
  opacity: 0.3;
}
.ant-carousel :deep(.custom-slick-arrow:before) {
  display: none;
}
.ant-carousel :deep(.custom-slick-arrow:hover) {
  opacity: 0.5;
}

.ant-carousel :deep(.slick-slide h3) {
  color: #fff;
}
.ant-image {
  display: inline-flex;
  padding-top: 5px;
}
// .ant-modal-body {
//   background-color: #3c3939;
// }
</style>

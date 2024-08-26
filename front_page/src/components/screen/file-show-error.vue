<template>
  <a-spin :spinning="loading" :delay="1500" tip="downloading" size="large">
    <div class="media-panel-wrapper">
      <a-table
        class="media-table"
        :columns="columns"
        :data-source="mediaData.data"
        row-key="fingerprint"
        :pagination="paginationProp"
        :scroll="{ x: '100%', y: 600 }"
        @change="refreshData"
      >
        <template
          v-for="col in ['name', 'path', 'drone']"
          #[col]="{ text }"
          :key="col"
        >
          <a-tooltip :title="text">
            <a v-if="col === 'name'">{{ text }}</a>
            <span v-else>{{ text }}</span>
          </a-tooltip>
        </template>
        <template #original="{ text }">
          {{ text }}
        </template>
        <template #action="{ record }">
          <a-tooltip title="下载">
            <a class="fz18" @click="downloadMedia(record)"
              ><DownloadOutlined
            /></a>
          </a-tooltip>
          <a-tooltip title="显示">
            <PictureOutlined
              class="fz18"
              :style="{ marginLeft: '10px', color: '#0000FF' }"
              @click="showModal(record)"
            />
          </a-tooltip>
        </template>
      </a-table>
    </div>
  </a-spin>
  <div>
    <a-modal
      v-model:visible="visible"
      @ok="handleOk"
      :closable="false"
      :footer="null"
      style="text-align: center; top: 20px"
      :width="800"
    >
      <a-image v-if="fileType == 'img'" :src="fileSrc" />
      <!-- <MapInfoWindow
        v-if="fileType == 'img'"
        :device="tempModel"
        :refresh="visible"
      /> -->
      <video
        v-if="fileType == 'video'"
        :style="{
          width: '100%',
          height: '100%',
        }"
        id="video-webrtc"
        ref="videowebrtc"
        :src="fileSrc"
        controls
        autoplay
      ></video>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { ref } from '@vue/reactivity'
import { TableState } from 'ant-design-vue/lib/table/interface'
import { onMounted, reactive, defineComponent } from 'vue'
import { IPage } from '/@/api/http/type'
import { ELocalStorageKey } from '/@/types/enums'
import { downloadFile } from '/@/utils/common'
import {
  downloadMediaFile,
  getMediaFile,
  getDeviceMediaFilesPage,
} from '/@/api/media'
import { getDeviceErrorFilesPage } from '/@/api/error-file'
import { DownloadOutlined, PictureOutlined } from '@ant-design/icons-vue'
import { message, Pagination } from 'ant-design-vue'
import { load } from '@amap/amap-jsapi-loader'
import MapInfoWindow from '/@/components/screen/MapInfoWindow.vue'

export default defineComponent({
  components: {
    message,
    Pagination,
    load,
    DownloadOutlined,
    PictureOutlined,
    MapInfoWindow,
  },
  name: 'fileShowError',
  props: {
    deviceSn: {
      type: String,
      required: true,
    },
    jobId: {
      type: String,
      required: true,
    },
    refresh: {
      type: Boolean,
      required: true,
    },
  },
  setup (props) {
    interface MediaFile {
      fingerprint: string;
      drone: string;
      payload: string;
      is_original: string;
      file_name: string;
      file_path: string;
      create_time: string;
      file_id: string;
      all_url_file: string;
      position_json: string;
    }
    const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId)!
    const deviceSn = ref<String>(props.deviceSn)
    const jobId = ref<String>(props.jobId)
    const loading = ref(false)
    const tempModel = ref<MediaFile>()
    const columns = [
      {
        title: '文件名',
        dataIndex: 'file_name',
        ellipsis: true,
        slots: { customRender: 'name' },
      },
      {
        title: '文件路径',
        dataIndex: 'file_path',
        ellipsis: true,
        slots: { customRender: 'path' },
      },
      // {
      //   title: 'FileSize',
      //   dataIndex: 'size',
      // },
      {
        title: '无人机',
        dataIndex: 'drone',
        ellipsis: true,
        slots: { customRender: 'drone' },
      },
      {
        title: '硬件类型',
        dataIndex: 'payload',
      },
      {
        title: '原图',
        dataIndex: 'is_original',
        slots: { customRender: 'original' },
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
      },
      {
        title: '操作',
        slots: { customRender: 'action' },
      },
    ]

    const fileType = ref<string>('img')
    const fileSrc = ref<string>('')

    const visible = ref<boolean>(false)

    function showModal (media: MediaFile) {
      tempModel.value = media
      getMediaFile(workspaceId, media.file_id)
        .then((res) => {
          if (!res) {
            return
          }
          fileSrc.value = res.data
          visible.value = true
          tempModel.value.all_url_file = res.data
          if (media.file_name.match('.MP4') || media.file_name.match('.mp4')) {
            fileType.value = 'video'
          } else {
            fileType.value = 'img'
          }
        })
        .finally(() => {
          loading.value = false
        })
    }

    const handleOk = (e: MouseEvent) => {
      console.log(e)
      visible.value = false
    }

    const body: IPage = {
      page: 1,
      total: 0,
      page_size: 20,
    }
    const paginationProp = reactive({
      pageSizeOptions: ['20', '50', '100'],
      showQuickJumper: true,
      showSizeChanger: true,
      pageSize: 20,
      current: 1,
      total: 0,
    })

    type Pagination = TableState['pagination'];

    const mediaData = reactive({
      data: [] as MediaFile[],
    })

    onMounted(() => {
      getFiles()
    })

    function getFiles () {
      getDeviceErrorFilesPage(
        workspaceId,
        deviceSn.value,
        jobId.value,
        body
      ).then((res) => {
        mediaData.data = res.data.list
        paginationProp.total = res.data.pagination.total
        paginationProp.current = res.data.pagination.page
        console.info(mediaData.data[0])
      })
    }

    function refreshData (page: Pagination) {
      body.page = page?.current!
      body.page_size = page?.pageSize!
      getFiles()
    }

    function downloadMedia (media: MediaFile) {
      loading.value = true
      downloadMediaFile(workspaceId, media.file_id)
        .then((res) => {
          if (!res) {
            return
          }
          const data = new Blob([res])
          downloadFile(data, media.file_name)
        })
        .finally(() => {
          loading.value = false
        })
    }
    return {
      columns,
      downloadMedia,
      refreshData,
      getFiles,
      mediaData,
      loading,
      paginationProp,
      showModal,
      visible,
      handleOk,
      fileType,
      fileSrc,
      tempModel,
    }
  },
  watch: {
    refresh (newVal, oldVal) {
      if (newVal) {
        this.getFiles()
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.media-panel-wrapper {
  width: 100%;
  padding: 16px;
  .media-table {
    background: #fff;
    margin-top: 10px;
  }
  .action-area {
    color: $primary;
    cursor: pointer;
  }
}
.header {
  width: 100%;
  height: 60px;
  background: #fff;
  padding: 16px;
  font-size: 20px;
  font-weight: bold;
  text-align: start;
  color: #000;
}
</style>

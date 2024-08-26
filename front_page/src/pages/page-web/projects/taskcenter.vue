<template>
  <div class="device-table-wrap table flex-display flex-column">
    <a-table
      :columns="columns"
      :data-source="data.device"
      :pagination="paginationProp"
      @change="refreshData"
      row-key="device_sn"
      :expandedRowKeys="expandRows"
      :row-selection="rowSelection"
      :rowClassName="rowClassName"
      :scroll="{ x: '100%', y: 600 }"
      :expandIcon="expandIcon"
      :loading="loading"
    >
      <template v-for="col in ['sn', 'workspace']" #[col]="{ text }" :key="col">
        <a-tooltip :title="text">
          <span>{{ text }}</span>
        </a-tooltip>
      </template>
      <!-- 状态 -->
      <template #device_status="{ text }">
        <span v-if="text" class="flex-row flex-align-center">
          <span
            class="mr5"
            style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background-color: green;
            "
          />
          <span>Online</span>
        </span>
        <span class="flex-row flex-align-center" v-else>
          <span
            class="mr5"
            style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background-color: red;
            "
          />
          <span>Offline</span>
        </span>
      </template>
      <!-- 操作 -->
      <template #action="{ record }">
        <div class="editable-row-operations">
          <!-- 非编辑态操作 -->
          <div class="flex-align-center flex-row" style="color: #2d8cf0">
            <a-tooltip
              v-if="current.indexOf(EDeviceTypeName.Dock) !== -1"
              title="Hms Info"
            >
              <FileSearchOutlined @click="showHms(record)" />
            </a-tooltip>
            <a-tooltip title="进入大屏">
              <VideoCameraAddOutlined @click="enterScreen(record)" />
            </a-tooltip>
          </div>
        </div>
      </template>
      <!-- 上传状态 -->
      <template #job_status="{ record }">
        <div>
          {{ TaskStatusMap[record.job_status] }}
        </div>
      </template>
    </a-table>
  </div>
  <!-- hms 信息 -->
  <DeviceHmsDrawer v-model:visible="hmsVisible" :device="currentDevice">
  </DeviceHmsDrawer>
</template>
<script lang="ts" setup>
import { ColumnProps, TableState } from 'ant-design-vue/lib/table/interface'
import { h, onMounted, reactive, ref, UnwrapRef } from 'vue'
import { IPage } from '/@/api/http/type'
import { getJobDevices } from '/@/api/wayline'
import { EDeviceTypeName, ELocalStorageKey } from '/@/types'
import {
  VideoCameraAddOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  FileSearchOutlined,
  CloudServerOutlined,
} from '@ant-design/icons-vue'
import { JobDevice } from '/@/types/device-job'
import { Device } from '/@/types/device'
import DeviceHmsDrawer from '/@/components/devices/device-hms/DeviceHmsDrawer.vue'
import { getRoot } from '/@/root'
import { ERouterName } from '/@/types/index'
import { TaskStatusMap } from '/@/types/task'
import { message, notification } from 'ant-design-vue'
interface DeviceData {
  device: JobDevice[];
}

const loading = ref(true)
const deleteTip = ref<boolean>(false)
const deleteSn = ref<string>()
const columns: ColumnProps[] = [
  {
    title: '设备名称',
    dataIndex: 'device_name',
    width: 100,
    // sorter: (a: JobDevice, b: JobDevice) =>
    //   a.nickname.localeCompare(b.nickname),
    className: 'titleStyle',
    ellipsis: true,
    slots: { customRender: 'device_name' },
  },
  {
    title: '设备编号',
    dataIndex: 'device_sn',
    width: 100,
    className: 'titleStyle',
    ellipsis: true,
    slots: { customRender: 'sn' },
  },
  {
    title: '航线名称',
    dataIndex: 'wayline_name',
    width: 100,
    className: 'titleStyle',
    slots: { customRender: 'wayline_name' },
  },
  {
    title: '任务名称',
    dataIndex: 'job_name',
    width: 100,
    className: 'titleStyle',
    ellipsis: true,
    slots: { customRender: 'job_name' },
  },
  {
    title: '硬件状态',
    dataIndex: 'device_status',
    width: 100,
    className: 'titleStyle',
    slots: { customRender: 'device_status' },
  },
  {
    title: '任务状态',
    dataIndex: 'job_status',
    width: 100,
    className: 'titleStyle',
    slots: { customRender: 'job_status' },
  },
  {
    title: '完成时间',
    dataIndex: 'completed_time',
    width: 150,
    sorter: (a: JobDevice, b: JobDevice) =>
      a.completed_time.localeCompare(b.completed_time),
    className: 'titleStyle',
    slots: { customRender: 'completed_time' },
  },
  {
    title: '操作',
    dataIndex: 'actions',
    width: 100,
    className: 'titleStyle',
    slots: { customRender: 'action' },
  },
]
const root = getRoot()
function enterScreen (job: JobDevice) {
  if (job.device_sn === undefined) {
    notification.error({
      key: '',
      message: '',
      description: '机场绑定无人机异常,请确认再试',
      duration: null,
    })
    return
  }
  root.$router.push({
    name: ERouterName.TASKSCREEN,
    query: {
      deviceSn: job.child_sn,
      jobId: job.job_id,
      waylineId: job.wayline_id,
      dock_sn: job.device_sn,
    },
  })
}

const expandIcon = (props: any) => {
  if (judgeCurrentType(EDeviceTypeName.Dock) && !props.expanded) {
    return h('div', {
      style:
        'border-left: 2px solid rgb(200,200,200); border-bottom: 2px solid rgb(200,200,200); height: 16px; width: 16px; float: left;',
      class: 'mt-5 ml0',
    })
  }
}

const rowClassName = (record: any, index: number) => {
  const className = []
  if ((index & 1) === 0) {
    className.push('table-striped')
  }
  if (record.domain !== EDeviceTypeName.Dock) {
    className.push('child-row')
  }
  return className.toString().replaceAll(',', ' ')
}

const expandRows = ref<string[]>([])
const data = reactive<DeviceData>({
  device: [],
})

const paginationProp = reactive({
  pageSizeOptions: ['20', '50', '100'],
  showQuickJumper: true,
  showSizeChanger: true,
  pageSize: 50,
  current: 1,
  total: 0,
})

// 获取分页信息
function getPaginationBody () {
  return {
    page: paginationProp.current,
    page_size: paginationProp.pageSize,
  } as IPage
}

const rowSelection = {
  onChange: (selectedRowKeys: (string | number)[], selectedRows: []) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      'selectedRows: ',
      selectedRows
    )
  },
  onSelect: (record: any, selected: boolean, selectedRows: []) => {
    console.log(record, selected, selectedRows)
  },
  onSelectAll: (selected: boolean, selectedRows: [], changeRows: []) => {
    console.log(selected, selectedRows, changeRows)
  },
  getCheckboxProps: (record: any) => ({
    disabled:
      judgeCurrentType(EDeviceTypeName.Dock) &&
      record.domain !== EDeviceTypeName.Dock,
    style:
      judgeCurrentType(EDeviceTypeName.Dock) &&
      record.domain !== EDeviceTypeName.Dock
        ? 'display: none'
        : '',
  }),
}
type Pagination = TableState['pagination'];

const workspaceId: string =
  localStorage.getItem(ELocalStorageKey.WorkspaceId) || ''
const editableData: UnwrapRef<Record<string, Device>> = reactive({})
const current = ref([EDeviceTypeName.Aircraft])

function judgeCurrentType (type: EDeviceTypeName): boolean {
  return current.value.indexOf(type) !== -1
}

// 获取设备列表信息
function getDevices (domain: number, closeLoading?: boolean) {
  if (!closeLoading) {
    loading.value = true
  }
  getJobDevices(workspaceId, getPaginationBody()).then((res) => {
    if (res.code !== 0) {
      return
    }
    const resData: JobDevice[] = res.data.list
    expandRows.value = []
    resData.forEach((val: any) => {
      // if (val.children) {
      //   val.children = [val.children]
      // }
      if (judgeCurrentType(EDeviceTypeName.Dock)) {
        expandRows.value.push(val.device_sn)
      }
    })
    data.device = resData
    paginationProp.total = res.data.pagination.total
    paginationProp.current = res.data.pagination.page
    paginationProp.pageSize = res.data.pagination.page_size
    loading.value = false
  })
}

function refreshData (page: Pagination) {
  paginationProp.current = page?.current!
  paginationProp.pageSize = page?.pageSize!
  getDevices(current.value[0])
}

const currentDevice = ref({} as Device)
// 设备日志
const deviceLogUploadRecordVisible = ref(false)
function showDeviceLogUploadRecord (dock: Device) {
  deviceLogUploadRecordVisible.value = true
  currentDevice.value = dock
}

// 健康状态
const hmsVisible = ref<boolean>(false)

function showHms (dock: Device) {
  hmsVisible.value = true
  currentDevice.value = dock
}

onMounted(() => {
  getDevices(current.value[0])
})
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
</style>

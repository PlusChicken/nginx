import request, { IWorkspaceResponse, IPage } from '/@/api/http/request'
import { ScreenDeviceErrorFile } from '/@/types/error-file'

const HTTP_PREFIX = '/media/api/v1'

export const getScreenDeviceErrorFile = async function (workspace_id: string, device_sn: string, job_id:string): Promise<IWorkspaceResponse<ScreenDeviceErrorFile[]>> {
  const url = `${HTTP_PREFIX}/error/files/${workspace_id}/files/${device_sn}/${job_id}`
  const result = await request.get(url)
  return result.data
}

// Get Device Media Files
export const getDeviceErrorFilesPage = async function (workspace_id: string, device_sn:string, job_id:string, pagination: IPage): Promise<IWorkspaceResponse<any>> {
  const url = `${HTTP_PREFIX}/error/files/${workspace_id}/files/${device_sn}/${job_id}/page?page=${pagination.page}&page_size=${pagination.page_size}`
  const result = await request.get(url)
  return result.data
}

export const getScreenLatestErrorFile = async function (workspace_id: string, device_sn: string, job_id:string): Promise<IWorkspaceResponse<ScreenDeviceErrorFile>> {
  const url = `${HTTP_PREFIX}/error/files/${workspace_id}/latest/${device_sn}/${job_id}`
  const result = await request.get(url)
  return result.data
}

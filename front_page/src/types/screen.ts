import { TaskType, TaskStatus, OutOfControlAction } from '/@/types/task'
import {WaylineType} from '/@/types/wayline'
export interface ScreenJob {
    name:string,
    task_type:TaskType,
    wayline_type:WaylineType,
    username:string,
    execute_time:string,
    end_time:string,
    status:TaskStatus,
    rth_altitude:string,
    out_of_control_action:OutOfControlAction,
    begin_time:string,
    completed_time:string
  }

export interface ScreenWayline{
    name:string
}

export interface DeviceJobInfo{
    success_task:string,
    total_task:string,
    error_task:string,
    pare_task:string
}
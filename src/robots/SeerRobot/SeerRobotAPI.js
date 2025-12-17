// 状态API

// 查询机器人看到的库位信息
async function robot_status_bins_req(SeerRobot) {
    return await SeerRobot.node_list.status.sendMsg(1,1803);
}

// 查询机器人信息
async function robot_status_info_req(SeerRobot) {
    return await SeerRobot.node_list.status.sendMsg(1,1000);
}

// 查询机器人运行信息
async function robot_status_run_req(SeerRobot) {
    return await SeerRobot.node_list.status.sendMsg(1,1002);
}

// 查询机器人位置
async function robot_status_loc_req(SeerRobot) {
    return await SeerRobot.node_list.status.sendMsg(1,1004);
}

// 查询机器人电池状态
async function robot_status_battery_req(SeerRobot, params = {simple: false}) {
    return await SeerRobot.node_list.status.sendMsg(1,1007, params);
}

// 查询电机状态信息
async function robot_status_motor_req(SeerRobot, params = {motor_names: null}) {
    return await SeerRobot.node_list.status.sendMsg(1,1040, params);
}

// 查询机器人导航状态
async function robot_status_task_req(SeerRobot, params = {simple: false}) {
    return await SeerRobot.node_list.status.sendMsg(1,1020, params);
}

// 查询机器人任务状态
async function robot_status_task_status_package_req(SeerRobot, params = {task_ids: null}) {
    return await SeerRobot.node_list.status.sendMsg(1,1110, params);
}

// 查询机器人定位状态
async function robot_status_reloc_req(SeerRobot) {
    return await SeerRobot.node_list.status.sendMsg(1,1021);
}

// 查询当前控制权所有者
async function robot_status_current_lock_req(SeerRobot) {
    return await SeerRobot.node_list.status.sendMsg(1,1060);
}

// 查询机器人载入的地图以及储存的地图
async function robot_status_map_req(SeerRobot) {
    return await SeerRobot.node_list.status.sendMsg(1,1300);
}

// 查询机器人当前载入地图中的站点信息
async function robot_status_station_req(SeerRobot) {
    return await SeerRobot.node_list.status.sendMsg(1,1301);
}

// 查询任意两点之间的路径
async function robot_status_get_path_req(SeerRobot, params={
    target_id: null,
    source_id: null,
}) {
    return await SeerRobot.node_list.status.sendMsg(1,1303, params);
}

// 查询站点绑定的库位信息
async function robot_status_station_bin_locations_req(SeerRobot, params={
    stations: []
}) {
    return await SeerRobot.node_list.status.sendMsg(1,1310, params);
}

// 
async function robot_status_laser_req(SeerRobot, params={
    return_beams3D: null,
}) {
    return await SeerRobot.node_list.status.sendMsg(1,1009, params);
}



// 导航API

// 平动
async function robot_task_translate_req(SeerRobot, params = {
    dist: 0, // 直线运动距离, 绝对值, 单位: m
    vx: null,   // 机器人坐标系下 X 方向运动的速度, 正为向前, 负为向后, 单位: m/s
    vy: null,   // 机器人坐标系下 Y 方向运动的速度, 正为向左, 负为向右, 单位: m/s
    mode: 0 // 0 = 里程模式(根据里程进行运动), 1 = 定位模式, 若缺省则默认为里程模式

}) {
    return await SeerRobot.node_list.navigation.sendMsg(1, 3055, params);
}

// 路径导航
async function robot_task_gotarget_req(SeerRobot, params) {
    return await SeerRobot.node_list.navigation.sendMsg(1, 3051, params);
}

// 获取路径导航的路径
async function robot_task_target_path_req(SeerRobot, params) {
    return await SeerRobot.node_list.navigation.sendMsg(1, 3053, params);
}

// 指定路径导航
async function robot_task_gotargetlist_req(SeerRobot, params) {
    return await SeerRobot.node_list.navigation.sendMsg(1, 3066, params);
}


// 配置API

// 抢占控制权
async function robot_config_lock_req(SeerRobot, params = {
    nick_name: "", // 控制者名称
}) {
    return await SeerRobot.node_list.configuration.sendMsg(1, 4005, params);
}

// 释放控制权
async function robot_config_unlock_req(SeerRobot) {
    return await SeerRobot.node_list.configuration.sendMsg(1, 4006);
}


// 推送 API
async function robot_push_config_req(SeerRobot, params = {
    interval: 1000,
    included_fields: null,
    excluded_fields: null,
}) {
    return await SeerRobot.node_list.notify.sendMsg(1, 9300, params);
}

module.exports = {
    robot_status_bins_req,
    robot_status_info_req,
    robot_status_run_req,
    robot_status_loc_req,
    robot_status_battery_req,
    robot_status_motor_req,
    robot_status_task_req,
    robot_status_task_status_package_req,
    robot_status_reloc_req,
    robot_status_current_lock_req,
    robot_status_map_req,
    robot_status_station_req,
    robot_status_get_path_req,
    robot_status_station_bin_locations_req,
    robot_status_laser_req,

    robot_task_translate_req,
    robot_task_gotarget_req,
    robot_task_target_path_req,
    robot_task_gotargetlist_req,


    robot_config_lock_req,
    robot_config_unlock_req,

    robot_push_config_req,
};
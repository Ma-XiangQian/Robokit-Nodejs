import { EventEmitter } from "events";

/**
 * 机器人推送消息数据类型
 */
export interface RobotNotifyData {
    DI: { id: number; source: string; status: boolean; valid: boolean }[];
    DO: { id: number; status: boolean }[];
    acc_x: number;
    acc_y: number;
    acc_z: number;
    angle: number;
    ap_addr: string;
    area_ids: string[];
    arm_info: {
        endpos: { rx: number; ry: number; rz: number; w: number; x: number; y: number; z: number };
        joints: {
            angle: number;
            current: number;
            temperature: number;
            type: string;
            velocity: number;
            voltage: number;
        }[];
        task_status: number;
    };
    auto_charge: boolean;
    battery_cycle: number;
    battery_extra: string;
    battery_level: number;
    battery_temp: number;
    battery_user_data: string;
    block_x: number;
    block_y: number;
    blocked: boolean;
    brake: boolean;
    calib_status: { desc: string; status: number };
    charging: boolean;
    confidence: number;
    controller_humi: number;
    controller_temp: number;
    controller_voltage: number;
    correction_errs: any[];
    create_on: string;
    current: number;
    current_lock: { locked: boolean };
    current_map: string;
    current_map_md5: string;
    current_station: string;
    detect_skid: boolean;
    di_max_node: number;
    dispatch_mode: number;
    do_max_node: number;
    driver_emc: boolean;
    dsp_version: string;
    electric: boolean;
    emergency: boolean;
    errors: any[];
    fatals: any[];
    finished_path: any[];
    goods_region: { name: string; point: any[] };
    gyro_version: string;
    hook: {
        hook_angle: number;
        hook_clamping_state: boolean;
        hook_emc: boolean;
        hook_enable: boolean;
        hook_error_code: number;
        hook_height: number;
        hook_isFull: boolean;
        hook_mode: boolean;
        hook_state: number;
    };
    imu_header: { data_nsec: string; frame_id: string; pub_nsec: string; seq: string };
    in_forbidden_area: boolean;
    is_stop: boolean;
    jack: {
        jack_emc: boolean;
        jack_enable: boolean;
        jack_error_code: number;
        jack_height: number;
        jack_isFull: boolean;
        jack_load_times: number;
        jack_mode: boolean;
        jack_speed: number;
        jack_state: number;
    };
    loadmap_status: number;
    loc_method: number;
    loc_notify: string;
    loc_state: number;
    manual_charge: boolean;
    map: { userData: any[] };
    model: string;
    model_md5: string;
    motor_info: {
        calib: boolean;
        can_id: number;
        can_router: number;
        current: number;
        emc: boolean;
        encoder: number;
        err: boolean;
        error_code: number;
        follow_err: boolean;
        header: { data_nsec: string; frame_id: string; pub_nsec: string; seq: string };
        motor_name: string;
        passive: boolean;
        position: number;
        raw_position: number;
        speed: number;
        stop: boolean;
        temperature: number;
        type: number;
        voltage: number;
    }[];
    motor_steer_angles: number[];
    move_status_info: string;
    nearest_obstacles: any[];
    notices: any[];
    odo: number;
    peripheral_data: any[];
    pgvs: any[];
    pitch: number;
    qw: number;
    qx: number;
    qy: number;
    qz: number;
    r_spin: number;
    r_steer: number;
    r_steer_angles: number[];
    r_vx: number;
    r_vy: number;
    r_w: number;
    reliabilities: any[];
    reloc_status: number;
    requestCurrent: number;
    requestVoltage: number;
    ret_code: number;
    rfids: any[];
    robot_note: string;
    roll: number;
    roller: {
        roller_emc: boolean;
        roller_enable: boolean;
        roller_error_code: number;
        roller_isFull: boolean;
        roller_mode: boolean;
        roller_speed: number;
        roller_state: number;
    };
    rot_off_x: number;
    rot_off_y: number;
    rot_off_z: number;
    rot_x: number;
    rot_y: number;
    rot_z: number;
    rssi: number;
    running_status: number;
    similarity: number;
    slam_status: number;
    slowed: boolean;
    soft_emc: boolean;
    spin: number;
    src_release: boolean;
    ssid: string;
    steer: number;
    steer_angles: number[];
    target_dist: number;
    target_id: string;
    target_label: string;
    target_point: [number, number, number];
    target_x: number;
    target_y: number;
    task_status: number;
    task_status_package: {
        closest_label: string;
        closest_target: string;
        distance: number;
        info: string;
        percentage: number;
        source_label: string;
        source_name: string;
        target_label: string;
        target_name: string;
        task_status_list: { status: number; task_id: string; type: number }[];
    };
    task_type: number;
    tasklist_status: {
        actionGroupId: number;
        actionIds: any[];
        loop: boolean;
        taskId: number;
        taskListName: string;
        taskListStatus: number;
    };
    time: number;
    today_odo: number;
    today_time: number;
    total_time: number;
    tracking_status: number;
    transparent_data: any | null;
    unfinished_path: any[];
    update_reason: number;
    user_objects: any[];
    vehicle_id: string;
    version: string;
    voltage: number;
    vx: number;
    vy: number;
    w: number;
    warnings: any[];
    x: number;
    y: number;
    yaw: number;
}


/**
 * 节点选项配置
 */
export interface NodeOptions {
    robot_id?: string;
    robot_model?: string;
    keepAlive?: {
        enable?: boolean;
        initialDelay?: number;
    };
    reconnect?: {
        enable?: boolean;
        delay?: number;
        maxAttempts?: number;
    };
    timeout?: number;
}

/**
 * 机器人节点类
 */
export declare class Robot_Node {
    constructor(ip: string, port: number, options?: NodeOptions);
    sendMsg(reqId: number, msgType: number, msg?: object): Promise<any>;
}

/**
 * 机器人推送节点类
 */
export declare class Notify_Node extends EventEmitter {
    constructor(ip: string, port: number, options?: NodeOptions);
    sendMsg(reqId: number, msgType: number, msg?: object): Promise<any>;
    disconnect(): void;
}

/**
 * SEER机器人类
 */
export declare class SeerRobot extends EventEmitter {
    NetworkStatusMap: {
        INIT: "init";
        CONNECTED: "connected";
        RECONNECTED: "reconnected";
        DISCONNECTED: "disconnected";
        DESTROYED: "destroyed";
    };

    NetworkStatus: string;

    node_list: {
        status: Robot_Node | null;
        control: Robot_Node | null;
        navigation: Robot_Node | null;
        configuration: Robot_Node | null;
        other: Robot_Node | null;
        notify: Notify_Node | null;
    };

    NODE_PORTS: {
        status: number;
        control: number;
        navigation: number;
        configuration: number;
        other: number;
        notify: number;
    };

    nick_name: string;
    ip: string;
    options: NodeOptions;

    constructor(ip: string, nick_name: string, options?: NodeOptions);

    /** 初始化节点 */
    init(): void;

    /** 改变机器人状态并触发事件 */
    updateStatus(newStatus: string): void;

    /** 断开所有节点 */
    disconnectAll(destroyed?: boolean): void;

    /** 销毁机器人对象 */
    destroy(): void;

    /** 事件监听 */
    on(event: "connected" | "reconnected" | "disconnected" | "destroyed", listener: () => void): this;
    on(event: "notify", listener: (data: RobotNotifyData) => void): this;

    once(event: "connected" | "reconnected" | "disconnected" | "destroyed", listener: () => void): this;
    once(event: "notify", listener: (data: RobotNotifyData) => void): this;
}
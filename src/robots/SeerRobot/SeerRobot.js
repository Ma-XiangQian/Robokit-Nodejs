const net = require('net');
const { Socket } = net;
const EventEmitter = require('events');
const { packMsg } = require("./utils");

/**
 * SeerRobot 类表示一个仙工智能机器人对象，包含其基本信息和功能节点。
 * 用于封装机器人相关的控制、导航、配置等功能模块。
 */
class SeerRobot extends EventEmitter {

    // 机器人网络状态映射表
    NetworkStatusMap = {
        INIT: "init",             // 初始化（刚创建，还没尝试连接）
        CONNECTED: "connected",   // 已连接
        RECONNECTED: "reconnected", // 已重连
        DISCONNECTED: "disconnected", // 已断开或者未连接
        DESTROYED: "destroyed"    // 已销毁
    }

    NetworkStatus = "init"; // 机器人网络状态

    /**
     * 节点列表，包括机器人的状态、控制、导航、配置和其他功能节点。
     * @type {{ status: Robot_Node, control: Robot_Node, navigation: Robot_Node, configuration: Robot_Node, other: Robot_Node, notify: Robot_Node }}
     */
    node_list = {
        status: null, // 状态节点
        control: null, // 控制节点
        navigation: null, // 导航节点
        configuration: null, // 配置节点
        other: null, // 其他节点
        notify: null // 机器人推送信息节点
    }

    // 机器人节点通信端口映射
    NODE_PORTS = {
        status: 19204,
        control: 19205,
        navigation: 19206,
        configuration: 19207,
        other: 19210,
        notify: 19301
    };
    

    /**
     * 创建 Robot 实例。
     * @param {string} ip - 机器人对应的 IP 地址。
     * @param {string} nick_name - 控制对象昵称。
     * @param {Object} [options={}] - 可选配置项。
     * @param {string} [options.robot_id=""] - 机器人ID。
     * @param {Object} [options.keepAlive] - Keep-alive 配置。
     * @param {boolean} [options.keepAlive.enable=true] - 是否启用 keep-alive。
     * @param {number} [options.keepAlive.initialDelay=3000] - 初始延迟时间（毫秒）。
     * @param {Object} [options.reconnect] - 重连配置。
     * @param {boolean} [options.reconnect.enable=true] - 是否启用自动重连。
     * @param {number} [options.reconnect.delay=3000] - 重连间隔时间（毫秒）。
     * @param {number} [options.reconnect.maxAttempts=Infinity] - 最大重试次数。
     * @param {number} [options.timeout=3000] - 连接超时时间（毫秒）。
     */
    constructor(ip, nick_name, options = {}) {
        super();
        this.nick_name = nick_name; // 控制对象昵称
        this.ip = ip; // 机器人IP地址
        this.options = Object.assign({
            robot_id: null, // 机器人ID (为空则自动获取，有则校验)
            robot_model: "L-AMR",  // 机器人类型 （自己定义的）
            keepAlive: {
                enable: true,
                initialDelay: 3000   // ms
            },
            reconnect: {
                enable: true,
                delay: 3000,         // ms, 重连间隔
                maxAttempts: Infinity // 最大重试次数
            },
            timeout: 3000,            // 超时时间 (ms)
        }, options);
        this.init();

        this.once("connected", () => {
            this.onConnected();
        });
    }

    // 初始化所有节点连接
    init(){
        // 初始化节点
        for (const [nodeName, port] of Object.entries(this.NODE_PORTS)) {
            if (nodeName === "notify") continue; // 推送节点单独初始化
            this.node_list[nodeName] = new Robot_Node(this.ip, port, this.options);
        }
        // 初始化推送节点
        this.node_list.notify = new Notify_Node(this.ip, this.NODE_PORTS.notify, this.options);
        // 监听推送节点的状态变化
        this.node_list.notify.on('statusChange', async (status) => {
            if (status === "connected") {

                // 机器人ID校验等待添加 +⚠️

                // 第一次连接成功
                if(this.NetworkStatus === "init"){
                    this.updateStatus(this.NetworkStatusMap.CONNECTED);
                    return;
                }
                // 重连成功
                this.updateStatus(this.NetworkStatusMap.RECONNECTED);
                return;
            }
            
            // 避免初始化时和断开时重复触发
            if (this.NetworkStatus === "init") return;
            this.updateStatus(this.NetworkStatusMap.DISCONNECTED);
        });

        // 监听推送节点的推送消息
        this.node_list.notify.on('notify', (data) => {
            this.emit('notify', data); // 机器人推送消息事件
        });
    }

    // 监听连接成功事件
    async onConnected() {
        // await this.nodes.notify.sendMsg(1, 9300, { interval: 2000 });
    }

    // 改变机器人状态
    updateStatus(newStatus) {
        // 状态未变化，直接返回
        if(this.NetworkStatus === newStatus) return;
        this.NetworkStatus = newStatus;
        this.emit(newStatus); // 状态变化事件
    }

    // 断开所有节点连接
    disconnectAll(destroyed=false){
        if (destroyed){
            this.node_list.notify.destroyed = true; // 标记推送节点为已销毁
        }
        this.node_list.notify.disconnect(); // 断开推送节点连接
    }

    // 销毁机器人对象
    destroy(){
        this.disconnectAll(true);
        this.updateStatus(this.NetworkStatusMap.DESTROYED);
    }
    
}


/**
 * Notify_Node 类表示一个仙工智能机器人Socket对象，机器人推送节点。
 */
class Notify_Node extends EventEmitter {

    NodeStatus = {
        INIT: "init",             // 初始化（刚创建，还没尝试连接）
        CONNECTING: "connecting", // 正在尝试连接
        CONNECTED: "connected",   // 已连接
        DISCONNECTED: "disconnected", // 主动或被动断开
        RECONNECTING: "reconnecting", // 正在重连
        ERROR: "error"            // 遇到错误
    };

    status = "init"; // 节点状态
    socket = null; // 网络套接字
    reconnectAttempts = 0; // 已尝试的重连次数
    reconnectTimer = null;  // 重连定时器
    destroyed = false; // 是否已销毁


    PORT = 19301; // 机器人推送节点端口号

    /**
     * 创建 Robot_Node 实例。
     * @param {string} ip - 机器人对应的 IP 地址。
     * @param {number} port - 机器人对应的端口号。
     * @param {Object} [options={}] - 可选配置项。
     * @param {string} [options.robot_id=""] - 机器人id。
     * @param {Object} [options.keepAlive] - Keep-alive 配置。
     * @param {boolean} [options.keepAlive.enable=true] - 是否启用 keep-alive。
     * @param {number} [options.keepAlive.initialDelay=3000] - 初始延迟时间（毫秒）。
     * @param {Object} [options.reconnect] - 重连配置。
     * @param {boolean} [options.reconnect.enable=true] - 是否启用自动重连。
     * @param {number} [options.reconnect.delay=3000] - 重连间隔时间（毫秒）。
     * @param {number} [options.reconnect.maxAttempts=Infinity] - 最大重试次数。
     * @param {number} [options.timeout=3000] - 连接超时时间（毫秒）。
     */
    constructor(ip, port, options = {}) {
        super();
        this.ip = ip; // 机器人IP地址
        this.port = port; // 机器人端口号
        this.options = options; // 配置选项
        this.initSocket(); // 初始化连接
    }

    // 初始化连接
    initSocket() {
        // 创建连接
        this.socket = new net.Socket();
        this.updateStatus(this.NodeStatus.CONNECTING);

        // 推送API处理
        this.socket.setTimeout(this.options.timeout); // 设置连接超时时间
        // 超时事件
        this.socket.on("timeout", () => {
            this.updateStatus(this.NodeStatus.ERROR);
            this.disconnect();
        });
        // 消息事件
        this.socket.on("data", (data) => {
            // 处理接收到的数据
            let dataAll = Buffer.from(data);
            let expectedLen = 0;

            if (dataAll.length >= 16 && expectedLen === 0) {
                const header = dataAll.slice(0, 16);
                const magic = header.readUInt8(0);
                const version = header.readUInt8(1);
                const reqId = header.readUInt16BE(2);
                const jsonLen = header.readUInt32BE(4);
                const msgType = header.readUInt16BE(8);
                const reserved = header.slice(10, 16);

                expectedLen = jsonLen;
            }

            if (expectedLen > 0 && dataAll.length >= 16 + expectedLen) {
                const jsonPart = dataAll.slice(16, 16 + expectedLen).toString('ascii');
                try {
                    const parsed = JSON.parse(jsonPart);
                    this.emit('notify', parsed); // 推送消息事件
                } catch (e) {
                    console.error(`${this.node_names[this.port]} JSON 解析失败！`);
                    throw e;
                }
            }
        });

        // 断开事件
        this.socket.on("close", (err) => {
            this.socket.removeAllListeners();
            this.updateStatus(this.NodeStatus.DISCONNECTED); // 连接断开
            this.disconnect();
            this.handleReconnect(); // 处理重连
        });

        // 错误事件
        this.socket.on("error", (err) => {
            this.updateStatus(this.NodeStatus.ERROR); // 连接错误
            this.disconnect();
        });

        // 连接
        this.socket.connect(this.port, this.ip, () => {
            this.updateStatus(this.NodeStatus.CONNECTED); // 连接成功
            // keep-alive
            if (this.options.keepAlive && this.options.keepAlive.enable){
                this.socket.setKeepAlive(true, this.options.keepAlive.initialDelay);
            }
        });
    }

    // 断开连接
    disconnect(){
        this.clearReconnectTimer(); // 清除重连定时器
        if (this.socket && !this.socket.destroyed) {
            this.socket.destroy(); // 断开连接
        }
    }

    // 重连
    handleReconnect(){
        const { reconnect } = this.options;
        if (reconnect && reconnect.enable && !this.destroyed) {
            if (this.reconnectAttempts < reconnect.maxAttempts) {
                this.reconnectAttempts++;
                this.updateStatus(this.NodeStatus.RECONNECTING);

                this.reconnectTimer = setTimeout(() => {
                    this.initSocket();
                }, reconnect.delay);
            } else {
                // console.error(`${this.node_names[this.port]} 已达到最大重连次数 (${reconnect.maxAttempts})`);
            }
        }
    }

    // 清除重连定时器
    clearReconnectTimer(){
        if (this.reconnectTimer){
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    // 改变节点状态
    updateStatus(newStatus) {
        // 状态未变化，直接返回
        if(this.status === newStatus) return;
        this.status = newStatus;
        this.emit('statusChange', this.status); // 状态变化事件
    }

    sendMsg(reqId, msgType, msg = {}) {
        return new Promise((resolve, reject) => {
            // 处理未连接的情况
            if (this.status!== this.NodeStatus.CONNECTED) {
                reject(new Error(`${this.node_names[this.port]} 未连接`));
                return;
            }
            // 打包消息
            const buffer = packMsg(reqId, msgType, msg);
            let dataAll = Buffer.alloc(0);
            let expectedLen = 0;
            // 发送消息
            this.socket.write(buffer, (err) => {
                if (err) {
                    reject(new Error(`发送消息失败: ${err.message}`));
                } else {
                    // 监听响应
                    this.socket.once('data', (chunk) => {
                        dataAll = Buffer.concat([dataAll, chunk]);

                        if (dataAll.length >= 16 && expectedLen === 0) {
                            const header = dataAll.slice(0, 16);
                            const magic = header.readUInt8(0);
                            const version = header.readUInt8(1);
                            const reqId = header.readUInt16BE(2);
                            const jsonLen = header.readUInt32BE(4);
                            const msgType = header.readUInt16BE(8);
                            const reserved = header.slice(10, 16);

                            expectedLen = jsonLen;
                        }

                        if (expectedLen > 0 && dataAll.length >= 16 + expectedLen) {
                            const jsonPart = dataAll.slice(16, 16 + expectedLen).toString('ascii');
                            try {
                                const parsed = JSON.parse(jsonPart);
                                resolve(parsed);
                            } catch (e) {
                                reject(new Error(`JSON 解析失败: ${e.message}`));
                            }
                        }
                    });
                }
            });
        });
    }

}


/**
 * Robot_Node 类表示一个仙工智能机器人Socket对象，包含其连接、发送、接受功能。
 */
class Robot_Node {

    /**
     * 创建 Robot_Node 实例。
     * @param {string} ip - 机器人对应的 IP 地址。
     * @param {number} port - 机器人对应的端口号。
     * @param {Object} [options={}] - 可选配置项。
     * @param {string} [options.robot_id=""] - 机器人id。
     * @param {Object} [options.keepAlive] - Keep-alive 配置。
     * @param {boolean} [options.keepAlive.enable=true] - 是否启用 keep-alive。
     * @param {number} [options.keepAlive.initialDelay=3000] - 初始延迟时间（毫秒）。
     * @param {Object} [options.reconnect] - 重连配置。
     * @param {boolean} [options.reconnect.enable=true] - 是否启用自动重连。
     * @param {number} [options.reconnect.delay=3000] - 重连间隔时间（毫秒）。
     * @param {number} [options.reconnect.maxAttempts=Infinity] - 最大重试次数。
     * @param {number} [options.timeout=3000] - 连接超时时间（毫秒）。
     */
    constructor(ip, port, options = {}) {
        this.ip = ip; // 机器人IP地址
        this.port = port; // 机器人端口号
        this.options = options; // 配置选项
    }

    sendMsg(reqId, msgType, msg = {}) {
        return new Promise((resolve, reject) => {
            // 打包消息
            const buffer = packMsg(reqId, msgType, msg);
            let dataAll = Buffer.alloc(0);
            let expectedLen = 0;

            // 创建socket
            const socket = new net.Socket();
            socket.setTimeout(this.options.timeout); // 设置连接超时时间
            // 超时事件
            socket.on("timeout", () => {
                socket.destroy();
                reject(new Error(`连接超时 (${this.options.timeout} ms)`));
            });

            // 断开事件
            socket.on("close", (err) => {
                socket.removeAllListeners();
                if (socket && !socket.destroyed) {
                    socket.destroy(); // 断开连接
                }
            });

            // 错误事件
            socket.on("error", (err) => {
                reject(new Error(`连接错误: ${err.message}`));
                socket.destroy();
            });

            // 连接
            socket.connect(this.port, this.ip, () => {
                // keep-alive
                if (this.options.keepAlive && this.options.keepAlive.enable){
                    socket.setKeepAlive(true, this.options.keepAlive.initialDelay);
                }
                // 发送数据
                socket.write(buffer, (err) => {
                    if (err) {
                        reject(new Error(`发送消息失败: ${err.message}`));
                        socket.destroy();
                    }
                });
            });
            // 监听响应
            socket.on('data', (chunk) => {
                dataAll = Buffer.concat([dataAll, chunk]);

                if (dataAll.length >= 16 && expectedLen === 0) {
                    const header = dataAll.slice(0, 16);
                    const magic = header.readUInt8(0);
                    const version = header.readUInt8(1);
                    const reqId = header.readUInt16BE(2);
                    const jsonLen = header.readUInt32BE(4);
                    const msgType = header.readUInt16BE(8);
                    const reserved = header.slice(10, 16);

                    expectedLen = jsonLen;
                }

                if (expectedLen > 0 && dataAll.length >= 16 + expectedLen) {
                    const jsonPart = dataAll.slice(16, 16 + expectedLen).toString('ascii');
                    try {
                        const parsed = JSON.parse(jsonPart);
                        socket.destroy();
                        resolve(parsed);
                    } catch (e) {
                        socket.destroy();
                        reject(new Error(`JSON 解析失败: ${e.message}`));
                    }
                }
            });
        });
    }

}

module.exports = SeerRobot;
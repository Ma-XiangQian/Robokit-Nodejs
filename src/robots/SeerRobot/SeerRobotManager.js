const EventEmitter = require('events');
const SeerRobot = require("./SeerRobot");

class SeerRobotManager extends EventEmitter{
    constructor(nick_name) {
        super();
        this.robots = new Map();
        this.nick_name = nick_name || 'robohub'; // 控制对象名称
        this.notifyCallback = null;   // 接受到推送消息后的回调函数
    }

    // 判断机器人IP是否重复
    isIpExist(ip) {
        for (const robot of this.robots.values()) {
            if (robot.ip === ip) return true;
        }
        return false;
    }

    /** 
     * 绑定推送事件回调函数
     * @param {SeerRobot} robot 仙工机器人对象
    */
    bindNotifyCallback(robot){
        robot.on("notify",(data)=>{
            if(typeof this.notifyCallback === 'function'){
                this.notifyCallback(data)
            }
        });
    }

    /**
     * 初始化机器人（用于从数据库获取机器人数据，进行创建机器人🤖）
     * @param {{ip: string, vehicle_id: string}[]} robots - 机器人数组，每个对象包含 IP 和 vehicle_id
     */
    initRobots(robots){
        for(let r of robots){
            const robot = new SeerRobot(r.ip, this.nick_name, { robot_id: r.vehicle_id, robot_model: r.robot_model });
            this.bindNotifyCallback(robot);
            this.robots.set(r.vehicle_id,robot);
        }
    }

    // 添加一个机器人
    addRobot(ip,options, timeout = 3000) {
        return new Promise((resolve, reject) => {
            // 重复IP不创建机器人
            if (this.isIpExist(ip)) {
                reject(`机器人 IP地址：${ip} 已重复！`);
                return;
            }

            let timer = null;

            const robot = new SeerRobot(ip, this.nick_name, options);
            timer = setTimeout(() => {
                robot.destroy();
                robot.removeAllListeners();
                reject(`机器人连接超时 ${ip} ： ${timeout}ms.`);
            }, timeout);

            robot.once("notify", (data) => {
                // 检测机器人ID重复
                if(this.robots.has(data.vehicle_id)){
                    console.warn(`Robot with ID ${data.vehicle_id} already exists.`);
                    reject(`机器人 ${data.vehicle_id} 已重复！`);
                    return;
                }
                clearTimeout(timer);
                timer = null;
                this.bindNotifyCallback(robot);
                this.robots.set(data.vehicle_id, robot);
                console.log(`机器人 ${data.vehicle_id} 添加成功 ${ip} ✅`);
                resolve({ip, vehicle_id: data.vehicle_id});
            });

        });
    }

    // 通过ID获取机器人
    getRobotById(id) {
        if (!this.robots.has(id)) {
            console.warn(`Robot with ID ${id} does not exist.`);
            return null;
        }
        return this.robots.get(id);
    }

    // 指定机器人执行指令
    runCommandById(id, callback) {
        const robot = this.getRobotById(id);
        if (robot) {
            callback(robot);
        } else {
            console.error(`Cannot run task. Robot with ID ${id} not found.`);
        }
    }

    // 指定多个机器人执行指令
    runCommandByIds(ids, callback, params = null) {
        return new Promise((resolve, reject)=>{
            if(!ids.length){
                for (const robot of this.robots.values()) {
                    if(robot.status == 'connected')callback(robot, params);
                }

            }else{
                for (const id of ids) {
                    if (this.robots.has(id)) {
                        const robot = this.robots.get(id);
                        if(robot.status == 'connected')callback(robot, params);
                    }
                }
            }
            resolve({success: true});
        });
    }

    // 获取所有机器人ID
    getAllRobotIds() {
        return Array.from(this.robots.keys());
    }

    // 获取所有机器人的基础信息
    getAllRobotInfo(){
        let data_arr = [];

        for (const robot of this.robots.values()) {
            let r = {}
            r.ip = robot.ip
            r.status = robot.status;
            r.vehicle_id = robot.options.robot_id;
            r.robot_model = robot.options.robot_model;
            data_arr.push(r);
        }
        return data_arr;
    }

    /**
     * 删除机器人，数组为空者全部删除
     * @param {string[]} ids 
     */
    dropRobots(ids){
        return new Promise((resolve, reject)=>{
            let dropCount = 0;
            if(!ids.length){
                for (const robot of this.robots.values()) {
                    robot.destroy();
                    robot.removeAllListeners();
                    dropCount++;
                    this.robots.delete(robot.options.robot_id);
                }
            }else{
                // 删除指定 id 的机器人
                for (const id of ids) {
                    if (this.robots.has(id)) {
                        const robot = this.robots.get(id);
                        robot.destroy();
                        robot.removeAllListeners();
                        this.robots.delete(id);
                        dropCount++;
                    }
                }
            }

            resolve({
                dropCount,
                robot_length: this.robots.size
            });
        });
    }

}

module.exports = SeerRobotManager;
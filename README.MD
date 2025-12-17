# Robokit-Nodejs
AMR机器人工具包，基于 Node.js 提供连接、控制和管理功能。

## 目前支持的AMR机器人
1. 仙工智能机器人

## 案例
1. 连接仙工机器人，并获取机器人信息。
```js
const { SeerRobot } = require("robokit-nodejs");
const { robot_status_info_req } = require("robokit-nodejs/SeerRobotAPI");

// 创建SEER机器人实例，自动连接
const robot = new SeerRobot("192.168.192.5", "demo");

// 连接成功事件监听
robot.once("connected", async () => {
    console.log("robot connected✅");

    // 查询机器人信息
    const info = await robot_status_info_req(robot);
    console.log("robot info 🤖", info);
});

// 机器人数据推送事件监听
robot.on("notify", async (data) => {
    console.log("robot notify 🤖", data);
});

// 重连成功事件监听
robot.on("reconnected", async () => {
    console.log("robot reconnected♻️");
});

// 断开连接事件监听
robot.on("disconnected", async () => {
    console.log("robot disconnected⚠️");
});

// 机器人销毁事件监听
robot.on("destroyed", async () => {
    console.log("robot destroyed🌚");
});
```
const { SeerRobot } = require("../index");

const robot = new SeerRobot("192.168.192.5", "demo");

robot.once("connected", async () => {
    console.log("robot connected✅");
});

robot.on("notify", async (data) => {
    console.log("robot notify 🤖", data);
});

robot.once("disconnected", async () => {
    console.log("robot disconnected⚠️");
});

robot.once("destroyed", async () => {
    console.log("robot destroyed🌚");
});
/** 
 * 按自定义协议格式构造消息数据包
 * 
 * @param {number} reqId - 请求及响应的序号（0 ~ 65535），请求包与响应包的这个字段是相同的，API 使用者自行填入序号。机器人对每个请求的响应都使用这个序号。
 * @param {number} msgType - 标识报文的类型, 即 API 的编号
 * @param {Object} [msg={}] - 要发送的JSON消息体，默认为空对象
 * @returns {Buffer} 返回组装好的Buffer，包含16字节头部和可选的JSON消息体
 *
 * @example 控制机器人向前移动2米，速度1米/秒
 * const buf = packMsg(1, 3055,{ dist:2,vx: 1 });
*/
function packMsg(reqId, msgType, msg = {}) {
    let jsonStr = JSON.stringify(msg);
    let msgLen = msg && Object.keys(msg).length > 0 ? Buffer.byteLength(jsonStr, 'ascii') : 0;

    const buffer = Buffer.alloc(16 + msgLen);

    buffer.writeUInt8(0x5A, 0);              // 报文同步头
    buffer.writeUInt8(0x01, 1);              // Version
    buffer.writeUInt16BE(reqId, 2);          // 序号（0 ~ 65535）
    buffer.writeUInt32BE(msgLen, 4);         // 数据总长度
    buffer.writeUInt16BE(msgType, 8);        // 标识报文的类型, 即 API 的编号,
    buffer.fill(0x00, 10, 16);               // 6bytes内部使用区域

    if (msgLen > 0) {
        buffer.write(jsonStr, 16, msgLen, 'ascii');
    }
    return buffer;
}

// 解析消息包
function parseMsg(buffer) {

}

module.exports = {
    packMsg,
    parseMsg
};
// import { v4 as uuidv4 } from 'uuid';
class WebSocketService {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.reconnectInterval = 2000; // 重新连接间隔时间（毫秒）
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.connectListener = (isConnect) => {};
    this.messagelistener = (message) => {};
    this.listeners = new Set()
    this.isConnecting = false;
    this.messageQueue = [];   //增加消息发送失败缓存队列，重连成功后重新发送
    this.intervalId = null;
  }

  connect() {
    if (this.isConnecting) return;

    this.isConnecting = true;
    this.reconnectAttempts = 0;

    this._createSocket();
  }

  _createSocket() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      // console.log('WebSocket连接成功');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.connectListener(true);
      // this.startPingInterval();
      // this.notifyListeners(JSON.stringify({ isConnect: true }));
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        this.sendMessage(msg);
      }
    };

    this.socket.onmessage = (event) => {
      if(event.data) {
        // console.log('WebSocket收到消息', event.data);
        this.notifyListeners(event.data);
        this.messagelistener(event.data);
      }
    };

    this.socket.onclose = (event) => {
      // console.log('WebSocket连接关闭:', event.code, event.reason);
      // this.notifyListeners(JSON.stringify({ isConnect: false }));
      this.connectListener(false);
      this._handleClose(event);
    };

    this.socket.onerror = (error) => {
      // console.error('WebSocket连接失败:', error);
      // this.notifyListeners(JSON.stringify({ isConnect: false }));
      this.connectListener(false);
      this._handleClose();
    };
  }

  _handleClose(event) {
    this.isConnecting = false;
    if (this.socket && this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectInterval);
    } else {
      // console.warn('Max reconnect attempts reached.');
    }
  }

  sendMessage(message, callback) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(message);
        callback && callback();
      } catch (error) {
        console.error('Failed to send message:', error);
        // 发送失败，将消息加入缓存队列
        this.messageQueue.push(message);
      }
      
    } else {
      console.error('WebSocket is not open, unable to send message');
      // 未连接，将消息加入缓存队列
      this.messageQueue.push(message);
    }
  }

  // startPingInterval() {
  //   this.stopPingInterval();
  //   this.intervalId = setInterval(() => {
  //     if (this.socket && this.socket.readyState === WebSocket.OPEN) {
  //       // this.socket.send('ping');
  //       let ping = `{"socketType":2,"data":"ping","isRequest":true,"requestId":${uuidv4()},"requestDate": "${this.getFormattedDate()}"}`
  //       // console.log('send ping ===> '+ping);
  //       this.socket.send(ping)
  //       // console.log('send ping');
  //     }
  //   }, 10000);
  // }

  // stopPingInterval() {
  //   if(this.intervalId){
  //     clearInterval(this.intervalId);
  //   }  
  // }

  getFormattedDate() {
    const now = new Date();
  
    const year = now.getFullYear();
    // 在月份和日期前补零
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
  
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
  
    // 格式化为 "YYYY-MM-DD HH:mm:ss"
    return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
  }

  setConnectListener(listener) {
    this.connectListener = listener;
  }

  setMessageListener(listener) {
    this.messagelistener = listener;
  }

  addListener(listener) {
    this.listeners.add(listener);
  }

  removeListener(listener) {
    this.listeners.delete(listener);
  }

  notifyListeners(message) {
    this.listeners.forEach(listener => listener(message));
  }

  close() {
    // this.stopPingInterval();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default WebSocketService;
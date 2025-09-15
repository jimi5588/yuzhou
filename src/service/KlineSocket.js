import WebSocketService from './WebSocketService';
import { ref, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { optional, tradesymbol } from '@/api';

let socketInstance = null;
const listeners = new Set();
const baseUrl = import.meta.env.VITE_WSS_URL;

const currencyMap = ref({});
const currencyTypes = ref([]);
const lastUpdateMap = new Map();
let interval = null;

function createSocket(url) {
    if (!socketInstance) {
        socketInstance = new WebSocketService(url);
        socketInstance.connect();
    }

    return socketInstance;
}

export const useKlineSocket = () => {
    const isConnected = ref(false);
    const message = ref(null);
    const handleMessage = ref(null);
    const klineList = ref([]);
    const depthData = ref({});
    const currencyName = ref('btcusdt');
    const period = ref('1min');
    const store = useStore();
    let socket = null;

    const initData = () => {
        if (!localStorage.getItem('token')) return;
        optional().then(res => {
            let optionMap = {};
            if (res.result.data && res.result.data.length > 0) {
                res.result.data.forEach(item => {
                    optionMap[item.jiaoyidui.toLowerCase()] = item;
                });
            }
            tradesymbol().then(res => {
                currencyMap.value = {};
                currencyTypes.value = [];
                let currencySymbol = null;
                let storeCurrencyMap = store.state.currencyMap;
                for (const type in res.result) {
                    var currencys = res.result[type];
                    if (!currencys || currencys.length === 0) continue;
                    currencyTypes.value.push(type);
                    res.result[type].forEach(item => {
                        let currency = item.jiaoyidui.toLowerCase();
                        if (!currencySymbol) currencySymbol = currency;
                        item.type = type;
                        item.optional = optionMap[currency] ? true : false;
                        if (storeCurrencyMap[currency]) {
                            if (storeCurrencyMap[currency].price) {
                                item.price = storeCurrencyMap[currency].price;
                                item.change = storeCurrencyMap[currency].change;
                            } else {
                                item.status = -1; //休市
                            }
                            if (storeCurrencyMap[currency].market) {
                                item.market = storeCurrencyMap[currency].market;
                            }
                        } else {
                            item.status = -1; //休市
                        }
                        currencyMap.value[currency] = item;
                        lastUpdateMap.set(currency, 0); // 设置币种初始更新时间
                    });
                }
                if (!store.state.currencySymbol) {
                    updateStoreCurrencySymbol(currencySymbol);
                }
                updateStoreCurrencyMap();
                updateStoreCurrencyTypes();
                initSocket();
            }).catch(err => {});
        }).catch(err => {});
    }

    const initSocket = () => {
        let map = store.state.currencyMap;
        if (!map || Object.keys(map).length === 0) {
            // 浏览器刷新，重新初始化数据
            initData();
            return;
        }
        if (!currencyMap.value || Object.keys(currencyMap.value).length === 0) {
            currencyMap.value = map;
        }
        socket = createSocket(baseUrl);

        socket?.setConnectListener((isConnect) => {
            if (isConnect) {
                sendMessage('sub:real.market_ti');
                sendMessage('sub:market_ti');
                sendMessage('sub:market_depth');
            }
        });

        socket?.setMessageListener((data) => {
            if (!data || data == 'ping') return;
            try {
                let content = JSON.parse(data);
                if (Array.isArray(content)) {
                    // Handle array case if needed
                } else if (typeof content === "object") {
                    if (content.cmd_id === 22998) { // 实时成交价
                        let key = content.data.code.toLowerCase();
                        if (!currencyMap.value[key]) return;
                        currencyMap.value[key].dataType = 'market';
                        let price = currencyMap.value[key].price;
                        if (content.data.price) {
                            currencyMap.value[key].status = 1; // 正常
                            let diffPrice = content.data.price - price;
                            // 在1到3之间生成一个随机数
                            let randomNumber = Math.random() * (3 - 1) + 1;
                            currencyMap.value[key].price = content.data.price;
                            if (diffPrice != null) {
                                currencyMap.value[key].change = diffPrice > 0 ? randomNumber : -randomNumber;
                            } else {
                                currencyMap.value[key].change = 0;
                            }
                            lastUpdateMap.set(key, Date.now()); // 更新最后推送时间
                        } else {
                            currencyMap.value[key].status = -1; // 休市
                        }
                    } else if (content.cmd_id === 22999) { // 深度数据
                        let key = content.data.code.toLowerCase();
                        if (key.toLowerCase() == store.state.currencySymbol) {
                            for (const listener of listeners) {
                                listener(null, content.data);
                            }
                        }
                    } else if (content.kline_type === 1 && content.code.toLowerCase() == store.state.currencySymbol) {
                        for (const listener of listeners) {
                            listener(content.kline_list, null);
                        }
                    }
                } else {
                    content = JSON.parse(content);
                    content.data.forEach(item => {
                        let key = item.code.toLowerCase();
                
                        // 检查当前币种的 status，如果为 -1，跳过该币种的处理
                        if (currencyMap.value[key] && currencyMap.value[key].status === -1) {
                            //console.log(`币种 ${key} 状态为 -1, 跳过处理`);
                            return;  // 跳过当前币种的后续处理
                        }
                
                        if (currencyMap.value[key]) {
                            let market = item.kline_data[0];
                            let previousPrice = currencyMap.value[key].price;
                            let diffPrice = market.close_price - previousPrice;
                
                            // 计算价格波动幅度，可以根据需求调整
                            let fluctuationRange = (diffPrice / previousPrice) * 100; // 波动百分比
                            let randomNumber = fluctuationRange > 1 ? Math.random() * fluctuationRange : Math.random() * 2; // 设定随机波动范围
                
                            // 更新币种的状态和数据
                            currencyMap.value[key].status = 1; // 设置币种为正常状态
                            currencyMap.value[key].dataType = 'kline';
                            currencyMap.value[key].market = market;
                            currencyMap.value[key].price = market.close_price;
                            currencyMap.value[key].change = diffPrice > 0 ? randomNumber : -randomNumber;
                
                            //console.log(`更新币种: ${key}, 价格: ${market.close_price}, 变化: ${currencyMap.value[key].change}`);
                            
                            // 如果当前币种与 store 中的货币符号一致，触发监听器
                            if (key === store.state.currencySymbol) {
                                for (const listener of listeners) {
                                    listener(market, null);
                                }
                            }
                        }
                    });
                }
                
                updateStoreCurrencyMap();
            } catch (error) {
                console.log("KlineSocket, error = " + error);
            }
        });
    }

    const checkMarketStatus = () => {
        interval = setInterval(() => {
            const now = Date.now();
            for (const key in currencyMap.value) {
                const lastUpdate = lastUpdateMap.get(key) || 0;
                if (now - lastUpdate > 30000) {
                    currencyMap.value[key].status = -1; // 超过 30 秒未收到推送，设为休市
                }
            }
        }, 10000); // 每 10 秒检查一次
    };

    onMounted(() => {
        handleMessage.value = (kData, dData) => {
            if (kData) klineList.value = kData;
            if (dData) depthData.value = dData;
        };

        listeners.add(handleMessage.value);

        if (klineList.value) handleMessage.value(klineList.value, null);
        if (depthData.value) handleMessage.value(null, depthData.value);
        checkMarketStatus(); // 启动市场状态检查定时器
    });

    onUnmounted(() => {
        if (handleMessage.value) listeners.delete(handleMessage.value);
        if (interval) clearInterval(interval); // 清除定时器
    });

    const sendMessage = (data, callback) => {
        socket?.sendMessage(data, callback);
    };

    const updateStoreCurrencyMap = () => {
        store.commit("updateCurrencyMap", currencyMap.value);
    };

    const updateStoreCurrencyTypes = () => {
        store.commit("updateCurrencyTypes", currencyTypes.value);
    };

    const updateStoreCurrencySymbol = (currency) => {
        store.commit("updateCurrencySymbol", currency);
    };

    const switchKline = () => {

    };

    const close = () => {
        socket?.close();
        socket = null;
        socketInstance = null;
    };

    return {
        initData,
        initSocket,
        switchKline,
        klineList,
        depthData,
        close
    };
};

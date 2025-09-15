import request from "../utils/request"

//站点信息
export const getHome = (params) => {
    return request.get("/home")
}

//用户登录
export const userLogin = (params) => {
    return request.post("/login", params)
}

//用户注册
export const userRegister = (params) => {
    return request.post("/register", params)
}

//用户详情
export const getUserInfo = () => {
    return request.get("/userdetail")
}

//公告
export const getnoticelist = (params) => {
    return request.get("/getnoticelist")
}

//系统消息列表
export const getSystemMessages = (params) => {
    return request.get("wallet/messagelist", { params: params })
}

//系统消息详情
export const getSystemMsgDetail = (id) => {
    return request.get("wallet/messagecontent?id="+id)
}

//公告列表
export const getAnnouncementlist = (params) => {
    return request.get("announcementlist", { params: params })
}

//公告详情
export const getAnnounceMsgDetail = (id) => {
    return request.get("announcementbyid?id="+id)
}

//首页弹窗
export const getHomePopup = () => {
    return request.get("/popup")
}

//关于我们
export const aboutme = () => {
    return request.get("/register/agreement?id=2")
}

//注册隐私
export const privacy = () => {
    return request.get("/register/agreement?id=1")
}

//文章
export const articl = (id) => {
    return request.get(`/register/agreement?id=${id}`)
}

//充提币种和汇率
export const exchangecurrency = () => {
    return request.get("/exchangecurrency")
}

//VIP详情
export const viplevelinfo = () => {
    return request.get("/viplevelinfo")
}

//客服链接
export const customerservice = (params) => {
    return request.get("/customerservice")
}

//产品列表
export const tradesymbol = (params) => {
    return request.get("/tradesymbol")
}

//自选产品列表
export const optional = () => {
    return request.get("/optional")
}

//添加自选产品
export const addoptional = (params) => {
    return request.post("/addoptional",params)
}

//app下载
export const appdownload = (params) => {
    return request.get("/download")
}

//实名认证申请
export const authverify = (type, params) => {
    return request.post(`/authverify/${type}`, params)
}

//上传头像
export const uploadFile = (params) => {
    return request.post("/uploadfile", params)
}

//更新头像
export const updateAvatar = (params) => {
    return request.post("/updateavatar",params)
}

//更新昵称
export const updateNickname = (params) => {
    return request.post("/updatenickname",params)
}

//修改提现密码
export const updatewithdrawpassword = (params) => {
    return request.put("withdrawpassword",params)
}

//修改登录密码
export const updatepassword = (params) => {
    return request.put("password",params)
}

export const getBanners = () => {
    return request.get("/bannar")
}

//GET用户银行卡
export const getbank = (params) => {
    return request.get("/getbank")
}

//GET用户钱包
export const getwallet = (params) => {
    return request.get("/getwallet")
}

//Bank绑定
export const updatebank = (params) => {
    return request.post("/wallet/blindbank",params)
}

//绑定钱包
export const updatewallet = (params) => {
    return request.post("/wallet/blindaddress",params)
}

//获取通道列表
export const getChannelList = (type) => {
    return request.get('depositlist', {
      params: { type }
    })
  }
export const getDepositType = (id) => {
    return request.get("deposittype?id="+id)
}

export const deposit = (params) => {
    return request.post("deposit", params)
}

export const getBanks = () => {
    return request.get("getbank")
}

export const getWallets = () => {
    return request.get("getwallet")
}

export const getBankWay = () => {
    return request.get("bankway")
}

export const getWalletWay = () => {
    return request.get("walletway")
}

//提现到钱包
export const walletWithdraw = (params) => {
    return request.post("/withdrawbywallet",params)
}

//提现到银行卡
export const bankWithdraw = (params) => {
    return request.post("/withdrawbybank",params)
}

//充值记录
export const getDepositRecord = (params) => {
    return request.get("depositrecord", { params: params })
}

//提现记录
export const getWithdrawRecord = (params) => {
    return request.get("withdrawrecord",  { params: params })
}

//账变记录
export const getMoneyChanges = (params) => {
    return request.get("moneychange",  { params: params })
}

export const getKlineData = (currency, period) => {
    return request.get("https://kor-bns.com/kline/query/history", {
        params: { coinName: currency, type: period }
    })
}

/*****交割下单*******/
//获取下单配置
export const getOrderInfo = () => {
    return request.get("orderinfo")
}

//合约下单
export const createOrder = (params) => {
    return request.post("order", params)
}

//合约订单列表(单个)
export const getOrderList = (symbol, status, params) => {
    return request.get("orderlist?symbol="+symbol+"&status="+status, { params: params })
}

//合约订单列表
export const getOrderRecord = (params) => {
    return request.get("orderrecord", { params: params})
}

//合约订单详情
export const getOrderDetail = (orderNo) => {
    return request.get("orderdetail/"+orderNo)
}

/*****永续下单*******/
//获取永续下单配置【杠杆倍数】
export const getContractInfo = () => {
    return request.get("trade/Contractinfo")
}

//永续下单
export const createContractOrder = (params) => {
    return request.post("trade/createPerpetualContract", params)
}

//設置止盈止損
export const setContract = (params) => {
    return request.post("trade/setContract", params)
}

//平仓
export const closeContract = (params) => {
    return request.post("trade/Contractclose", params)
}

//一键平仓
export const batchCloseContract = (params) => {
    return request.post("trade/batchClose", params)
}

//挂单撤单
export const cancelContractOrder = (params) => {
    return request.post("trade/Contractordercancel", params)
}

//永续订单列表（单个币种）
export const getContractOrderList = (params) => {
    return request.get("trade/Contractorderlist", { params: params })
}

//永续订单列表（全部币种）
export const getAllContractOrderList = (params) => {
    return request.get("trade/Contractorderalllist", { params: params })
}

//公告消息
export const getNoticeList = (params) => {
    return request.get("/getnoticelist")
}

//贷款信息
export const loaninfo = () => { 
    return request.get("/loaninfo");
}

//贷款历史
export const loanhistory = (params) => { 
    return request.get("/loanhistory",  { params: params })
}

//申请贷款
export const loan = (params) => {
    return request.post("/loansubmit", params)
}

//矿机产品
export const stakinginfo = () => { 
    return request.get("/stakinginfo");
}

//矿机订单
export const stakinghistory = (id) => {
    return request.get("/stakinghistory", { 
        params: { id } 
    })
}

//矿机详情
export const stakingdetail = (id) => {
    return request.get("/stakingdetail", { params: { id } })
}

//矿机下单
export const stakingsubmit = (params = {}) => {
    return request.post("/stakingsubmit", params)
}

//汇率
export const exchange = (from, to) => { 
    return request.get("/exchange", {
        params: { from, to }
    })
}

//转换闪兑
export const coinexchange = (params) => {
    return request.post("/coinexchange",params)
}

//充值下单
export const payOrder = (channelId, amount) => {
    return request.post("wealth-portal/payOrder/save", {
        channelId: channelId,
        amount: amount
    })
}

//分享码
export const getRefCode = () => {
    return request.post("wealth-portal/user/getRef", {})
}

//验证码
export const getSmsCode = (phone) => {
    let params = phone ? { 'phone': phone } : {}
    return request.post("wealth-portal/user/getSms", params)
}

//获取银行卡
export const getBank = () => {
    return request.post("wealth-admin/bank/getMy", {})
}

//绑定银行卡
export const bindBank = (params) => {
    return request.post("wealth-admin/bank/save", params)
}

//忘记密码
export const findPassword = (params) => {
    return request.post("wealth-portal/user/findPwd", params)
}

//修改密码
export const saveUser = (params) => {
    return request.post("wealth-portal/user/save", params)
}

//修改支付密码
export const modifyPayPassword = (params) => {
    return request.post("wealth-portal/user/savePayPwd", params)
}

//修改头像
export const changePassword = (params) => {
    return request.post("wealth-portal/user/savePwd", params)
}

//提现
export const withdraw = (params) => {
    return request.post("wealth-portal/cashOutApply/save", params)
}

//付款记录
export const getRechargeRecord = (params) => {
    return request.post("wealth-portal/payOrder/queryMy", params)
}

//工资记录
export const getSalaryRecord = (params) => {
    return request.post("wealth-admin/salary/getMy", params)
}

//分享记录
export const getShareRecord = (params) => {
    return request.post("wealth-portal/shareRecord/getMy", params)
}

//发现页
export const getFindHtml = () => {
    return request.post("wealth-admin/find/html", {})
}

//团队数据
export const getTeamData = (params) => {
    return request.post("wealth-portal/user/getTeam", params)
}

//工资入账记录
export const getSalaryCreatedRecord = (params) => {
    return request.post("wealth-portal/salaryChange/created", params)
}

//工资取现记录
export const getSalaryWithdrawRecord = (params) => {
    return request.post("wealth-portal/cashOutApply/salary", params)
}

//交易入账记录
export const getTradeCreatedRecord = (params) => {
    return request.post("wealth-portal/balanceChange/created", params)
}

//交易取现记录
export const getTradeWithdrawRecord = (params) => {
    return request.post("wealth-portal/cashOutApply/balance", params)
}

//下单
export const tradeOrder = (params) => {
    return request.post("wealth-portal/tradeOrder/save", params)
}

//交易历史
export const getTradeHistory = (params) => {
    return request.post("wealth-portal/tradeOrder/queryMy", params)
}

//账户结算
export const getAccountRecord = (params) => {
    return request.post("wealth-portal/balanceChange/queryMyBill", params)
}

//获取聊天房间
export const getChatRooms = (params) => {
    return request.post("wealth-portal/talk/chat_rooms", params)
}

//获取聊天消息
export const getChatMessages = (params) => {
    return request.post("wealth-portal/talk/message", params)
}

export const uploadChatFile = async (file) => {
    return await request.post("wealth-portal/filebyte/upload", file.blob, {
        headers: {
            'Content-Type': 'application/json',
            param: JSON.stringify({
                extension: file.extension,
                type: file.type,
                size: file.size,
                name: encodeURIComponent(file.name),
            }),
        },
    })
}

//圈子消息
export const getCircleList = (params) => {
    return request.post("wealth-admin/message/getCircle", params)
}

//货币列表
export const getCurrencyList = () => {
    return request.post("wealth-portal/market/findCurrencyList")
}

//翻译
export const translate = (text, targetLang) => {
    return request.post("wealth-portal/translate", {
        targetLanguageCode: targetLang,
        text: text
    })
}

//公共字典
export const queryCommonDict = () => {
    return request.post("wealth-admin/dict/mobileQueryCommon", {})
}

//字典
export const queryDict = (params) => {
    return request.post("wealth-admin/dict/mobileQuery", params)
}

//首页弹窗
export const getHomeDialogMess = () => {
    return request.post("wealth-admin/message/getPopup", {})
}

//获取最大可下单金额
export const getAvailableAmount = () => {
    return request.post("wealth-portal/tradeOrder/getAvailableAmount", {})
}

//获取银行列表
export const getBankList = () => {
    return request.post("wealth-admin/dict/getByType/bank_of_tanzania", {})
}

//获取邀请任务提示
export const getInviteTaskTip = () => {
    return request.post("wealth-portal/user/inviteTaskTip", {})
}

//申购新币种
export const subscription = () => { 
    return request.get("/subscription");
}
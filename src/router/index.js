import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/pages/login",
            name: 'login',
            component: () => import('../views/user/Login'),
            meta: { requiresAuth: false },
        },
        {
            path: "/pages/user/register",
            name: 'reg',
            component: () => import('../views/user/Register'),
            meta: { requiresAuth: false },
        },
        {
            path: "/pages/user/findpassword",
            name: 'findpassword',
            component: () => import('../views/user/FindPassword'),
            meta: { requiresAuth: false },
        },
        {
            path: "/pages/user/setPayPassword",
            name: 'setPayPassword',
            component: () => import('../views/user/SetPayPassword'),
        },
        {
            path: "/",
            name: 'home',
            component: () => import('../views/home'),
            props: { tabIndex: 0 },
        },
        {
            path: "/pages/home/market",
            name: 'home/market',
            component: () => import('../views/home'),
            props: { tabIndex: 1 },
        },
        {
            path: "/pages/home/msgs",
            name: 'home/msgs',
            component: () => import('../views/home'),
            props: { tabIndex: 2 },
        },
        {
            path: "/pages/home/order",
            name: 'home/order',
            component: () => import('../views/home'),
            props: { tabIndex: 3 },
        },
        {
            path: "/pages/home/assets",
            name: 'home/assets',
            component: () => import('../views/home'),
            props: { tabIndex: 4 },
        },
        {
            path: "/pages/language",
            name: 'language',
            component: () => import('../views/user/Language'),
            meta: { requiresAuth: false },
        },
        {
            path: "/pages/user/kefu",
            name: 'kefu',
            component: () => import('../views/user/Kefu'),
            meta: { requiresAuth: false },
        },
        {
            path: "/pages/usercenter",
            name: 'usercenter',
            component: () => import('../views/user/UserCenter'),
        },
        {
            path: "/pages/userinfo",
            name: 'userinfo',
            component: () => import('../views/user/UserDetail'),
        },
        {
            path: "/pages/user/vip",
            name: 'vip',
            component: () => import('../views/user/AboutVip'),
        },
        {
            path: "/pages/user/share",
            name: 'share',
            component: () => import('../views/user/Share'),
        },
        {
            path: "/pages/user/auth",
            name: 'auth',
            component: () => import('../views/user/Auth'),
        },
        {
            path: "/pages/auth/authstepone",
            name: 'autuhstepone',
            component: () => import('../views/user/Authstepone'),
        },
        {
            path: "/pages/auth/authstepsecond",
            name: 'autuhstepsecond',
            component: () => import('../views/user/Authstepsecond'),
        },
        {
            path: "/pages/setting/secure",
            name: 'setting/secure',
            component: () => import('../views/user/SecureSet'),
        },
        {
            path: "/pages/user/aboutus",
            name: 'aboutus',
            component: () => import('../views/user/AboutUs'),
        },
        {
            path: "/pages/wallet",
            name: 'wallet',
            component: () => import('../views/wallet/Wallet'),
        },
        {
            path: "/pages/user/team",
            name: 'team',
            component: () => import('../views/user/Team'),
        },
        {
            path: "/pages/setting/bank",
            name: 'setting/bank',
            component: () => import('../views/wallet/AddBank'),
        },
        {
            path: "/pages/setting/addwallet",
            name: 'setting/addwallet',
            component: () => import('../views/wallet/AddWallet'),
        },
        {
            path: "/pages/recharge/select",
            name: 'recharge/select',
            component: () => import('../views/wallet/RechargeSelect'),
        },
        {
            path: "/pages/recharge",
            name: 'recharge',
            component: () => import('../views/wallet/Recharge'),
        },
        {
            path: "/pages/withdraw",
            name: 'withdraw',
            component: () => import('../views/wallet/Withdraw'),
        },
        {
            path: "/pages/currency/search",
            name: 'currency/search',
            component: () => import('../views/other/SearchCurrency'),
        },
        {
            path: "/pages/signalchannel",
            name: 'signalchannel',
            component: () => import('../views/other/SignalChannel'),
        },
        {
            path: "/pages/accountsettle",
            name: 'accountsettle',
            component: () => import('../views/wallet/AccountSettle'),
        },
        {
            path: "/pages/wallet/payrollrecords",
            name: 'wallet/payrollrecords',
            component: () => import('../views/wallet/PayrollRecords'),
        },
        {
            path: "/pages/wallet/financialrecords",
            name: 'wallet/financialrecords',
            component: () => import('../views/wallet/FinancialRecords'),
        },
        {
            path: "/pages/wallet/record",
            name: 'wallet/record',
            component: () => import('../views/wallet/Record'),
        },
        {
            path: "/pages/user/inviterecords",
            name: 'user/inviterecords',
            component: () => import('../views/user/InviteRecords'),
        },
        {
            path: "/pages/trade",
            name: 'trade',
            component: () => import('../views/trade/Trade'),
        },
        {
            path: "/pages/trade/contract",
            name: 'trade/contract',
            component: () => import('../views/trade/TradeContract'),
        },
        {
            path: "/pages/lever/leverList",
            name: 'leverList',
            component: () => import('../views/lever/leverList'),
        },
        {
            path: "/pages/lever/orderList",
            name: 'lever/orderList',
            component: () => import('../views/lever/orderList'),
        },
        {
            path: "/pages/trade/traderecords",
            name: 'trade/traderecords',
            component: () => import('../views/trade/TradeRecords'),
        },
        {
            path: "/pages/trade/orderdetail",
            name: 'trade/orderdetail',
            component: () => import('../views/trade/OrderDetail'),
        },
        {   
            path: "/pages/user/accountsecurity",
            name: 'user/accountsecurity',
            component: () => import('../views/user/AccountSecurity'),
        },
        {
            path: "/pages/message/center",
            name: 'message/center',
            component: () => import('../views/message/MessageCenter'),
        },
        {
            path: "/pages/message/detail",
            name: 'message/detail',
            component: () => import('../views/message/MessageDetail'),
        },
        {
            path: "/pages/message/notifyrecords",
            name: 'message/notifyrecords',
            component: () => import('../views/message/NotifyRecords'),
        },
        {
            path: "/pages/appdownload",
            name: 'appdownload',
            component: () => import('../views/other/AppDownload.vue'),
        },
        {
            path: "/pages/find",
            name: 'find',
            component: () => import('../views/other/Find'),
        },
        {
            path: "/pages/trade/loan",
            name: 'trade/loan',
            component: () => import('../views/trade/Loan'),
        },
        {
            path: "/pages/trade/stakingdetails",
            name: 'trade/stakingdetails',
            component: () => import('../views/trade/StakingDetails'),
        },
        {
            path: "/pages/trade/staking",
            name: 'trade/staking',
            component: () => import('../views/trade/Staking'),
        },
        {
            path: "/pages/user/exchange",
            name: 'user/exchange',
            component: () => import('../views/wallet/Exchange'),
        },
        {
            path: "/pages/recharge/counter",
            name: 'recharge/counter',
            component: () => import('../views/wallet/Rechargecounter'),
            meta: { requiresAuth: false },
        },
        {
            path: "/pages/newcoin",
            name: 'newcoin',
            component: () => import('../views/trade/newcoin'),
            meta: { requiresAuth: false },
        },
        {
            path: "/pages/ncrecords",
            name: 'ncrecords',
            component: () => import('../views/trade/ncrecords'),
            meta: { requiresAuth: false },
        },
        // {
        //     path: "/pages/home/grab",
        //     name:"home/grab",
        //     component: () => import('../views/home'),
        //     props: { tabIndex: 1 }
        // },
        // {
        //     path: "/pages/home/records",
        //     name:"home/records",
        //     component: () => import('../views/home'),
        //     props: { tabIndex: 2 }
        // },
    ]
});

//路由守卫
router.beforeEach((to, from, next) => {
    // 检查是否需要认证
    if (to.matched.some(record => {
        var requiresAuth  = record.meta.requiresAuth
        if(requiresAuth === undefined){
            return true
        }else{
            return requiresAuth
        }
    })) {
        // 假设我们有一个函数或者属性来检查用户是否已经登录
        if (!isAuthenticated()) {
            // 如果用户没有登录，则重定向到登录页面
            next({ path: '/pages/login' });
        } else {
            // 如果用户已登录，允许继续前往目标页面
            next();
            window.scrollTo(0, 0);
        }
    } else {
        // 不需要认证，直接放行
        next();
        window.scrollTo(0, 0);
    }
});

function isAuthenticated() {
    // 这里可以是实际的逻辑，例如检查 localStorage 或者 Vuex store 中是否有 token
    return !!localStorage.getItem('token');
}

export default router;
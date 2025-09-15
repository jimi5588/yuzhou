import createPersistedState from "vuex-persistedstate";
import { createStore } from "vuex";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default createStore({
    plugins: [createPersistedState()],
    state(){
        return{
            baseUrl: baseUrl,
            theme: 'light',
            appLogo: '',
            symbol: 'USD',
            user: null,
            dictData: null,
            currencyMap: {},
            currencyTypes: [],
            currencySymbol: null,
            fiatCurrency: null,
        } 
    },

    mutations: {
        updateTheme(state, theme){
            state.theme = theme
        },
        updateAppLogo(state, appLogo){
            state.appLogo = appLogo
        },
        updateUser(state, user){
            state.user = user
        },
        updateDictData(state, dictData){
            state.dictData = dictData
        },
        updateCurrencyMap(state, currencyMap){
            state.currencyMap = currencyMap
        },
        updateCurrencyTypes(state, types){
            state.currencyTypes = types
        },
        updateCurrencySymbol(state, currency){
            state.currencySymbol = currency
        },
        updateFiatCurrency(state, fiatCurrency){
            state.fiatCurrency = fiatCurrency
        },
    },

    //为异步操作准备的
    actions: {
        updateTheme({ commit }, theme) {
            commit('updateTheme', theme);
        },
        updateAppLogo({ commit }, appLogo) {
            commit('updateAppLogo', appLogo);
        },
        updateUser({ commit }, user) {
            commit('updateUser', user);
        },
        updateDictData({ commit }, dictData) {
            commit('updateDictData', dictData);
        },
        updateCurrencyMap({ commit }, currencyMap) {
            commit('updateCurrencyMap', currencyMap);
        },
        updateCurrencyTypes({ commit }, types) {
            commit('updateCurrencyTypes', types);
        },
        updateCurrencySymbol({ commit }, currency) {
            commit('updateCurrencySymbol', currency);
        },
        updateFiatCurrency({ commit }, fiatCurrency) {
            commit('updateFiatCurrency', fiatCurrency);
        },
    }

})
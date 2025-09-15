import axios from "axios";
import i18n from '../lang/i18n';

const baseUrl = import.meta.env.VITE_API_BASE_URL;


function getBaseUrl() {
    return baseUrl;
}

const http = axios.create({
    // baseURL: getBaseUrl(),
    baseURL: getBaseUrl() + "/api/",
    timeout: 10000,
})

// 添加请求拦截器
http.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  // config.headers['Content-Type'] = 'application/json; charset=UTF-8';
  const token = localStorage.getItem("token");
  if (token != null) {
    config.headers["Authorization"] = "Bearer " + token
  }
  var lang = localStorage.getItem('language') || 'en';
  config.headers["Lang"] = lang;
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
http.interceptors.response.use(function (response) {
  // 2xx 范围内的状态码都会触发该函数。
  // 对响应数据做点什么
  if (response.data.status == 200 || response.data.code == 200 || response.data.kline_type) {
    return response.data;
  } else {
    // showFailToast(response.data.message);
    return Promise.reject(response.data);
  }
}, function (error) {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  const originalRequest = error.config;
  if (error.response.status === 401 && !originalRequest._retry) {
    // 如果是 401 错误，并且请求没有被重试过
    originalRequest._retry = true;

    // 清除 token 并重定向到登录页面
    localStorage.removeItem('token');

    // 显示提示弹窗
    // alert('The token has expired, please log in again.');
    showDialog({
      message: i18n.global.t('common_token_expire'),
      confirmButtonText: i18n.global.t('common_confirm'),
    }).then(() => {
      // on close
      window.location.href = '/#/pages/login'; // 重定向到登录页面
    });

    return Promise.reject(error);
  }
  switch (error.response.data.status) {
    case 400:
      var result = error.response.data.result
      for (var key in result) {
        var value = result[key]
        if (value.length > 0) {
          error.message = value[0]
          break
        }
      }
      break
    case 403:
      error.message = error.response.data.message
      break
  }
  return Promise.reject(error);
});


  export default http
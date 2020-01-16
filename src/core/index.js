/**
 * @description 코어 모듈
 * @author Leegeunhyeok
 * @version 3.0.0
 */

import axios from 'axios'

class RequestManager {
  constructor () {
    // 세션 ID
    this._sid = null;

    // 세션 만료 시간
    this._expires = null;

    // 세션 갱신 시간
    this._expiresTime = 1000 * 60 * 30
  }

  /**
   * HTTP GET 요청
   * @param {string} url 요청 URL
   * @param {any} config 요청 설정 객체
   * @returns {Promise<any>}
   */
  get (url, config) {
    return this._prepare()
      .then(() => {
        return axios.get(url, config);
      });
  }

  /**
   * HTTP POST 요청
   * @param {string} url 요청 URL
   * @param {any} config 요청 설정 객체
   * @returns {Promise<any>}
   */
  post (url, config) {
    return this._prepare()
      .then(() => {
        return axios.post(url, config);
      });
  }

  /**
   * 요청 전 세션 확인 진행
   * @returns {Promise<void>}
   */
  _prepare () {
    return new Promise(resolve => {
      if (!this._sid || this._expires < +new Date()) {
        // 세션 ID가 존재하지 않거나 만료된 경우 새로 갱신
        this._reload().then(() => {
          axios.defaults.headers.common = {
            'Cookie': 'JSESSIONID=' + this._sid
          };
          resolve();
        })
      } else {
        resolve();
      }
    });
  }

  /**
   * 새로운 세션으로 갱신
   * @returns {Promise<void>}
   */
  _reload () {
    // 메인 페이지로 접속하여 세션 갱신
    return axios.get('https://stu.goe.go.kr/edusys.jsp?page=sts_m40000')
      .then(res => {
        // 쿠키에서 세션 ID 추출
        const sid = res.headers['set-cookie']
          .join('')
          .match(/JSESSIONID=(.*?);/)

        this._sid = sid[1]
        this._expires = Date.now() + this._expiresTime
      });
  }
}

export default { RequestManager }

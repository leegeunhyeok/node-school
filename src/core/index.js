/**
 * core
 */

import axios from 'axios'
import Data from '../../data';
const { data } = Data;

class RequestManager {
  constructor () {
    // 교육청 교육청 관할 지역
    this._region = null;

    // 데이터
    this._data = data;

    // 세션 ID
    this._sid = null;

    // 세션 만료 시간
    this._expires = null;

    // 세션 갱신 시간
    this._expiresTime = 1000 * 60 * 30;
  }

  /**
   * 교육청 관할 지역 심볼 설정
   * @param {Symbol} region 교육청 관할 지역 심볼
   */
  setRegion (region) {
    this._region = region;
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
        return axios.get(this._makeUrl(url), config);
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
        return axios.post(this._makeUrl(url), config);
      });
  }

  /**
   * 해당 지역 교육청의 요청 URL를 생성하여 반환합니다.
   * @param {string} endPoint 데이터 수집 End-Point
   */
  _makeUrl (endPoint) {
    const host = this._data.REGION[this._region];
    return `https://${host}/${endPoint}`;
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
    return axios.get(this._makeUrl(this._data.mainUrl))
      .then(res => {
        // 쿠키에서 세션 ID 추출
        const sid = res.headers['set-cookie']
          .join('')
          .match(/JSESSIONID=(.*?);/);

        this._sid = sid[1];
        this._expires = Date.now() + this._expiresTime;
      });
  }
}

export default { RequestManager };
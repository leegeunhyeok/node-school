/**
 * @name node-school-kr
 * @description 전국 교육청 급식, 학사일정 파싱 라이브러리
 * @author Leegeunhyeok
 * @license MIT
 * @version 3.0.0
 *
 * Github : https://github.com/leegeunhyeok/node-school-kr
 * NPM : https://www.npmjs.com/package/node-school-kr
 */

// 아래 코드는 트랜스파일 할 경우 정상 동작하지 않음 (Babel 7, @babel/preset-env)
// import { RequestManager } from './src/core';

import core from './src/core';
import Data from './data';
const { type, region, data } = Data;

class School {
  /**
   * @constructor
   */
  constructor () {
    this._request = new core.RequestManager(); // HTTP 요청 관리 객체
    this._data = data;                         // 데이터 정의 객체
    this._searchUrl = data.searchUrl;          // 검색 URL End-point
    this._mealUrl = data.mealUrl;              // 급식 URL End-point
    this._calendarUrl = data.calendarUrl;      // 학사일정 URL End-point

    this._schoolType = null;   // init한 교육기관 유형 심볼 값
    this._schoolRegion = null; // init한 지역별 교육청 주소 심볼 값
    this._scoolCode = null;    // init한 학교 코드 값
  }

  _makeUrl (region, url) {
    const host = this._data.REGION[region];
    return `https://${host}/${url}`;
  }

  init (type, region, schoolCode) {
    if (!(this._data.EDUTYPE[type] && this._data.REGION[region])) {
      throw new Error('교육기관 유형 또는 지역 값을 확인해주세요');
    }

    if (!(schoolCode && typeof schoolCode === 'string')) {
      throw new Error('학교 코드 값을 확인해주세요');
    }
  }

  /**
   * @description 해당 지역의 학교를 검색합니다.
   * @param {Symbol} region 교육청 관할 지역 심볼
   * @param {string} name 학교명
   */
  search (region, name) {
    if (!this._data.REGION[region]) {
      throw new Error('지역 값을 확인해주세요');
    }

    if (!(name && typeof name === 'string')) {
      throw new Error('검색할 학교명을 확인해주세요');
    }

    return this._request.post(this._makeUrl(region, this._searchUrl), {
      kraOrgNm: name
    })
      .then(({ data }) => {
        if (data.result.status === 'error') {
          throw new Error(data.result.message);
        }

        return data.resultSVO.orgDVOList.map(s => {
          return {
            name: s.kraOrgNm,
            schoolCode: s.orgCode,
            address: s.zipAdres
          };
        });
      });
  }
}

School.Type = type;
School.Region = region;

module.exports = School;

(function () {
  'use strict';

  function addEventListenerList(list, event, fn) {
    for (let i = 0, len = list.length; i < len; i += 1) {
      list[i].addEventListener(event, fn, false);
    }
    return list;
  }
  function isPhoneGap() {
    return !!((window.cordova || window.PhoneGap || window.phonegap) && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent));
  }
  function cacheBuster(len = 16) {
    let hash = '';
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < len; i += 1) {
      hash += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return hash;
  }
  function generateUUID() {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now();
    }
    const h = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    const k = ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', '-', 'x', 'x', 'x', 'x', '-', '4', 'x', 'x', 'x', '-', 'y', 'x', 'x', 'x', '-', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'];
    let u = '';
    let i = 0;
    let rb = d + Math.random() * 0xffffffff | 0;
    while (i++ < 36) {
      const c = k[i - 1];
      const r = rb & 0xf;
      const v = c === 'x' ? r : r & 0x3 | 0x8;
      u += c === '-' || c === '4' ? c : h[v];
      rb = i % 8 === 0 ? Math.random() * 0xffffffff | 0 : rb >> 4;
    }
    return u;
  }

  class FileHandler {
    constructor(listGroups = null) {
      this.listGroups = listGroups;
      this.defaultMime = 'application/vnd.ms-powerpoint';
      this.isPhoneGap = isPhoneGap();
    }
    static fileOpen(path, mime) {
      const fileOpened = cordova.plugins.fileOpener2.showOpenWithDialog(cordova.file.applicationDirectory + path, mime, {
        error: e => {
          console.log(e.message);
        },
        success: () => true,
        rect: [0, 0, innerWidth / 2, 0]
      });
      return fileOpened;
    }
    onClick(event) {
      event.preventDefault();
      const anchor = event.target.closest('a');
      if (!anchor.href) return;
      const mimeType = anchor.dataset.mime ? anchor.dataset.mime : this.defaultMime;
      this.constructor.fileOpen(anchor.href, mimeType);
    }
    bindEvents() {
      addEventListenerList(this.listGroups, 'click', this.onClick.bind(this));
    }
    init() {
      if (this.isPhoneGap && this.listGroups.length) {
        this.bindEvents();
      }
    }
  }

  const trackingAPI = 'https://www.google-analytics.com';
  const trackingKey = 'UA-36156565-7';
  const metaTag = document.querySelector("meta[name='application-name']");
  const appName = metaTag && metaTag.dataset.name;
  const appVersion = metaTag && metaTag.dataset.version;
  const defaults = {
    v: 1,
    tid: trackingKey,
    ds: isPhoneGap() ? 'app' : 'web',
    an: appName,
    av: appVersion,
    cid: localStorage.getItem('session') ? localStorage.getItem('session') : 'lxl_no_session_id'
  };
  class Tracker {
    constructor(prefix = 'lxl_') {
      this.prefix = prefix;
      Lockr.prefix = this.prefix;
    }
    static buildParamString(obj) {
      let paramString = '';
      Object.entries(Object.assign(defaults, obj)).forEach(([key, value]) => {
        paramString += "".concat(key, "=").concat(value, "&");
      });
      return paramString;
    }
    track(event) {
      const params = this.constructor.buildParamString(event);
      const hash = cacheBuster();
      const http = new XMLHttpRequest();
      console.log('Tracking payload >>> ', params);
      http.open('HEAD', "".concat(trackingAPI, "/collect"));
      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status !== 200) {
          Lockr.sadd('hits', encodeURI("".concat(params, "z=").concat(hash)));
        }
        if (http.readyState === 4 && http.status === 200) {
          if ('sendBeacon' in navigator) {
            navigator.sendBeacon("".concat(trackingAPI, "/collect"), encodeURI("".concat(params, "z=").concat(hash)));
          } else {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', "".concat(trackingAPI, "/collect"), true);
            xhr.send(encodeURI("".concat(params, "z=").concat(hash)));
          }
          this.constructor.sync();
        }
      };
      http.send();
    }
    static sync() {
      if (Lockr.smembers('hits').length > 0) {
        const currentTs = new Date() * 1 / 1000;
        const hits = Lockr.smembers('hits');
        const chunkSize = 20;
        const chunkedHits = Lockr.smembers('hits').map((e, i) => i % chunkSize === 0 ? hits.slice(i, i + chunkSize) : null).filter(e => e);
        for (let i = 0; i < chunkedHits.length; i += 1) {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', "".concat(trackingAPI, "/batch"), true);
          xhr.send(chunkedHits[i].map(x => {
            if (x.indexOf('&qt=') > -1) {
              return x.replace(/qt=([^&]*)/, "qt=".concat(Math.round(currentTs - x.match(/qt=([^&]*)/)[1] / 1000) * 1000));
            }
            return x;
          }).join('\n'));
        }
        Lockr.flush();
      }
    }
    maybeSendSavedHits() {
      const http = new XMLHttpRequest();
      http.open('HEAD', "".concat(trackingAPI, "/collect"));
      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          this.constructor.sync();
        }
      };
      http.send();
    }
    onDeviceReady() {
      document.addEventListener('online', this.maybeSendSavedHits.bind(this), false);
    }
    bindEvents() {
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    }
    init() {
      this.bindEvents();
    }
  }

  const params = {
    download: {
      ea: '',
      ec: 'document',
      el: '',
      t: 'event'
    },
    page: {
      el: 'view',
      t: 'screenview'
    }
  };
  const listGroupSelectors = '[data-resource], [data-slidedeck]';
  class App {
    constructor(key = 'session', tracker = null) {
      this.listGroups = document.querySelectorAll(listGroupSelectors) || document.querySelectorAll('a[download]');
      this.key = key;
      this.loadEvent = isPhoneGap() ? 'deviceready' : 'DOMContentLoaded';
      this.tracker = tracker || new Tracker();
      this.setGuid();
    }
    setGuid() {
      if (!localStorage.getItem(this.key)) localStorage.setItem(this.key, generateUUID());
    }
    onLoad() {
      this.tracker.init();
      this.fileHandler = new FileHandler(this.listGroups);
      this.fileHandler.init();
      this.trackScreenView();
    }
    onDeviceReady() {
      this.receivedEvent('deviceready');
      StatusBar.hide();
      screen.orientation.lock('landscape');
    }
    trackScreenView() {
      params.page.cd = document.body.dataset.page ? document.body.dataset.page : 'lxl_no_page';
      this.tracker.track(params.page);
    }
    trackDownload(event) {
      const anchor = event.target.closest('a');
      if (!anchor.href) return;
      params.download.ea = anchor && anchor.dataset.category;
      params.download.el = anchor && anchor.textContent.trim();
      this.tracker.track(params.download);
    }
    receivedEvent(eventId) {
      console.log("PhoneGap Received Event: ".concat(eventId));
    }
    bindEvents() {
      document.addEventListener(this.loadEvent, this.onLoad.bind(this), false);
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
      addEventListenerList(this.listGroups, 'click', this.trackDownload.bind(this));
    }
    init() {
      this.bindEvents();
    }
  }

  function Homepage () {
    const homepage = document.querySelector('[data-page="homepage"]');
    if (homepage) {
      const homepageContent = homepage.querySelector('.homepage_content');
      localStorage.removeItem('rowsToShow');
      if (isPhoneGap()) {
        document.addEventListener('deviceready', () => {
          homepageContent.dataset.active = true;
        }, true);
      } else {
        homepageContent.dataset.active = true;
      }
    }
  }

  function saveCompoundData () {
    const saveDataButtons = Array.from(document.querySelectorAll('[data-action="save-compound-data"]'));
    if (saveDataButtons) {
      saveDataButtons.forEach(saveDataButton => {
        saveDataButton.addEventListener('click', e => {
          const dataToSave = e.currentTarget.dataset.target;
          if (!confirm("This will show all of the data for ".concat(dataToSave, ". Are you sure?"))) {
            return;
          }
          const existingRows = localStorage.getItem('rowsToShow');
          if (existingRows) {
            const existingRowsArray = JSON.parse(existingRows);
            if (existingRowsArray.indexOf(dataToSave) === -1) {
              existingRowsArray.push(dataToSave);
              localStorage.setItem('rowsToShow', JSON.stringify(existingRowsArray));
              document.location.reload();
            }
          } else {
            localStorage.setItem('rowsToShow', JSON.stringify([dataToSave]));
            document.location.reload();
          }
        });
      });
    }
  }

  const app = new App();
  app.init();
  saveCompoundData();
  Homepage();
  window.addEventListener('load', () => {
    const hiddenLinks = Array.from(document.querySelectorAll('.page-navigation li[data-visible]'));
    const linksToShow = localStorage.rowsToShow ? JSON.parse(localStorage.rowsToShow) : null;
    console.log(linksToShow, hiddenLinks);
    if (linksToShow) {
      console.log(linksToShow);
      hiddenLinks.forEach(link => {
        link.setAttribute('data-visible', !!(linksToShow.indexOf(link.dataset.target) > -1));
      });
    }
    const grids = Array.from(document.querySelectorAll('.grid'));
    grids.map(grid => grid.querySelector('.content').style.opacity = 1);
  });

}());

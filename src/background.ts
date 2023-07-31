import CryptoJS from 'crypto-js';
import formurlencoded from 'form-urlencoded';
import { piratebay } from 'piratebay-scraper';
import { TPBProvider } from 'piratebay-scraper/interfaces';
import { md5crypt } from './services/md5crypt';

const PROVIDERS = ['https://tpb.party', 'https://thepiratebay.zone/', 'https://pirateproxy.live/'];

let index = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.contentScriptQuery === 'fetchData') {
    getData(request, sender, sendResponse, PROVIDERS[index]);
    return true;
  } else {
    return false;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.contentScriptQuery === 'fetchWebshareData') {
    webshareSearch(request, sender, sendResponse);
    return true;
  } else {
    return false;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.contentScriptQuery === 'loginWebshare') {
    webshareLogin(request, sender, sendResponse);
    return true;
  } else {
    return false;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.contentScriptQuery === 'loginWebshareSalt') {
    webshareLoginSalt(request, sender, sendResponse);
    return true;
  } else {
    return false;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.contentScriptQuery === 'linkWebshare') {
    webshareLink(request, sender, sendResponse);
    return true;
  } else {
    return false;
  }
});

const getData = (request: any, sender: any, sendResponse: any, provider: TPBProvider) => {
  piratebay
    .search(request.searchQuery, provider)
    .then((response) => {
      if (response) {
        return response;
      }
      throw new Error("Can't connect to movie provider :(");
    })
    .then((response) => {
      sendResponse(response);
    })
    .catch((error) => {
      if (index <= PROVIDERS.length - 1) {
        console.log(PROVIDERS[index]);
        index = index + 1;
        getData(request, sender, sendResponse, PROVIDERS[index]);
      } else {
        console.log('csfd-magnets error:', error);
        sendResponse(error);
      }
    });
};

const webshareLogin = (request: any, sender: any, sendResponse: any) => {
  callWebshare('login', {
    username_or_email: request.email,
    password: CryptoJS.SHA1(md5crypt(request.password, request.salt)).toString(),
    digest: CryptoJS.MD5(request.email + ':Webshare:' + request.password).toString(),
    keep_logged_in: 0
  })
    .then((response) => {
      if (response) {
        console.log(response);
        return response;
      }
      throw new Error("Can't connect to movie provider :(");
    })
    .then((response) => {
      sendResponse(response);
    })
    .catch((error) => {
      console.log('csfd-magnets error:', error);
      sendResponse(error);
    });
};

const webshareLoginSalt = (request: any, sender: any, sendResponse: any) => {
  callWebshare('salt', {
    username_or_email: request.email
  })
    .then((response) => {
      if (response) {
        console.log(response);
        return response;
      }
      throw new Error("Can't connect to movie provider :(");
    })
    .then((response) => {
      sendResponse(response);
    })
    .catch((error) => {
      console.log('csfd-magnets error:', error);
      sendResponse(error);
    });
};

const webshareSearch = (request: any, sender: any, sendResponse: any) => {
  callWebshare('search', { what: request.searchQuery, offset: 0, limit: 5, category: 'video' })
    .then((response) => {
      if (response) {
        console.log(response);
        return response;
      }
      throw new Error("Can't connect to movie provider :(");
    })
    .then((response) => {
      sendResponse(response);
    })
    .catch((error) => {
      console.log('csfd-magnets error:', error);
      sendResponse(error);
    });
};

const webshareLink = (request: any, sender: any, sendResponse: any) => {
  callWebshare('file_link', { ident: request.ident, wst: request.token })
    .then((response) => {
      if (response) {
        console.log(response);
        return response;
      }
      throw new Error("Can't connect to movie provider :(");
    })
    .then((response) => {
      sendResponse(response);
    })
    .catch((error) => {
      console.log('csfd-magnets error:', error);
      sendResponse(error);
    });
};

const callWebshare = (method: string, data: any) => {
  // if (this.token) data.wst = this.token;
  var args = {
    method: 'POST',
    headers: {
      Accept: 'application/xml; charset=UTF-8',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formurlencoded(data)
  };
  return fetch('http://webshare.cz/api/' + method + '/', args).then((response) => response.text());
};

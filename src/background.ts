import formurlencoded from 'form-urlencoded';
import { piratebay } from 'piratebay-scraper';
import { TPBProvider } from 'piratebay-scraper/interfaces';

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
    getWebshareData(request, sender, sendResponse);
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

const getWebshareData = (request: any, sender: any, sendResponse: any) => {
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

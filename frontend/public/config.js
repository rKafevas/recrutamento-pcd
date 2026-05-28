const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://inclui-plus-api.onrender.com';

window.API_URL = API_URL;

window.fileUrl = function(url) {
  if (!url) return '';
  if (!url.startsWith('http')) return API_URL + '/' + url.replace(/\\/g, '/');
  return url;
};

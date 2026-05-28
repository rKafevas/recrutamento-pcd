const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://inclui-plus-api.onrender.com';

window.API_URL = API_URL;

window.fileUrl = function(url) {
  if (!url) return '';
  if (!url.startsWith('http')) return API_URL + '/' + url.replace(/\\/g, '/');
  // Cloudinary raw URL sem extensão: adiciona .pdf para Content-Type correto
  if (url.includes('/raw/upload/') && !/\.\w{2,4}$/.test(url.split('?')[0])) {
    return url + '.pdf';
  }
  return url;
};
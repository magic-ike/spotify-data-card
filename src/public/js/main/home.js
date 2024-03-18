import {
  DEFAULT_TIMEOUT_DELAY_MS,
  showMainView,
  _copyCardCode
} from './common.js';

// initialization

const USER_ID_KEY = 'userId';
const REFRESH_TOKEN_KEY = 'refreshToken';

$(() => {
  const userId = localStorage.getItem(USER_ID_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (userId && refreshToken) {
    renderPage(userId);
  } else {
    setTimeout(checkForHashParams, DEFAULT_TIMEOUT_DELAY_MS);
  }
});

// renderer

const renderPage = (userId) => {
  const $loadingImgContainer = $('.loading-img-container');
  const $dataCardLink = $('.data-card-link');
  const $dataCard = $('.data-card');
  const $loggedOutView = $('.logged-out-view');
  const $loggedInView = $('.logged-in-view');
  if (userId) {
    const [cardPageUrl, cardImageUrl] = getCardUrls(userId);
    $dataCardLink.attr('href', cardPageUrl);
    $dataCard.one('load', () => $loadingImgContainer.hide());
    $dataCard.attr('src', cardImageUrl);
    $loggedOutView.hide();
    $loggedInView.fadeIn();
  } else {
    $dataCardLink.removeAttr('href');
    $dataCard.removeAttr('src');
    $loggedOutView.fadeIn();
    $loggedInView.hide();
  }
  showMainView();
};

// hash param handlers

const checkForHashParams = () => {
  const { error, user_id, refresh_token } = getHashParams();
  if (error) {
    alert(`Failed to generate data card. Error: ${error}`);
  } else if (user_id && refresh_token) {
    localStorage.setItem(USER_ID_KEY, user_id);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    alert('Data card generated!');
    clearHashParams();
    renderPage(user_id);
    return;
  }
  clearHashParams();
  renderPage(null);
};

const getHashParams = () => {
  const params = {};
  const queryString = location.hash.slice(1);
  const regex = /([^&;=]+)=?([^&;]*)/g;
  let execArray;
  while ((execArray = regex.exec(queryString)))
    params[execArray[1]] = decodeURIComponent(execArray[2]);
  return params;
};

const clearHashParams = () => {
  history.replaceState(null, '', location.pathname);
};

// button click handlers

window.generateCard = () => {
  $('.gen-btn').hide();
  $('.gen-btn-group > .loading-btn').show();
  location.href = '/auth/login';
};

window.copyCardCode = () => {
  const userId = localStorage.getItem(USER_ID_KEY);
  const [cardPageUrl, cardImageUrl] = getCardUrls(userId);
  _copyCardCode(cardPageUrl, cardImageUrl);
};

window.goToCardPage = () => {
  const userId = localStorage.getItem(USER_ID_KEY);
  const [cardPageUrl] = getCardUrls(userId);
  location.href = cardPageUrl;
};

window.logOut = () => {
  localStorage.clear();
  renderPage(null);
};

window.deleteCard = async () => {
  if (!confirm('Are you sure you want to delete your data card?')) return;

  const $deleteBtn = $('.delete-btn');
  const $loadingBtn = $('.delete-btn-group > .loading-btn');
  $deleteBtn.hide();
  $loadingBtn.show();

  const userId = localStorage.getItem(USER_ID_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const genericErrorMessage =
    'Something went wrong while trying to delete your data card!\nTry logging out, logging back in, then trying again.';
  let response;
  try {
    response = await fetch(`/api/card?user_id=${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    });
    if (!response.ok) throw genericErrorMessage;
  } catch (error) {
    alert(
      error === genericErrorMessage
        ? error
        : `Failed to delete data card. Error: ${error}`
    );
    $deleteBtn.show();
    $loadingBtn.hide();
    return;
  }
  logOut();

  const responseMessage = await response.text();
  setTimeout(() => alert(responseMessage), DEFAULT_TIMEOUT_DELAY_MS);
};

// helpers

const getCardUrls = (userId) => {
  const cardPageUrl = `${location.origin}/card?user_id=${userId}`;
  const cardImageUrl = cardPageUrl.replace('/card', '/api/card');
  return [cardPageUrl, cardImageUrl];
};

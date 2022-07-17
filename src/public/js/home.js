const USER_ID = 'userId';
const REFRESH_TOKEN = 'refreshToken';
const DEFAULT_DELAY_TIME = 400;

$(() => {
  renderPage();
  setTimeout(() => {
    checkForHashParams();
  }, DEFAULT_DELAY_TIME);
});

// rendering

const renderPage = () => {
  const userId = localStorage.getItem(USER_ID);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);
  const loggedIn = userId && refreshToken;

  const $loadingImgContainer = $('.loading-img-container');
  const $dataCardLink = $('.data-card-link');
  const $dataCard = $('.data-card');
  const $loggedOutView = $('.logged-out-view');
  const $loggedInView = $('.logged-in-view');

  if (!loggedIn) {
    $dataCardLink.removeAttr('href');
    $dataCard.removeAttr('src');

    $loggedOutView.fadeIn();
    $loggedInView.hide();
  } else {
    const [cardPageUrl, cardImageUrl] = getCardUrls(userId);
    $dataCardLink.attr('href', cardPageUrl);
    $dataCard.one('load', () => $loadingImgContainer.hide());
    $dataCard.attr('src', cardImageUrl);

    $loggedOutView.hide();
    $loggedInView.fadeIn();
  }

  showMainView();
};

// hash params

const checkForHashParams = () => {
  const { error, user_id, refresh_token } = getHashParams();
  if (error) {
    alert(`Failed to generate data card. Error: ${error}`);
  } else if (user_id && refresh_token) {
    localStorage.setItem(USER_ID, user_id);
    localStorage.setItem(REFRESH_TOKEN, refresh_token);
    alert('Data card generated!');
    renderPage();
  }
  clearHashParams();
};

const getHashParams = () => {
  const params = {};
  const queryString = window.location.hash.slice(1);
  const regex = /([^&;=]+)=?([^&;]*)/g;
  let execArray;
  while ((execArray = regex.exec(queryString)))
    params[execArray[1]] = decodeURIComponent(execArray[2]);
  return params;
};

const clearHashParams = () => {
  history.replaceState('', document.title, window.location.pathname);
};

// buttons

const generateCard = () => {
  $('.gen-btn').hide();
  $('.gen-btn-group > .loading-btn').show();
  window.location.href = '/auth/login';
};

const copyCardCode = () => {
  const userId = localStorage.getItem(USER_ID);
  const [cardPageUrl, cardImageUrl] = getCardUrls(userId);
  _copyCardCode(cardPageUrl, cardImageUrl);
};

const goToCardPage = () => {
  const userId = localStorage.getItem(USER_ID);
  const [cardPageUrl] = getCardUrls(userId);
  window.location.href = cardPageUrl;
};

const logOut = () => {
  localStorage.clear();
  renderPage();
};

const deleteCard = async () => {
  if (!confirm('Are you sure you want to delete your data card?')) return;

  const $deleteBtn = $('.delete-btn');
  const $loadingBtn = $('.delete-btn-group > .loading-btn');
  $deleteBtn.hide();
  $loadingBtn.show();

  const userId = localStorage.getItem(USER_ID);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);
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
  setTimeout(() => {
    alert(responseMessage);
  }, DEFAULT_DELAY_TIME);
};

// helpers

const getCardUrls = (userId) => {
  const cardPageUrl = `${window.location.origin}/card?user_id=${userId}`;
  const cardImageUrl = cardPageUrl.replace('/card', '/api/card');
  return [cardPageUrl, cardImageUrl];
};

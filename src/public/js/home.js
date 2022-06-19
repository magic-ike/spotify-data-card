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

  $dataCard.one('load', () => $loadingImgContainer.hide());

  if (!loggedIn) {
    $dataCardLink.removeAttr('href');
    $dataCard.removeAttr('src');

    $loggedOutView.fadeIn();
    $loggedInView.hide();
  } else {
    const [cardPageUrl, imageUrl] = getUrls(userId);
    $dataCardLink.attr('href', cardPageUrl);
    $dataCard.attr('src', imageUrl);

    $loggedOutView.hide();
    $loggedInView.fadeIn();
  }

  const $body = $('body');
  if ($body.is(':hidden')) $body.show();
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
  } else return;
  history.replaceState('', document.title, window.location.pathname);
  renderPage();
};

const getHashParams = () => {
  const params = {};
  const regex = /([^&;=]+)=?([^&;]*)/g;
  const queryString = window.location.hash.slice(1);
  let execArray;
  while ((execArray = regex.exec(queryString)))
    params[execArray[1]] = decodeURIComponent(execArray[2]);
  return params;
};

// buttons

const generateCard = () => {
  $('.gen-btn').hide();
  $('.gen-btn-group > .btn-loading-img').show();
  window.location.href = '/auth/login';
};

const copyCardCode = async () => {
  const userId = localStorage.getItem(USER_ID);
  const [cardPageUrl, imageUrl] = getUrls(userId);
  const code = `<a href="${cardPageUrl}">
  <img src="${imageUrl}" />
</a>`;
  const confirmation = `Code:

${code}

Click 'OK' to copy.`;
  if (!confirm(confirmation)) return;
  setTimeout(async () => {
    await navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  }, DEFAULT_DELAY_TIME);
};

const logOut = () => {
  localStorage.clear();
  renderPage();
};

const deleteCard = async () => {
  if (!confirm('Are you sure you want to delete your data card?')) return;

  $('.delete-btn').hide();
  $('.delete-btn-group > .btn-loading-img').show();

  const userId = localStorage.getItem(USER_ID);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);
  let response;
  try {
    response = await fetch(`/api/card?user_id=${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    });
  } catch (error) {
    alert(
      'Something went wrong while trying to delete your data card!\nTry logging out, logging back in, then trying again.'
    );
    return;
  }

  logOut();

  const responseMessage = await response.text();
  setTimeout(() => {
    alert(responseMessage);
  }, DEFAULT_DELAY_TIME);
};

// helpers

const getUrls = (userId) => {
  const origin = window.location.origin;
  const cardPageUrl = `${origin}/card?user_id=${userId}`;
  const imageUrl = `${origin}/api/card?user_id=${userId}`;
  return [cardPageUrl, imageUrl];
};

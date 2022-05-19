const USER_ID = 'userId';
const REFRESH_TOKEN = 'refreshToken';
const DEFAULT_DELAY_TIME = 400;

$(() => {
  renderPage();
  setTimeout(() => {
    checkForHashParams();
  }, DEFAULT_DELAY_TIME);
});

// page rendering functions

const renderPage = () => {
  const userId = localStorage.getItem(USER_ID);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);
  const loggedIn = userId && refreshToken;
  // temp
  const imageUrl =
    'https://github-readme-stats.vercel.app/api/top-langs/?username=magic-ike&theme=dark&border_radius=10&hide_title=true&layout=compact&langs_count=10';

  const dataCard = $('.data-card');
  const dataCardText = $('.data-card-text');
  const logoutBtn = $('.logout-btn');

  if (loggedIn) {
    dataCard.attr('src', imageUrl).fadeIn();
    dataCardText.hide();
    setActionBtnText(loggedIn).off('click').click(copyCardCode);
    logoutBtn.fadeIn();
  } else {
    dataCard.removeAttr('src').hide();
    dataCardText.attr('src', imageUrl).fadeIn();
    setActionBtnText(loggedIn).off('click').click(generateCard);
    logoutBtn.hide();
  }

  const body = $('body');
  if (body.is(':hidden')) body.show();
};

const setActionBtnText = (loggedIn) => {
  const actionBtn = $('.action-btn');
  const oldText = actionBtn.html();
  const newText = loggedIn ? 'Copy Code' : 'Generate Card';
  if (!oldText || oldText === newText) return actionBtn.html(newText);
  else return actionBtn.hide().html(newText).fadeIn();
};

const copyCardCode = () => {
  alert('Code copied to clipboard!');
  // TODO: copy code
};

const logOut = () => {
  localStorage.clear();
  renderPage();
};

const generateCard = () => {
  window.location.href = '/auth/login';
};

// hash param functions

const checkForHashParams = () => {
  const { error, user_id, refresh_token } = getHashParams();
  if (error) {
    alert(`Failed to generate data card. Error: ${error}`);
  } else if (user_id && refresh_token) {
    localStorage.setItem(USER_ID, user_id);
    localStorage.setItem(REFRESH_TOKEN, refresh_token);
    alert('Data card generated!');
  }
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

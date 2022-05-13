const USER_ID = 'userId';
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
  // temp
  const imageUrl =
    'https://github-readme-stats.vercel.app/api/top-langs/?username=magic-ike&theme=dark&hide_title=true&layout=compact&langs_count=10';

  const dataCard = $('.data-card');
  const dataCardText = $('.data-card-text');
  const logoutBtn = $('.logout-btn');

  if (userId) {
    dataCard.attr('src', imageUrl).fadeIn();
    dataCardText.hide();
    setActionBtnText(userId).off('click').click(copyCardCode);
    logoutBtn.fadeIn();
  } else {
    dataCard.removeAttr('src').hide();
    dataCardText.attr('src', imageUrl).fadeIn();
    setActionBtnText(userId).off('click').click(generateCard);
    logoutBtn.hide();
  }

  const body = $('body');
  if (body.is(':hidden')) body.show();
};

const setActionBtnText = (userId) => {
  const actionBtn = $('.action-btn');
  const newText = userId ? 'Copy Code' : 'Generate Card';
  if (!actionBtn.html()) return actionBtn.html(newText);
  else return actionBtn.hide().html(newText).fadeIn();
};

const copyCardCode = () => {
  alert('Code copied to clipboard!');
  // TODO: copy code
};

const logOut = () => {
  localStorage.removeItem(USER_ID);
  renderPage();
};

const generateCard = () => {
  window.location.href = '/auth/login';
};

// hash param functions

const checkForHashParams = () => {
  const { error, userId } = getHashParams();
  if (error) {
    alert(`Failed to generate data card. Error: ${error}`);
  } else if (userId) {
    localStorage.setItem(USER_ID, userId);
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

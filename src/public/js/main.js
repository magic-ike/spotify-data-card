const USER_ID = 'userId';

$(() => {
  renderPage();
});

const renderPage = () => {
  $('body').hide();

  const userId = localStorage.getItem(USER_ID);
  // temp
  const imageUrl =
    'https://github-readme-stats.vercel.app/api/top-langs/?username=magic-ike&theme=dark&hide_title=true&layout=compact&langs_count=10';

  const dataCard = $('.data-card');
  const dataCardText = $('.data-card-text');

  if (userId) {
    dataCard.attr('src', imageUrl).fadeIn();
    dataCardText.hide();
    setActionBtnText(userId).off('click').click(copyCardCode);
  } else {
    dataCard.removeAttr('src').hide();
    dataCardText.attr('src', imageUrl).fadeIn();
    setActionBtnText(userId).off('click').click(generateCard);
  }

  $('body').show();
};

const setActionBtnText = (userId) => {
  const actionBtn = $('.action-btn');
  const newText = userId ? 'Copy Code' : 'Generate Card';
  if (!actionBtn.html()) return actionBtn.html(newText);
  else return actionBtn.hide().html(newText).fadeIn();
};

const copyCardCode = () => {
  alert('Code copied to clipboard!');
  // temp
  localStorage.removeItem(USER_ID);
  renderPage();
};

const generateCard = () => {
  window.location.href = '/auth/login';
  // localStorage.setItem(USER_ID, 'asdf');
  // alert('Data card generated!');
  // renderPage();
};

$(() => {
  renderPage();
});

// rendering

const renderPage = () => {
  const $loadingImgContainer = $('.loading-img-container');
  const $iDataCard = $('.interactive-data-card');
  const [_, cardImageUrl] = getCardUrls();
  $iDataCard.one('load', () => $loadingImgContainer.hide());
  showMainView();
  $iDataCard.attr('data', cardImageUrl); // must be set AFTER the main view is visible
};

// buttons

const copyCardCode = () => {
  const [cardPageUrl, cardImageUrl] = getCardUrls();
  _copyCardCode(cardPageUrl, cardImageUrl);
};

const copyCardPageLink = async () => {
  const [cardPageUrl] = getCardUrls();
  await navigator.clipboard.writeText(cardPageUrl);
  alert('Link copied to clipboard!');
};

const saveCardSnapshot = () => {
  const [_, cardImageUrl] = getCardUrls();
  const cardImageUrlObject = new URL(cardImageUrl);
  cardImageUrlObject.searchParams.set('show_date', '1');
  cardImageUrlObject.searchParams.set('time_zone', moment.tz.guess());

  const link = document.createElement('a');
  link.href = cardImageUrlObject.href;
  link.download = `Spotify Data on ${getDateString()}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert('Download started...');
};

const goToHomePage = () => {
  window.location.href = '/';
};

// helpers

const getCardUrls = () => {
  const cardPageUrl = window.location.href;
  const cardImageUrl = cardPageUrl.replace('/card', '/api/card');
  return [cardPageUrl, cardImageUrl];
};

const getDateString = () => {
  return moment().format('YYYY-MM-DD [at] h.mm.ss A');
};

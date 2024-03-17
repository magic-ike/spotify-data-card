import { showMainView, _copyCardCode } from './common.js';

// initialization

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

window.copyCardCode = () => {
  const [cardPageUrl, cardImageUrl] = getCardUrls();
  _copyCardCode(cardPageUrl, cardImageUrl);
};

window.copyCardPageLink = async () => {
  const [cardPageUrl] = getCardUrls();
  await navigator.clipboard.writeText(cardPageUrl);
  alert('Link copied to clipboard!');
};

window.goToHomePage = () => {
  window.location.href = '/';
};

// helpers

const getCardUrls = () => {
  const cardPageUrl = window.location.href;
  const cardImageUrl = cardPageUrl.replace('/card', '/api/card');
  return [cardPageUrl, cardImageUrl];
};

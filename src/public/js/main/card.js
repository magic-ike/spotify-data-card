import {
  DEFAULT_TIMEOUT_DELAY_MS,
  showMainView,
  _copyCardCode
} from './common.js';

// initialization

$(() => {
  renderPage();
});

// renderer

const renderPage = () => {
  const $loadingImgContainer = $('.loading-img-container');
  const $iDataCard = $('.interactive-data-card');
  const [_, cardImageUrl] = getCardUrls();
  $iDataCard.one('load', () => {
    $iDataCard.css('background-color', 'var(--spotify-bg)');
    window.setTimeout(() => {
      $loadingImgContainer.hide();
      $iDataCard.css('background-color', '');
    }, DEFAULT_TIMEOUT_DELAY_MS);
  });
  showMainView();
  // this is set AFTER the main view is shown to prevent a bug where the data card never gets rendered
  $iDataCard.attr('data', cardImageUrl);
};

// button click handlers

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
  location.href = '/';
};

// helpers

const getCardUrls = () => {
  const cardPageUrl = location.href;
  const cardImageUrl = cardPageUrl.replace('/card', '/api/card');
  return [cardPageUrl, cardImageUrl];
};

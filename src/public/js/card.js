$(() => {
  renderPage();
});

// rendering

const renderPage = () => {
  const $loadingImgContainer = $('.loading-img-container');
  const $iDataCard = $('.interactive-data-card');
  const $dataCard = $('.data-card');

  $dataCard.one('load', () => $loadingImgContainer.hide());

  const imageUrl = getImageUrl();
  $iDataCard.attr('data', imageUrl);
  $dataCard.attr('src', imageUrl);

  const $body = $('body');
  if ($body.is(':hidden')) $body.show();
};

// buttons

copyCardPageLink = async () => {
  await navigator.clipboard.writeText(window.location.href);
  alert('Link copied to clipboard!');
};

saveCardSnapshot = () => {
  const link = document.createElement('a');
  const imageUrlObject = new URL(getImageUrl());
  imageUrlObject.searchParams.set('show_date', '1');
  link.href = imageUrlObject.href;
  link.download = `Spotify Data on ${getDateString()}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert('Download started...');
};

goToHomePage = () => {
  window.location.href = '/';
};

// helpers

const getImageUrl = () => {
  return `${window.location.origin}/api${window.location.pathname}${window.location.search}`;
};

const getDateString = () => {
  return moment().format('YYYY-MM-DD [at] h.mm.ss A');
};

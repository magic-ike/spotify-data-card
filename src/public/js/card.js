$(() => {
  renderPage();
});

// rendering

const renderPage = () => {
  const $loadingImgContainer = $('.loading-img-container');
  const $iDataCard = $('.interactive-data-card');
  const $dataCard = $('.data-card');

  const imageUrl = getImageUrl();
  $dataCard.one('load', () => {
    $iDataCard.attr('data', imageUrl); // must be run after the main view is visible
    $loadingImgContainer.hide();
  });
  $dataCard.attr('src', imageUrl);

  showMainView();
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
  imageUrlObject.searchParams.set('time_zone', moment.tz.guess());
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

$(() => {
  renderPage();
});

// rendering

const renderPage = () => {
  const loadingImgContainer = $('.loading-img-container');
  const iDataCard = $('.interactive-data-card');
  const dataCard = $('.data-card');

  dataCard.one('load', () => loadingImgContainer.hide());

  const imageUrl = getImageUrl();
  iDataCard.attr('data', imageUrl);
  dataCard.attr('src', imageUrl);

  const body = $('body');
  if (body.is(':hidden')) body.show();
};

// buttons

copyCardPageLink = async () => {
  await navigator.clipboard.writeText(window.location.href);
  alert('Link copied to clipboard!');
};

saveCardSnapshot = () => {
  const link = document.createElement('a');
  link.href = getImageUrl();
  link.download = `spotify_data_${getDateString()}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert('Download starting...');
};

goToHomePage = () => {
  window.location.href = '/';
};

// helpers

const getImageUrl = () => {
  return `/api${window.location.pathname}${window.location.search}`;
};

const getDateString = () => {
  return moment().format('YYYY-MM-DD_h.mm.ss_A');
};

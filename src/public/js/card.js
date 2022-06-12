$(() => {
  renderPage();
});

const renderPage = () => {
  const loadingImgContainer = $('.loading-img-container');
  const iDataCard = $('.interactive-data-card');
  const dataCard = $('.data-card');

  dataCard.one('load', () => loadingImgContainer.hide());

  const imageUrl = `/api/card${window.location.search}`;
  iDataCard.attr('data', imageUrl);
  dataCard.attr('src', imageUrl);

  const body = $('body');
  if (body.is(':hidden')) body.show();
};

copyCardPageLink = async () => {
  await navigator.clipboard.writeText(window.location.href);
  alert('Link copied to clipboard.');
};

saveCardSnapshot = () => {
  // TODO: implement
  alert('Snapshot saved.');
};

goToHomePage = () => {
  window.location.href = '/';
};

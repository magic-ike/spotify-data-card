$(() => {
  renderPage();
});

const renderPage = () => {
  const imageUrl = `/api/card${window.location.search}`;
  const iDataCard = $('.interactive-data-card');
  const dataCard = $('.data-card');

  iDataCard.attr('data', imageUrl);
  dataCard.attr('src', imageUrl);

  const body = $('body');
  if (body.is(':hidden')) body.show();
};

copyCardPageLink = async () => {
  await navigator.clipboard.writeText(window.location.href);
  alert('Link copied to clipboard.');
};

goToHomePage = () => {
  window.location.href = '/';
};

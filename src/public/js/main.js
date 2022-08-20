function showMainView() {
  const $loadingView = $('.loading-view');
  const $mainView = $('.main-view');
  // display properties are checked and set explicitly to avoid rendering bugs
  if (
    $loadingView.css('display') === 'block' ||
    $mainView.css('display') === 'none'
  ) {
    $loadingView.css('display', 'none');
    $mainView.css('display', 'block');
  }
}

async function _copyCardCode(pageUrl, imageUrl) {
  const code = `<a href="${pageUrl}">
  <img src="${imageUrl}" alt="Data Card for Spotify">
</a>`;
  await navigator.clipboard.writeText(code);
  alert('Code copied to clipboard!');
}

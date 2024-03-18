export const DEFAULT_TIMEOUT_DELAY_MS = 400;

export const showMainView = () => {
  const $loadingView = $('.loading-view');
  const $mainView = $('.main-view');
  // the display properties are checked and set explicitly to prevent rendering issues
  if (
    $loadingView.css('display') === 'block' ||
    $mainView.css('display') === 'none'
  ) {
    $loadingView.css('display', 'none');
    $mainView.css('display', 'block');
  }
};

export const _copyCardCode = async (pageUrl, imageUrl) => {
  const code = `<a href="${pageUrl}">
  <img src="${imageUrl}" alt="Data Card for Spotify">
</a>`;
  await navigator.clipboard.writeText(code);
  alert('Code copied to clipboard!');
};

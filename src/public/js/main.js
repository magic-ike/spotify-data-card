function showMainView() {
  const $loadingView = $('.loading-view');
  const $mainView = $('.main-view');
  if ($loadingView.is(':visible') || $mainView.is(':hidden')) {
    $loadingView.hide();
    $mainView.show();
  }
}

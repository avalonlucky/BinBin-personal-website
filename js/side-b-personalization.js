(function () {
  'use strict';

  const title = 'Side B | Meridian Space';

  function applyPersonalMetadata() {
    document.title = title;
  }

  applyPersonalMetadata();
  document.addEventListener('DOMContentLoaded', applyPersonalMetadata, { once: true });
  window.addEventListener('load', applyPersonalMetadata, { once: true });
  window.addEventListener('pageshow', applyPersonalMetadata);
}());

(function () {
  'use strict';

  const title = 'Side B | Maridian Space';

  function applyPersonalMetadata() {
    document.title = title;
  }

  applyPersonalMetadata();
  document.addEventListener('DOMContentLoaded', applyPersonalMetadata, { once: true });
  window.addEventListener('load', applyPersonalMetadata, { once: true });
  window.addEventListener('pageshow', applyPersonalMetadata);
}());

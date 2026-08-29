(() => {
  const clock = document.getElementById('clock');
  if (!clock) return;

  function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  updateClock();
  setInterval(updateClock, 1000);
})();

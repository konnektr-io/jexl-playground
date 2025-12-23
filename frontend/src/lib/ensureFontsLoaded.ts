// Utility to ensure custom fonts are loaded before remeasuring Monaco editor fonts
export function ensureFontsLoaded(callback: () => void) {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      callback();
    });
  } else {
    // Fallback: call callback immediately if Font Loading API is not supported
    callback();
  }
}

/* Shared defaults: loaded by the content script, the service worker (importScripts) and the popup. */
var YSS = {
  // Selector overrides are fetched from here so YouTube DOM changes can be fixed without a store release.
  // Data only — no remote code is ever executed.
  REMOTE_CONFIG_URL: 'https://raw.githubusercontent.com/anilpekesen/youtube-shorts-auto-scroll/main/remote-config.json',

  BTC_ADDRESS: 'bc1qREPLACE_WITH_YOUR_BTC_ADDRESS',

  SETTINGS: { enabled: true },

  // Each list is tried in order; the first match wins.
  SELECTORS: {
    activeVideo: [
      'ytd-reel-video-renderer[is-active] video',
      '#shorts-player video',
      'ytd-shorts video'
    ],
    nextButton: [
      '#navigation-button-down button',
      '#navigation-button-down ytd-button-renderer button',
      'ytd-shorts button[aria-label="Next video"]'
    ],
    scrollContainer: [
      '#shorts-inner-container',
      'ytd-shorts #shorts-container'
    ]
  }
};

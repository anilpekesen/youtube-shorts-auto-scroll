/* Shared defaults: loaded by the content script, the service worker (importScripts) and the popup. */
var YSS = {
  // Selector overrides are fetched from here so site DOM changes can be fixed without a store release.
  // Data only — no remote code is ever executed.
  REMOTE_CONFIG_URL: 'https://raw.githubusercontent.com/anilpekesen/youtube-shorts-auto-scroll/main/remote-config.json',

  // USDT on the Tron network only — other coins or networks sent here are lost.
  DONATION: { coin: 'USDT', network: 'Tron · TRC20', address: 'TR1fPfJEQ5MuqX97PbXyZwitmH3zHZGb3X' },

  SETTINGS: { sites: { youtube: true, tiktok: true, instagram: true } },

  SELECTOR_KEYS: ['activeVideo', 'nextButton', 'scrollContainer'],

  // Each selector list is tried in order; the first list entry with a visible match wins.
  // `path` decides on which pages of the host the auto scroll runs.
  SITES: {
    youtube: {
      name: 'YouTube Shorts',
      hosts: ['www.youtube.com', 'm.youtube.com'],
      path: '^/shorts/',
      selectors: {
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
    },
    tiktok: {
      name: 'TikTok',
      hosts: ['www.tiktok.com'],
      // The feed keeps the same URL while scrolling, so advancing is detected by the active video changing.
      path: '^/(foryou|following|friends)?/?$',
      selectors: {
        activeVideo: [
          'article[data-e2e="recommend-list-item-container"] video',
          '[data-e2e="feed-video"] video'
        ],
        nextButton: [
          'button[data-e2e="feed-navigation-next"]'
        ],
        scrollContainer: [
          '#column-list-container'
        ]
      }
    },
    instagram: {
      name: 'Instagram Reels',
      hosts: ['www.instagram.com'],
      path: '^/reels/',
      selectors: {
        activeVideo: [
          'main video'
        ],
        // Labels are localized, so the "next" button is found by structure: last of the two nav buttons.
        nextButton: [
          'main div[aria-label]:has(> div[role="button"][aria-label] + div[role="button"][aria-label]:last-child) > div[role="button"]:last-child'
        ],
        // Empty: the nearest scrollable ancestor of the video is used.
        scrollContainer: []
      }
    }
  }
};

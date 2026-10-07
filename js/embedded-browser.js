// Pure, DOM-free detection of in-app / embedded browsers.
//
// In-app webviews (notably WeChat's iOS WKWebView) send an opaque or absent
// `Origin` (and often no `Referer`) on cross-origin fetches. The NAS AI API
// allowlists only *.elevenbeans.me origins, so those calls are rejected before
// inference. We detect the common embedded browsers to show a hint that the
// assistant needs a standard browser.

const EMBEDDED_UA_RE =
  /MicroMessenger|QQ\/|Weibo|AlipayClient|DingTalk|Douyin|FBAN|FBAV|Instagram|Line\/|Twitter|Snapchat|; wv\)|GSA\//i;

export function isEmbeddedBrowser(userAgent) {
  if (typeof userAgent !== 'string') return false;
  return EMBEDDED_UA_RE.test(userAgent);
}

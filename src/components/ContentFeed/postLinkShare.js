// 只发起分享，不将打开目标应用或系统面板等同于发送成功。
export const buildPostLinkPayload = (post, url) => ({
  title: String(post.title || '社区帖子'),
  url,
});

export const buildWhatsAppShareUrl = (payload) => {
  const url = new URL('https://wa.me/');
  url.searchParams.set('text', `${payload.title}\n${payload.url}`);
  return url.toString();
};

export const shareLinkWithSystem = async (payload, shareNavigator) => {
  if (typeof shareNavigator?.share !== 'function') return 'unsupported';
  try {
    if (typeof shareNavigator.canShare === 'function' && !shareNavigator.canShare(payload)) {
      return 'unsupported';
    }
    await shareNavigator.share(payload);
    return 'returned';
  } catch (error) {
    // AbortError 也可能表示没有可用目标，不能据此断言微信未安装。
    return error?.name === 'AbortError' ? 'cancelled' : 'failed';
  }
};

export const openWhatsAppLink = (payload, openWindow) => {
  let popup;
  try {
    // 同步打开空白页识别弹窗拦截，移除 opener 后才导航至官方地址。
    popup = openWindow('about:blank', '_blank');
    if (!popup) return 'blocked';
    popup.opener = null;
    popup.location.replace(buildWhatsAppShareUrl(payload));
    return 'opened';
  } catch {
    try { popup?.close(); } catch { /* 关闭失败不影响当前分享页恢复。 */ }
    return 'failed';
  }
};

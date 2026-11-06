import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * ShareSheet: 小红书风格底部分享面板
 *
 * SHARE-UX-004 布局调整：
 * - 四个操作单排横向排列：微信好友、WhatsApp、生成分享图、复制链接
 * - 移除“分享渠道”“工具与操作”分区小标题与中间分隔线
 * - 保持 52px 规范圆形图标，四个图标顶部位置保持一致
 * - 320px 窄屏及正常手机宽度同屏展示四项，长标签支持换行或整排横向滚动，禁止折成两排
 * - 面板有明确关闭（右上角X）和取消（底部按钮）入口；点击遮罩、Escape均可关闭
 * - 关闭使用 preventScroll 恢复触发点焦点，面板内点击不误关闭
 * - 面板打开期间锁定背景滚动并恢复原样式
 * - 底部取消按钮明确安全区留白，长文本/RTL保证关闭和取消始终可达
 */
const ShareSheet = ({
  isOpen,
  onClose,
  onChannelShare,
  onGeneratePoster,
  onCopyLink,
  isSharing = false,
  channelShareHint = '',
  shareFailureInfo = null,
  portalNode = null,
  triggerRef = null,
}) => {
  const sheetRef = useRef(null);
  const closeButtonRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const prevIsOpenRef = useRef(false);

  // 保证回调引用最新且不触发焦点副作用
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // 打开时单次聚焦关闭按钮（解耦 render）
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      closeButtonRef.current?.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // 关闭时恢复焦点至触发入口，防止页面滚动跳跃
  useEffect(() => {
    if (!isOpen && prevIsOpenRef.current) {
      const triggerEl = triggerRef?.current;
      if (triggerEl && typeof triggerEl.focus === 'function') {
        try {
          triggerEl.focus({ preventScroll: true });
        } catch {
          /* ignore focus failure */
        }
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, triggerRef]);

  // 面板内 Tab/Shift+Tab 焦点陷阱与 Escape 关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (e.key === 'Tab') {
        const container = sheetRef.current;
        if (!container) return;
        const focusable = container.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !container.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !container.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 打开时锁定背景容器滚动，关闭时恢复原样式
  useEffect(() => {
    if (!isOpen) return;
    const target = portalNode || (typeof document !== 'undefined' ? document.body : null);
    if (!target) return;
    const originalOverflow = target.style.overflow;
    target.style.overflow = 'hidden';
    return () => {
      target.style.overflow = originalOverflow;
    };
  }, [isOpen, portalNode]);

  if (!isOpen) return null;

  const content = (
    <div
      className="absolute inset-0 z-[70] flex flex-col justify-end bg-black/45 backdrop-blur-[1px] transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-sheet-title"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className="w-full max-h-[85%] rounded-t-2xl bg-white shadow-2xl flex flex-col overflow-hidden text-gray-900 transition-transform duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="auto"
      >
        {/* 顶部标题栏：居中标题与右上角关闭按钮 */}
        <div className="relative flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="w-8" aria-hidden="true" />
          <h2 id="share-sheet-title" className="text-[15px] font-semibold text-gray-900 tracking-tight text-center">
            分享至
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="关闭分享面板"
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 active:bg-gray-100 rounded-full transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 提示与异常状态展示（若有） */}
        <div className="overflow-y-auto px-3 py-3 flex-1 min-h-0 space-y-3">
          {shareFailureInfo && (
            <div
              className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-900 shadow-2xs"
              role="alert"
              dir="auto"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-amber-900 break-words">{shareFailureInfo.message}</span>
              </div>
              {shareFailureInfo.manualUrl && (
                <input
                  type="text"
                  readOnly
                  value={shareFailureInfo.manualUrl}
                  onClick={(e) => e.target.select()}
                  aria-label="帖子链接，可手动复制"
                  className="mt-2 w-full rounded border border-amber-300 bg-white px-2 py-1.5 text-[11px] text-gray-800 select-all font-mono"
                />
              )}
              <div className="mt-2 flex items-center gap-2">
                {shareFailureInfo.canRetry && (
                  <button
                    type="button"
                    onClick={onCopyLink}
                    disabled={isSharing}
                    className="rounded-md bg-brand-red px-2.5 py-1 text-[11px] font-medium text-white shadow-2xs active:bg-red-700 disabled:opacity-50"
                  >
                    重试复制链接
                  </button>
                )}
                {onGeneratePoster && (
                  <button
                    type="button"
                    onClick={onGeneratePoster}
                    disabled={isSharing}
                    className="rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-900 active:bg-amber-100 disabled:opacity-50"
                  >
                    生成分享图
                  </button>
                )}
              </div>
            </div>
          )}

          {channelShareHint && (
            <div
              role="status"
              dir="auto"
              className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-[12px] text-gray-600 leading-relaxed break-words"
            >
              {channelShareHint}
            </div>
          )}

          {/* 单排四个操作：微信好友、WhatsApp、生成分享图、复制链接（SHARE-UX-004） */}
          <div className="pt-2 pb-1 overflow-x-auto scrollbar-none">
            <div className="flex items-start justify-between min-w-full gap-1.5 px-0.5">
              {/* 微信好友 */}
              <button
                type="button"
                onClick={() => onChannelShare('wechat')}
                disabled={isSharing}
                aria-label="分享到微信"
                className="group flex flex-col items-center gap-1.5 focus:outline-none disabled:opacity-50 cursor-pointer flex-1 min-w-[62px] max-w-[76px] shrink-0"
              >
                <div className="w-[52px] h-[52px] rounded-full bg-[#07c160] flex items-center justify-center text-white shadow-xs group-active:scale-95 transition-transform">
                  <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24">
                    <path
                      d="M9 3C4.6 3 1 5.8 1 9.3c0 2 1.2 3.8 3.1 5l-.7 2.5 2.9-1.5c.9.3 1.8.4 2.7.4 4.4 0 8-2.9 8-6.4S13.4 3 9 3Z"
                      fill="white"
                    />
                    <circle cx="6.3" cy="8" r="1.1" fill="#07c160" />
                    <circle cx="11.7" cy="8" r="1.1" fill="#07c160" />
                    <path
                      d="M22.9 15c0-3-3-5.4-6.6-5.4-3.7 0-6.7 2.4-6.7 5.4s3 5.4 6.7 5.4c.7 0 1.5-.1 2.2-.3l2.4 1.2-.6-2.1c1.6-1 2.6-2.5 2.6-4.2Z"
                      fill="white"
                      stroke="#07c160"
                      strokeWidth="0.8"
                    />
                    <circle cx="14" cy="14" r=".9" fill="#07c160" />
                    <circle cx="18.5" cy="14" r=".9" fill="#07c160" />
                  </svg>
                </div>
                <span className="text-[12px] text-gray-700 text-center leading-tight break-words max-w-full">
                  微信好友
                </span>
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => onChannelShare('whatsapp')}
                disabled={isSharing}
                aria-label="分享到 WhatsApp"
                className="group flex flex-col items-center gap-1.5 focus:outline-none disabled:opacity-50 cursor-pointer flex-1 min-w-[62px] max-w-[76px] shrink-0"
              >
                <div className="w-[52px] h-[52px] rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-xs group-active:scale-95 transition-transform">
                  <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.7a9 9 0 0 1-13.2 8L3 21l1.3-4.6A9 9 0 1 1 21 11.7Z" />
                    <path d="M8.1 7.2c-.8.3-1.1 1.4-.7 2.7 1 3.1 3.8 5.7 6.7 6.3 1.2.3 2.4-.4 2.6-1.3l-2.6-1.4-1.1 1c-1.6-.7-2.9-2-3.6-3.6l1-1.1-1.3-2.6Z" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[12px] text-gray-700 text-center leading-tight break-words max-w-full" dir="ltr">
                  WhatsApp
                </span>
              </button>

              {/* 生成分享图 */}
              <button
                type="button"
                onClick={onGeneratePoster}
                disabled={isSharing}
                aria-label="生成分享图"
                className="group flex flex-col items-center gap-1.5 focus:outline-none disabled:opacity-50 cursor-pointer flex-1 min-w-[62px] max-w-[76px] shrink-0"
              >
                <div className="w-[52px] h-[52px] rounded-full bg-[#f3f4f6] border border-gray-200/60 flex items-center justify-center text-gray-700 shadow-xs group-active:scale-95 group-active:bg-gray-200 transition-all">
                  <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <span className="text-[12px] text-gray-700 text-center leading-tight break-words max-w-full">
                  生成分享图
                </span>
              </button>

              {/* 复制链接 */}
              <button
                type="button"
                onClick={onCopyLink}
                disabled={isSharing}
                aria-label="复制链接"
                className="group flex flex-col items-center gap-1.5 focus:outline-none disabled:opacity-50 cursor-pointer flex-1 min-w-[62px] max-w-[76px] shrink-0"
              >
                <div className="w-[52px] h-[52px] rounded-full bg-[#f3f4f6] border border-gray-200/60 flex items-center justify-center text-gray-700 shadow-xs group-active:scale-95 group-active:bg-gray-200 transition-all">
                  <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <span className="text-[12px] text-gray-700 text-center leading-tight break-words max-w-full">
                  复制链接
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 底部取消按钮：明确安全区留白，保证长文本/RTL下始终可达 */}
        <div
          className="border-t border-gray-100 bg-gray-50/60 p-2 flex-shrink-0"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] flex items-center justify-center rounded-xl bg-white text-[15px] font-medium text-gray-700 border border-gray-200/80 active:bg-gray-100 shadow-2xs transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );

  return portalNode ? createPortal(content, portalNode) : content;
};

export default ShareSheet;

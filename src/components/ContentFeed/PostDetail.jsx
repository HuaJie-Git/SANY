/* oxlint-disable react/only-export-components */
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import {
  getTopicById,
  getUserById,
  getCurrentUser,
  isFollowing,
  toggleFollow,
  addComment,
  deleteComment,
  getCommentsByPostId,
} from './communityData';
import ViewCountBadge from './ViewCountBadge';
import { buildPostLinkPayload, openWhatsAppLink, shareLinkWithSystem } from './postLinkShare';

const COMMENT_MAX_LENGTH = 500;

export const isSystemShareSupported = () => {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
};

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }
};

const wrapCanvasText = (ctx, value, maxWidth, maxLines = Infinity) => {
  const text = String(value || '');
  const lines = [];
  let line = '';
  for (const char of text) {
    const next = line + char;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = char;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const visible = lines.slice(0, maxLines);
  let last = visible[maxLines - 1];
  while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
  visible[maxLines - 1] = `${last}…`;
  return visible;
};

export const generatePostPoster = async (post, shareUrl) => {
  if (typeof document === 'undefined') throw new Error('当前环境无法生成图片');
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 960;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('当前环境无法生成图片');

  // 画布底色
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 640, 960);

  // 底部粉色浅底区域
  const footerGradient = ctx.createLinearGradient(0, 760, 0, 960);
  footerGradient.addColorStop(0, '#fff6f7');
  footerGradient.addColorStop(1, '#fde8eb');
  ctx.fillStyle = footerGradient;
  ctx.fillRect(0, 760, 640, 200);

  const postImages = Array.isArray(post?.images) && post.images.length > 0
    ? post.images
    : (post?.image ? [post.image] : []);
  const mainImageSrc = postImages[0];
  if (!mainImageSrc) throw new Error('这条帖子没有可用图片');

  // 顶部卡片图片区域
  const imageX = 28;
  const imageY = 28;
  const imageWidth = 584;
  const imageHeight = 390;
  ctx.fillStyle = '#e8edf0';
  drawRoundedRect(ctx, imageX, imageY, imageWidth, imageHeight, 18);
  ctx.fill();

  const image = new Image();
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = new URL(mainImageSrc, new URL(import.meta.env.BASE_URL, window.location.href)).href;
  });

  const scale = Math.max(imageWidth / image.width, imageHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  ctx.save();
  drawRoundedRect(ctx, imageX, imageY, imageWidth, imageHeight, 18);
  ctx.clip();
  ctx.drawImage(image, imageX + (imageWidth - width) / 2, imageY + (imageHeight - height) / 2, width, height);

  // 仅真实图片数 > 1 时在首图右下角展示“共 N 张”角标
  if (postImages.length > 1) {
    const badgeText = `共${postImages.length}张`;
    ctx.font = 'bold 16px sans-serif';
    const textMetrics = ctx.measureText(badgeText);
    const badgePaddingX = 14;
    const badgeHeight = 32;
    const badgeWidth = textMetrics.width + badgePaddingX * 2;
    const badgeX = imageX + imageWidth - 14 - badgeWidth;
    const badgeY = imageY + imageHeight - 14 - badgeHeight;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 16);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
  }
  ctx.restore();

  // 作者信息
  const author = getUserById(post?.authorId);
  const authorName = author?.name || '社区用户';
  const avatarX = 44;
  const avatarY = 436;
  const avatarRadius = 24;
  ctx.beginPath();
  ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#f1f2f4';
  ctx.fill();

  if (author?.avatar) {
    try {
      const avatar = new Image();
      await new Promise((resolve, reject) => {
        avatar.onload = resolve;
        avatar.onerror = reject;
        avatar.src = new URL(author.avatar, new URL(import.meta.env.BASE_URL, window.location.href)).href;
      });
      const avatarScale = Math.max(48 / avatar.width, 48 / avatar.height);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        avatar,
        avatarX + (48 - avatar.width * avatarScale) / 2,
        avatarY + (48 - avatar.height * avatarScale) / 2,
        avatar.width * avatarScale,
        avatar.height * avatarScale
      );
      ctx.restore();
    } catch { /* 头像不可用时显示默认圆形 */ }
  }

  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(authorName, 104, avatarY + avatarRadius, 480);

  // 标题（最多2行）
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 27px sans-serif';
  ctx.textBaseline = 'alphabetic';
  const titleLines = wrapCanvasText(ctx, post?.title || '社区帖子', 548, 2);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, 44, 526 + index * 38);
  });
  const titleBottomY = 526 + (titleLines.length - 1) * 38;

  // 正文（最多3行）
  let currentY = titleBottomY + 30;
  if (post?.content) {
    ctx.fillStyle = '#4b5563';
    ctx.font = '17px sans-serif';
    const contentLines = wrapCanvasText(ctx, post.content, 548, 3);
    contentLines.forEach((line) => {
      ctx.fillText(line, 44, currentY);
      currentY += 27;
    });
    currentY += 4;
  }

  // 发布时间
  ctx.fillStyle = '#9ca3af';
  ctx.font = '15px sans-serif';
  ctx.fillText(`${post?.date || ''} 发布`, 44, Math.min(currentY + 16, 734), 548);

  // 底部粉色区域左侧：品牌标 + 扫码提示
  ctx.save();
  ctx.fillStyle = '#e02424';
  drawRoundedRect(ctx, 44, 818, 92, 26, 6);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SanVIST', 44 + 46, 818 + 13);
  ctx.restore();

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('扫码查看完整帖子', 44, 858);

  // 底部粉色区域右侧：真实二维码（编码完整帖子深链）
  const qr = QRCode.create(shareUrl, { errorCorrectionLevel: 'M' });
  const qrSize = qr.modules.size;
  const qrBoxSize = 144;
  const qrBoxX = 640 - 44 - qrBoxSize;
  const qrBoxY = 788;

  ctx.save();
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 12);
  ctx.fill();

  const cell = Math.floor(128 / (qrSize + 2));
  const renderedSize = cell * qrSize;
  const qrInnerX = qrBoxX + Math.floor((qrBoxSize - renderedSize) / 2);
  const qrInnerY = qrBoxY + Math.floor((qrBoxSize - renderedSize) / 2);

  ctx.fillStyle = '#111827';
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (qr.modules.get(row, col)) {
        ctx.fillRect(qrInnerX + col * cell, qrInnerY + row * cell, cell, cell);
      }
    }
  }
  ctx.restore();

  return canvas.toDataURL('image/png');
};

export const getPostShareUrl = (postId) => {
  if (typeof window === 'undefined') return '';
  try {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('postId', String(postId));
    return url.toString();
  } catch {
    const base = window.location.origin + window.location.pathname;
    return `${base}?postId=${postId}`;
  }
};

export const parsePostIdFromUrl = () => {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('postId');
    if (pid) return pid;
  } catch { /* ignore */ }
  try {
    const hash = window.location.hash || '';
    const match = hash.match(/(?:post[/-]|postId=)(\d+)/i);
    if (match) return match[1];
  } catch { /* ignore */ }
  return null;
};

export const syncPostIdToUrl = (postId) => {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('postId') !== String(postId)) {
      url.searchParams.set('postId', String(postId));
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  } catch { /* ignore */ }
};

export const clearPostIdFromUrl = () => {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('postId')) {
      url.searchParams.delete('postId');
      const search = url.search ? url.search : '';
      window.history.replaceState({}, '', url.pathname + search + url.hash);
    }
  } catch { /* ignore */ }
};

const SHARE_STORAGE_PREFIX = 'sanvist_post_shares_';

const getStoredShareCount = (postId) => {
  if (typeof window === 'undefined' || !postId) return null;
  try {
    const val = window.localStorage.getItem(SHARE_STORAGE_PREFIX + postId);
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (Number.isFinite(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return null;
};

const setStoredShareCount = (postId, count) => {
  if (typeof window === 'undefined' || !postId) return;
  try {
    window.localStorage.setItem(SHARE_STORAGE_PREFIX + postId, String(count));
  } catch { /* ignore */ }
};

const calculateInitialShareCount = (post) => {
  const stored = getStoredShareCount(post?.id);
  if (stored !== null) return stored;
  if (Number.isFinite(post?.shareCount)) return post.shareCount;
  if (Number.isFinite(post?.shares)) return post.shares;
  return 0;
};

const PostDetail = ({ post, onBack, onTopicClick, onDelete, targetCommentId, targetStatus, demoMode = false, onRequireLogin }) => {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(getCommentsByPostId(post.id));
  const [expandedRoots, setExpandedRoots] = useState(() => new Set(targetCommentId ? [targetCommentId] : []));
  const [replyTarget, setReplyTarget] = useState(null);
  const [commentSort, setCommentSort] = useState('default');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [expandedAllRoots, setExpandedAllRoots] = useState(() => new Set());
  const [expandedComments, setExpandedComments] = useState(() => new Set());
  const [following, setFollowing] = useState(isFollowing(post.authorId));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // 分享状态管理（使用本地持久计数，避免直接改动 post props）
  const [shareCount, setShareCount] = useState(() => calculateInitialShareCount(post));
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showPosterPreview, setShowPosterPreview] = useState(false);
  const [posterDataUrl, setPosterDataUrl] = useState('');
  const [previewQrUrl, setPreviewQrUrl] = useState('');
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [posterFailureInfo, setPosterFailureInfo] = useState(null);
  const [showPosterFailureAlert, setShowPosterFailureAlert] = useState(false);
  const [copyFailureInfo, setCopyFailureInfo] = useState(null);
  const [channelAlert, setChannelAlert] = useState('');
  const channelAlertTimerRef = useRef(null);

  // 状态隔离令牌（REVIEW-005）：生成海报、链接/渠道分享、保存图片相互解耦
  const posterGenAttemptRef = useRef(0);
  const linkShareAttemptRef = useRef(0);
  const saveImageAttemptRef = useRef(0);
  const previewSessionRef = useRef(0);

  const channelShareBusyRef = useRef(false);
  const copyBusyRef = useRef(false);
  const isSavingImageRef = useRef(false);
  const shareTriggerRef = useRef(null);
  const posterDialogRef = useRef(null);
  const posterCloseBtnRef = useRef(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const detailRootRef = useRef(null);

  const showChannelAlert = (msg) => {
    if (channelAlertTimerRef.current) clearTimeout(channelAlertTimerRef.current);
    setChannelAlert(msg);
    if (msg) {
      channelAlertTimerRef.current = window.setTimeout(() => {
        setChannelAlert('');
      }, 4000);
    }
  };

  useEffect(() => {
    setActiveImageIndex(0);
    previewSessionRef.current += 1;
    posterGenAttemptRef.current += 1;
    linkShareAttemptRef.current += 1;
    saveImageAttemptRef.current += 1;
    channelShareBusyRef.current = false;
    copyBusyRef.current = false;
    isSavingImageRef.current = false;
    setIsGeneratingPoster(false);
    setIsSavingImage(false);
    setPosterFailureInfo(null);
    setShowPosterFailureAlert(false);
    setCopyFailureInfo(null);
    setChannelAlert('');
    if (channelAlertTimerRef.current) clearTimeout(channelAlertTimerRef.current);
    setShowShareSheet(false);
    setShowPosterPreview(false);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      setToastMessage('');
    }
    return () => {
      previewSessionRef.current += 1;
      posterGenAttemptRef.current += 1;
      linkShareAttemptRef.current += 1;
      saveImageAttemptRef.current += 1;
      if (channelAlertTimerRef.current) clearTimeout(channelAlertTimerRef.current);
    };
  }, [post?.id]);

  // 当海报预览打开时锁定背景滚动并恢复原样式，支持 Escape 键关闭与 Tab 循环焦点陷阱
  useEffect(() => {
    if (!showPosterPreview) return;
    const target = detailRootRef.current?.closest('[data-phone-screen]') || (typeof document !== 'undefined' ? document.body : null);
    if (!target) return;
    const originalOverflow = target.style.overflow;
    target.style.overflow = 'hidden';

    // 聚焦于关闭/返回按钮
    posterCloseBtnRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseShare();
        return;
      }
      if (e.key === 'Tab') {
        const dialogEl = posterDialogRef.current;
        if (!dialogEl) return;
        const focusable = dialogEl.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      target.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPosterPreview]);

  // 内部异常模式触发（URL参数 ?mockShare=copy_fail / ?mockShare=image_fail 等）
  const getActiveMockScenario = () => {
    if (typeof window !== 'undefined') {
      try {
        const p = new URLSearchParams(window.location.search).get('mockShare');
        if (p) return p;
      } catch { /* ignore */ }
    }
    return null;
  };

  // 评论加载与轻提示
  const [commentLoadError, setCommentLoadError] = useState(targetStatus === 'comment_error');
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef(null);

  const commentSectionRef = useRef(null);
  const commentInputRef = useRef(null);
  const targetCommentRef = useRef(null);

  const topic = getTopicById(post.topicId);
  const author = getUserById(post.authorId);
  const currentUser = getCurrentUser();
  const isOwnPost = post.authorId === currentUser.id;

  // 仅审核未通过、待审核或已删除的帖子不可分享；评论被删除不影响仍公开的帖子分享
  const isPostShareable = !(
    post.auditStatus === 'rejected' ||
    post.auditStatus === 'pending' ||
    post.status === 'deleted' ||
    post.isPublic === false ||
    post.visibility === 'private' ||
    post.visibility === 'hidden'
  );

  const showToast = (message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setShareCount(calculateInitialShareCount(post));
  }, [post]);

  const incrementShareCount = () => {
    setShareCount((prev) => {
      const next = prev + 1;
      if (post?.id) {
        setStoredShareCount(post.id, next);
      }
      return next;
    });
  };

  // 点击分享：直接进入海报预览并异步生成海报与二维码（SHARE-UX-005 / SHARE-UX-006）
  const handleShareClick = () => {
    if (!isPostShareable) {
      showToast('该帖子暂不可分享（待审核/未通过或已删除）');
      return;
    }
    previewSessionRef.current += 1;
    posterGenAttemptRef.current += 1;
    linkShareAttemptRef.current += 1;
    saveImageAttemptRef.current += 1;
    channelShareBusyRef.current = false;
    copyBusyRef.current = false;
    isSavingImageRef.current = false;
    setIsGeneratingPoster(false);
    setIsSavingImage(false);
    setPosterFailureInfo(null);
    setShowPosterFailureAlert(false);
    setCopyFailureInfo(null);
    setChannelAlert('');
    if (channelAlertTimerRef.current) clearTimeout(channelAlertTimerRef.current);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      setToastMessage('');
    }
    setShowShareSheet(false);
    setShowPosterPreview(true);
    startPosterGeneration();
  };

  // 异步生成用于页面内预览的真实二维码及下载用海报（链接类操作立即可用，不被阻塞；带独立失效令牌）
  const startPosterGeneration = async () => {
    if (!isPostShareable) return;
    const targetPostId = post?.id;
    const currentSession = previewSessionRef.current;
    const attempt = ++posterGenAttemptRef.current;

    setIsGeneratingPoster(true);
    setPreviewQrUrl('');
    setPosterDataUrl('');
    setPosterFailureInfo(null);
    setShowPosterFailureAlert(false);

    const shareUrl = getPostShareUrl(post.id);
    const mockScenario = getActiveMockScenario();

    try {
      if (mockScenario === 'image_fail') {
        throw new Error('模拟海报生成受限');
      }

      // 生成用于页面内预览的真实二维码
      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        margin: 1,
        width: 200,
        errorCorrectionLevel: 'M',
      });
      if (attempt !== posterGenAttemptRef.current || post?.id !== targetPostId || previewSessionRef.current !== currentSession) return;
      setPreviewQrUrl(qrDataUrl);

      // 预生成海报用于下载
      const dataUrl = await generatePostPoster(post, shareUrl);
      if (attempt !== posterGenAttemptRef.current || post?.id !== targetPostId || previewSessionRef.current !== currentSession) return;
      setPosterDataUrl(dataUrl);

      setIsGeneratingPoster(false);
    } catch {
      if (attempt !== posterGenAttemptRef.current || post?.id !== targetPostId || previewSessionRef.current !== currentSession) return;
      setIsGeneratingPoster(false);
      setPosterFailureInfo({
        message: '图片生成失败，请重试',
        manualUrl: shareUrl,
        canRetryPoster: true,
      });
      setShowPosterFailureAlert(true);
      showToast('图片生成失败，请重试');
    }
  };

  const handleCloseShare = () => {
    previewSessionRef.current += 1;
    posterGenAttemptRef.current += 1;
    linkShareAttemptRef.current += 1;
    saveImageAttemptRef.current += 1;
    channelShareBusyRef.current = false;
    copyBusyRef.current = false;
    isSavingImageRef.current = false;
    setIsGeneratingPoster(false);
    setIsSavingImage(false);
    setShowShareSheet(false);
    setShowPosterPreview(false);
    setPosterFailureInfo(null);
    setShowPosterFailureAlert(false);
    setCopyFailureInfo(null);
    setChannelAlert('');
    if (channelAlertTimerRef.current) clearTimeout(channelAlertTimerRef.current);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      setToastMessage('');
    }
    // 恢复焦点至分享触发点（使用 preventScroll 避免背景滚动跳跃）
    if (shareTriggerRef.current && typeof shareTriggerRef.current.focus === 'function') {
      try {
        shareTriggerRef.current.focus({ preventScroll: true });
      } catch {
        /* ignore focus failure */
      }
    }
  };

  const handleGeneratePosterClick = () => {
    setShowShareSheet(false);
    setShowPosterPreview(true);
    startPosterGeneration();
  };

  // 渠道分享（SHARE-UX-006：简洁友好、可消失或关闭、不挤压海报、不显示裸链接）
  const handleChannelShare = async (channel) => {
    if (!isPostShareable) {
      showToast('该帖子暂不可分享（待审核/未通过或已删除）');
      return;
    }
    if (channelShareBusyRef.current || copyBusyRef.current || isSavingImage) return;
    const targetPostId = post?.id;
    const currentSession = previewSessionRef.current;
    const payload = buildPostLinkPayload(post, getPostShareUrl(post.id));
    const attempt = ++linkShareAttemptRef.current;
    channelShareBusyRef.current = true;

    if (channel === 'whatsapp') {
      const result = openWhatsAppLink(payload, window.open.bind(window));
      if (attempt !== linkShareAttemptRef.current || post?.id !== targetPostId || previewSessionRef.current !== currentSession) {
        channelShareBusyRef.current = false;
        return;
      }
      if (result === 'opened') {
        showChannelAlert('');
      } else {
        showChannelAlert('暂时无法分享到 WhatsApp，可复制链接或保存图片后分享。');
      }
    } else {
      const result = await shareLinkWithSystem(payload, navigator);
      if (attempt !== linkShareAttemptRef.current || post?.id !== targetPostId || previewSessionRef.current !== currentSession) {
        channelShareBusyRef.current = false;
        return;
      }
      if (result === 'unsupported' || result === 'failed') {
        showChannelAlert('暂时无法分享到微信，可复制链接或保存图片后分享。');
      } else if (result === 'cancelled') {
        showChannelAlert('');
        // 取消系统分享不显示误导提示，不报错，不增加计数
      } else {
        // returned
        showChannelAlert('');
      }
    }
    channelShareBusyRef.current = false;
  };

  // 复制链接：真实剪贴板成功才递增本地持久计数 +1，失败仍提供手动复制链接及重试（SHARE-UX-006）
  const handleCopyLink = async () => {
    if (channelShareBusyRef.current || copyBusyRef.current || isSavingImage) return;
    const targetPostId = post?.id;
    const currentSession = previewSessionRef.current;
    const attempt = ++linkShareAttemptRef.current;
    copyBusyRef.current = true;
    setCopyFailureInfo(null);

    const shareUrl = getPostShareUrl(post.id);
    const mockScenario = getActiveMockScenario();
    let writeSucceeded = false;

    if (mockScenario !== 'copy_fail') {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(shareUrl);
          writeSucceeded = true;
        } catch {
          writeSucceeded = false;
        }
      }
    }

    copyBusyRef.current = false;
    // 迟到保护：若用户已关闭、切换帖子或重开新会话，不执行关闭与重复操作
    if (attempt !== linkShareAttemptRef.current || post?.id !== targetPostId || previewSessionRef.current !== currentSession) {
      return;
    }

    if (!writeSucceeded) {
      setCopyFailureInfo({
        message: '复制链接失败，请重试或手动复制链接',
        manualUrl: shareUrl,
        canRetryCopy: true,
      });
      showToast('复制链接失败，请重试或手动复制链接');
      return;
    }

    setCopyFailureInfo(null);
    incrementShareCount();
    showToast('帖子链接已复制');
  };

  // 保存图片：仅在 posterDataUrl 已就绪时启用，防重复提交并具备明确忙态判定（REVIEW-006）
  const handleSaveImage = async () => {
    if (!posterDataUrl || isGeneratingPoster || isSavingImage || isSavingImageRef.current) return;
    const targetPostId = post?.id;
    const currentSession = previewSessionRef.current;
    const attempt = ++saveImageAttemptRef.current;
    isSavingImageRef.current = true;
    setIsSavingImage(true);

    try {
      const link = document.createElement('a');
      link.download = `SanVIST-Post-${post.id}.png`;
      link.href = posterDataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      if (attempt === saveImageAttemptRef.current && post?.id === targetPostId && previewSessionRef.current === currentSession) {
        showToast('图片已保存');
      }
    } catch {
      if (attempt === saveImageAttemptRef.current && post?.id === targetPostId && previewSessionRef.current === currentSession) {
        showToast('保存图片失败，请重试');
      }
    } finally {
      if (attempt === saveImageAttemptRef.current && post?.id === targetPostId && previewSessionRef.current === currentSession) {
        isSavingImageRef.current = false;
        setIsSavingImage(false);
      }
    }
  };

  const handleLike = () => {
    if (demoMode) {
      onRequireLogin?.();
      return;
    }
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
  };

  const handleFollow = () => {
    if (demoMode) {
      onRequireLogin?.();
      return;
    }
    const nowFollowing = toggleFollow(post.authorId);
    setFollowing(nowFollowing);
  };

  // 点击评论按钮 → 滚动到评论区并聚焦输入框
  const handleCommentClick = () => {
    if (demoMode) {
      onRequireLogin?.();
      return;
    }
    commentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => commentInputRef.current?.focus(), 350);
  };

  const handleSubmitComment = () => {
    if (demoMode) {
      onRequireLogin?.();
      return;
    }
    const trimmed = commentText.trim();
    if (!trimmed) return;
    const newComment = addComment(post.id, trimmed, replyTarget ? {
      rootCommentId: replyTarget.rootCommentId,
      parentCommentId: replyTarget.id,
      replyToUserId: replyTarget.userId,
    } : {});
    setComments((prev) => [...prev, newComment]);
    setCommentText('');
    setReplyTarget(null);
    if (newComment.rootCommentId) {
      setExpandedRoots((prev) => new Set(prev).add(newComment.rootCommentId));
    }
  };

  const handleReply = (comment) => {
    if (demoMode) {
      onRequireLogin?.();
      return;
    }
    const rootCommentId = comment.rootCommentId || comment.id;
    setReplyTarget({ ...comment, rootCommentId });
    setExpandedRoots((prev) => new Set(prev).add(rootCommentId));
    window.setTimeout(() => commentInputRef.current?.focus(), 50);
  };

  const handleCommentLike = (commentId) => {
    if (demoMode) {
      onRequireLogin?.();
      return;
    }
    setComments((prev) => prev.map((comment) => {
      if (comment.id !== commentId) return comment;
      const isLiked = !comment.isLiked;
      return { ...comment, isLiked, likeCount: Math.max(0, (comment.likeCount || 0) + (isLiked ? 1 : -1)) };
    }));
  };

  const requestDeleteComment = (comment) => {
    if (comment.userId !== currentUser.id) return;
    setCommentToDelete(comment);
  };

  const handleDeleteCommentConfirm = () => {
    if (!commentToDelete || !deleteComment(commentToDelete.id)) {
      setCommentToDelete(null);
      return;
    }
    const rootId = commentToDelete.rootCommentId || commentToDelete.id;
    setComments((prev) => prev.filter((comment) => (
      commentToDelete.parentCommentId
        ? comment.id !== commentToDelete.id
        : comment.id !== commentToDelete.id && (comment.rootCommentId || comment.id) !== rootId
    )));
    setExpandedRoots((prev) => {
      const next = new Set(prev);
      next.delete(rootId);
      return next;
    });
    if (replyTarget?.id === commentToDelete.id) setReplyTarget(null);
    setCommentToDelete(null);
  };

  const isLongComment = (comment) => (comment.content || '').length > 80;
  const toggleCommentExpanded = (commentId) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const repliesByRoot = comments.reduce((groups, comment) => {
    if (!comment.parentCommentId) return groups;
    const rootId = comment.rootCommentId || comment.parentCommentId;
    groups[rootId] = [...(groups[rootId] || []), comment];
    return groups;
  }, {});
  const rootComments = comments
    .filter((comment) => !comment.parentCommentId)
    .sort((a, b) => {
      if (commentSort === 'latest') return (b.id || 0) - (a.id || 0);
      if (commentSort === 'likes') return (b.likeCount || 0) - (a.likeCount || 0);
      const aScore = (a.likeCount || 0) + (repliesByRoot[a.rootCommentId || a.id]?.length || 0) * 2;
      const bScore = (b.likeCount || 0) + (repliesByRoot[b.rootCommentId || b.id]?.length || 0) * 2;
      return bScore - aScore;
    });

  useEffect(() => {
    if (!targetCommentId) return;
    const target = comments.find((comment) => comment.id === targetCommentId);
    if (!target) return;
    const rootId = target.rootCommentId || target.id;
    setExpandedRoots((prev) => new Set(prev).add(rootId));
    window.setTimeout(() => targetCommentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
  }, [targetCommentId, comments]);

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (demoMode) {
        onRequireLogin?.();
        return;
      }
      handleSubmitComment();
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDelete?.(post.id);
  };

  const isVideo = post.type === 'video';
  const postImages = Array.isArray(post.images) && post.images.length > 0
    ? post.images
    : (post.image ? [post.image] : []);
  const currentImageSrc = postImages[activeImageIndex] || post.image;
  const mainImageSrc = postImages[0] || post.image;

  return (
    <div ref={detailRootRef} className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* 顶部导航栏 */}
      <div className="flex-shrink-0 flex items-center h-[44px] px-4 border-b border-gray-100 bg-white">
        <div className="cursor-pointer mr-3" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </div>
        <span className="text-[16px] font-medium text-gray-900 flex-1 truncate">帖子详情</span>
        <div className="w-[20px]"></div>
      </div>

      {/* 可滚动内容区 */}
      <div className="flex-1 overflow-y-auto">
        {/* 图片/视频区域 */}
        <div className="relative bg-black select-none">
          <img
            src={currentImageSrc}
            alt={`${post.title}${postImages.length > 1 ? ` (${activeImageIndex + 1}/${postImages.length})` : ''}`}
            className="w-full h-[260px] object-cover"
          />

          {/* 多图模式：右上角页码角标、左右切换按钮、底部指示圆点 */}
          {postImages.length > 1 && (
            <>
              {/* 右上角角标：当前页 / 总页数 */}
              <div className="absolute top-3 right-3 bg-black/60 text-white text-[12px] px-2.5 py-0.5 rounded-full font-medium tabular-nums shadow-sm pointer-events-none">
                {activeImageIndex + 1}/{postImages.length}
              </div>

              {/* 左切换箭头 */}
              <button
                type="button"
                aria-label="查看上一张图片"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 active:scale-95 transition-all"
                onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : postImages.length - 1))}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {/* 右切换箭头 */}
              <button
                type="button"
                aria-label="查看下一张图片"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 active:scale-95 transition-all"
                onClick={() => setActiveImageIndex((prev) => (prev < postImages.length - 1 ? prev + 1 : 0))}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* 底部指示圆点 */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                {postImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`跳转到第 ${idx + 1} 张图片`}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
                    }`}
                    onClick={() => setActiveImageIndex(idx)}
                  />
                ))}
              </div>
            </>
          )}

          {isVideo && (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                    <path d="M4 2L14 8L4 14V2Z" fill="white"/>
                  </svg>
                </div>
              </div>
              {post.duration && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[12px] px-2 py-0.5 rounded font-medium tabular-nums">
                  {post.duration}
                </div>
              )}
            </>
          )}
          <ViewCountBadge views={post.views} />
        </div>

        {/* 内容信息 */}
        <div className="px-4 pt-3 pb-2">
          {/* 标题 */}
          <h1 className="text-[17px] font-bold text-gray-900 leading-[1.4] mb-3 break-words">
            {post.title}
          </h1>

          {/* 正文 */}
          <div className="text-[14px] text-gray-700 leading-[1.7]">
            {post.content || '这是一篇社区帖子，分享关于工程机械的经验和见解。'}
          </div>

          {/* 话题标签 - 正文末尾 */}
          {topic && (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <span
                className="text-[13px] text-brand-red cursor-pointer hover:underline"
                onClick={() => onTopicClick?.(topic.name)}
              >
                # {topic.name}
              </span>
            </div>
          )}

          {post.auditStatus === 'rejected' && post.auditReason && (
            <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-brand-red">审核未通过</span>
              </div>
              <p className="mt-1.5 text-[12px] leading-[1.6] text-gray-600">未通过原因：{post.auditReason}</p>
            </div>
          )}
          {targetStatus === 'comment_deleted' && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[12px] text-gray-500" role="status">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
              <span>该内容已删除</span>
            </div>
          )}
        </div>

        {/* 作者信息区域 */}
        {author && (
          <div className="px-4 py-3 border-t border-gray-50">
            <div className="flex items-center gap-3">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-medium text-gray-900 truncate">{author.name}</span>
                  {author.isOfficial && (
                    <span className="flex-shrink-0 text-[10px] font-medium text-brand-red bg-red-50 px-1.5 py-0.5 rounded leading-tight">官方</span>
                  )}
                </div>
                <div className="text-[12px] text-gray-500">{post.date} 发布</div>
              </div>
              {/* 关注按钮 - 仅其他用户显示 */}
              {!isOwnPost && (
                <div
                  className={`px-4 py-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors ${
                    following
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-brand-red text-white'
                  }`}
                  onClick={handleFollow}
                >
                  {following ? '已关注' : '关注'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 海报生成失败或复制链接失败时的当前页面恢复入口（不能只给 Toast） */}
        {(posterFailureInfo || copyFailureInfo) && !showPosterPreview && !showShareSheet && (
          <div className="mx-4 my-2.5 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-[12px] text-amber-900 shadow-sm" role="alert">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-amber-900">
                {(posterFailureInfo || copyFailureInfo).message}
              </span>
              <button
                type="button"
                className="p-1 text-amber-600 hover:text-amber-800"
                aria-label="关闭恢复提示"
                onClick={() => {
                  setPosterFailureInfo(null);
                  setCopyFailureInfo(null);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            {copyFailureInfo?.manualUrl && (
              <input
                type="text"
                readOnly
                value={copyFailureInfo.manualUrl}
                onClick={(event) => event.target.select()}
                aria-label="帖子链接，可手动复制"
                className="mt-2 w-full rounded border border-amber-300 bg-white px-2 py-1.5 text-[11px] text-gray-700 select-all font-mono"
              />
            )}
            <div className="mt-2.5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopyLink}
                disabled={channelShareBusyRef.current || copyBusyRef.current || isSavingImage}
                className="rounded-lg bg-brand-red px-3 py-1.5 text-[12px] font-medium text-white shadow-sm active:bg-red-700 disabled:opacity-50"
              >
                复制帖子链接
              </button>
              <button
                type="button"
                onClick={handleGeneratePosterClick}
                disabled={isGeneratingPoster || isSavingImage}
                className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-[12px] font-medium text-amber-900 active:bg-amber-100 disabled:opacity-50"
              >
                重试生成海报
              </button>
            </div>
          </div>
        )}

        {/* 互动操作栏 - 点赞、评论、分享同级并列 */}
        <div className="px-4 py-3 flex items-center gap-6 border-t border-gray-50">
          {/* 点赞 */}
          <div
            className={`flex items-center gap-1.5 cursor-pointer select-none ${liked ? 'text-brand-red' : 'text-gray-600'}`}
            onClick={handleLike}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span className="text-[14px] tabular-nums">{likeCount}</span>
          </div>

          {/* 评论 - 点击滚动到评论区并聚焦输入框 */}
          <div
            className="flex items-center gap-1.5 cursor-pointer select-none text-gray-600"
            onClick={handleCommentClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-[14px] tabular-nums">{comments.length}</span>
          </div>

          {/* 分享 - 紧随评论，与点赞、评论同级并列 */}
          <div
            ref={shareTriggerRef}
            role="button"
            tabIndex={0}
            aria-label={isPostShareable ? '分享帖子' : '该帖子暂不可分享'}
            aria-disabled={!isPostShareable}
            className={`flex items-center gap-1.5 select-none transition-colors ${
              isPostShareable
                ? 'cursor-pointer text-gray-600 hover:text-gray-800'
                : 'cursor-not-allowed text-gray-300'
            }`}
            onClick={handleShareClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleShareClick();
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span className="text-[14px] tabular-nums">{shareCount}</span>
          </div>

          {/* 删除 - 仅本人帖子显示，紧随分享操作 */}
          {isOwnPost && (
            <button
              type="button"
              className="flex items-center gap-1.5 cursor-pointer select-none text-brand-red"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18"/>
                <path d="M8 6V4h8v2"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v5M14 11v5"/>
              </svg>
              <span className="text-[14px]">删除</span>
            </button>
          )}
        </div>

        {/* 浏览量统计 - 仅文字 */}
        <div className="px-4 pb-2 text-[12px] text-gray-400">
          {post.views.toLocaleString()} 浏览
        </div>

        {/* 评论区域 */}
        <div
          ref={commentSectionRef}
          className="px-4 pt-3 pb-4 border-t border-gray-100"
          onClick={(event) => {
            if (event.target === event.currentTarget && replyTarget) setReplyTarget(null);
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-medium text-gray-900">评论 ({comments.length})</h3>
            <div role="group" aria-label="评论排序">
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-1 text-[12px] text-gray-500"
                aria-haspopup="menu"
                aria-expanded={sortMenuOpen}
                onClick={() => setSortMenuOpen((open) => !open)}
              >
                {commentSort === 'latest' ? '最新' : commentSort === 'likes' ? '最多点赞' : '默认'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {sortMenuOpen && (
                <div className="absolute right-0 top-7 z-20 w-[128px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-[0_8px_24px_rgba(15,23,42,0.14)]" role="menu">
                  {[
                    { key: 'default', label: '默认' },
                    { key: 'latest', label: '最新' },
                    { key: 'likes', label: '最多点赞' },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      role="menuitemradio"
                      aria-checked={commentSort === option.key}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] text-gray-700 active:bg-gray-50"
                      onClick={() => { setCommentSort(option.key); setSortMenuOpen(false); }}
                    >
                      <span>{option.label}</span>
                      {commentSort === option.key && <span className="text-brand-red text-[16px] leading-none">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>

          {commentLoadError ? (
            <div className="py-8 text-center" role="alert">
              <div className="text-[13px] text-gray-500 mb-2">评论加载失败，请检查网络后重试</div>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-[12px] text-gray-700 active:bg-gray-50 shadow-sm"
                onClick={() => setCommentLoadError(false)}
              >
                重新加载
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-[13px]" dir="auto">
              暂无评论，快来抢沙发吧
            </div>
          ) : (
            <div className="space-y-5">
              {rootComments.map((c) => {
                const rootId = c.rootCommentId || c.id;
                const isTargetRoot = targetCommentId === c.id || targetCommentId === rootId;
                const replies = repliesByRoot[rootId] || [];
                const visibleReplies = expandedAllRoots.has(rootId) ? replies : replies.slice(0, 5);
                return (
                <div key={c.id} ref={isTargetRoot ? targetCommentRef : undefined} className={isTargetRoot ? 'rounded-lg bg-red-50/70 p-2 ring-1 ring-brand-red/30' : ''}>
                <div className="flex gap-2.5">
                  <img
                    src={c.userAvatar}
                    alt={c.userName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[12px] font-normal text-gray-500 truncate" dir="auto">{c.userName}</span>
                      <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{c.time}</span>
                    </div>
                    <div className="relative text-[14px] font-normal text-gray-900 leading-[1.6] break-words" dir="auto">
                      {c.status === 'deleted' ? (
                        <div className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 text-[12px] text-gray-400 leading-[1.5]">该评论已被删除，涉嫌违规：{c.deleteReason || '违规内容'}</div>
                      ) : <>
                        <div style={isLongComment(c) && !expandedComments.has(c.id) ? { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden', paddingRight: '38px' } : undefined}>{c.content}</div>
                        {isLongComment(c) && <button type="button" className="absolute bottom-0 right-0 bg-white pl-1 text-brand-red text-[13px]" onClick={() => toggleCommentExpanded(c.id)}>{expandedComments.has(c.id) ? '收起' : '...展开'}</button>}
                      </>}
                    </div>
                    {c.status !== 'deleted' && <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
                      <button type="button" className="hover:text-brand-red" onClick={() => handleReply(c)}>回复</button>
                      <button
                        type="button"
                        aria-label={c.isLiked ? '取消点赞评论' : '点赞评论'}
                        className={`inline-flex items-center gap-1 hover:text-brand-red ${c.isLiked ? 'text-brand-red' : ''}`}
                        onClick={() => handleCommentLike(c.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={c.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span>{c.likeCount || 0}</span>
                      </button>
                      {c.userId === currentUser.id && (
                        <button type="button" className="hover:text-brand-red" onClick={() => requestDeleteComment(c)}>删除</button>
                      )}
                    </div>}
                  </div>
                </div>
                {replies.length > 0 && (
                  <div className="ml-10 mt-2">
                    {!expandedRoots.has(rootId) ? (
                      <button type="button" className="text-[12px] text-brand-red" onClick={() => setExpandedRoots((prev) => new Set(prev).add(rootId))}>
                        展开 {replies.length} 条回复
                      </button>
                    ) : (
                      <>
                        <div className="space-y-3 border-l-2 border-gray-100 pl-3">
                          {visibleReplies.map((reply) => (
                            <div key={reply.id} ref={targetCommentId === reply.id ? targetCommentRef : undefined} className={`flex gap-2 ${targetCommentId === reply.id ? 'rounded-lg bg-red-50/70 p-1.5 ring-1 ring-brand-red/30' : ''}`}>
                              <img src={reply.userAvatar} alt={reply.userName} className="w-6 h-6 rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className="text-[11px] font-normal text-gray-500 truncate" dir="auto">{reply.userName}</span>
                                  <span className="text-[10px] text-gray-400 flex-shrink-0">{reply.time}</span>
                                </div>
                                <div
                                  className="relative mt-0.5 text-[13px] font-normal text-gray-900 leading-[1.5] break-words cursor-pointer"
                                  dir="auto"
                                  onClick={() => reply.status !== 'deleted' && handleReply(reply)}
                                >
                                  {reply.status === 'deleted' ? <div className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-[11px] text-gray-400 leading-[1.5]">该评论已被删除，涉嫌违规：{reply.deleteReason || '违规内容'}</div> : <div style={isLongComment(reply) && !expandedComments.has(reply.id) ? { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden', paddingRight: '38px' } : undefined}>
                                  {reply.replyToUserId && (
                                    <span
                                      className="text-brand-red mr-1 cursor-pointer font-medium"
                                      onClick={(event) => { event.stopPropagation(); handleReply({ ...reply, userId: reply.replyToUserId, userName: getUserById(reply.replyToUserId)?.name || '用户' }); }}
                                    >
                                      回复 @{getUserById(reply.replyToUserId)?.name || '用户'}
                                    </span>
                                  )}
                                  {reply.content}</div>}
                                  {reply.status !== 'deleted' && isLongComment(reply) && (
                                    <button type="button" className="absolute bottom-0 right-0 bg-white pl-1 text-brand-red text-[12px]" onClick={(event) => { event.stopPropagation(); toggleCommentExpanded(reply.id); }}>
                                      {expandedComments.has(reply.id) ? '收起' : '...展开'}
                                    </button>
                                  )}
                                </div>
                                {reply.status !== 'deleted' && <div className="flex items-center gap-4 mt-1.5 text-[11px] text-gray-400">
                                  <button type="button" className="hover:text-brand-red" onClick={() => handleReply(reply)}>回复</button>
                                  <button
                                    type="button"
                                    aria-label={reply.isLiked ? '取消点赞回复' : '点赞回复'}
                                    className={`inline-flex items-center gap-1 hover:text-brand-red ${reply.isLiked ? 'text-brand-red' : ''}`}
                                    onClick={() => handleCommentLike(reply.id)}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill={reply.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                    <span>{reply.likeCount || 0}</span>
                                  </button>
                                  {reply.userId === currentUser.id && (
                                    <button type="button" className="hover:text-brand-red" onClick={() => requestDeleteComment(reply)}>删除</button>
                                  )}
                                </div>}
                              </div>
                            </div>
                          ))}
                        </div>
                        {replies.length > 5 && !expandedAllRoots.has(rootId) && (
                          <button type="button" className="text-[12px] text-brand-red mt-2" onClick={() => setExpandedAllRoots((prev) => new Set(prev).add(rootId))}>展开更多回复</button>
                        )}
                        <button type="button" className="text-[12px] text-gray-400 mt-2 ml-3" onClick={() => setExpandedRoots((prev) => { const next = new Set(prev); next.delete(rootId); return next; })}>收起回复</button>
                      </>
                    )}
                  </div>
                )}
                </div>
              ); })}
            </div>
          )}
        </div>
      </div>

      {/* 底部固定区域 - 仅评论输入框和发送按钮 */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <input
            ref={commentInputRef}
            type="text"
            className="flex-1 h-[36px] bg-gray-100 rounded-full px-4 text-[13px] outline-none focus:ring-1 focus:ring-brand-red/30"
            placeholder={replyTarget ? `回复 @${replyTarget.userName}` : '写评论...'}
            value={commentText}
            maxLength={COMMENT_MAX_LENGTH}
            aria-label={replyTarget ? `回复 ${replyTarget.userName}` : '写评论'}
            onFocus={() => {
              if (demoMode) {
                commentInputRef.current?.blur();
                onRequireLogin?.();
              }
            }}
            onChange={(e) => {
              if (demoMode) {
                onRequireLogin?.();
                return;
              }
              setCommentText(e.target.value);
            }}
            onKeyDown={handleCommentKeyDown}
          />
          <div
            className={`px-4 h-[36px] flex items-center rounded-full cursor-pointer transition-colors ${
              commentText.trim() ? 'bg-brand-red text-white' : 'bg-gray-200 text-gray-400'
            }`}
            onClick={() => {
              if (demoMode) {
                onRequireLogin?.();
                return;
              }
              handleSubmitComment();
            }}
          >
            <span className="text-[13px]">发送</span>
          </div>
        </div>
      </div>

      {/* 删除二次确认 */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 z-[60] flex items-end bg-black/45 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-post-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4 text-center">
              <h2 id="delete-post-title" className="text-[17px] font-semibold text-gray-900">删除这条帖子？</h2>
              <p className="mt-2 text-[13px] leading-5 text-gray-500">删除后无法恢复，相关评论也会一并删除。</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                type="button"
                className="flex-1 py-3.5 text-[16px] text-gray-600 active:bg-gray-50"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="flex-1 border-l border-gray-100 py-3.5 text-[16px] font-medium text-brand-red active:bg-red-50"
                onClick={handleDeleteConfirm}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 评论/回复删除二次确认 */}
      {commentToDelete && (
        <div
          className="absolute inset-0 z-[65] flex items-end bg-black/45 p-4"
          onClick={() => setCommentToDelete(null)}
        >
          <div
            className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-comment-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4 text-center">
              <h2 id="delete-comment-title" className="text-[17px] font-semibold text-gray-900">删除这条评论？</h2>
              <p className="mt-2 text-[13px] leading-5 text-gray-500">删除后无法恢复，请确认是否继续。</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button type="button" className="flex-1 py-3.5 text-[16px] text-gray-600 active:bg-gray-50" onClick={() => setCommentToDelete(null)}>取消</button>
              <button type="button" className="flex-1 border-l border-gray-100 py-3.5 text-[16px] font-medium text-brand-red active:bg-red-50" onClick={handleDeleteCommentConfirm}>删除</button>
            </div>
          </div>
        </div>
      )}

      {/* 整屏“分享”页面（SHARE-UX-005：直达海报预览 + 底部单排四操作，通过 portal 挂载到手机屏幕容器） */}
      {showPosterPreview && (() => {
        const portalNode = detailRootRef.current?.closest('[data-phone-screen]') || (typeof document !== 'undefined' ? document.body : null);
        if (!portalNode) return null;

        return createPortal(
          <div
            ref={posterDialogRef}
            className="absolute inset-0 z-[75] flex flex-col bg-white overflow-hidden text-gray-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-page-title"
          >
            {/* 顶栏：返回原帖 + 标题“分享”（SHARE-UX-006） + 关闭按钮 */}
            <div className="flex-shrink-0 grid grid-cols-[36px_minmax(0,1fr)_36px] items-center px-4 pt-4 pb-2.5 bg-white border-b border-gray-100 relative z-10">
              <button
                type="button"
                onClick={handleCloseShare}
                aria-label="返回原帖"
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h2 id="share-page-title" className="text-[17px] font-semibold text-gray-900 text-center min-w-0 break-words">
                分享
              </h2>
              <div className="flex justify-end">
                <button
                  ref={posterCloseBtnRef}
                  type="button"
                  aria-label="关闭分享"
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 active:text-gray-900 rounded-full transition-colors"
                  onClick={handleCloseShare}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 中间区域悬浮提示集合容器（SHARE-UX-007 / REVIEW-007：对齐截图位置约70%文字与二维码交界，居中呈现，限制最大高度可滚动，多提示不重叠且不遮挡底部操作，适配窄屏与RTL） */}
            <div
              className="absolute top-[70%] -translate-y-1/2 max-h-[34%] left-3.5 right-3.5 z-40 flex flex-col items-center gap-2.5 pointer-events-none overflow-y-auto scrollbar-none"
              dir="auto"
            >
              {/* 轻提示 Toast（复制成功 / 保存成功 / 保存失败等） */}
              {toastMessage && (
                <div
                  role="status"
                  className="pointer-events-auto max-w-[90%] px-4 py-2 bg-black/85 text-white text-[12px] rounded-full shadow-2xl transition-all duration-200 text-center break-words backdrop-blur-sm ring-1 ring-white/10"
                  dir="auto"
                >
                  {toastMessage}
                </div>
              )}

              {/* 渠道调用提示（可消失或关闭、不显示裸链接、文案友好） */}
              {channelAlert && (
                <div
                  className="pointer-events-auto w-full max-w-[340px] rounded-xl bg-gray-900/90 text-white shadow-xl px-3.5 py-2.5 text-[12px] flex items-center justify-between gap-2.5 backdrop-blur-xs transition-opacity duration-200"
                  role="alert"
                  dir="auto"
                >
                  <span className="flex-1 leading-snug">{channelAlert}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (channelAlertTimerRef.current) clearTimeout(channelAlertTimerRef.current);
                      setChannelAlert('');
                    }}
                    aria-label="关闭提示"
                    className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white rounded-full transition-colors flex-shrink-0 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* 复制失败提示（保留手动复制选中文本框与重试按钮，可关闭） */}
              {copyFailureInfo && (
                <div
                  className="pointer-events-auto w-full max-w-[340px] rounded-xl bg-amber-50/95 border border-amber-200 p-3 text-[12px] text-amber-900 shadow-xl backdrop-blur-xs"
                  role="alert"
                  dir="auto"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-amber-900">{copyFailureInfo.message}</span>
                    <button
                      type="button"
                      onClick={() => setCopyFailureInfo(null)}
                      aria-label="关闭提示"
                      className="w-5 h-5 flex items-center justify-center text-amber-600 hover:text-amber-900 rounded-full flex-shrink-0 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {copyFailureInfo.manualUrl && (
                    <input
                      type="text"
                      readOnly
                      value={copyFailureInfo.manualUrl}
                      onClick={(event) => event.target.select()}
                      aria-label="帖子链接，可手动复制"
                      className="mt-2 w-full rounded border border-amber-300 bg-white px-2.5 py-1 text-[11px] text-gray-800 select-all font-mono"
                    />
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-block font-medium text-brand-red underline active:text-red-700 cursor-pointer"
                    >
                      重试复制链接
                    </button>
                  </div>
                </div>
              )}

              {/* 图片生成失败提示（关闭仅收起此浮层，不清除真实失败状态，重试入口始终保留） */}
              {showPosterFailureAlert && posterFailureInfo && (
                <div
                  className="pointer-events-auto w-full max-w-[340px] rounded-xl bg-amber-50/95 border border-amber-200 p-3 text-[12px] text-amber-800 shadow-xl backdrop-blur-xs"
                  role="alert"
                  dir="auto"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-amber-800">{posterFailureInfo.message}</span>
                    <button
                      type="button"
                      onClick={() => setShowPosterFailureAlert(false)}
                      aria-label="关闭提示"
                      className="w-5 h-5 flex items-center justify-center text-amber-600 hover:text-amber-800 rounded-full flex-shrink-0 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={startPosterGeneration}
                      className="inline-block font-medium text-brand-red underline active:text-red-700 cursor-pointer"
                    >
                      重试生成图片
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 白色内容全宽连续排版，自适应填满高度，长内容可滚动 */}
            <div className="min-h-0 flex-1 overflow-y-auto flex flex-col justify-between">
              {/* 上部：铺满边缘的首图 + 正常页边距的文本区 */}
              <div className="flex-1">
                {/* 首图：铺到页面左右边缘，取消圆角与阴影 */}
                <div className="relative w-full overflow-hidden bg-gray-100 select-none">
                  <img
                    src={mainImageSrc}
                    alt={post.title}
                    className="w-full h-[260px] object-cover"
                  />
                  {postImages.length > 1 && (
                    <div className="absolute right-3 bottom-3 rounded-full bg-black/65 backdrop-blur-xs px-2.5 py-0.5 text-[12px] font-medium text-white shadow-sm pointer-events-none select-none">
                      共{postImages.length}张
                    </div>
                  )}
                </div>

                {/* 作者 / 标题 / 摘要 / 日期：正常页边距，完整展示短文避免大块空白 */}
                <div className="px-5 pt-3.5 pb-4 space-y-3">
                  {/* 作者信息 */}
                  <div className="flex items-center gap-2.5">
                    <img
                      src={author?.avatar || 'images/机手社区/三一起重机/三一起重机_01.jpg'}
                      alt={author?.name || '社区用户'}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-100 flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="text-[14px] font-medium text-gray-800 truncate" dir="auto">
                      {author?.name || '社区用户'}
                    </span>
                  </div>

                  {/* 标题 */}
                  <h1 className="text-[18px] font-bold text-gray-900 leading-snug break-words" dir="auto">
                    {post.title}
                  </h1>

                  {/* 正文摘要：完整展示短正文，长文随页面自然滚动，不硬截断以消除大片空白 */}
                  {post.content && (
                    <p className="text-[14px] leading-[1.65] text-gray-600 break-words whitespace-pre-line" dir="auto">
                      {post.content}
                    </p>
                  )}

                  {/* 发布日期 */}
                  <div className="text-[12px] text-gray-400 pt-0.5">
                    {post.date} 发布
                  </div>
                </div>
              </div>

              {/* 粉色二维码区做全宽平直页脚（高度提升至约125–130px，二维码92px，文字相应放大，视觉重心更稳） */}
              <div className="w-full bg-[#fff5f6] border-t border-red-100/70 px-5 py-4 min-h-[128px] flex items-center justify-between gap-4 flex-shrink-0">
                <div className="flex-1 min-w-0 pr-1">
                  <div className="inline-flex items-center rounded-md px-2.5 py-1 bg-[#e02424] text-white text-[12px] font-bold tracking-tight shadow-2xs">
                    SanVIST
                  </div>
                  <div className="mt-2.5 text-[17px] font-bold text-gray-900 leading-tight">
                    扫码查看完整帖子
                  </div>
                </div>

                {/* 真实二维码：约 92px，去掉 rounded-xl/shadow/border 保持整栏平直；失败呈现明确不可用状态且内置重试入口（REVIEW-006） */}
                <div className="flex-shrink-0 w-[92px] h-[92px] bg-white p-1 flex items-center justify-center">
                  {previewQrUrl ? (
                    <img
                      src={previewQrUrl}
                      alt="帖子二维码"
                      className="w-full h-full object-contain"
                    />
                  ) : posterFailureInfo ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-amber-800 bg-amber-50 p-1 text-center leading-tight rounded">
                      <span className="font-medium">二维码不可用</span>
                      <button
                        type="button"
                        onClick={startPosterGeneration}
                        className="mt-1 text-[10px] text-brand-red font-medium underline active:text-red-700 cursor-pointer"
                      >
                        重试
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                      加载中…
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 底部固定操作栏：微信好友、WhatsApp、保存图片、复制链接（SHARE-UX-005） */}
            <div
              className="flex-shrink-0 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] px-3 pt-3"
              style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))' }}
            >
              <div className="overflow-x-auto scrollbar-none">
                <div className="flex items-start justify-between min-w-full gap-1.5 px-0.5">
                  {/* 微信好友 */}
                  <button
                    type="button"
                    onClick={() => handleChannelShare('wechat')}
                    disabled={channelShareBusyRef.current || copyBusyRef.current || isSavingImage}
                    aria-label="微信好友"
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
                    onClick={() => handleChannelShare('whatsapp')}
                    disabled={channelShareBusyRef.current || copyBusyRef.current || isSavingImage}
                    aria-label="WhatsApp"
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

                  {/* 保存图片：仅在 posterDataUrl 就绪时启用（REVIEW-006） */}
                  <button
                    type="button"
                    onClick={handleSaveImage}
                    disabled={!posterDataUrl || isGeneratingPoster || isSavingImage}
                    aria-label="保存图片"
                    className="group flex flex-col items-center gap-1.5 focus:outline-none disabled:opacity-50 cursor-pointer flex-1 min-w-[62px] max-w-[76px] shrink-0"
                  >
                    <div className="w-[52px] h-[52px] rounded-full bg-brand-red flex items-center justify-center text-white shadow-xs group-active:scale-95 transition-transform">
                      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                    <span className="text-[12px] text-gray-700 text-center leading-tight break-words max-w-full">
                      {isSavingImage ? '保存中…' : isGeneratingPoster ? '生成中…' : '保存图片'}
                    </span>
                  </button>

                  {/* 复制链接 */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={channelShareBusyRef.current || copyBusyRef.current || isSavingImage}
                    aria-label="复制链接"
                    className="group flex flex-col items-center gap-1.5 focus:outline-none disabled:opacity-50 cursor-pointer flex-1 min-w-[62px] max-w-[76px] shrink-0"
                  >
                    <div className="w-[52px] h-[52px] rounded-full bg-[#f3f4f6] border border-gray-200/60 flex items-center justify-center text-gray-700 shadow-xs group-active:scale-95 group-active:bg-gray-200 transition-all">
                      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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


          </div>,
          portalNode
        );
      })()}

      {/* 浮层 Toast - 仅在未打开全屏分享时于普通帖子底部展示 */}
      {!showPosterPreview && toastMessage && (
        <div
          role="status"
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[85] max-w-[85%] px-4 py-2 bg-black/85 text-white text-[12px] rounded-full shadow-2xl pointer-events-none transition-all duration-200 text-center break-words backdrop-blur-sm ring-1 ring-white/10"
          dir="auto"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default PostDetail;

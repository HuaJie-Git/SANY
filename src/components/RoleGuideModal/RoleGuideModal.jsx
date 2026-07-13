import React, { useState, useEffect, useRef, useCallback } from 'react';
import { trackRoleGuide } from '../../utils/tracking';

// 角色列表数据（固定顺序，不使用推荐算法重排）
const DEFAULT_ROLES = [
  { id: 'owner', name: '设备所有者', color: '#2196F3', iconType: 'house' },
  { id: 'manager', name: '设备管理员', color: '#9C27B0', iconType: 'gear' },
  { id: 'operator', name: '设备操作手', color: '#FF9800', iconType: 'joystick' },
  { id: 'dealer', name: '三一代理商', color: '#F44336', iconType: 'store' },
  { id: 'mechanic', name: '设备维修员', color: '#4CAF50', iconType: 'wrench' },
  { id: 'employee', name: '三一员工', color: '#1565C0', iconType: 'logo' },
];

// 角色SVG图标组件
const RoleIcon = ({ type, color, size = 64 }) => {
  const iconMap = {
    house: (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill={color} opacity="0.15" />
        <path d="M32 16L14 28V48C14 49.1 14.9 50 16 50H26V38H38V50H48C49.1 50 50 49.1 50 48V28L32 16Z" fill={color} />
        <rect x="26" y="38" width="12" height="12" fill="white" opacity="0.9" rx="1" />
      </svg>
    ),
    gear: (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill={color} opacity="0.15" />
        <path d="M32 20C28.7 20 26 22.7 26 26C26 29.3 28.7 32 32 32C35.3 32 38 29.3 38 26C38 22.7 35.3 20 32 20ZM32 29.5C30.1 29.5 28.5 27.9 28.5 26C28.5 24.1 30.1 22.5 32 22.5C33.9 22.5 35.5 24.1 35.5 26C35.5 27.9 33.9 29.5 32 29.5Z" fill={color} />
        <path d="M49 32C49 31.2 48.9 30.4 48.7 29.7L51 27.9V24.6L45.6 21.6L43.3 25.5C41.9 24.5 40.3 23.8 38.5 23.4L38 17.6H33L32.5 23.4C30.7 23.8 29.1 24.5 27.7 25.5L25.4 21.6L20 24.6V27.9L22.3 29.7C22.1 30.4 22 31.2 22 32C22 32.8 22.1 33.6 22.3 34.3L20 36.1V39.4L25.4 42.4L27.7 38.5C29.1 39.5 30.7 40.2 32.5 40.6L33 46.4H38L38.5 40.6C40.3 40.2 41.9 39.5 43.3 38.5L45.6 42.4L51 39.4V36.1L48.7 34.3C48.9 33.6 49 32.8 49 32ZM35.5 37.2C33 37.2 31 35.2 31 32.7C31 30.2 33 28.2 35.5 28.2C38 28.2 40 30.2 40 32.7C40 35.2 38 37.2 35.5 37.2Z" fill={color} />
      </svg>
    ),
    joystick: (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill={color} opacity="0.15" />
        <rect x="22" y="38" width="20" height="8" rx="4" fill={color} />
        <rect x="30" y="20" width="4" height="22" rx="2" fill={color} />
        <circle cx="32" cy="18" r="5" fill={color} />
        <circle cx="32" cy="18" r="3" fill="white" opacity="0.5" />
        <circle cx="24" cy="42" r="2" fill="white" opacity="0.6" />
        <circle cx="40" cy="42" r="2" fill="white" opacity="0.6" />
      </svg>
    ),
    wrench: (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill={color} opacity="0.15" />
        <path d="M46.5 17.5C43.3 14.3 38.1 14.3 34.9 17.5L17.5 34.9C14.3 38.1 14.3 43.3 17.5 46.5C20.7 49.7 25.9 49.7 29.1 46.5L46.5 29.1C49.7 25.9 49.7 20.7 46.5 17.5ZM31.8 43.2C29.1 45.9 24.7 45.9 22 43.2C19.3 40.5 19.3 36.1 22 33.4L33.4 22C36.1 19.3 40.5 19.3 43.2 22C45.9 24.7 45.9 29.1 43.2 31.8L31.8 43.2Z" fill={color} />
        <circle cx="40" cy="20" r="4" fill={color} opacity="0.6" />
      </svg>
    ),
    cart: (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill={color} opacity="0.15" />
        <path d="M20 20H24L30 40H42L48 24H26" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="32" cy="46" r="3" fill={color} />
        <circle cx="42" cy="46" r="3" fill={color} />
        <path d="M18 16H14" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    store: (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill={color} opacity="0.15" />
        <path d="M14 22V46C14 47.1 14.9 48 16 48H48C49.1 48 50 47.1 50 46V22H14Z" fill={color} />
        <path d="M12 22L16 14H48L52 22H12Z" fill={color} opacity="0.7" />
        <rect x="20" y="30" width="8" height="10" rx="1" fill="white" opacity="0.8" />
        <rect x="36" y="30" width="8" height="10" rx="1" fill="white" opacity="0.8" />
        <path d="M14 22L18 14" stroke="white" strokeWidth="1" opacity="0.3" />
        <path d="M50 22L46 14" stroke="white" strokeWidth="1" opacity="0.3" />
      </svg>
    ),
    logo: (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill={color} opacity="0.15" />
        <text x="32" y="38" textAnchor="middle" fill={color} fontSize="18" fontWeight="bold" fontFamily="Arial">SANY</text>
        <rect x="18" y="42" width="28" height="2" rx="1" fill={color} opacity="0.5" />
      </svg>
    ),
  };

  return iconMap[type] || null;
};

const RoleGuideModal = ({ visible, onClose, onConfirm }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const autoPlayRef = useRef(null);

  // 使用固定顺序的角色列表
  const ROLES = DEFAULT_ROLES;

  // 弹窗打开时，重置到第一个位置
  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      // 埋点：弹窗展示
      trackRoleGuide.modalShow(ROLES[0]?.id);
    }
  }, [visible]);

  // 自动轮播逻辑
  useEffect(() => {
    if (isAutoPlaying && visible) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ROLES.length);
      }, 3000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, visible]);

  // 触摸开始 - 停止自动轮播
  const handleTouchStart = useCallback((e) => {
    setIsAutoPlaying(false);
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
  }, []);

  // 触摸移动
  const handleTouchMove = useCallback((e) => {
    if (touchStart === null) return;
    const delta = e.touches[0].clientX - touchStart;
    setTouchDelta(delta);
  }, [touchStart]);

  // 触摸结束 - 切换卡片
  const handleTouchEnd = useCallback(() => {
    if (Math.abs(touchDelta) > 50) {
      const fromRole = ROLES[currentIndex]?.id;
      if (touchDelta > 0) {
        setCurrentIndex((prev) => {
          const newIndex = (prev - 1 + ROLES.length) % ROLES.length;
          // 埋点：滑动切换
          trackRoleGuide.swipe(fromRole, ROLES[newIndex]?.id, 'swipe');
          return newIndex;
        });
      } else {
        setCurrentIndex((prev) => {
          const newIndex = (prev + 1) % ROLES.length;
          // 埋点：滑动切换
          trackRoleGuide.swipe(fromRole, ROLES[newIndex]?.id, 'swipe');
          return newIndex;
        });
      }
    }
    setTouchStart(null);
    setTouchDelta(0);
    setIsDragging(false);
  }, [touchDelta, currentIndex]);

  // 确认选择角色
  const handleConfirm = () => {
    // 埋点：点击确定
    trackRoleGuide.confirm(ROLES[currentIndex]?.id);
    onConfirm(ROLES[currentIndex]);
  };

  // 关闭弹窗
  const handleClose = () => {
    // 埋点：点击关闭
    trackRoleGuide.close(ROLES[currentIndex]?.id);
    onClose();
  };

  if (!visible) return null;

  const currentRole = ROLES[currentIndex];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
      {/* 弹窗主体 */}
      <div className="relative w-[90%] max-w-[340px] bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* 关闭按钮 - 极淡，需要认真看才能发现 */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full z-10 transition-colors"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)', color: 'rgba(0, 0, 0, 0.15)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* 标题区域 */}
        <div className="pt-8 pb-4 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            请选择角色，解锁专属服务
          </h2>
        </div>

        {/* 角色卡片轮播区域 */}
        <div
          ref={containerRef}
          className="relative h-[280px] overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 左箭头 */}
          <button
            onClick={() => {
              setIsAutoPlaying(false);
              const fromRole = ROLES[currentIndex]?.id;
              setCurrentIndex((prev) => {
                const newIndex = (prev - 1 + ROLES.length) % ROLES.length;
                // 埋点：箭头切换
                trackRoleGuide.swipe(fromRole, ROLES[newIndex]?.id, 'arrow');
                return newIndex;
              });
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          {/* 右箭头 */}
          <button
            onClick={() => {
              setIsAutoPlaying(false);
              const fromRole = ROLES[currentIndex]?.id;
              setCurrentIndex((prev) => {
                const newIndex = (prev + 1) % ROLES.length;
                // 埋点：箭头切换
                trackRoleGuide.swipe(fromRole, ROLES[newIndex]?.id, 'arrow');
                return newIndex;
              });
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${isDragging ? touchDelta : 0}px))`,
              transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            {ROLES.map((role) => (
              <div
                key={role.id}
                className="w-full flex-shrink-0 flex flex-col items-center justify-center px-6"
              >
                {/* 角色头像 */}
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center mb-5 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${role.color}20, ${role.color}40)`,
                    border: `3px solid ${role.color}60`,
                  }}
                >
                  <RoleIcon type={role.iconType} color={role.color} size={72} />
                </div>

                {/* 角色名称 */}
                <div className="text-lg font-bold text-gray-900 mb-2">{role.name}</div>

                {/* 角色描述 */}
                <div className="text-xs text-gray-500 mb-5 text-center">
                  {role.id === 'owner' && '管理设备资产'}
                  {role.id === 'manager' && '统筹运维管理'}
                  {role.id === 'operator' && '专业操作指导'}
                  {role.id === 'dealer' && '代理专属服务'}
                  {role.id === 'mechanic' && '维修知识支持'}
                  {role.id === 'employee' && '员工专属通道'}
                </div>

                {/* 确定按钮 */}
                <button
                  onClick={handleConfirm}
                  className="w-48 py-3 rounded-full text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${role.color}, ${role.color}dd)`,
                  }}
                >
                  确定选择
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 分页指示器 */}
        <div className="flex justify-center gap-2 pb-6 pt-2">
          {ROLES.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className="transition-all duration-300"
              style={{
                width: currentIndex === index ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: currentIndex === index ? currentRole.color : '#e0e0e0',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleGuideModal;

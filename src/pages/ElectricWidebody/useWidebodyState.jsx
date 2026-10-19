import React, { useState, useEffect, useRef } from 'react';

/**
 * STATE-002 异常状态机 Hook 与渲染组件 (FIX-004 / F2-04)
 * 支持内部 URL 参数: ?widebodyState=loading|error|empty|denied|expired|removed|offline
 * 修复点:
 * 1. empty 作为可展示的阻断空态 (hasBlockingState 包含 empty)，提供返回上一页与重新加载
 * 2. error/empty 重试只恢复为可用状态 (normal)，杜绝重置日期/表单等副作用
 * 3. 所有定时器在卸载时彻底销毁清理，防止异步内存泄漏
 * 4. 按钮文案与目标统一为「返回上一页」
 */
export function useWidebodyState(onBack, onRetry) {
  const [stateParam, setStateParam] = useState('normal');
  const [loadingActive, setLoadingActive] = useState(false);
  const loadTimerRef = useRef(null);
  const retryTimerRef = useRef(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ws = params.get('widebodyState');
      if (ws) {
        setStateParam(ws);
        if (ws === 'loading') {
          setLoadingActive(true);
          loadTimerRef.current = setTimeout(() => {
            setLoadingActive(false);
          }, 1000);
        }
      } else {
        setStateParam('normal');
      }
    } catch {
      setStateParam('normal');
    }

    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const handleRetry = () => {
    if (stateParam === 'error' || stateParam === 'loading' || stateParam === 'empty') {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      setLoadingActive(true);
      retryTimerRef.current = setTimeout(() => {
        setLoadingActive(false);
        setStateParam('normal');
        // 如果外部提供了非重置日期的安全刷新回调，才安全触发
        if (typeof onRetry === 'function') {
          try {
            onRetry();
          } catch {
            // 安全容错
          }
        }
      }, 500);
    }
  };

  const isOffline = stateParam === 'offline';
  const isEmpty = stateParam === 'empty';
  const hasBlockingState = ['error', 'denied', 'expired', 'removed', 'empty'].includes(stateParam) || loadingActive;

  const renderStateOverlay = (customTitle, customDesc) => {
    if (loadingActive) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[14px] shadow-[0_1px_2px_rgba(31,41,55,0.035)] text-center m-3">
          <div className="w-8 h-8 border-3 border-[#2377f3] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-[14px] font-medium text-[#252b33]">数据加载中...</p>
          <p className="text-[12px] text-[#7a8290] mt-1">正在同步车辆实时数据</p>
        </div>
      );
    }

    if (stateParam === 'empty') {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[14px] shadow-[0_1px_2px_rgba(31,41,55,0.035)] text-center m-3">
          <div className="w-12 h-12 rounded-full bg-[#f0f1f3] text-[#252b33] flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-[15px] font-semibold text-[#252b33]">{customTitle || '暂无数据记录'}</h3>
          <p className="text-[12px] text-[#7a8290] mt-1 max-w-xs">{customDesc || '当前设备或时段暂无工况数据，可尝试重新加载或调整查询条件'}</p>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-[12px] font-medium text-[#6d7480] bg-[#f1f2f4] rounded-[10px] active:bg-gray-200"
            >
              返回上一页
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 text-[12px] font-medium text-white bg-[#252b33] rounded-[10px] active:opacity-80"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    if (stateParam === 'error') {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[14px] shadow-[0_1px_2px_rgba(31,41,55,0.035)] text-center m-3">
          <div className="w-12 h-12 rounded-full bg-[#fef2f2] text-[#b91c1c] flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-[15px] font-semibold text-[#252b33]">数据暂时无法加载，请重试</h3>
          <p className="text-[12px] text-[#7a8290] mt-1 max-w-xs">网络请求超时或通讯不稳定，已保留您当前选择的车辆与时间</p>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-[12px] font-medium text-[#6d7480] bg-[#f1f2f4] rounded-[10px] active:bg-gray-200"
            >
              返回上一页
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 text-[12px] font-medium text-white bg-[#252b33] rounded-[10px] active:opacity-80"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    if (stateParam === 'denied' || stateParam === 'expired') {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[14px] shadow-[0_1px_2px_rgba(31,41,55,0.035)] text-center m-3">
          <div className="w-12 h-12 rounded-full bg-[#fffbeb] text-[#b45309] flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-[15px] font-semibold text-[#252b33]">
            {stateParam === 'expired' ? '登录状态已失效' : '暂无查看权限'}
          </h3>
          <p className="text-[12px] text-[#7a8290] mt-1 max-w-xs">
            {stateParam === 'expired' ? '您的身份验证已过期，请重新登录后查看该资产' : '当前账号未分配该电动宽体车的查看权限'}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 px-5 py-2 text-[12px] font-medium text-white bg-[#252b33] rounded-[10px] active:opacity-80"
          >
            返回上一页
          </button>
        </div>
      );
    }

    if (stateParam === 'removed') {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[14px] shadow-[0_1px_2px_rgba(31,41,55,0.035)] text-center m-3">
          <div className="w-12 h-12 rounded-full bg-[#fef2f2] text-[#b91c1c] flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-[15px] font-semibold text-[#252b33]">该设备已被移除</h3>
          <p className="text-[12px] text-[#7a8290] mt-1 max-w-xs">当前车辆已从企业资产列表中迁出或解除绑定</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 px-5 py-2 text-[12px] font-medium text-white bg-[#252b33] rounded-[10px] active:opacity-80"
          >
            返回上一页
          </button>
        </div>
      );
    }

    return null;
  };

  return {
    stateParam,
    isOffline,
    isEmpty,
    hasBlockingState,
    renderStateOverlay,
    handleRetry,
  };
}

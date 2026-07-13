import React, { useState, useEffect } from 'react';
import { trackPhoneBind } from '../../utils/tracking';

const PhoneBindModal = ({ visible, onClose, onSuccess, containerRef, sourcePage }) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+86');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 常用国家/地区代码
  const countryCodes = [
    { code: '+86', name: '中国', nameEn: 'China', flag: '🇨🇳', iso: 'CN' },
    { code: '+91', name: '印度', nameEn: 'India', flag: '🇮🇳', iso: 'IN' },
    { code: '+62', name: '印度尼西亚', nameEn: 'Indonesia', flag: '🇮🇩', iso: 'ID' },
    { code: '+66', name: '泰国', nameEn: 'Thailand', flag: '🇹🇭', iso: 'TH' },
    { code: '+55', name: '巴西', nameEn: 'Brazil', flag: '🇧🇷', iso: 'BR' },
    { code: '+1', name: '美国', nameEn: 'United States', flag: '🇺🇸', iso: 'US' },
    { code: '+44', name: '英国', nameEn: 'United Kingdom', flag: '🇬🇧', iso: 'GB' },
    { code: '+81', name: '日本', nameEn: 'Japan', flag: '🇯🇵', iso: 'JP' },
    { code: '+82', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷', iso: 'KR' },
    { code: '+852', name: '中国香港', nameEn: 'Hong Kong', flag: '🇭🇰', iso: 'HK' },
    { code: '+853', name: '中国澳门', nameEn: 'Macau', flag: '🇲🇴', iso: 'MO' },
    { code: '+886', name: '中国台湾', nameEn: 'Taiwan', flag: '🇹🇼', iso: 'TW' },
    { code: '+65', name: '新加坡', nameEn: 'Singapore', flag: '🇸🇬', iso: 'SG' },
    { code: '+60', name: '马来西亚', nameEn: 'Malaysia', flag: '🇲🇾', iso: 'MY' },
    { code: '+84', name: '越南', nameEn: 'Vietnam', flag: '🇻🇳', iso: 'VN' },
    { code: '+63', name: '菲律宾', nameEn: 'Philippines', flag: '🇵🇭', iso: 'PH' },
    { code: '+61', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺', iso: 'AU' },
    { code: '+64', name: '新西兰', nameEn: 'New Zealand', flag: '🇳🇿', iso: 'NZ' },
    { code: '+49', name: '德国', nameEn: 'Germany', flag: '🇩🇪', iso: 'DE' },
    { code: '+33', name: '法国', nameEn: 'France', flag: '🇫🇷', iso: 'FR' },
    { code: '+39', name: '意大利', nameEn: 'Italy', flag: '🇮🇹', iso: 'IT' },
    { code: '+34', name: '西班牙', nameEn: 'Spain', flag: '🇪🇸', iso: 'ES' },
    { code: '+7', name: '俄罗斯', nameEn: 'Russia', flag: '🇷🇺', iso: 'RU' },
    { code: '+52', name: '墨西哥', nameEn: 'Mexico', flag: '🇲🇽', iso: 'MX' },
    { code: '+376', name: '安道尔', nameEn: 'Andorra', flag: '🇦🇩', iso: 'AD' },
    { code: '+971', name: '阿联酋', nameEn: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE' },
    { code: '+93', name: '阿富汗', nameEn: 'Afghanistan', flag: '🇦🇫', iso: 'AF' },
    { code: '+1268', name: '安提瓜和巴布达', nameEn: 'Antigua and Barbuda', flag: '🇦🇬', iso: 'AG' },
    { code: '+1809', name: '安圭拉岛', nameEn: 'Anguilla', flag: '🇦🇮', iso: 'AI' },
    { code: '+355', name: '阿尔巴尼亚', nameEn: 'Albania', flag: '🇦🇱', iso: 'AL' },
    { code: '+374', name: '亚美尼亚', nameEn: 'Armenia', flag: '🇦🇲', iso: 'AM' },
  ];

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 重置状态
  useEffect(() => {
    if (!visible) {
      setPhone('');
      setCountryCode('+86');
      setVerificationCode('');
      setCountdown(0);
      setLoading(false);
      setError('');
      setSuccess(false);
    }
  }, [visible]);

  // 弹窗展示时埋点
  useEffect(() => {
    if (visible) {
      trackPhoneBind.modalShow(sourcePage || 'unknown');
    }
  }, [visible, sourcePage]);

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone || phone.length < 6) {
      setError('请输入正确的手机号');
      return;
    }

    setError('');
    setLoading(true);

    // 埋点：点击获取验证码
    trackPhoneBind.getCode(countryCode);

    // 模拟发送验证码
    setTimeout(() => {
      setLoading(false);
      setCountdown(60);
      // 实际项目中这里调用发送验证码接口
    }, 1000);
  };

  // 提交绑定
  const handleSubmit = async () => {
    if (!phone || phone.length < 6) {
      setError('请输入正确的手机号');
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    setError('');
    setLoading(true);

    // 模拟绑定成功
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // 埋点：绑定成功
      trackPhoneBind.confirm(countryCode, true);
      // 实际项目中这里调用绑定接口
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1500);
    }, 1500);
  };

  // 处理手机号输入
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPhone(value);
    setError('');
  };

  // 处理验证码输入
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setVerificationCode(value);
    setError('');
  };

  // 处理区号选择
  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value);
    setError('');
  };

  // 处理国家选择
  const handleCountrySelect = (code) => {
    setCountryCode(code);
    setShowCountryPicker(false);
    setSearchQuery('');
    setError('');
  };

  // 过滤国家列表
  const filteredCountries = countryCodes.filter(country =>
    country.name.includes(searchQuery) ||
    country.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery) ||
    country.iso.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 按字母分组
  const groupedCountries = filteredCountries.reduce((acc, country) => {
    const firstLetter = country.nameEn[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(country);
    return acc;
  }, {});

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <div className="relative bg-white rounded-lg w-80 mx-4 overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="w-6" /> {/* 占位，保持标题居中 */}
          <h3 className="text-base font-medium text-center flex-1">绑定手机号</h3>
          <button
            onClick={() => {
              // 埋点：点击关闭
              trackPhoneBind.close(sourcePage || 'unknown');
              onClose();
            }}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 内容区 */}
        <div className="px-4 py-4">
          {/* 说明文字 */}
          <p className="text-sm text-gray-500 text-center mb-4">
            {sourcePage === 'ServiceRequest' && '获取工程师响应'}
            {sourcePage === 'PartsOrder' && '快速订购原厂配件'}
            {sourcePage === 'DeviceMaintenance' && '申请专业保养服务'}
            {!sourcePage && '继续操作'}
          </p>

          {/* 手机号输入 */}
          <div className="flex mb-3">
            {/* 区号选择 */}
            <button
              type="button"
              onClick={() => setShowCountryPicker(true)}
              className="flex items-center px-2 py-2.5 border border-gray-200 rounded-l-lg bg-gray-50 text-sm focus:outline-none focus:border-red-500"
            >
              <span>{countryCode}</span>
              <svg className="w-3 h-3 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {/* 手机号输入框 */}
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="请输入手机号"
              className="flex-1 min-w-0 px-3 py-2.5 border border-l-0 border-gray-200 rounded-r-lg text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          {/* 验证码输入 */}
          <div className="flex mb-3">
            <input
              type="text"
              value={verificationCode}
              onChange={handleCodeChange}
              placeholder="请输入验证码"
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-l-lg text-sm focus:outline-none focus:border-red-500"
            />
            <button
              onClick={handleSendCode}
              disabled={countdown > 0 || !phone || phone.length < 6}
              className={`px-3 py-2.5 border border-l-0 border-gray-200 rounded-r-lg text-sm whitespace-nowrap ${
                countdown > 0 || !phone || phone.length < 6
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-red-500 hover:bg-red-50'
              }`}
            >
              {countdown > 0 ? `${countdown}s后重试` : '获取验证码'}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-xs text-red-500 mb-3">{error}</p>
          )}

          {/* 成功提示 */}
          {success && (
            <p className="text-xs text-green-500 mb-3">设置成功！</p>
          )}

          {/* 确认按钮 */}
          <button
            onClick={handleSubmit}
            disabled={loading || !phone || phone.length < 6 || !verificationCode || verificationCode.length !== 6}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
              loading || !phone || phone.length < 6 || !verificationCode || verificationCode.length !== 6
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {loading ? '提交中...' : '确认'}
          </button>
        </div>
      </div>

      {/* 半屏国家选择页面 */}
      {showCountryPicker && (
        <div className="absolute inset-0 z-[60]">
          {/* 遮罩层 */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setShowCountryPicker(false);
              setSearchQuery('');
            }}
          />

          {/* 底部弹出面板 */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl" style={{ height: '70vh' }}>
            {/* 顶部栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button
                onClick={() => {
                  setShowCountryPicker(false);
                  setSearchQuery('');
                }}
                className="text-sm text-gray-500"
              >
                取消
              </button>
              <span className="text-base font-medium">选择国家/地区</span>
              <div className="w-10" /> {/* 占位，保持标题居中 */}
            </div>

            {/* 搜索框 */}
            <div className="px-4 py-2">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索国家/地区"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* 国家列表 */}
            <div className="overflow-y-auto" style={{ height: 'calc(70vh - 110px)' }}>
              {searchQuery ? (
                // 搜索结果
                <div className="px-4">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountrySelect(country.code)}
                      className="w-full flex items-center py-3 border-b border-gray-50 hover:bg-gray-50"
                    >
                      <span className="text-2xl mr-3">{country.flag}</span>
                      <span className="flex-1 text-left">
                        <span className="text-sm text-gray-900">{country.name}</span>
                        <span className="text-sm text-gray-500 ml-1">({country.iso})</span>
                      </span>
                      <span className="text-sm text-gray-500">({country.code})</span>
                      {countryCode === country.code && (
                        <svg className="w-5 h-5 text-red-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                // 按字母分组显示
                <>
                  {/* 常用国家 */}
                  <div className="px-4">
                    <div className="py-2 text-xs text-gray-500 font-medium">常用</div>
                    {countryCodes.slice(0, 5).map((country) => (
                      <button
                        key={country.code}
                        onClick={() => handleCountrySelect(country.code)}
                        className="w-full flex items-center py-3 border-b border-gray-50 hover:bg-gray-50"
                      >
                        <span className="text-2xl mr-3">{country.flag}</span>
                        <span className="flex-1 text-left">
                          <span className="text-sm text-gray-900">{country.name}</span>
                          <span className="text-sm text-gray-500 ml-1">({country.iso})</span>
                        </span>
                        <span className="text-sm text-gray-500">({country.code})</span>
                        {countryCode === country.code && (
                          <svg className="w-5 h-5 text-red-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* 按字母分组 */}
                  {Object.keys(groupedCountries).sort().map((letter) => (
                    <div key={letter} className="px-4">
                      <div className="py-2 text-xs text-gray-500 font-medium">{letter}</div>
                      {groupedCountries[letter].map((country) => (
                        <button
                          key={country.code}
                          onClick={() => handleCountrySelect(country.code)}
                          className="w-full flex items-center py-3 border-b border-gray-50 hover:bg-gray-50"
                        >
                          <span className="text-2xl mr-3">{country.flag}</span>
                          <span className="flex-1 text-left">
                            <span className="text-sm text-gray-900">{country.name}</span>
                            <span className="text-sm text-gray-500 ml-1">({country.iso})</span>
                          </span>
                          <span className="text-sm text-gray-500">({country.code})</span>
                          {countryCode === country.code && (
                            <svg className="w-5 h-5 text-red-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* 右侧字母索引 */}
            {!searchQuery && (
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
                {Object.keys(groupedCountries).sort().map((letter) => (
                  <button
                    key={letter}
                    onClick={() => {
                      const element = document.getElementById(`letter-${letter}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="w-4 h-4 flex items-center justify-center text-[10px] text-blue-500 hover:bg-blue-100 rounded"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneBindModal;

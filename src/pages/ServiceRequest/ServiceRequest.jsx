import React, { useState, useEffect } from 'react';
import PhoneBindModal from '../../components/PhoneBindModal/PhoneBindModal';

const ServiceRequest = ({ onBack }) => {
  const [showPhoneBindModal, setShowPhoneBindModal] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [country, setCountry] = useState('中国');
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+86');

  // 服务类型选项
  const serviceTypes = [
    { id: 'repair', name: '维修召请' },
    { id: 'maintenance', name: '保养预约' },
    { id: 'startup', name: '我要开机' }
  ];

  // 模拟检查用户手机号
  useEffect(() => {
    const userPhone = null; // 模拟未绑定手机号

    if (!userPhone) {
      const timer = setTimeout(() => {
        setShowPhoneBindModal(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  // 处理手机号绑定成功
  const handlePhoneBindSuccess = () => {
    console.log('手机号绑定成功');
  };

  // 处理服务类型选择
  const handleServiceTypeSelect = (type) => {
    setServiceType(type.id);
  };

  // 处理暂存
  const handleSave = () => {
    console.log('暂存:', { serviceType, country, contactName, phoneNumber });
  };

  // 处理提交
  const handleSubmit = () => {
    console.log('提交:', { serviceType, country, contactName, phoneNumber });
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* 状态栏 - 与内容信息流详情页一致 */}
      <div className="flex-shrink-0">
        <div className="h-[44px] flex items-center justify-between px-4 bg-white">
          <span className="text-black text-[14px] font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 8H3V12H1V8Z" fill="#333"/>
              <path d="M5 5H7V12H5V5Z" fill="#333"/>
              <path d="M9 3H11V12H9V3Z" fill="#333"/>
              <path d="M13 0H15V12H13V0Z" fill="#333"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2C10.76 2 13.07 3.61 14.1 6L15.5 4.5C14.14 2.58 11.23 1 8 1C4.77 1 1.86 2.58 0.5 4.5L1.9 6C2.93 3.61 5.24 2 8 2Z" fill="#333"/>
              <path d="M8 5C9.66 5 11.14 5.69 12.11 6.88L13.5 5.5C12.2 3.98 10.21 3 8 3C5.79 3 3.8 3.98 2.5 5.5L3.89 6.88C4.86 5.69 6.34 5 8 5Z" fill="#333"/>
              <path d="M8 8C8.83 8 9.58 8.34 10.12 8.9L11.5 7.5C10.6 6.6 9.37 6 8 6C6.63 6 5.4 6.6 4.5 7.5L5.88 8.9C6.42 8.34 7.17 8 8 8Z" fill="#333"/>
              <circle cx="8" cy="11" r="1.5" fill="#333"/>
            </svg>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="#333" strokeOpacity="0.35"/>
              <rect x="2" y="2" width="18" height="8" rx="1" fill="#333"/>
              <path d="M23 4V8C23.5523 8 24 7.5523 24 7V5C24 4.4477 23.5523 4 23 4Z" fill="#333" fillOpacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* 顶部导航栏 */}
        <div className="flex items-center px-4 py-3 border-b border-gray-100">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="flex-1 text-center text-base font-medium">我要召请</h1>
          <div className="flex items-center">
            <button className="px-3 py-1 border border-gray-300 rounded-full text-xs text-gray-600 mr-2">
              暂存 (0)
            </button>
            <button className="w-8 h-8 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 页面内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 添加设备按钮 */}
        <div className="mb-4">
          <button className="w-full py-4 bg-gray-100 rounded-lg text-sm text-gray-600 flex items-center justify-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            添加设备
          </button>
        </div>

        {/* 服务类型 */}
        <div className="mb-4">
          <div className="text-sm text-gray-900 mb-2">
            <span className="text-red-500">*</span> 服务类型
          </div>
          <div className="flex flex-wrap gap-2">
            {serviceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleServiceTypeSelect(type)}
                className={`px-4 py-2 rounded-full text-sm ${
                  serviceType === type.id
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* 选择设备所在国家 */}
        <div className="mb-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-red-500 mb-1">*请选择设备所在国家</div>
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-900">{country}</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>

        {/* 联系人 */}
        <div className="mb-4">
          <div className="bg-white rounded-lg p-4">
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="*联系人"
              className="w-full text-base text-gray-900 focus:outline-none"
            />
          </div>
        </div>

        {/* 手机号码 */}
        <div className="mb-4">
          <div className="flex">
            {/* 区号选择 */}
            <button className="flex items-center px-4 py-3 bg-gray-100 rounded-l-lg text-base text-gray-900">
              {countryCode}
              <svg className="w-4 h-4 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {/* 手机号码输入框 */}
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="*手机号码"
              className="flex-1 px-4 py-3 bg-gray-100 rounded-r-lg text-base text-gray-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 py-3 border border-gray-300 rounded-lg text-sm text-gray-700"
        >
          暂存
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-medium"
        >
          提交
        </button>
      </div>

      {/* 手机号绑定弹窗 */}
      <PhoneBindModal
        visible={showPhoneBindModal}
        onClose={() => setShowPhoneBindModal(false)}
        onSuccess={handlePhoneBindSuccess}
      />
    </div>
  );
};

export default ServiceRequest;

import React, { useState, useEffect } from 'react';
import PhoneBindModal from '../../components/PhoneBindModal/PhoneBindModal';

const ServiceRequest = ({ onBack }) => {
  const [showPhoneBindModal, setShowPhoneBindModal] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [country] = useState('中国');
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState('+86');

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
    <div className="relative flex h-full w-full flex-col bg-white">
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
        sourcePage="ServiceRequest"
      />
    </div>
  );
};

export default ServiceRequest;

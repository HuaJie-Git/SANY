import React, { useState } from 'react';

const SCORE_OPTIONS = [
  { id: '10', label: 'A.10' },
  { id: '9', label: 'B.9' },
  { id: '8', label: 'C.8' },
  { id: '7', label: 'D.7' },
  { id: '6', label: 'E.6' },
  { id: '5', label: 'F.5' },
];

const Survey = ({ onBack }) => {
  // 未登录游客状态：所有联系信息与地址均为空，需手动填写
  const [form, setForm] = useState({
    country: '',
    company: '',
    contact: '',
    product: '',
    satisfactionScore: '10',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleScoreSelect = (id) => {
    setForm((prev) => ({ ...prev, satisfactionScore: id }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.contact.trim() && !form.country.trim()) {
      setErrorMessage('请填写所处国家及联系方式');
      return;
    }
    setErrorMessage('');
    setSubmitted(true);
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-white text-gray-900 overflow-hidden" dir="auto">
      {/* 顶部标题栏 (图1) */}
      <header className="flex h-12 flex-shrink-0 items-center border-b border-gray-100 bg-white px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-800 active:bg-gray-100"
          aria-label="返回"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="ml-1 text-[17px] font-bold text-gray-900">客户满意度调研问卷</h1>
      </header>

      {/* 主体问卷内容 */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-6">
        {/* 问卷标题 */}
        <h2 className="mb-6 text-center text-[20px] font-bold tracking-wide text-[#345084]">
          客户满意度调研问卷
        </h2>

        {submitted ? (
          <div className="my-8 rounded-2xl bg-[#F9FAFB] p-6 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-[18px] font-bold text-gray-900">问卷提交成功</h3>
            <p className="mt-2 text-[14px] text-gray-600 leading-relaxed">
              衷心感谢您对三一重工的支持与反馈！我们将根据您的宝贵建议持续改善产品品质与服务体验。
            </p>
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={onBack}
                className="w-full rounded-xl bg-[#E01923] py-2.5 text-[15px] font-bold text-white active:bg-[#c4151e]"
              >
                返回
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1、您所处的国家为？ */}
            <div>
              <label className="block text-[15px] font-bold text-gray-900">
                1、您所处的国家为？
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="请输入您所在的国家（如：中国）"
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400"
                />
              </div>
            </div>

            {/* 2、您所在的公司名称是？ */}
            <div>
              <label className="block text-[15px] font-bold text-gray-900">
                2、您所在的公司名称是？
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="请输入公司名称"
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400"
                />
              </div>
            </div>

            {/* 3、您的联系方式为？ (未登录状态不默认获取，需用户手动填写) */}
            <div>
              <label className="block text-[15px] font-bold text-gray-900">
                3、您的联系方式为？
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="请输入您的手机号或邮箱"
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400"
                />
              </div>
            </div>

            {/* 4、您使用三一哪款产品？ */}
            <div>
              <label className="block text-[15px] font-bold text-gray-900">
                4、您使用三一哪款产品？
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  placeholder="例如：车载泵 SYM5180THBES 30C-8"
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400"
                />
              </div>
            </div>

            {/* 5、您对三一售后服务满意吗（如响应速度、维修技能、态度等）？ */}
            <div>
              <label className="block text-[15px] font-bold text-gray-900 leading-snug">
                5、您对三一售后服务满意吗（如响应速度、维修技能、态度等）？
              </label>
              <div className="mt-3 space-y-2.5">
                {SCORE_OPTIONS.map((opt) => {
                  const isChecked = form.satisfactionScore === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleScoreSelect(opt.id)}
                      className={`flex h-12 w-full items-center rounded-lg border px-4 cursor-pointer transition ${
                        isChecked
                          ? 'border-gray-400 bg-gray-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border ${
                          isChecked
                            ? 'border-[#E01923] bg-[#E01923]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      <span className="text-[15px] font-medium text-gray-800">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-lg bg-red-50 p-3 text-[13px] text-red-600">
                {errorMessage}
              </div>
            )}
          </form>
        )}
      </div>

      {/* 底部吸底提交按钮 (吸附在手机容器底部) */}
      {!submitted && (
        <footer className="flex-shrink-0 border-t border-gray-100 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={handleSubmit}
            className="h-12 w-full rounded-xl bg-[#E01923] text-[16px] font-bold text-white shadow-md active:bg-[#c4151e] transition"
          >
            提交问卷
          </button>
        </footer>
      )}
    </div>
  );
};

export default Survey;

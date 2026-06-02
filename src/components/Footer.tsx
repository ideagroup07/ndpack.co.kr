/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Award, ShieldAlert, FileCode, X } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  setActiveTab: (tab: string) => void;
  setAdminMode: (mode: boolean) => void;
}

export default function Footer({ settings, setActiveTab, setAdminMode }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLinkClick = (tabId: string) => {
    setAdminMode(false);
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('admin_password') || '1234';
    if (passwordInput === storedPassword) {
      setShowPasswordPrompt(false);
      setPasswordInput('');
      setErrorMessage('');
      setAdminMode(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMessage('비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <footer className="bg-[#212529] text-gray-400 font-sans border-t border-[#343A40]" id="footer-main">
      {/* Top Banner section */}
      <div className="border-b border-[#343A40] py-10 bg-[#1A1C1E]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#00A3FF]/10 rounded-lg text-[#00A3FF]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white text-base font-black">오염 가용 차단 S등급 초청정 위생 제조라인</p>
              <p className="text-sm text-gray-400 mt-0.5 font-medium">엔디팩은 식약처 및 위생 유도 규격을 실시간 준수하고 있습니다.</p>
            </div>
          </div>
          <div className="flex space-x-3 text-sm">
            <button 
              onClick={() => handleLinkClick('about')}
              className="px-5 py-2.5 bg-[#343A40] text-gray-300 font-bold rounded-full hover:text-white hover:bg-gray-700 transition-all cursor-pointer"
            >
              회사연혁 보기
            </button>
            <button 
              onClick={() => handleLinkClick('inquiry')}
              className="px-5 py-2.5 bg-[#00A3FF] text-white font-black rounded-full hover:bg-[#0096C7] transition-all cursor-pointer"
            >
              간편 견적요청
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Logo & Intro Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-white font-extrabold text-xl tracking-tight select-none">엔디팩 <span className="text-[#00A3FF] font-black">ND Pack</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md font-medium break-keep" style={{ wordBreak: 'keep-all' }}>
              지난 30여 년간 정직과 신용을 바탕으로, 위생적이고 차단성이 뛰어난 고품격 하이브리드 포장재를 연구·생산해 온 제조공정 전문 기업입니다.
            </p>
            

          </div>

          {/* Location / Headquarters Column */}
          <div className="space-y-3.5 text-sm md:col-span-1">
            <h4 className="text-white text-base font-black tracking-tight border-b border-[#343A40] pb-2">고객센터 및 본사</h4>
            
            <div className="flex items-start space-x-2">
              <MapPin className="w-5 h-5 text-[#00A3FF] shrink-0 mt-0.5" />
              <span className="leading-snug text-gray-350 font-medium text-sm">{settings.address}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-[#00A3FF] shrink-0" />
              <span className="text-gray-200 font-extrabold text-sm">Tel. {settings.phone}</span>
            </div>

            {settings.mobile && (
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-extrabold text-[#00A3FF] border border-[#00A3FF]/40 rounded px-1.5 py-0.5 shrink-0 font-mono scale-90">Mob</span>
                <span className="text-gray-200 font-extrabold text-sm">{settings.mobile}</span>
              </div>
            )}

            {settings.fax && (
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-extrabold text-gray-350 border border-gray-600 rounded px-1.5 py-0.5 shrink-0 font-mono scale-90">Fax</span>
                <span className="text-gray-350 font-bold text-sm">{settings.fax}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-[#00A3FF] shrink-0" />
              <span className="text-gray-350 font-bold text-sm break-all">{settings.email}</span>
            </div>
          </div>

        </div>

        {/* Gray Legal & Copyright lines */}
        <div className="border-t border-[#343A40] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-gray-400 font-semibold">
          <div className="space-y-1.5 text-center md:text-left">
            <p className="leading-relaxed">
              상호명: {settings.companyName || '엔디팩 (ND Pack)'} | 대표자: {settings.ceoName} | 사업자등록번호: {settings.bizNum} 
            </p>
            <p className="leading-relaxed text-gray-500">
              디지털 인쇄 허가: 대구 달서 제 2018-052호 | 통신판매업 신고: 제 2024-갈산-0034호 | 상온 보관 위생 안전 검사 마크 획득 완료
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowPasswordPrompt(true)} 
              className="text-gray-600 hover:text-gray-500 transition-colors cursor-pointer text-[11px] font-normal"
            >
              관리자
            </button>
            <p>© {currentYear} ND Pack Corp. All Rights Reserved.</p>
          </div>
        </div>
      </div>

      {/* Admin Password Entry Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-[#212529] animate-fade-in animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">관리자 인증</h3>
              <button 
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setPasswordInput('');
                  setErrorMessage('');
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">비밀번호</label>
                <input 
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="비밀번호를 입력해주세요."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00A3FF] focus:border-[#0096C7] transition-all text-sm outline-none font-medium"
                  autoFocus
                />
                {errorMessage && (
                  <p className="text-red-500 text-xs mt-1.5 font-bold flex items-center">
                    <span className="mr-1">⚠️</span> {errorMessage}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordPrompt(false);
                    setPasswordInput('');
                    setErrorMessage('');
                  }}
                  className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-bold rounded-xl transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00A3FF] hover:bg-[#0096C7] text-white text-sm font-extrabold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}

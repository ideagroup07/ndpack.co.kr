/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, ChevronRight, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  adminMode: boolean;
  setAdminMode: (mode: boolean) => void;
  siteSettings: { title: string; ceoName: string };
}

export default function Header({
  activeTab,
  setActiveTab,
  adminMode,
  setAdminMode,
  siteSettings
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'about', label: '회사소개' },
    { id: 'products', label: '제품소개' },
    { id: 'facility', label: '주요생산시설' },
    { id: 'process', label: '생산공정' },
    { id: 'inquiry', label: '견적문의' },
    { id: 'notices', label: '고객센터' }
  ];

  const handleNavClick = (tabId: string) => {
    setAdminMode(false);
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center space-x-3 cursor-pointer group select-none"
            id="header-logo-container"
          >
            {/* Elegant SVG Replication of the Isometric Cube Logo */}
            <svg 
              className="w-12 h-12 transform group-hover:scale-105 transition-transform duration-300" 
              viewBox="0 0 120 120" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Top Face (Sky Blue) */}
              <path 
                d="M 60 12 L 108 36 L 60 60 L 12 36 Z" 
                fill="#00A5EC" 
              />
              {/* N Letter components on Top Face */}
              <path d="M 60 19.2 L 69.6 24 L 36 40.8 L 26.4 36 Z" fill="white" />
              <path d="M 84 31.2 L 93.6 36 L 60 52.8 L 50.4 48 Z" fill="white" />
              <path d="M 60 19.2 L 69.6 24 L 60 52.8 L 50.4 48 Z" fill="white" stroke="white" strokeWidth="0.5" />

              {/* Left Face (Royal Blue) */}
              <path 
                d="M 12 36 L 60 60 V 108 L 12 84 Z" 
                fill="#007BC3" 
              />
              {/* D Letter components on Left Face */}
              <path d="M 19.2 46.8 L 43.2 58.8 L 52.8 73.2 L 52.8 87.6 L 43.2 92.4 L 19.2 80.4 Z" fill="white" />
              <path d="M 28.8 61.2 L 38.4 66 L 43.2 73.2 L 43.2 78 L 38.4 80.4 L 28.8 75.6 Z" fill="#007BC3" />

              {/* Right Face (Deep Purple-Blue) */}
              <path 
                d="M 60 60 L 108 36 V 84 L 60 108 Z" 
                fill="#242886" 
              />
              {/* P Letter components on Right Face */}
              <path d="M 67.2 63.6 L 91.2 51.6 L 100.8 54 L 100.8 61.2 L 91.2 73.2 L 76.8 80.4 L 76.8 92.4 L 67.2 97.2 Z" fill="white" />
              <path d="M 76.8 66 L 86.4 61.2 L 91.2 62.6 L 91.2 64.6 L 86.4 70.8 L 76.8 75.6 Z" fill="#242886" />
            </svg>

            <div className="flex flex-col select-none">
              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#00A3FF] font-mono leading-none">
                New Developing Pack
              </span>
              <span className="text-xl font-black font-sans text-[#212529] tracking-tight leading-tight mt-1">
                엔디팩
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8 items-center" id="desktop-nav">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id && !adminMode;
              return (
                <button
                   key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative text-base font-bold py-2 px-1 transition-colors duration-300 select-none ${
                    isActive 
                      ? 'text-[#00A3FF]' 
                      : 'text-[#212529]/70 hover:text-[#00A3FF]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00A3FF]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Utilities */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Quote Request Shortcut */}
            <button
               id="header-quote-shortcut"
              onClick={() => handleNavClick('inquiry')}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-[#00A3FF] text-white text-base font-bold rounded-full hover:bg-[#0096C7] transition-all shadow-sm"
            >
              <FileText className="w-4.5 h-4.5" />
              <span>견적문의 바로가기</span>
            </button>
          </div>

          {/* Hamburger / Mobile Trigger */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-200 shadow-xl" id="mobile-nav-drawer">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id && !adminMode;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-lg text-base font-bold transition-colors ${
                    isActive 
                      ? 'bg-blue-50/50 text-[#00A3FF]' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-5 h-5 opacity-55" />
                </button>
              );
            })}
            <div className="pt-4 border-t border-gray-100 flex flex-col space-y-2 px-4">
              <button
                onClick={() => {
                  setAdminMode(false);
                  setActiveTab('inquiry');
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-[#00A3FF] text-white font-extrabold text-base rounded-lg"
              >
                <FileText className="w-5 h-5" />
                <span>무상 견적문의 시작하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

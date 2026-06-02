/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowDown,
  Award, 
  Briefcase, 
  ShieldCheck, 
  Flame, 
  Settings, 
  Filter, 
  Layers, 
  Grid, 
  List, 
  Search, 
  ChevronRight, 
  FileCheck, 
  Upload, 
  CheckCircle2, 
  Info,
  Building,
  History,
  TrendingUp,
  User,
  ExternalLink,
  ChevronLeft,
  X,
  FileText,
  Image,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

import { 
  Product, 
  NoticeBoardPost, 
  SiteSettings, 
  Inquiry 
} from './types';

import { 
  INITIAL_PRODUCTS, 
  INITIAL_NOTICES, 
  INITIAL_INQUIRIES, 
  DEFAULT_SETTINGS,
  HISTORY_DATA,
  PROCESS_DATA
} from './data';

import Header from './components/Header';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import ProductImage from './components/ProductImage';
import PageHeader from './components/PageHeader';

export default function App() {
  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [adminMode, setAdminMode] = useState<boolean>(false);

  // Persistent States
    const PRODUCT_DATA_VERSION = '2026-06-02-product-image-reset';

  const [products, setProducts] = useState<Product[]>(() => {
    const savedVersion = localStorage.getItem('nd_products_version');

    if (savedVersion !== PRODUCT_DATA_VERSION) {
      localStorage.setItem('nd_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('nd_products_version', PRODUCT_DATA_VERSION);
      return INITIAL_PRODUCTS;
    }

    const saved = localStorage.getItem('nd_products');

    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => {
            const freshProduct = INITIAL_PRODUCTS.find((item) => item.id === p.id);

            if (freshProduct) {
              return {
                ...freshProduct,
                visible: p.visible ?? freshProduct.visible,
              };
            }

            return p;
          });
        }

        return INITIAL_PRODUCTS;
      } catch (e) {
        localStorage.setItem('nd_products', JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
    }

    localStorage.setItem('nd_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  });
  const [notices, setNotices] = useState<NoticeBoardPost[]>(() => {
    const saved = localStorage.getItem('nd_notices');
    if (saved !== null) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed = parsed.map((p: any) => {
            if (p.imageUrl && p.imageUrl.includes('/public/images/')) {
              p.imageUrl = p.imageUrl.replace('/public/images/', '/images/');
            }
            // Migrate legacy notice image patterns to the newly structured pathing
            const freshNotice = INITIAL_NOTICES.find(inot => inot.id === p.id);
            if (freshNotice) {
              p.imageUrl = freshNotice.imageUrl;
            }
            return p;
          });
        }
        return parsed;
      } catch (e) {
        return INITIAL_NOTICES;
      }
    }
    localStorage.setItem('nd_notices', JSON.stringify(INITIAL_NOTICES));
    return INITIAL_NOTICES;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('nd_inquiries');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    localStorage.setItem('nd_inquiries', JSON.stringify(INITIAL_INQUIRIES));
    return INITIAL_INQUIRIES;
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('nd_settings');
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (parsed.ceoName === '정철우' || !parsed.hasOwnProperty('mobile')) {
        localStorage.setItem('nd_settings', JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      return parsed;
    }
    localStorage.setItem('nd_settings', JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  });

  // Local UI States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductList, setShowProductList] = useState<boolean>(true);
  const [selectedNotice, setSelectedNotice] = useState<NoticeBoardPost | null>(null);

  const [noticeCategory, setNoticeCategory] = useState<string>('전체');
  const [facilityImageError, setFacilityImageError] = useState<boolean>(false);
  const [aboutImageError, setAboutImageError] = useState<boolean>(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'notices') {
      setSelectedNotice(null);
      setNoticeCategory('전체');
    }
    if (tabId === 'facility') {
      setFacilityImageError(false);
    }
    if (tabId === 'about') {
      setAboutImageError(false);
    }
  };
  const [noticeSearch, setNoticeSearch] = useState<string>('');
  const [noticeViewMode, setNoticeViewMode] = useState<'list' | 'grid'>('list');
  const [noticePage, setNoticePage] = useState<number>(1);
  const [showInquirySuccess, setShowInquirySuccess] = useState<boolean>(false);

  // Interactive Products Filtering State (Dual-Axis Filtering)
  const [filterPurposes, setFilterPurposes] = useState<string[]>(['전체']);
  const [filterShape, setFilterShape] = useState<string>('전체');

  // Inquiry form status
  const [inquiryForm, setInquiryForm] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    purpose: '제과제빵용',
    shape: '삼방형',
    width: '',
    length: '',
    gusset: '', // 폭 (선택 사항)
    quantity: '',
    content: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Computed Filtered Notices
  const noticeSearchRegex = new RegExp(noticeSearch, 'i');
  const queried = notices.filter(post => {
    if (post.visible === false) return false;
    if (noticeCategory !== '전체' && post.category !== noticeCategory) return false;
    return noticeSearchRegex.test(post.title) || noticeSearchRegex.test(post.content);
  });

  // Dynamically update document title / page layout representation
  useEffect(() => {
    if (siteSettings && siteSettings.title) {
      document.title = siteSettings.title;
    }
  }, [siteSettings]);

  // Sync to local storage on changes
  const handleUpdateProducts = (updated: Product[] | ((prev: Product[]) => Product[])) => {
    setProducts((prev) => {
      const nextProducts = typeof updated === 'function' ? updated(prev) : updated;
      localStorage.setItem('nd_products', JSON.stringify(nextProducts));
      
      // Safety: close details if the selected product was deleted
      if (selectedProduct && !nextProducts.some(p => p.id === selectedProduct.id)) {
        setTimeout(() => setSelectedProduct(null), 0);
      }
      
      return nextProducts;
    });
  };

  const handleUpdateNotices = (updated: NoticeBoardPost[] | ((prev: NoticeBoardPost[]) => NoticeBoardPost[])) => {
    setNotices((prev) => {
      const nextNotices = typeof updated === 'function' ? updated(prev) : updated;
      localStorage.setItem('nd_notices', JSON.stringify(nextNotices));
      
      // Safety: close details if the selected notice was deleted
      if (selectedNotice && !nextNotices.some(n => n.id === selectedNotice.id)) {
        setTimeout(() => setSelectedNotice(null), 0);
      }
      
      return nextNotices;
    });
  };

  const handleUpdateInquiries = (updated: Inquiry[] | ((prev: Inquiry[]) => Inquiry[])) => {
    setInquiries((prev) => {
      const nextInquiries = typeof updated === 'function' ? updated(prev) : updated;
      localStorage.setItem('nd_inquiries', JSON.stringify(nextInquiries));
      return nextInquiries;
    });
  };

  const handleUpdateSettings = (updated: SiteSettings) => {
    setSiteSettings(updated);
    localStorage.setItem('nd_settings', JSON.stringify(updated));
    
    // Dynamically update document title / page layout representation
    document.title = updated.title;
  };

  // Inquiry Submission
  const handleInquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formFieldName = name;
    if (name === 'company') formFieldName = 'companyName';
    if (name === 'name') formFieldName = 'contactName';
    if (name === 'message') formFieldName = 'content';
    setInquiryForm(prev => ({ ...prev, [formFieldName]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Complete validation
    if (!inquiryForm.companyName || !inquiryForm.contactName || !inquiryForm.phone) {
      alert('업체 정보 및 연락처 항목들은 필수 사항입니다.');
      return;
    }

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      companyName: inquiryForm.companyName,
      contactName: inquiryForm.contactName,
      phone: inquiryForm.phone,
      email: inquiryForm.email,
      purpose: inquiryForm.purpose,
      shape: inquiryForm.shape,
      dimensions: `${inquiryForm.width || '0'}mm x ${inquiryForm.length || '0'}mm ${inquiryForm.gusset ? `x ${inquiryForm.gusset}mm` : ''}`,
      quantity: inquiryForm.quantity ? `${Number(inquiryForm.quantity).toLocaleString()} 장` : '협의 필요',
      attachmentName: uploadedFile ? uploadedFile.name : undefined,
      content: inquiryForm.content,
      status: '대기중',
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Submit to Netlify via FormData
    const formData = new FormData();
    formData.append('form-name', 'contact-form');
    formData.append('company', inquiryForm.companyName);
    formData.append('name', inquiryForm.contactName);
    formData.append('phone', inquiryForm.phone);
    if (inquiryForm.email) {
      formData.append('email', inquiryForm.email);
    }
    formData.append('purpose', inquiryForm.purpose);
    formData.append('shape', inquiryForm.shape);
    if (inquiryForm.width) {
      formData.append('width', inquiryForm.width);
    }
    if (inquiryForm.length) {
      formData.append('length', inquiryForm.length);
    }
    if (inquiryForm.gusset) {
      formData.append('gusset', inquiryForm.gusset);
    }
    if (inquiryForm.quantity) {
      formData.append('quantity', inquiryForm.quantity);
    }
    if (inquiryForm.content) {
      formData.append('message', inquiryForm.content);
    }
    if (uploadedFile) {
      formData.append('attachment', uploadedFile);
    }

    fetch('/', {
      method: 'POST',
      body: formData,
    })
      .then(() => {
        console.log('Netlify Forms submission successful');
      })
      .catch((err) => {
        console.error('Netlify Forms submission failed:', err);
      });

    const updated = [newInquiry, ...inquiries];
    handleUpdateInquiries(updated);
    setShowInquirySuccess(true);

    // Reset Form
    setInquiryForm({
      companyName: '',
      contactName: '',
      phone: '',
      email: '',
      purpose: '제과제빵용',
      shape: '삼방형',
      width: '',
      length: '',
      gusset: '',
      quantity: '',
      content: ''
    });
    setUploadedFile(null);
  };

  // Products filters lists
  const PurposesList = ['전체', '제과제빵용', '농·축·수산물용', '가공식품용', '공산품용'];
  const ShapesList = ['전체', '삼방형', 'T형', '파우치형', '지퍼형', 'M형', '레토르트형', '자동롤형'];

  // Filter actual catalog
  const filteredProducts = products.filter(prod => {
    if (prod.visible === false) return false;
    const pMatch = filterPurposes.includes('전체') || (
      Array.isArray(prod.purpose) 
        ? prod.purpose.some(p => filterPurposes.includes(p)) 
        : filterPurposes.includes(prod.purpose)
    );
    const sMatch = filterShape === '전체' || prod.shape === filterShape ;
    return pMatch && sMatch;
  });

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans" id="applet-main-body">
      
      {/* Dynamic SEO Meta Title Injection */}
      {!adminMode && (
        <Header 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          adminMode={adminMode} 
          setAdminMode={setAdminMode}
          siteSettings={siteSettings}
        />
      )}

      <main className="flex-grow">
        
        {/* Render Admin Mode Panel Separately */}
        {adminMode ? (
          <AdminPanel 
            products={products}
            onUpdateProducts={handleUpdateProducts}
            inquiries={inquiries}
            onUpdateInquiries={handleUpdateInquiries}
            notices={notices}
            onUpdateNotices={handleUpdateNotices}
            settings={siteSettings}
            onUpdateSettings={handleUpdateSettings}
            onClose={() => setAdminMode(false)}
          />
        ) : (
          <AnimatePresence mode="wait">
            
            {/* TAB 1: HOME PAGE */}
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                id="page-home"
              >
                
                {/* A. HERO SECTION */}
                <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/30 via-white to-white py-24 sm:py-32" id="home-hero">
                  
                  {/* Visual Background Details */}
                  <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#00A3FF] to-[#00B4D8] opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72rem]" />
                  </div>

                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                      
                      {/* Left copywriting */}
                      <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                        
                        <div className="inline-block px-3 py-1 bg-white border border-[#00A3FF] text-[#00A3FF] text-xs font-bold rounded-sm uppercase tracking-wider">
                          PREMIUM PACKAGING SOLUTION
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-sans text-[#212529] tracking-tight leading-[1.1] break-keep">
                          식품과 공산품을 담는<br />
                          포장재 전문기업, <span className="text-[#00A3FF]">엔디팩</span>
                        </h1>

                        <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-gray-500 leading-relaxed font-medium break-keep">
                          최첨단 디지털 인쇄 기술과 철저한 위생 시스템으로 최상의 브랜드 가치를 담아냅니다.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
                          <button
                            onClick={() => { setActiveTab('inquiry'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="px-8 py-3.5 bg-[#00A3FF] text-white text-sm font-bold rounded-full hover:bg-[#0096C7] transition-all text-center shadow-md active:scale-95"
                            id="hero-cta-inquiry"
                          >
                            견적문의 바로가기
                          </button>
                          <button
                            onClick={() => { handleTabChange('products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="px-8 py-3.5 bg-white text-[#212529] text-sm font-bold border border-gray-200 hover:bg-[#F8F9FA] rounded-full transition-all text-center active:scale-95"
                            id="hero-cta-products"
                          >
                            제품 둘러보기
                          </button>
                        </div>
                      </div>

                      {/* Right 3D Cube & Product collage preview */}
                      <div className="mt-16 lg:mt-0 lg:col-span-5 flex justify-center py-5">
                        <div className="relative w-full max-w-sm aspect-square bg-gray-50 rounded-3xl border border-gray-100 p-8 shadow-inner flex flex-col justify-between items-center group overflow-hidden">
                          {/* Floating backdrop blur light */}
                          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl group-hover:bg-blue-400/30 transition-all duration-500" />
                          
                          {/* Large high quality product render SVG logo inside home */}
                          <svg className="w-48 h-48 drop-shadow-xl animate-float mt-4" viewBox="0 0 120 120" fill="none">
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

                          <div className="text-center space-y-1 z-10 w-full bg-white/70 backdrop-blur border border-gray-100 p-4 rounded-xl">
                            <p className="text-sm font-bold text-[#00A3FF] tracking-wider uppercase font-mono">Precision Packaging Solution</p>
                            <p className="text-base font-black text-gray-800">엔디팩 3차원 입체 밀봉 가공 시스템</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </section>

                {/* C. FEATURED PRODUCTS PREVIEW GRID */}
                <section className="py-20 bg-gray-50/50" id="home-products-featured">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
                      <div>
                        <h2 className="text-xs font-bold text-[#00A3FF] uppercase tracking-widest font-mono">PRODUCT PREVIEW</h2>
                        <h3 className="text-2xl font-black text-gray-900 mt-2 select-none">카테고리별 주력 패키지</h3>
                      </div>
                      <button 
                        onClick={() => { handleTabChange('products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="text-xs font-bold text-[#00A3FF] hover:underline flex items-center space-x-1 shrink-0"
                      >
                        <span>전체 제품 둘러보기</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {products.filter(p => p.visible !== false).slice(0, 4).map((prod) => (
                        <div 
                          key={prod.id}
                          onClick={() => { setSelectedProduct(prod); }}
                          className="bg-white rounded-2xl border border-gray-100 hover:border-[#00A3FF]/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col h-full"
                        >
                          <div className="relative overflow-hidden shrink-0">
                            <ProductImage 
                             src={prod.imageUrl} 
                              type={prod.thumbnailType}
                              fileName={prod.thumbnailFileName}
                              alt={prod.name} 
                              aspectRatio="square"
                              className="group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3 flex flex-wrap gap-1 select-none max-w-[calc(100%-24px)] z-10">
                              {Array.isArray(prod.purpose) ? (
                                prod.purpose.map((p) => (
                                  <span key={p} className="bg-[#00A3FF] text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase shadow-sm">
                                    {p}
                                  </span>
                                ))
                              ) : (
                                <span className="bg-[#00A3FF] text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase shadow-sm">
                                  {prod.purpose}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-5 flex-grow flex flex-col justify-start space-y-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">{prod.shape}</span>
                            <h4 className="text-sm font-extrabold text-gray-800 group-hover:text-[#00A3FF] transition-colors leading-snug line-clamp-2">
                              {prod.name}
                            </h4>
                            <p className="text-[11px] text-gray-400 leading-normal line-clamp-2 font-medium">
                              {prod.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </section>


                {/* D. RECENT NOTICES/NEWS */}
                <section className="py-20 bg-white" id="home-notices-featured">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
                      <div>
                        <h2 className="text-xs font-bold text-[#00A3FF] uppercase tracking-widest font-mono">NOTICE & PRESS</h2>
                        <h3 className="text-2xl font-black text-gray-900 mt-2 select-none">엔디팩 연구소 및 주요 소식</h3>
                      </div>
                      <button 
                        onClick={() => { setActiveTab('notices'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="text-xs font-bold text-[#00A3FF] hover:underline flex items-center space-x-1 shrink-0"
                      >
                        <span>공지사항 목록 가기</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="border border-gray-150 rounded-2xl overflow-hidden divide-y divide-gray-150 bg-white shadow-sm" id="home-notices-list">
                      {notices.filter(n => n.visible !== false).slice(0, 3).map((notice) => (
                        <div 
                          key={notice.id}
                          onClick={() => { setSelectedNotice(notice); setActiveTab('notices'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50/50 cursor-pointer text-sm font-semibold select-none group transition-all duration-200"
                        >
                          <div className="space-y-1.5 min-w-0 pr-4 flex-grow">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 text-xs font-bold rounded shrink-0 leading-none ${
                                notice.category === '공지사항' 
                                  ? 'bg-red-50 text-red-600 border border-red-100' 
                                  : notice.category === '제품소식'
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {notice.category}
                              </span>
                              <span className="font-mono text-xs text-gray-400 font-bold">{notice.createdAt}</span>
                            </div>
                            <h4 className="text-base font-extrabold text-gray-800 group-hover:text-[#00A3FF] transition-colors leading-snug line-clamp-1">
                              {notice.title}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium leading-normal line-clamp-1">
                              {notice.content}
                            </p>
                          </div>

                          <div className="flex items-center space-x-4 text-gray-400 mt-3 md:mt-0 select-none shrink-0 text-xs font-bold">
                            <span>조회수 {notice.views}회</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </section>

              </motion.div>
            )}


            {/* TAB 2: ABOUT US (회사소개) */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                id="page-about"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24"
              >
                {/* 1. Page Title */}
                <PageHeader 
                  eyebrow="COMPANY PROFILE"
                  title={<>깨끗한 공정과 안정적인 품질로,<br />제품의 가치를 온전히 전합니다.</>}
                  mbClass="mb-12 border-b border-gray-105 pb-12 !max-w-4xl"
                  className="!text-center md:!text-left"
                />


                {/* 2. CEO greeting */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start" id="ceo-section">
                  <div className="lg:col-span-12 xl:col-span-5 relative bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col justify-between overflow-hidden">
                    {/* Visual profile preview */}
                    {!aboutImageError ? (
                      <img 
                        src="/images/common/sign-01.png" 
                        alt="Greeting" 
                        referrerPolicy="no-referrer"
                        className="w-full h-80 object-cover rounded-2xl"
                        onError={() => setAboutImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-80 bg-blue-50/30 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-dashed border-blue-100/80">
                        <div className="p-3 bg-blue-50 rounded-full border border-blue-100/60 mb-3 text-[#00A3FF]">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-extrabold text-gray-700">대표이사 서명 및 전경 이미지</h4>
                        <p className="text-[11px] text-gray-400 mt-1 font-semibold leading-normal max-w-xs">
                          기획부터 인쇄, 완가공 출고까지 정성을 다할 것을 약속하는 엔디팩의 공식 회사 소개 이미지 준비 중입니다.
                        </p>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-base font-extrabold text-gray-800">대표이사 {siteSettings.ceoName}</p>
                        <p className="text-sm text-gray-500 font-bold tracking-tight">New Developing Pack 대표 및 총괄</p>
                      </div>
                      <span className="font-mono text-xl font-bold text-[#00A3FF]">ND Pack</span>
                    </div>
                  </div>

                  <div className="lg:col-span-12 xl:col-span-7 space-y-6 text-gray-800 text-base font-medium">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-black text-gray-900 leading-relaxed break-keep tracking-tight">
                      안녕하십니까. 엔디팩(New Developing Pack)을 찾아주신 고객 여러분께 진심으로 감사드립니다.
                    </h3>
                    <div className="leading-relaxed space-y-5 font-sans text-gray-700">
                      <p className="text-base md:text-lg">
                        엔디팩은 1990년 창립 이래 포장재 인쇄와 가공 제조 분야에 집중해 온 전문 기업입니다. 비닐팩, 파우치, 기능성 필름 합지, 그라비어 인쇄 등 다양한 생산 경험을 바탕으로 고객 제품에 적합한 포장 솔루션을 제공하고 있습니다.
                      </p>
                      <p className="text-base md:text-lg">
                        포장재는 제품을 보호하고 브랜드 가치를 전달하는 중요한 요소입니다. 엔디팩은 정확한 공정 관리와 안정적인 품질 기준을 바탕으로 식품, 생활용품, 산업용 제품 등 다양한 분야에 맞는 포장재를 제조하고 있습니다.
                      </p>
                      <p className="text-base md:text-lg">
                        앞으로도 고객사의 요구에 맞춘 합리적인 제안과 성실한 납기 대응으로 신뢰받는 포장재 인쇄·제조 파트너가 되겠습니다.
                      </p>
                      <p className="text-base md:text-lg">
                        감사합니다.
                      </p>
                    </div>
                    {/* Sign-off */}
                    <div className="pt-6 flex flex-col items-end pr-5">
                      <p className="text-sm text-gray-500 font-bold">New Developing Pack 임직원 일동 드림</p>
                      <span className="text-base font-black text-gray-900 tracking-tight mt-1">대표이사 {siteSettings.ceoName}</span>
                    </div>
                  </div>
                </div>


                {/* 3. Visions */}
                <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-100" id="vision-mission-cards">
                  <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
                    <h3 className="text-sm font-black text-[#00A3FF] uppercase tracking-wider font-mono">VALUES & MISSION</h3>
                    <h4 className="text-2xl font-black text-gray-900 font-extrabold text-gray-800">엔디팩 경영 3대 핵심 기치</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6.5">
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3 text-center md:text-left">
                      <div className="w-10 h-10 bg-blue-50 text-[#00A3FF] rounded-xl flex items-center justify-center mx-auto md:mx-0 font-bold text-sm">01</div>
                      <h5 className="text-base font-black text-gray-900">철저한 위생 안전 보전율</h5>
                      <span className="text-sm text-gray-600 block leading-relaxed font-semibold">
                        생산 공정 전 과정에 오염 방지 제어 가이드라인을 도입하고 이지컷 등 개봉자 안전까지 실무 고안합니다.
                      </span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3 text-center md:text-left">
                      <div className="w-10 h-10 bg-blue-50 text-[#00A3FF] rounded-xl flex items-center justify-center mx-auto md:mx-0 font-bold text-sm">02</div>
                      <h5 className="text-base font-black text-gray-900">오차 제쇄 초정밀 가공</h5>
                      <span className="text-sm text-gray-600 block leading-relaxed font-semibold">
                        자동 슬리팅 및 연속 열접착 시 미세한 벌어짐이나 열주름 불량을 0.01% 이하로 모니터링 관리합니다.
                      </span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3 text-center md:text-left">
                      <div className="w-10 h-10 bg-blue-50 text-[#00A3FF] rounded-xl flex items-center justify-center mx-auto md:mx-0 font-bold text-sm">03</div>
                      <h5 className="text-base font-black text-gray-900">상생적 원가 절감 제안</h5>
                      <span className="text-sm text-gray-600 block leading-relaxed font-semibold">
                        고객사 원고 절감을 위해 과스펙 두께는 합리적으로 슬림화하되, 차단성은 완벽히 지키는 대체 배리어를 구성해 드립니다.
                      </span>
                    </div>

                  </div>
                </div>


                {/* 4. Timeline History */}
                <div className="space-y-12" id="about-history">
                  <div className="text-center md:text-left max-w-4xl space-y-2">
                    <h3 className="text-sm font-black text-[#00A3FF] uppercase tracking-wider font-mono">HISTORY OF ND PACK</h3>
                    <h4 className="text-2xl font-black text-gray-900">엔디팩 30년사 발자취</h4>
                    <p className="text-sm text-gray-500 font-semibold">포장 기술 진화의 흐름을 리드해 온 역사적인 매일입니다.</p>
                  </div>

                  <div className="relative border-l border-gray-200 ml-5 md:ml-32 pl-8 space-y-10">
                    {HISTORY_DATA.map((item, idx) => (
                      <div key={idx} className="relative group">
                        
                        {/* Dot */}
                        <div className="absolute -left-10 top-[21px] w-4 h-4 rounded-full bg-white border-[3px] border-[#00A3FF] group-hover:scale-115 transition-transform" />
                        
                        {/* Left Side Year for desktop */}
                        <div className="hidden md:block absolute -left-36 top-[13px] text-right w-24">
                          <span className="text-xl font-black text-gray-800">{item.year}년</span>
                          <span className="text-xs text-[#00A3FF] font-extrabold block">{item.month}월</span>
                        </div>

                        {/* Content */}
                        <div className="space-y-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100 group-hover:border-blue-100 group-hover:bg-white transition-all text-sm">
                          {/* Year label for mobile */}
                          <span className="inline-block md:hidden font-black text-[#00A3FF] text-[15px] mr-1.5 leading-none">
                            {item.year}년 {item.month}월
                          </span>
                          <p className="font-extrabold text-gray-800 text-sm md:text-base leading-tight md:mt-0">{item.event}</p>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}


            {/* TAB 3: PRODUCTS CATALOG (제품소개) */}
            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                id="page-products"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
              >
                
                {/* Product Title */}
                <PageHeader 
                  eyebrow="SPECIFICATION & CATALOG"
                  title="제품별 포장 사양 찾기"
                  description={`포장 용도와 형태를 기준으로 엔디팩의 다양한 포장 제품을 확인해 보세요. 제품 특성에 따라 적용 가능한 포장 방식은 달라질 수 있으며, 
원하는 조건이 있으시면 문의를 통해 맞춤 상담을 받아보실 수 있습니다.`}
                  mbClass="mb-16"
                />


                {/* Advanced Dual-Axis Filter Board */}
                <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-100 mb-12 space-y-5" id="product-filtering-panel">
                  
                  {/* Axis 1: Purpose Filter */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pb-4 border-b border-gray-100">
                    <span className="text-base font-black text-gray-500 w-20 sm:w-28 uppercase shrink-0">용도별</span>
                    <div className="flex flex-wrap gap-4 pt-1 select-none">
                      {PurposesList.map((purp) => {
                        const isSelect = filterPurposes.includes(purp);
                        return (
                          <button
                            key={purp}
                            onClick={() => {
                              setShowProductList(true);
                              if (purp === '전체') {
                                setFilterPurposes(['전체']);
                              } else {
                                let next = filterPurposes.filter(p => p !== '전체');
                                if (next.includes(purp)) {
                                  next = next.filter(p => p !== purp);
                                } else {
                                  next.push(purp);
                                }
                                if (next.length === 0) {
                                  next = ['전체'];
                                }
                                setFilterPurposes(next);
                              }
                            }}
                            className={`text-base font-black pb-1 transition-all ${
                              isSelect 
                                ? 'text-[#00A3FF] border-b-2 border-[#00A3FF]' 
                                : 'text-gray-400 hover:text-[#212529]'
                            }`}
                          >
                            {purp}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Axis 2: Shape Filter */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pt-2">
                    <span className="text-base font-black text-gray-500 w-20 sm:w-28 uppercase shrink-0">형태별</span>
                    <div className="flex flex-wrap gap-2 pt-1 select-none">
                      {ShapesList.map((shp) => {
                        const isSelect = filterShape === shp;
                        return (
                          <button
                            key={shp}
                            onClick={() => {
                              setShowProductList(true);
                              setFilterShape(shp);
                            }}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                              isSelect 
                                ? 'bg-[#00A3FF] text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-[#00A3FF] hover:text-white'
                            }`}
                          >
                            {shp}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current Active Counters */}
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-gray-500 pt-3 border-t border-gray-100">
                    <p>적용된 필터: <span className="text-[#00A3FF]">{filterPurposes.join(', ')}</span> × <span className="text-[#00A3FF]">{filterShape}</span></p>
                    <button 
                      onClick={() => { setFilterPurposes(['전체']); setFilterShape('전체'); setShowProductList(true); }}
                      className="text-gray-500 hover:text-red-500 transition-colors underline"
                    >
                      필터 초기화
                    </button>
                  </div>
                </div>


                {/* Filtered Products Catalog Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="products-catalog-result-grid">
                    {filteredProducts.length === 0 ? (
                      <div className="col-span-full text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 font-bold text-sm leading-relaxed">
                        선택하신 검색 필터 조합 (용도: ‘{filterPurposes.join(', ')}’, 형태: ‘{filterShape}’) 에 해당 사양의 주력 제품은 부재중입니다. <br />
                        엔디팩은 맞춤형 전폭 신규 합지 성형이 모두 무상 가능하므로 “견적문의” 페이지를 통해 직접 요청해 주시기 바랍니다.
                      </div>
                    ) : (
                      filteredProducts.map((prod) => (
                        <div 
                          key={prod.id}
                          onClick={() => setSelectedProduct(prod)}
                          className="bg-white rounded-2xl border border-gray-100 hover:border-[#00A3FF]/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col h-full"
                        >
                          <div className="relative overflow-hidden shrink-0">
                            <ProductImage 
                              src={prod.imageUrl}
                              type={prod.thumbnailType}
                              fileName={prod.thumbnailFileName}
                              alt={prod.name} 
                              aspectRatio="square"
                              className="group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2.5 left-2.5 select-none flex flex-wrap gap-1 max-w-[calc(100%-20px)] z-10">
                              {Array.isArray(prod.purpose) ? (
                                prod.purpose.map((p) => (
                                  <span key={p} className="bg-[#00A3FF] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                                    {p}
                                  </span>
                                ))
                              ) : (
                                <span className="bg-[#00A3FF] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                                  {prod.purpose}
                                </span>
                              )}
                            </div>
                          </div>
  
                          <div className="p-5 flex-grow flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="text-xs font-bold text-gray-400 uppercase font-mono leading-none block">{prod.shape}</span>
                              <h3 className="text-base font-extrabold text-gray-800 group-hover:text-[#00A3FF] transition-colors leading-snug line-clamp-2">
                                {prod.name}
                              </h3>
                              <p className="text-xs text-gray-500 font-medium leading-normal line-clamp-2">
                                {prod.description}
                              </p>
                            </div>
  
                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-black text-gray-500">
                              <span>용도 및 상세 스펙</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>


                {/* PRODUCT DETAIL WORKFLOW EXPAND MODAL */}
                {selectedProduct && (
                  <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-default overflow-y-auto animate-fadeIn" id="product-detail-modal">
                    <div 
                      className="bg-white rounded-3xl w-full max-w-2xl border border-gray-100 overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={() => setSelectedProduct(null)}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-gray-500 hover:text-gray-800 transition-colors border border-gray-100 shadow-sm"
                        id="close-product-modal"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
                        
                        {/* Title and Top */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                          <div 
                            onClick={() => {
                              const isPdf = selectedProduct.thumbnailType === 'pdf' || 
                                            (selectedProduct.thumbnailUrl && selectedProduct.thumbnailUrl.toLowerCase().split(/[?#]/)[0].endsWith('.pdf')) ||
                                            (selectedProduct.imageUrl && selectedProduct.imageUrl.toLowerCase().split(/[?#]/)[0].endsWith('.pdf'));
                              if (isPdf) {
                                window.open(selectedProduct.thumbnailUrl || selectedProduct.imageUrl, '_blank');
                              }
                            }}
                            className={
                              (selectedProduct.thumbnailType === 'pdf' || 
                               (selectedProduct.thumbnailUrl && selectedProduct.thumbnailUrl.toLowerCase().split(/[?#]/)[0].endsWith('.pdf')) ||
                               (selectedProduct.imageUrl && selectedProduct.imageUrl.toLowerCase().split(/[?#]/)[0].endsWith('.pdf')))
                                ? "cursor-pointer hover:opacity-80 transition-opacity w-full md:w-44 shrink-0"
                                : "w-full md:w-44 shrink-0"
                            }
                          >
                            <ProductImage 
                              src={selectedProduct.imageUrl}
                              type={selectedProduct.thumbnailType}
                              fileName={selectedProduct.thumbnailFileName}
                              alt={selectedProduct.name} 
                              aspectRatio="square"
                              className="rounded-2xl border border-gray-200"
                            />
                          </div>
                          <div className="space-y-3.5 text-sm">
                            <div className="flex flex-wrap gap-1.5 select-none text-xs">
                              {Array.isArray(selectedProduct.purpose) ? (
                                selectedProduct.purpose.map((p) => (
                                  <span key={p} className="bg-[#00A3FF] text-white font-bold px-2 py-0.5 rounded leading-none uppercase">
                                    {p}
                                  </span>
                                ))
                              ) : (
                                <span className="bg-[#00A3FF] text-white font-bold px-2 py-0.5 rounded leading-none uppercase">
                                  {selectedProduct.purpose}
                                </span>
                              )}
                              <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded leading-none uppercase">
                                {selectedProduct.shape}
                              </span>
                            </div>
                            
                            <h3 className="text-xl font-black text-gray-905">{selectedProduct.name}</h3>
                            <p className="text-gray-600 leading-relaxed font-semibold text-sm">{selectedProduct.description}</p>
                            {(selectedProduct.thumbnailType === 'pdf' || 
                              (selectedProduct.thumbnailUrl && selectedProduct.thumbnailUrl.toLowerCase().split(/[?#]/)[0].endsWith('.pdf')) ||
                              (selectedProduct.imageUrl && selectedProduct.imageUrl.toLowerCase().split(/[?#]/)[0].endsWith('.pdf'))) && (
                              <div className="pt-2">
                                <a 
                                  href={selectedProduct.thumbnailUrl || selectedProduct.imageUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center space-x-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold border border-red-200 rounded-xl transition-all shadow-sm text-xs"
                                >
                                  <span>📄 PDF 카탈로그 다운로드 및 전문보기</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Specs grid */}
                        <div className="space-y-4 pt-4 border-t border-gray-100 text-sm">
                          {/* Features */}
                          <div className="space-y-2">
                            <p className="font-extrabold text-gray-500 pl-1 text-xs uppercase tracking-wide">주요 특징</p>
                            <p className="text-gray-750 font-semibold leading-relaxed text-xs sm:text-sm pl-1">
                              {selectedProduct.description}
                            </p>
                          </div>

                          {/* Applications */}
                          <div className="space-y-2 pt-2">
                            <p className="font-extrabold text-gray-500 pl-1 text-xs uppercase tracking-wide">권장 적용 상품범위</p>
                            <div className="flex flex-wrap gap-1.5 pl-1">
                              {selectedProduct.applications?.map((app, i) => (
                                <span key={i} className="bg-blue-50/70 border border-blue-100/50 rounded-lg px-2.5 py-1 text-gray-800 font-bold text-xs mr-1 mb-1">
                                  {app}
                                </span>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex justify-between items-center shrink-0">
                        <span className="text-xs text-gray-500 font-bold">이 제품 사양으로 맞춤 인쇄 견적 상담이 가능합니다.</span>
                        <button
                          onClick={() => {
                            setInquiryForm(prev => ({
                              ...prev,
                              purpose: Array.isArray(selectedProduct.purpose) 
                                ? selectedProduct.purpose[0] || '제과제빵용' 
                                : selectedProduct.purpose,
                              shape: selectedProduct.shape,
                              content: `[주력 제품군 문의: ${selectedProduct.name}]\n이 규격 카드의 추천 스펙으로 맞춤 제작 및 밴딩 의뢰 견적을 요청해 드립니다.`
                            }));
                            setSelectedProduct(null);
                            setActiveTab('inquiry');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-5 py-2.5 bg-[#00A3FF] hover:bg-opacity-90 text-white font-bold text-sm rounded-lg shadow-sm"
                          id="modal-cta-inquiry"
                        >
                          이 제품으로 견적문의
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </motion.div>
            )}


            {/* TAB: PRODUCTION FACILITIES (주요생산시설) */}
            {activeTab === 'facility' && (
              <motion.div
                key="facility"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                id="page-facility"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12"
              >
                {/* Title and Description */}
                <PageHeader 
                  eyebrow="PRODUCTION FACILITIES"
                  title="주요생산시설"
                  description="엔디팩은 고품질 포장재 생산을 위한 인쇄, 라미네이팅, 재단, 가공 설비를 기반으로 다양한 포장 제품을 안정적으로 생산하고 있습니다."
                  mbClass="mb-12"
                />

                {/* Facility Main Image Box with beautiful placeholder and overlay */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden animate-fadeIn" id="facility-showcase-panel">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-1.5 h-6 bg-[#00A3FF] rounded-full" />
                      <h3 className="text-lg font-black text-gray-800">주요 설비 이미지</h3>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                      {!facilityImageError ? (
                        <img 
                          src="/images/common/equipment-01.png" 
                          alt="ND Pack Production Facility Main" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full max-h-[500px] object-contain rounded-2xl"
                          onError={() => setFacilityImageError(true)}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                          <div className="p-4 bg-blue-50/50 rounded-full border border-blue-100">
                            <svg className="w-12 h-12 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-gray-800">엔디팩 원스톱 정밀 제조 설비 라인</h4>
                            <p className="text-xs text-gray-400 mt-1 font-bold leading-normal max-w-md">
                              그라비어 인쇄기, 드라이 라미네이터 및 고속 슬릿터 등 식약처 안전 규격에 부응하는 고밀도 합지/슬리팅 자동화 설비 전경 이미지 준비 중입니다.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Equipment Status Section */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-150 shadow-sm space-y-6" id="facility-list-panel">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-1.5 h-6 bg-[#00A3FF] rounded-full" />
                    <h3 className="text-lg font-black text-gray-800">보유 설비 현황</h3>
                  </div>

                  <div className="overflow-x-auto w-full border border-gray-150 rounded-2xl shadow-sm">
                    <table className="w-full text-left text-xs sm:text-sm text-gray-650 min-w-[800px] table-auto animate-fadeIn">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 font-extrabold uppercase tracking-wider text-xs border-b border-gray-150">
                          <th className="py-4 px-5 w-[180px] whitespace-nowrap break-keep select-none">기계명</th>
                          <th className="py-4 px-5 min-w-[220px] whitespace-nowrap break-keep select-none">모델 / 규격 / 형식</th>
                          <th className="py-4 px-5 w-[80px] text-center whitespace-nowrap break-keep select-none">대수</th>
                          <th className="py-4 px-5 min-w-[180px] whitespace-nowrap break-keep select-none">제작회사</th>
                          <th className="py-4 px-5 w-[140px] whitespace-nowrap break-keep select-none">제작년월</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {[
                          { name: '그라비아 인쇄기', spec: 'AMT-GPSP-1300 / 1300MM / 10도색', qty: 1, maker: 'A.M. TECH', date: '2012. 5.' },
                          { name: '그라비아 인쇄기', spec: 'DXG 1200-8 / 1200MM / 8도색', qty: 1, maker: '대진기계공업(주)', date: '2004. 2.' },
                          { name: '디지털 인쇄기', spec: 'INDIGO 20000 DIGITAL PRESS', qty: 1, maker: '휴렛 패커드(HP)', date: '2015. 3. 27.' },
                          { name: '익스트루젼 라미네이터', spec: '1300MM', qty: 1, maker: 'EACE 기계', date: '2003. 9.' },
                          { name: '무용제 드라이 라미네이터', spec: '1300MM', qty: 1, maker: '대일기계', date: '1996. 7.' },
                          { name: '이액형 드라이 라미네이터', spec: 'DL-1300 / 1300MM', qty: 1, maker: '대진기계공업(주)', date: '2010. 12.' },
                          { name: '이액형 무용제 드라이 라미네이터', spec: 'Simplex SL, MOD. 1300', qty: 1, maker: 'NORDMECCANICA GROUP', date: '2015. 7. 8.' },
                          { name: '이액형 무용제 드라이 라미네이터', spec: 'Super Simplex SL, MOD. / 1300MM', qty: 1, maker: 'NORDMECCANICA GROUP', date: '2019. 5. 9.' },
                          { name: '슬릿터 기계', spec: 'FW102-1350L / 1350MM', qty: 1, maker: '(주)오성전기계', date: '2016. 12.' },
                          { name: '슬릿터 기계', spec: 'FW101-1300L / 1200MM', qty: 1, maker: '(주)오성기계', date: '1999. 8.' },
                          { name: '슬릿터 기계', spec: 'FW101-1300L / 1200MM', qty: 1, maker: '(주)오성기계', date: '2007. 4.' },
                          { name: '슬릿터 기계', spec: 'BK-101 / 1200MM', qty: 1, maker: '(주)보광기계', date: '1995. 4.' }
                        ].map((equip, i) => (
                          <tr key={i} className="hover:bg-gray-50/40 transition-colors font-semibold text-xs sm:text-sm">
                            <td className="py-4.5 px-5 text-gray-800 font-extrabold whitespace-nowrap break-keep">{equip.name}</td>
                            <td className="py-4.5 px-5 text-gray-600 break-keep font-sans">{equip.spec}</td>
                            <td className="py-4.5 px-5 text-center font-mono font-bold text-gray-800">{equip.qty}</td>
                            <td className="py-4.5 px-5 text-gray-600 break-keep">{equip.maker}</td>
                            <td className="py-4.5 px-5 text-gray-500 font-mono whitespace-nowrap break-keep">{equip.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: PRODUCTION PROCESS (생산공정) */}
            {activeTab === 'process' && (
              <motion.div
                key="process"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                id="page-process"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12"
              >
                {/* Title */}
                <PageHeader 
                  eyebrow="MANUFACTURING PROCESS"
                  title="엔디팩 정밀 제조공정"
                  description="기획부터 출고까지 유기적으로 연결된 생산라인을 통해, 차단성과 내구성을 갖춘 포장재를 안정적으로 생산합니다."
                  mbClass="mb-10"
                />

                {/* Flowchart Panel Container (B2B Manufacturing Aesthetic style, text-boxes diagram flow, no photos) */}
                <div className="w-full py-4 space-y-6" id="process-flowchart-container">
                  
                  {/* Desktop Layout (md and up): snake-flow or grid-row flow */}
                  <div className="hidden md:block space-y-4">
                    {[
                      [
                        { id: '01', name: '원고제작' },
                        { id: '02', name: '교정' },
                        { id: '03', name: '필름 / 동판제작' },
                        { id: '04', name: '칼라확인' }
                      ],
                      [
                        { id: '05', name: '인쇄' },
                        { id: '06', name: '드라이라미 / 익스트루전' },
                        { id: '07', name: '경화' },
                        { id: '08', name: '재단 / 가공' }
                      ],
                      [
                        { id: '09', name: '검사' },
                        { id: '10', name: '포장' },
                        { id: '11', name: '출고' }
                      ]
                    ].map((row, rowIdx, allRows) => (
                      <div key={rowIdx} className="space-y-4">
                        {row.length === 4 ? (
                          <div className="flex items-center w-full justify-between">
                            {row.map((step, stepIdx) => (
                              <React.Fragment key={step.id}>
                                {/* Step Card Frame (Refined Light Theme Compact Box, Flat, No Hover Effects) */}
                                <div 
                                  style={{ width: 'calc((100% - 120px) / 4)' }}
                                  className="bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-left flex items-center space-x-3 h-12 cursor-default select-none shrink-0"
                                >
                                  <span className="text-[10px] font-bold text-[#00A3FF] font-mono leading-none bg-blue-50 border border-blue-100/60 px-1.5 py-0.5 rounded shrink-0">
                                    {step.id}
                                  </span>
                                  <span className="text-xs sm:text-sm font-semibold text-gray-700 tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis">{step.name}</span>
                                </div>

                                {/* Arrow Right within row - Centered inside gap (Thin linear styling) */}
                                {stepIdx < row.length - 1 && (
                                  <div className="w-10 shrink-0 flex items-center justify-center text-gray-300 select-none pointer-events-none">
                                    <div className="flex items-center justify-center w-full">
                                      <div className="h-[1px] w-3 bg-gray-200"></div>
                                      <ArrowRight className="w-3 h-3 text-gray-400 stroke-[2] -ml-[1.5px]" />
                                    </div>
                                  </div>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        ) : (
                          <div className="flex justify-center w-full">
                            {row.map((step, stepIdx) => (
                              <React.Fragment key={step.id}>
                                {/* Step/Card Frame */}
                                <div 
                                  style={{ width: 'calc((100% - 120px) / 4)' }}
                                  className="bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-left flex items-center space-x-3 h-12 cursor-default select-none shrink-0"
                                >
                                  <span className="text-[10px] font-bold text-[#00A3FF] font-mono leading-none bg-blue-50 border border-blue-100/60 px-1.5 py-0.5 rounded shrink-0">
                                    {step.id}
                                  </span>
                                  <span className="text-xs sm:text-sm font-semibold text-gray-700 tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis">{step.name}</span>
                                </div>

                                {/* Arrow Right within row (Thin linear styling) */}
                                {stepIdx < row.length - 1 && (
                                  <div className="w-10 shrink-0 flex items-center justify-center text-gray-300 select-none pointer-events-none">
                                    <div className="flex items-center justify-center w-full">
                                      <div className="h-[1px] w-3 bg-gray-200"></div>
                                      <ArrowRight className="w-3 h-3 text-gray-400 stroke-[2] -ml-[1.5px]" />
                                    </div>
                                  </div>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {/* Connection arrow pointing down at the end of row (Visually distinct bold down transition) */}
                        {rowIdx < allRows.length - 1 && (
                          <div className="flex flex-col items-center justify-center py-4 select-none pointer-events-none">
                            <div className="w-[1.5px] h-6 bg-gradient-to-b from-gray-250 to-[#00A3FF]"></div>
                            <div className="bg-[#00A3FF]/10 border border-[#00A3FF]/30 p-1.5 rounded-full -mt-1.5 flex items-center justify-center shadow-xs">
                              <ArrowDown className="w-4 h-4 text-[#00A3FF] stroke-[2.5]" />
                            </div>
                            <span className="text-[9px] font-black text-[#00A3FF]/85 uppercase mt-1 tracking-wider font-sans text-center">
                              다음 단계 이동
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Mobile Layout (sm and down) */}
                  <div className="block md:hidden space-y-2 max-w-xs mx-auto">
                    {[
                      { id: '01', name: '원고제작' },
                      { id: '02', name: '교정' },
                      { id: '03', name: '필름 / 동판제작' },
                      { id: '04', name: '칼라확인' },
                      { id: '05', name: '인쇄' },
                      { id: '06', name: '드라이라미 / 익스트루전' },
                      { id: '07', name: '경화' },
                      { id: '08', name: '재단 / 가공' },
                      { id: '09', name: '검사' },
                      { id: '10', name: '포장' },
                      { id: '11', name: '출고' }
                    ].map((step, index, all) => (
                      <div key={step.id} className="flex flex-col items-center">
                        {/* Compact Mobile Card with Silver White & Dark Text, Blue Accent Badge */}
                        <div className="bg-white border border-gray-200 rounded-lg py-2 px-3.5 w-full h-11 flex items-center justify-between text-left cursor-default shadow-xs select-none">
                          <span className="text-[10px] font-bold text-[#00A3FF] font-mono leading-none bg-blue-50 border border-blue-100/60 px-1.5 py-0.5 rounded leading-none shrink-0">{step.id}</span>
                          <span className="text-xs font-semibold text-gray-700 tracking-tight whitespace-nowrap leading-none">{step.name}</span>
                        </div>
                        {index < all.length - 1 && (
                          <div className="text-gray-300 flex items-center justify-center py-1 shrink-0 select-none pointer-events-none">
                            <ArrowDown className="w-3 h-3 text-gray-300 stroke-[1.5]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}


            {/* TAB 5: INQUIRY FORM (견적문의) */}
            {activeTab === 'inquiry' && (
              <motion.div
                key="inquiry"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                id="page-inquiry"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
              >
                
                {/* Title */}
                <PageHeader 
                  eyebrow="QUOTATION INQUIRY"
                  title="포장재 무상 맞춤 견적 신청"
                  description="내용물의 특성에 맞는 필름 재질 추천과 디자인 동판인쇄에 적합한 가이드 및 견적을 1영업일 이내 송신 드립니다."
                  mbClass="mb-16"
                />


                {/* Form Frame inside Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                  
                  {/* Left segment guides info */}
                  <div className="lg:col-span-4 p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col justify-between space-y-8 text-xs font-semibold">
                    <div className="space-y-6">
                      <h3 className="text-base font-black text-gray-800 flex items-center space-x-1.5 leading-none">
                        <Info className="w-5 h-5 text-[#00A3FF]" />
                        <span>견적문의 작성 안내</span>
                      </h3>
                      
                      <div className="space-y-4 leading-normal text-gray-500 font-medium">
                        <div className="space-y-1">
                          <p className="text-gray-800 font-bold">1. 제품 크기 입력</p>
                          <p>가로, 세로, 폭 등 필요한 포장 크기를 알고 계신 경우 입력해 주세요. 정확한 규격을 모르는 경우에는 대략적인 크기만 입력해도 됩니다.</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-800 font-bold">2. 포장 형태 선택</p>
                          <p>삼방형, T형, 지퍼형, 자동롤형 등 원하는 포장 형태를 선택해 주세요. 어떤 형태가 적합한지 모르겠다면 문의내용에 간단히 적어주시면 됩니다.</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-800 font-bold">3. 참고자료 첨부</p>
                          <p>디자인 시안, 제품 사진, 기존 포장재 사진, 참고자료가 있다면 첨부해 주세요. 자료가 없어도 견적문의는 가능합니다.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                      <p className="font-extrabold text-[#00A3FF]">엔디팩 비즈니스 전용 수신처</p>
                      <p className="text-gray-400">대표전화: <span className="text-gray-800 font-extrabold ml-1 font-mono">{siteSettings.phone}</span></p>
                      <p className="text-gray-400">접수메일: <span className="text-gray-800 font-bold ml-1 font-mono break-all">{siteSettings.email}</span></p>
                    </div>
                  </div>

                  {/* Right Form segment */}
                  <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
                    <form 
                      onSubmit={handleInquirySubmit} 
                      className="space-y-6 text-xs text-gray-700" 
                      id="b2b-inquiry-form-actual"
                      name="contact-form"
                      method="POST"
                      data-netlify="true"
                      encType="multipart/form-data"
                    >
                      <input type="hidden" name="form-name" value="contact-form" />
                      
                      {/* Company Info row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <div className="space-y-1.5">
                          <label className="font-extrabold text-gray-600 block">업체명 *</label>
                          <input 
                            type="text"
                            name="company"
                            required
                            placeholder="예: 주식회사 엔디팩"
                            value={inquiryForm.companyName}
                            onChange={handleInquiryChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF] font-semibold text-gray-800"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-extrabold text-gray-600 block">담당자명/부서 *</label>
                          <input 
                            type="text"
                            name="name"
                            required
                            placeholder="예: 홍길동 과장 / 구매팀"
                            value={inquiryForm.contactName}
                            onChange={handleInquiryChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-extrabold text-gray-600 block">연락처 *</label>
                          <input 
                            type="text"
                            name="phone"
                            required
                            placeholder="예: 010-1234-5678"
                            value={inquiryForm.phone}
                            onChange={handleInquiryChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF] font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-extrabold text-gray-600 block">이메일</label>
                          <input 
                            type="email"
                            name="email"
                            placeholder="예: contact@example.com"
                            value={inquiryForm.email}
                            onChange={handleInquiryChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF]"
                          />
                        </div>

                      </div>

                      {/* Dropdowns purpose shape */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <div className="space-y-1.5">
                          <label className="font-extrabold text-gray-600 block">포장 용도 *</label>
                          <select
                            name="purpose"
                            value={inquiryForm.purpose}
                            onChange={handleInquiryChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#00A3FF] font-semibold text-gray-800"
                          >
                            <option value="제과제빵용">제과제빵용 (빵, 디저트, 쿠키)</option>
                            <option value="농·축·수산물용">농·축·수산물용 (진공, 냉동보존)</option>
                            <option value="가공식품용">가공식품용 (소스, 레토르트)</option>
                            <option value="공산품용">공산품용 (마스크, 기계소재)</option>
                            <option value="기타">기타 용도 의뢰</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-extrabold text-gray-600 block">포장 형태 *</label>
                          <select
                            name="shape"
                            value={inquiryForm.shape}
                            onChange={handleInquiryChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none"
                          >
                            <option value="삼방형">삼방형 (표준 삼면 압착 봉합)</option>
                            <option value="T형">T형 (봉지과자, 배면 수직 융착)</option>
                            <option value="파우치형">파우치형 (소형 진열 파우치)</option>
                            <option value="지퍼형">지퍼형 (보관용 스탠딩 지퍼백)</option>
                            <option value="M형">M형 (측면 접이 넓은 입체백)</option>
                            <option value="레토르트형">레토르트형 (고온가압 멸균 기능성)</option>
                            <option value="자동롤형">자동롤형 (자동 피딩 기계 장착 롤필름)</option>
                          </select>
                        </div>

                      </div>

                      {/* Dimensions Specs Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                        
                        <div className="sm:col-span-3 space-y-1.5">
                          <label className="font-extrabold text-gray-600 block">포장 크기 (가로 × 세로 × 폭 mm) *</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="number"
                              name="width"
                              placeholder="가로"
                              value={inquiryForm.width}
                              onChange={handleInquiryChange}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-sans text-center"
                            />
                            <span>x</span>
                            <input 
                              type="number"
                              name="length"
                              placeholder="세로"
                              value={inquiryForm.length}
                              onChange={handleInquiryChange}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-sans text-center"
                            />
                            <span>x</span>
                            <input 
                              type="number"
                              name="gusset"
                              placeholder="폭"
                              value={inquiryForm.gusset}
                              onChange={handleInquiryChange}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-sans text-center"
                            />
                            <span className="text-gray-400 font-bold shrink-0">mm</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-extrabold text-gray-600 block">희망 수량 (장) *</label>
                          <input 
                            type="number"
                            name="quantity"
                            placeholder="예: 20,000장"
                            value={inquiryForm.quantity}
                            onChange={handleInquiryChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 font-mono text-center font-bold text-gray-800"
                          />
                        </div>

                      </div>

                      {/* Interactive Drag & Drop File Upload area */}
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-gray-600 block">참고자료 첨부</label>
                        <div 
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                            isDragOver 
                              ? 'border-[#00A3FF] bg-blue-50/20' 
                              : uploadedFile 
                                ? 'border-green-400 bg-green-50/10' 
                                : 'border-gray-300 hover:border-[#00A3FF]/40 bg-gray-50/40'
                          }`}
                        >
                          <input 
                            type="file"
                            id="file-input-actual"
                            name="attachment"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label htmlFor="file-input-actual" className="cursor-pointer space-y-2.5 block select-none">
                            <Upload className={`w-8 h-8 mx-auto ${uploadedFile ? 'text-green-500' : 'text-gray-400'}`} />
                            <div className="text-xs">
                              {uploadedFile ? (
                                <p className="font-bold text-green-600">선택 완료: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</p>
                              ) : (
                                <p className="text-gray-500">
                                  디자인 시안, 제품 사진, 기존 포장재 사진, 참고자료가 있다면 첨부해 주세요.
                                </p>
                              )}
                            </div>
                          </label>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium leading-normal mt-1.5 pl-1">
                          ※ 첨부파일은 선택사항이며, 8MB 이하 파일만 첨부 가능합니다. 대용량 자료는 견적문의 접수 후 이메일로 별도 전달해 주세요.
                        </p>
                      </div>

                      {/* Content textarea */}
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-gray-600 block">추가 요청사항 및 문의내용</label>
                        <textarea 
                          name="message"
                          rows={5}
                          placeholder="포장할 제품 종류, 원하는 포장 형태, 수량, 참고사항 등을 자유롭게 적어주세요. 잘 모르시는 부분은 비워두셔도 됩니다."
                          value={inquiryForm.content}
                          onChange={handleInquiryChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF] leading-relaxed font-sans text-gray-800"
                        />
                      </div>

                      {/* Terms safety */}
                      <p className="text-[10px] text-gray-400 leading-normal font-sans">
                        ※ 엔디팩은 고객님이 제출하신 기업 고유 도판 일러스트 가이드 정보 및 이메일 수신 처리에 있어 통신 비밀 준수 법령을 준수하고 있으며, 무단 상업적 유출을 전격 차단 보존합니다.
                      </p>

                      {/* Submit */}
                      <div className="pt-2 border-t border-gray-150 flex justify-end">
                        <button
                          type="submit"
                          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-[#00A3FF] hover:opacity-95 text-white font-extrabold text-sm rounded-xl shadow-lg transition-transform transform active:scale-95"
                          id="submit-inquiry-button"
                        >
                          무상 맞춤 견적 신청 완료하기
                        </button>
                      </div>

                    </form>
                  </div>

                </div>


                {/* INQUIRY SUCCESS CONFIRMATION MODAL */}
                {showInquirySuccess && (
                  <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="success-inquiry-modal">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-gray-100 text-center space-y-5 shadow-2xl animate-scaleUp">
                      <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-100 shadow-inner">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      
                      <div className="space-y-1.5 text-xs">
                        <h3 className="text-base font-black text-gray-800">무상 견적 신청 접수 완료</h3>
                        <p className="text-gray-500 leading-relaxed font-semibold">
                          성공적으로 엔디팩 B2B 견적 DB에 등록되었습니다. 전당 엔지니어가 검토 후 기밀 견적서 이메일 전송 또는 유선 상담 드리겠습니다.
                        </p>
                      </div>

                      <div className="p-3.5 bg-gray-50 rounded-xl space-y-1 text-center font-mono text-[10px] text-gray-400">
                        <p>의뢰 접수 고유번호 ID: inq-{Date.now().toString().slice(-6)}</p>
                        <p>접수 타임스탬프: {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC</p>
                      </div>

                      <button
                        onClick={() => setShowInquirySuccess(false)}
                        className="w-full py-3 bg-[#00A3FF] text-white text-sm font-bold rounded-xl shadow hover:opacity-95 transition-opacity"
                        id="dismiss-success-modal"
                      >
                        확인 완료 및 돌아가기
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            )}


            {/* TAB 6: NOTICES BOARD (고객센터) */}
            {activeTab === 'notices' && (
              <motion.div
                key="notices"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                id="page-notices"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
              >
                
                {/* Board detail view (Toggle standard post) */}
                {selectedNotice ? (
                  <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn" id="notice-detail-view">
                    
                    {/* Back header */}
                    <button
                      onClick={() => { setSelectedNotice(null); }}
                      className="px-4 py-2 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-lg border border-gray-200 flex items-center space-x-1.5 self-start transition-colors"
                      id="notice-back-button"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>공지 목록</span>
                    </button>

                    {(() => {
                      const visibleNotices = notices.filter(n => n.visible !== false);
                      const currentIdx = visibleNotices.findIndex(n => n.id === selectedNotice.id);
                      const prevPost = (currentIdx !== -1 && currentIdx < visibleNotices.length - 1) ? visibleNotices[currentIdx + 1] : null;
                      const nextPost = (currentIdx > 0) ? visibleNotices[currentIdx - 1] : null;

                      return (
                        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                          
                          {/* Meta titles */}
                          <div className="space-y-3.5 border-b border-gray-100 pb-6 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded shrink-0 leading-none ${
                                selectedNotice.category === '공지사항' ? 'bg-red-50 text-red-600 border border-red-100' :
                                selectedNotice.category === '제품소식' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {selectedNotice.category}
                              </span>
                              <span className="font-mono text-gray-400 font-bold">{selectedNotice.createdAt}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-400 font-medium">조회수 {selectedNotice.views}회</span>
                            </div>
                            <h1 className="text-lg sm:text-2xl font-black text-gray-800 leading-tight">
                              {selectedNotice.title}
                            </h1>
                          </div>

                          {/* Content Section & Banner photo (Only PDF allowed, Images are omitted) */}
                          {selectedNotice.imageUrl && (() => {
                            const isPdf = selectedNotice.imageType === 'pdf' || 
                                          selectedNotice.imageUrl.toLowerCase().split(/[?#]/)[0].endsWith('.pdf');
                            if (isPdf) {
                              return (
                                <div className="w-full h-44 flex flex-col items-center justify-center space-y-2 text-red-500 font-bold border border-red-100 bg-red-50/30 rounded-2xl p-4">
                                  <FileText className="w-12 h-12 text-red-500" />
                                  <span className="text-sm text-gray-700 truncate max-w-md block">
                                    {selectedNotice.imageFileName || 'PDF 설명 자료'}
                                  </span>
                                  <a
                                    href={selectedNotice.imageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow transition-colors"
                                  >
                                    PDF 문서 열기 / 보기
                                  </a>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          <div className="text-sm text-gray-700 leading-relaxed font-sans whitespace-pre-wrap select-text selection:bg-[#00A3FF] selection:text-white pb-6 border-b border-gray-100">
                            {selectedNotice.content}
                          </div>

                          {/* Attachments Section */}
                          {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                            <div className="pt-4 border-t border-gray-100 space-y-3">
                              <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">첨부파일 다운로드 ({selectedNotice.attachments.length})</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {selectedNotice.attachments.map((file, idx) => (
                                  <a
                                    key={idx}
                                    href={file.fileUrl}
                                    download={file.fileName}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-150 rounded-xl transition-colors text-xs text-gray-700"
                                  >
                                    <div className="flex items-center space-x-2 min-w-0">
                                      <FileText className="w-5 h-5 text-red-500 shrink-0" />
                                      <div className="min-w-0">
                                        <p className="font-bold truncate">{file.fileName}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">{(file.fileSize / 1024).toFixed(1)} KB</p>
                                      </div>
                                    </div>
                                    <span className="text-[#00A3FF] hover:underline shrink-0 font-bold ml-2">다운로드</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Previous / Next Post Navigation */}
                          <div className="pt-6 mt-8 border-t border-gray-100 space-y-3" id="notice-prev-next-nav">
                            <div className="flex flex-col space-y-2 text-xs sm:text-sm">
                              {/* Next Post Line */}
                              <div 
                                onClick={() => {
                                  if (nextPost) {
                                    const updated = notices.map(p => p.id === nextPost.id ? { ...p, views: p.views + 1 } : p);
                                    handleUpdateNotices(updated);
                                    setSelectedNotice({ ...nextPost, views: nextPost.views + 1 });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }
                                }}
                                className={`flex items-center p-3.5 rounded-xl border border-gray-100 transition-colors select-none ${
                                  nextPost 
                                    ? 'bg-white hover:bg-gray-50/85 cursor-pointer text-gray-700' 
                                    : 'bg-gray-50/50 cursor-default text-gray-400'
                                }`}
                              >
                                <span className="w-16 sm:w-20 font-extrabold text-gray-500 shrink-0 select-none flex items-center gap-1.5 break-keep">
                                  <ChevronUp className="w-3.5 h-3.5 stroke-[2]" />
                                  다음글
                                </span>
                                <span className="text-gray-300 mx-2.5">|</span>
                                <span className="font-semibold truncate flex-grow min-w-0 tracking-tight text-left break-keep word-break-keep-all select-text">
                                  {nextPost ? nextPost.title : '다음글이 없습니다.'}
                                </span>
                              </div>

                              {/* Previous Post Line */}
                              <div 
                                onClick={() => {
                                  if (prevPost) {
                                    const updated = notices.map(p => p.id === prevPost.id ? { ...p, views: p.views + 1 } : p);
                                    handleUpdateNotices(updated);
                                    setSelectedNotice({ ...prevPost, views: prevPost.views + 1 });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }
                                }}
                                className={`flex items-center p-3.5 rounded-xl border border-gray-100 transition-colors select-none ${
                                  prevPost 
                                    ? 'bg-white hover:bg-gray-50/85 cursor-pointer text-gray-700' 
                                    : 'bg-gray-50/50 cursor-default text-gray-400'
                                }`}
                              >
                                <span className="w-16 sm:w-20 font-extrabold text-gray-500 shrink-0 select-none flex items-center gap-1.5 break-keep">
                                  <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
                                  이전글
                                </span>
                                <span className="text-gray-300 mx-2.5">|</span>
                                <span className="font-semibold truncate flex-grow min-w-0 tracking-tight text-left break-keep word-break-keep-all select-text">
                                  {prevPost ? prevPost.title : '이전글이 없습니다.'}
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="space-y-12" id="notices-list-view">
                    
                    {/* Title */}
                    <PageHeader 
                      eyebrow="CUSTOMER NOTICES"
                      title="엔디팩 고객 공지센터"
                      description="당사 식품안전 연구소의 특허 소식부터 생산라인 위생 검사 안내 등을 신속하게 공유합니다."
                      mbClass="mb-16"
                    />

                    {/* Category Filter Buttons */}
                    <div className="flex flex-wrap gap-2.5 mb-6 select-none" id="notices-category-filter">
                      {['전체', '공지사항', '제품소식', '보도자료'].map((cat) => {
                        const isSelect = noticeCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => { setNoticeCategory(cat); setNoticePage(1); }}
                            className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                              isSelect 
                                ? 'bg-[#00A3FF] text-white shadow-md shadow-[#00A3FF]/15 border border-[#00A3FF]' 
                                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 border border-gray-200'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Filter and board utilities bar */}
                    <div className="bg-gray-50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border border-gray-100">
                      
                      {/* Search box block */}
                      <div className="relative w-full sm:max-w-xs">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                        <input 
                          type="text"
                          placeholder="검색어를 입력해 주세요... (예: 친환경)"
                          value={noticeSearch}
                          onChange={(e) => { setNoticeSearch(e.target.value); setNoticePage(1); }}
                          className="w-full bg-white select-all border border-gray-200 focus:outline-[#00A3FF] text-sm py-2.5 px-10 rounded-xl font-bold"
                        />
                      </div>

                      {/* Total count badge */}
                      <div className="text-sm font-bold text-gray-500 shrink-0 select-none">
                        전체등록 건수: <span className="text-[#00A3FF] font-black">{queried.length}</span> 건
                      </div>

                    </div>


                    {/* Board items result rendering */}
                    {queried.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 rounded-2xl text-gray-400 font-medium text-sm border border-gray-100">
                        검색하신 구문에 해당하는 게시글이 발견되지 않았습니다. 다른 검색어를 입력해 보세요.
                      </div>
                    ) : (
                      <div className="border border-gray-150 rounded-2xl overflow-hidden divide-y divide-gray-150 bg-white shadow-sm" id="board-standard-table-list">
                        {queried.map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => {
                              // Dynamic views increment simulation
                              const updated = notices.map(p => p.id === item.id ? { ...p, views: p.views + 1 } : p);
                              handleUpdateNotices(updated);
                              setSelectedNotice({ ...item, views: item.views + 1 });
                            }}
                            className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50/50 cursor-pointer text-sm font-semibold select-none group"
                          >
                            <div className="space-y-1.5 min-w-0 pr-4">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 text-xs font-bold rounded shrink-0 leading-none ${
                                  item.category === '공지사항' ? 'bg-red-50 text-red-600 border border-red-100' :
                                  item.category === '제품소식' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {item.category}
                                </span>
                                <span className="font-mono text-xs text-gray-400 font-bold">{item.createdAt}</span>
                              </div>
                              <h3 className="text-base font-extrabold text-gray-800 truncate group-hover:text-[#00A3FF] transition-colors leading-snug">
                                {item.title}
                              </h3>
                            </div>

                            <div className="flex items-center space-x-4 text-gray-400 mt-3 sm:mt-0 select-none shrink-0 text-xs font-bold">
                              <span>조회수 {item.views}회</span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        )}

      </main>

      <Footer 
        settings={siteSettings} 
        setActiveTab={handleTabChange} 
        setAdminMode={setAdminMode} 
      />

    </div>
  );
}

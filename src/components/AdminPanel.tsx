/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  BarChart3, 
  FileCheck, 
  FolderEdit, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Check, 
  Lock, 
  X,
  RefreshCw,
  Globe,
  Upload,
  UploadCloud,
  FileSpreadsheet,
  Image,
  FileText,
  Search
} from 'lucide-react';
import { Product, NoticeBoardPost, NoticeBoardAttachment, SiteSettings, Inquiry } from '../types';
import ProductImage from './ProductImage';

interface AdminPanelProps {
  products: Product[];
  onUpdateProducts: (products: Product[] | ((prev: Product[]) => Product[])) => void;
  inquiries: Inquiry[];
  onUpdateInquiries: (inquiries: Inquiry[] | ((prev: Inquiry[]) => Inquiry[])) => void;
  notices: NoticeBoardPost[];
  onUpdateNotices: (notices: NoticeBoardPost[] | ((prev: NoticeBoardPost[]) => NoticeBoardPost[])) => void;
  settings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => void;
  onClose: () => void;
}

export default function AdminPanel({
  products,
  onUpdateProducts,
  inquiries,
  onUpdateInquiries,
  notices,
  onUpdateNotices,
  settings,
  onUpdateSettings,
  onClose
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inquiries' | 'products' | 'notices' | 'settings'>('dashboard');
  
  // Calculate inquiries in the last 30 days
  const recentMonthCount = (() => {
    let refDate = new Date();
    const maxInqTimestamp = inquiries.reduce((max, inq) => {
      const t = Date.parse(inq.createdAt);
      return isNaN(t) ? max : Math.max(max, t);
    }, 0);
    
    // If the latest inquiry is in the future compared to real system date (mock data alignment), use that as reference
    if (maxInqTimestamp > refDate.getTime()) {
      refDate = new Date(maxInqTimestamp);
    }
    
    const thirtyDaysAgo = new Date(refDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    return inquiries.filter(inq => {
      const t = Date.parse(inq.createdAt);
      if (isNaN(t)) return false;
      return t >= thirtyDaysAgo.getTime() && t <= (refDate.getTime() + 24 * 60 * 60 * 1000); // include ref day
    }).length;
  })();

  // Modal & Edit States
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<NoticeBoardPost | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Create States
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  
  // Post Form State
  const [postForm, setPostForm] = useState({
    title: '',
    category: '공지사항' as '공지사항' | '제품소식' | '보도자료',
    content: '',
    imageUrl: '',
    imageType: 'image' as 'image' | 'pdf' | 'external',
    imageSource: 'none' as 'upload' | 'url' | 'none',
    imageFileName: '',
    imageStoragePath: '',
    attachments: [] as NoticeBoardAttachment[],
    visible: true
  });

  const [postPreviewUrl, setPostPreviewUrl] = useState('');
  const [postPreviewError, setPostPreviewError] = useState(false);
  const postImageFileInputRef = useRef<HTMLInputElement>(null);
  const postAttachmentInputRef = useRef<HTMLInputElement>(null);

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    purpose: ['제과제빵용'] as Product['purpose'],
    shape: '삼방형' as Product['shape'],
    description: '',
    imageUrl: '',
    thumbnailUrl: '',
    thumbnailType: 'image' as 'image' | 'pdf' | 'external',
    thumbnailFileName: '',
    thumbnailStoragePath: '',
    thumbnailSource: 'none' as 'upload' | 'url' | 'sample' | 'none',
    material: '',
    featuresString: '', // newline separated
    applicationsString: '', // comma separated
    visible: true,
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search state for product database
  const [searchQuery, setSearchQuery] = useState('');

  // Sorter and Search Filter for products
  const getProcessedProducts = () => {
    // 1. Sort the products: Newest on top
    const sorted = [...products].sort((a, b) => {
      const getTimestamp = (p: Product) => {
        if (p.createdAt) {
          const parsed = Date.parse(p.createdAt);
          if (!isNaN(parsed)) return parsed;
        }
        // Fallback matching of prod-[id]
        if (p.id) {
          const match = p.id.match(/^prod-(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > 10000) {
              // Time stamp format prod-[timestamp]
              return num;
            } else {
              // Sequence number, map up so newer sequences like prod-3 are older than timestamp, but newer than prod-2
              return num * 100000;
            }
          }
        }
        return 0;
      };
      return getTimestamp(b) - getTimestamp(a);
    });

    // 2. Filter by search query if present
    if (!searchQuery.trim()) {
      return sorted;
    }

    const query = searchQuery.toLowerCase().trim();
    return sorted.filter((prod) => {
      const nameMatch = prod.name?.toLowerCase().includes(query);
      const descMatch = prod.description?.toLowerCase().includes(query);
      const shapeMatch = prod.shape?.toLowerCase().includes(query);
      
      const purposeMatch = Array.isArray(prod.purpose)
        ? prod.purpose.some(p => p.toLowerCase().includes(query))
        : String(prod.purpose || '').toLowerCase().includes(query);

      const appMatch = Array.isArray(prod.applications)
        ? prod.applications.some(a => a.toLowerCase().includes(query))
        : false;

      return nameMatch || descMatch || shapeMatch || purposeMatch || appMatch;
    });
  };

  const filteredProducts = getProcessedProducts();

  // Settings local state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({ ...settings });

  // Password Reset state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('admin_password') || '1234';
    
    if (currentPassword !== storedPassword) {
      setPwdError('현재 비밀번호가 올바르지 않습니다.');
      setPwdSuccess('');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPwdError('새 비밀번호가 일치하지 않습니다.');
      setPwdSuccess('');
      return;
    }
    
    if (newPassword.trim() === '') {
      setPwdError('새 비밀번호를 제대로 입력해주세요.');
      setPwdSuccess('');
      return;
    }
    
    localStorage.setItem('admin_password', newPassword);
    setPwdSuccess('관리자 비밀번호가 변경되었습니다.');
    setPwdError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('관리자 비밀번호가 정상적으로 변경되었습니다.');
  };

  // Inquiry actions
  const handleInquiryStatusChange = (id: string, newStatus: Inquiry['status']) => {
    const updated = inquiries.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq);
    onUpdateInquiries(updated);
    showToast(`문의 상태가 '${newStatus}'(으)로 변경되었습니다.`);
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }
  };

  const handleInquiryDelete = (id: string) => {
    onUpdateInquiries((prev) => prev.filter(inq => inq.id !== id));
    showToast('견적문의가 성공적으로 삭제되었습니다.');
    setSelectedInquiry(null);
  };

  // Post Actions
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title.trim() || !postForm.content.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    let finalImageUrl = '';
    let finalImageType: 'image' | 'pdf' | 'external' = 'image';
    let finalImageSource: 'upload' | 'url' | 'none' = 'none';
    let finalImageFileName = '';
    let finalImageStoragePath = '';

    if (postForm.imageSource === 'upload' && postForm.imageUrl) {
      finalImageUrl = postForm.imageUrl;
      finalImageType = postForm.imageType;
      finalImageFileName = postForm.imageFileName;
      finalImageStoragePath = postForm.imageStoragePath;
      finalImageSource = 'upload';
    } else if (postForm.imageUrl && postForm.imageUrl.trim() !== '') {
      finalImageUrl = postForm.imageUrl.trim();
      finalImageType = 'external';
      finalImageFileName = finalImageUrl.split('/').pop() || '';
      finalImageStoragePath = '';
      finalImageSource = 'url';
    } else if (editingPost && editingPost.imageUrl) {
      finalImageUrl = editingPost.imageUrl;
      finalImageType = editingPost.imageType || 'image';
      finalImageFileName = editingPost.imageFileName || '';
      finalImageStoragePath = editingPost.imageStoragePath || '';
      finalImageSource = editingPost.imageSource || 'upload';
    } else {
      finalImageUrl = '';
      finalImageType = 'image';
      finalImageSource = 'none';
    }

    if (editingPost) {
      // Edit mode
      const updated = notices.map(post => 
        post.id === editingPost.id 
          ? { 
              ...post, 
              title: postForm.title, 
              category: postForm.category, 
              content: postForm.content,
              imageUrl: finalImageUrl || undefined,
              imageSource: finalImageSource,
              imageType: finalImageType,
              imageFileName: finalImageFileName,
              imageStoragePath: finalImageStoragePath,
              attachments: postForm.attachments || [],
              visible: postForm.visible !== false
            } 
          : post
      );
      onUpdateNotices(updated);
      showToast('게시글이 정상적으로 수정되었습니다.');
      setEditingPost(null);
      setIsCreatingPost(false);
    } else {
      // Create mode
      const newPost: NoticeBoardPost = {
        id: `post-${Date.now()}`,
        title: postForm.title,
        category: postForm.category,
        content: postForm.content,
        imageUrl: finalImageUrl || undefined,
        imageSource: finalImageSource,
        imageType: finalImageType,
        imageFileName: finalImageFileName,
        imageStoragePath: finalImageStoragePath,
        attachments: postForm.attachments || [],
        createdAt: new Date().toISOString().split('T')[0],
        views: 0,
        visible: postForm.visible !== false
      };
      onUpdateNotices([newPost, ...notices]);
      showToast('새로운 게시글이 정상 등록되었습니다.');
      setIsCreatingPost(false);
    }

    // Reset
    setPostForm({
      title: '',
      category: '공지사항',
      content: '',
      imageUrl: '',
      imageType: 'image',
      imageSource: 'none',
      imageFileName: '',
      imageStoragePath: '',
      attachments: [],
      visible: true
    });
    setPostPreviewUrl('');
    setPostPreviewError(false);
    if (postImageFileInputRef.current) postImageFileInputRef.current.value = '';
    if (postAttachmentInputRef.current) postAttachmentInputRef.current.value = '';
  };

  const handleCancelPost = () => {
    console.log('handleCancelPost triggered');
    setIsCreatingPost(false);
    setEditingPost(null);
    setPostForm({
      title: '',
      category: '공지사항',
      content: '',
      imageUrl: '',
      imageType: 'image',
      imageSource: 'none',
      imageFileName: '',
      imageStoragePath: '',
      attachments: [],
      visible: true
    });
    setPostPreviewUrl('');
    setPostPreviewError(false);
    if (postImageFileInputRef.current) postImageFileInputRef.current.value = '';
    if (postAttachmentInputRef.current) postAttachmentInputRef.current.value = '';
  };

  const handlePostDelete = (id: string): boolean => {
    console.log("게시글 삭제 버튼 클릭:", id);

    if (!id) {
      alert("삭제할 게시글 ID가 없습니다.");
      return false;
    }

    onUpdateNotices((prev) => prev.filter(post => post.id !== id));

    // Safety check: reset editing details state if deleted
    if (editingPost && editingPost.id === id) {
      setEditingPost(null);
    }

    showToast("삭제되었습니다.");
    return true;
  };

  const startEditPost = (post: NoticeBoardPost) => {
    setEditingPost(post);
    
    const source = post.imageSource || 
                   (post.imageUrl && post.imageUrl.startsWith('data:') ? 'upload' : (post.imageUrl ? 'url' : 'none'));
    const currentUrl = post.imageUrl || '';

    setPostForm({
      title: post.title,
      category: post.category,
      content: post.content,
      imageUrl: currentUrl,
      imageType: post.imageType || 'image',
      imageSource: source,
      imageFileName: post.imageFileName || '',
      imageStoragePath: post.imageStoragePath || '',
      attachments: post.attachments || [],
      visible: post.visible !== false
    });

    setPostPreviewUrl(currentUrl);
    setPostPreviewError(false);
    if (postImageFileInputRef.current) postImageFileInputRef.current.value = '';
    if (postAttachmentInputRef.current) postAttachmentInputRef.current.value = '';
    setIsCreatingPost(true);
  };

  // Product Actions
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('상품명을 입력해 주십시오.');
      return;
    }

    const finalApplications = productForm.applicationsString
      ? productForm.applicationsString.split(',').map(s => s.trim()).filter(Boolean)
      : (editingProduct && editingProduct.applications) || ['가공식품', '선물용 기획 패키지'];

    const resolveImagePath = (fileName: string): string => {
      if (!fileName) return '';
      const trimmed = fileName.trim();
      const clean = trimmed.replace(/^\/?images\/product\//, '').replace(/^\/?images\//, '');
      if (clean.startsWith('http://') || clean.startsWith('https://')) {
        return clean;
      }
      return `/images/product/${clean}`;
    };

    const finalFileName = productForm.thumbnailFileName.trim();
    const finalThumbnailUrl = resolveImagePath(finalFileName);
    const finalSource: 'upload' | 'url' | 'none' = finalFileName ? 'url' : 'none';
    const finalThumbnailType: 'image' | 'pdf' | 'external' = 'image';
    const finalStoragePath = '';
    const finalDescription = productForm.description || (editingProduct && editingProduct.description) || productForm.name;
    const isVisible = productForm.visible !== false;

    if (editingProduct) {
      // Edit
      const updated = products.map(prod => 
        prod.id === editingProduct.id 
          ? { 
              ...prod, 
              name: productForm.name, 
              purpose: productForm.purpose, 
              shape: productForm.shape, 
              description: finalDescription,
              imageUrl: finalThumbnailUrl || prod.imageUrl || '',
              thumbnailUrl: finalThumbnailUrl,
              thumbnailType: finalThumbnailType,
              thumbnailFileName: finalFileName,
              thumbnailStoragePath: finalStoragePath,
              thumbnailSource: finalSource,
              applications: finalApplications,
              createdAt: editingProduct.createdAt || prod.createdAt || new Date().toISOString(),
              visible: isVisible
            } 
          : prod
      );
      onUpdateProducts(updated);
      showToast('제품 정보 변경이 성공적으로 이루어졌습니다.');
      setEditingProduct(null);
      setIsCreatingProduct(false);
    } else {
      // Create
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: productForm.name,
        purpose: productForm.purpose,
        shape: productForm.shape,
        description: finalDescription,
        imageUrl: finalThumbnailUrl,
        thumbnailUrl: finalThumbnailUrl,
        thumbnailType: finalThumbnailType,
        thumbnailFileName: finalFileName,
        thumbnailStoragePath: finalStoragePath,
        thumbnailSource: finalSource,
        applications: finalApplications,
        createdAt: new Date().toISOString(),
        visible: isVisible
      };
      onUpdateProducts([newProduct, ...products]);
      showToast('새 제품이 규격 품목에 안전하게 등록되었습니다.');
      setIsCreatingProduct(false);
    }

    // Reset default
    setProductForm({
      name: '',
      purpose: ['제과제빵용'],
      shape: '삼방형',
      description: '',
      imageUrl: '',
      thumbnailUrl: '',
      thumbnailType: 'image',
      thumbnailFileName: '',
      thumbnailStoragePath: '',
      thumbnailSource: 'none',
      material: '',
      featuresString: '',
      applicationsString: '',
      visible: true
    });
    setPreviewUrl('');
    setPreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProductDelete = (id: string) => {
    console.log("제품 삭제 버튼 클릭:", id);

    if (!id) {
      alert("삭제할 제품 ID가 없습니다.");
      return;
    }

    onUpdateProducts((prev) => prev.filter(product => product.id !== id));

    // Safety check: reset editing details state if deleted
    if (editingProduct && editingProduct.id === id) {
      setEditingProduct(null);
    }

    showToast("삭제되었습니다.");
  };

  const startEditProduct = (prod: Product) => {
    const getFileNameOnly = (path: string): string => {
      if (!path) return '';
      return path.replace(/^\/?images\//, '');
    };

    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      purpose: Array.isArray(prod.purpose) ? prod.purpose : [prod.purpose],
      shape: prod.shape,
      description: prod.description || '',
      imageUrl: '',
      thumbnailUrl: prod.thumbnailUrl || prod.imageUrl || '',
      thumbnailType: prod.thumbnailType || 'image',
      thumbnailFileName: prod.thumbnailFileName ? getFileNameOnly(prod.thumbnailFileName) : (prod.imageUrl ? getFileNameOnly(prod.imageUrl) : ''),
      thumbnailStoragePath: prod.thumbnailStoragePath || '',
      thumbnailSource: 'url',
      material: '',
      featuresString: '',
      applicationsString: prod.applications?.join(', ') || '',
      visible: prod.visible !== false
    });

    setPreviewUrl(prod.thumbnailUrl || prod.imageUrl || '');
    setPreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsCreatingProduct(true);
  };

  // Settings Submit
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    showToast('기관 환경 정보 및 B2B 공정 SNS 세팅 정보가 정식 반영되었습니다.');
  };



  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans pb-16 relative" id="admin-dashboard-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center bg-gray-900 border border-gray-800 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl transition-all duration-300 transform translate-y-0" id="toast-notif">
          <span className="w-2 h-2 rounded-full bg-[#00A3FF] mr-2.5 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white border-b border-gray-150 shadow-sm px-6 py-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sticky top-0 z-50">
        <div className="flex items-center space-x-3.5">
          <div className="flex items-center space-x-2">
            <svg 
              className="w-9 h-9" 
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
            <div className="h-6 w-[1px] bg-gray-200" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 tracking-tight leading-none flex items-center gap-2">
              엔디팩 포탈 
              <span className="text-[#00A3FF] text-[10px] font-black bg-blue-50 border border-blue-100 uppercase px-1.5 py-0.5 rounded">
                관리자 모드
              </span>
            </h1>
            <p className="text-[11px] text-gray-500 mt-1">현 페이지는 B2B 데이터 실시간 로컬 편집기입니다. 저장 시 모든 탭과 제품에 즉시 적용됩니다.</p>
          </div>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-lg transition-transform transform active:scale-95 flex items-center space-x-1.5"
            id="admin-exit-btn"
          >
            <span>클라이언트 모드 복귀</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Menu Segment */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase px-3 select-none">관리 메뉴</h3>
            
            <button
              id="admin-tab-dashboard"
              onClick={() => { setActiveTab('dashboard'); setIsCreatingPost(false); setIsCreatingProduct(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-[#00A3FF] text-white shadow-md shadow-blue-400/20' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>대시보드 종합현황</span>
            </button>

            <button
              id="admin-tab-inquiries"
              onClick={() => { setActiveTab('inquiries'); setIsCreatingPost(false); setIsCreatingProduct(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'inquiries' 
                  ? 'bg-[#00A3FF] text-white shadow-md shadow-blue-400/20' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileCheck className="w-4 h-4" />
                <span>견적문의 건수 관리</span>
              </div>
              {inquiries.filter(i => i.status === '대기중').length > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full font-black text-[9px] animate-pulse">
                  {inquiries.filter(i => i.status === '대기중').length}
                </span>
              )}
            </button>

            <button
              id="admin-tab-notices"
              onClick={() => { setActiveTab('notices'); setIsCreatingPost(false); setIsCreatingProduct(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'notices' 
                  ? 'bg-[#00A3FF] text-white shadow-md shadow-blue-400/20' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
              }`}
            >
              <FolderEdit className="w-4 h-4" />
              <span>고객 안내 / 뉴스 관리</span>
            </button>

            <button
              id="admin-tab-settings"
              onClick={() => { setActiveTab('settings'); setIsCreatingPost(false); setIsCreatingProduct(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'settings' 
                  ? 'bg-[#00A3FF] text-white shadow-md shadow-blue-400/20' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>페이지 설정</span>
            </button>
          </div>

          {/* Right Main Panel Content */}
          <div className="lg:col-span-3">

            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8" id="admin-subtab-dashboard">
                {/* 운영 안내 문구 banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start space-x-3 text-xs text-blue-800 shadow-sm animate-fadeIn">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-1.5 font-medium leading-relaxed">
                    <p className="font-extrabold text-blue-900 text-sm">홈페이지 운영 관리 안내</p>
                    <div className="space-y-2 mt-1 text-blue-850">
                      <p>
                        제품 이미지, 제품 목록, 연혁 등 구조 변경이 필요한 콘텐츠는 홈페이지 안정성을 위해 담당 관리 업체에서 직접 반영합니다.
                      </p>
                      <p>
                        신규 제품 등록, 이미지 교체, 연혁 추가, 페이지 구성 변경이 필요한 경우에는 아래 담당 업체로 문의해 주세요.
                      </p>
                      <div className="pt-2 border-t border-blue-200/60 mt-2 text-[11px] space-y-0.5 text-blue-900 font-bold">
                        <p>🏢 담당 관리 업체: (주)아이디어그룹</p>
                        <p>📞 문의: 053-262-0902 / <a href="mailto:idea4d@naver.com" className="underline hover:text-blue-800 text-[#00A3FF]">idea4d@naver.com</a></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-400">최근 한달간 견적 의뢰수</p>
                      <div className="mt-4">
                        <span className="text-3xl font-black text-gray-800 font-mono">{recentMonthCount}건</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 h-full">
                      <div>
                        <p className="text-xs font-semibold text-gray-400">누적 견적의뢰수</p>
                        <div className="mt-4">
                          <span className="text-3xl font-black text-gray-800 font-mono">{inquiries.length}건</span>
                        </div>
                      </div>
                      
                      {/* Status split on the right */}
                      <div className="flex flex-col space-y-1.5 text-[11px] text-gray-500 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-6 shrink-0 font-bold whitespace-nowrap min-w-[90px]">
                        <div className="flex justify-between items-center space-x-3">
                          <span className="text-gray-400">대기</span>
                          <span className="text-gray-700 font-mono">{inquiries.filter(i => i.status === '대기중').length}건</span>
                        </div>
                        <div className="flex justify-between items-center space-x-3">
                          <span className="text-gray-400">검토</span>
                          <span className="text-amber-500 font-mono">{inquiries.filter(i => i.status === '검토중').length}건</span>
                        </div>
                        <div className="flex justify-between items-center space-x-3">
                          <span className="text-gray-400">답변</span>
                          <span className="text-green-500 font-mono">{inquiries.filter(i => i.status === '답변완료').length}건</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Recent Inquiries List Widget */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h4 className="text-sm font-extrabold text-gray-800 mb-4 flex items-center justify-between">
                    <span>최근 접수된 실시간 견적 문의</span>
                    <button 
                      onClick={() => setActiveTab('inquiries')}
                      className="text-[#00A3FF] text-xs hover:underline flex items-center space-x-1"
                    >
                      <span>전체 관리보기</span>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </h4>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs text-gray-600 min-w-[700px] table-auto">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                          <th className="py-3 px-4 w-[150px] whitespace-nowrap break-keep select-none">날짜</th>
                          <th className="py-3 px-4 min-w-[150px] whitespace-nowrap break-keep select-none">업체명</th>
                          <th className="py-3 px-4 w-[120px] whitespace-nowrap break-keep select-none">문의형태</th>
                          <th className="py-3 px-4 min-w-[200px] whitespace-nowrap break-keep select-none">용도 / 형태</th>
                          <th className="py-3 px-4 text-center w-[100px] whitespace-nowrap break-keep select-none">진행상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {inquiries.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-gray-400 font-medium">
                              접수된 견적인 오더가 존재하지 않습니다.
                            </td>
                          </tr>
                        ) : (
                          inquiries.slice(0, 3).map((inq) => (
                            <tr key={inq.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3.5 px-4 font-mono whitespace-nowrap break-keep">{inq.createdAt}</td>
                              <td className="py-3.5 px-4 font-bold text-gray-800 break-keep">{inq.companyName}</td>
                              <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap break-keep">{inq.contactName}</td>
                              <td className="py-3.5 px-4 text-gray-500 select-none whitespace-nowrap break-keep">
                                <span className="bg-blue-50 text-[#00A3FF] text-[10px] px-1.5 py-0.5 rounded border border-blue-100/50 mr-1 inline-block">{inq.purpose}</span>
                                <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded mr-1 inline-block">{inq.shape}</span>
                              </td>
                              <td className="py-3.5 px-4 text-center whitespace-nowrap break-keep">
                                <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase inline-block ${
                                  inq.status === '대기중' ? 'bg-red-50 text-red-600 border border-red-100' :
                                  inq.status === '검토중' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                  'bg-green-50 text-green-600 border border-green-100'
                                }`}>
                                  {inq.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Simulated Custom HTML Chart component */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-sm font-extrabold text-normal text-gray-800">포장 용도별 견적 유입 현황 (B2B 모니터링)</h4>
                      <p className="text-[11px] text-gray-400 mt-1">고객사 유입 데이터를 바탕으로 분석된 활성화 비율 그래프</p>
                    </div>
                    <div className="flex space-x-3 text-[10px] font-bold text-gray-500">
                      <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-[#00A3FF] mr-1" />제과제빵</span>
                      <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-[#00B4D8] mr-1" />농축수산</span>
                      <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-amber-500 mr-1" />가공식품</span>
                      <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-indigo-600 mr-1" />공산품</span>
                    </div>
                  </div>

                  <div className="h-44 flex items-end justify-between items-stretch space-y-0 space-x-4 border-b border-gray-100 pb-2 mt-10">
                    {[
                      { label: '제과제빵용 (Bakery)', val: 45, color: 'bg-[#00A3FF]' },
                      { label: '농·축·수산물용 (Fresh)', val: 20, color: 'bg-[#00B4D8]' },
                      { label: '가공식품용 (Processed)', val: 30, color: 'bg-amber-500' },
                      { label: '공산품용 (Industrial)', val: 15, color: 'bg-indigo-600' }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col justify-end items-center group">
                        <span className="text-xs font-mono font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                          {bar.val}% ({Math.round(inquiries.length * (bar.val / 100))}건)
                        </span>
                        <div 
                          className={`w-12 ${bar.color} rounded-t-lg transition-all duration-700`}
                          style={{ height: `${bar.val * 2}px` }}
                        />
                        <span className="text-[10px] font-bold text-gray-500 mt-3 break-keep text-center">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: INQUIRIES MANAGER */}
            {activeTab === 'inquiries' && (
              <div className="space-y-6" id="admin-subtab-inquiries">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-base font-extrabold text-gray-800">오프라인/온라인 실시간 견적 접수 처</h2>
                      <p className="text-xs text-gray-400 mt-1">고객이 요청서를 제출할 때마다 즉시 리스트업됩니다. 단계별 검토 및 답변 처리를 마킹할 수 있습니다.</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      총 {inquiries.length}개 의뢰 접수
                    </span>
                  </div>

                  {/* List layout */}
                  <div className="space-y-4">
                    {inquiries.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl text-gray-400 font-medium text-xs">
                        접수된 견적 의뢰 내역이 없습니다.
                      </div>
                    ) : (
                      inquiries.map((inq) => (
                        <div 
                          key={inq.id} 
                          className={`p-5 rounded-2xl border transition-all ${
                            selectedInquiry?.id === inq.id 
                              ? 'bg-blue-50/20 border-[#00A3FF] ring-1 ring-blue-100' 
                              : 'bg-white border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs text-gray-400 font-bold">{inq.createdAt}</span>
                                <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                                  inq.status === '대기중' ? 'bg-red-50 text-red-600' :
                                  inq.status === '검토중' ? 'bg-amber-50 text-amber-600' :
                                  'bg-green-50 text-green-600'
                                }`}>
                                  {inq.status}
                                </span>
                              </div>
                              <h3 className="text-sm font-black text-gray-800 select-all">
                                {inq.companyName} <span className="text-xs font-medium text-gray-500">({inq.contactName})</span>
                              </h3>
                              <p className="text-xs text-gray-500 leading-none">
                                용도: <span className="text-gray-700 font-bold mr-3">{inq.purpose}</span> 
                                형태: <span className="text-gray-700 font-bold mr-3">{inq.shape}</span> 
                                부량: <span className="text-gray-700 font-bold">{inq.quantity}</span>
                              </p>
                            </div>

                            {/* Actions bar inside list */}
                            <div className="flex items-center space-x-2 shrink-0 justify-end md:justify-start">
                              <button
                                onClick={() => setSelectedInquiry(selectedInquiry?.id === inq.id ? null : inq)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-lg text-xs font-bold flex items-center space-x-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{selectedInquiry?.id === inq.id ? '상세닫기' : '의뢰서 확인'}</span>
                              </button>
                              
                              <div className="relative inline-block text-left">
                                <select
                                  value={inq.status}
                                  onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value as Inquiry['status'])}
                                  className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs py-1.5 px-3 pr-8 rounded-lg font-bold leading-tight focus:outline-none focus:border-[#00A3FF]"
                                >
                                  <option value="대기중">대기중</option>
                                  <option value="검토중">검토중</option>
                                  <option value="답변완료">답변완료</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setInquiryToDelete(inq.id);
                                }}
                                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Detail view */}
                          {selectedInquiry?.id === inq.id && (
                            <div className="mt-5 pt-5 border-t border-gray-100/80 bg-gray-50/50 p-4 rounded-xl space-y-4 text-xs animate-fadeIn text-gray-700">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <p className="font-bold text-gray-400">연락처:</p>
                                  <p className="text-gray-800 font-bold select-all">{inq.phone}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-bold text-gray-400">이메일:</p>
                                  <p className="text-gray-800 font-bold select-all">{inq.email}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-bold text-gray-400">규격 및 사이즈:</p>
                                  <p className="text-gray-800 font-bold select-all">{inq.dimensions || '미규정사양'}</p>
                                </div>
                              </div>
                              <div className="space-y-1 pt-2">
                                <p className="font-bold text-gray-400">추가 요구사항 및 문의내용:</p>
                                <div className="bg-white p-3.5 rounded-lg border border-gray-200 leading-relaxed font-sans text-gray-801 whitespace-pre-wrap">
                                  {inq.content}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: NOTICES BOARD MANAGER */}
            {activeTab === 'notices' && (
              <div className="space-y-6" id="admin-subtab-notices">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 pb-5 mb-6 gap-4">
                    <div>
                      <h2 className="text-base font-extrabold text-gray-800">공지사항 및 보도 뉴스 동적 발행</h2>
                      <p className="text-xs text-gray-400 mt-1">기업 중요 소식, 위생 마크 등식 등록, 제품 단가 변동 소식을 실시간 추가합니다.</p>
                    </div>
                    {!isCreatingPost && (
                      <button
                        onClick={() => {
                          setEditingPost(null);
                          setPostForm({
                            title: '',
                            category: '공지사항',
                            content: '',
                            imageUrl: '',
                            imageType: 'image',
                            imageSource: 'none',
                            imageFileName: '',
                            imageStoragePath: '',
                            attachments: [],
                            visible: true
                          });
                          setIsCreatingPost(true);
                        }}
                        className="px-4 py-2 bg-[#00A3FF] hover:opacity-90 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 shrink-0 self-end sm:self-auto"
                        id="admin-add-post-btn"
                      >
                        <Plus className="w-4 h-4" />
                        <span>신규 안내물 게재</span>
                      </button>
                    )}
                  </div>

                  {/* Form toggle */}
                  {isCreatingPost ? (
                    <form onSubmit={handlePostSubmit} className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-150 animate-fadeIn" id="post-control-form">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <h3 className="text-xs font-black text-gray-700">
                          {editingPost ? '게시글 문안 수정하기' : '신규 게시글 작성'}
                        </h3>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCancelPost();
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer pointer-events-auto relative z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {/* 안내 문서 */}
                        <div className="sm:col-span-2 bg-[#00A3FF]/5 px-4 py-3 rounded-b-xl border border-[#00A3FF]/20 flex items-start space-x-2.5">
                          <span className="text-[#00A3FF] text-[13px] font-black mt-0.5">💡</span>
                          <div className="text-[11px] text-gray-500 font-semibold leading-relaxed space-y-1.5">
                            <p>제품 이미지, 제품 목록, 연혁 등 구조 변경이 필요한 콘텐츠는 홈페이지 안정성을 위해 담당 관리 업체에서 직접 반영합니다.</p>
                            <p>신규 제품 등록, 이미지 교체, 연혁 추가, 페이지 구성 변경이 필요한 경우에는 아래 담당 업체로 문의해 주세요.</p>
                            <p className="font-bold text-gray-700">
                              🏢 담당 관리 업체: (주)아이디어그룹<br />
                              📞 문의: 053-262-0902 / <a href="mailto:idea4d@naver.com" className="underline hover:text-blue-800 text-[#00A3FF]">idea4d@naver.com</a>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-bold text-gray-600 block">게시물 제목 *</label>
                          <input 
                            type="text"
                            required
                            placeholder="구체적인 게시글 제목을 적어주세요."
                            value={postForm.title}
                            onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-gray-600 block">공정 및 뉴스 카테고리 *</label>
                          <select
                            value={postForm.category}
                            onChange={(e) => setPostForm({ ...postForm, category: e.target.value as NoticeBoardPost['category'] })}
                            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF] font-semibold bg-white"
                          >
                            <option value="공지사항">공지사항</option>
                            <option value="제품소식">제품소식</option>
                            <option value="보도자료">보도자료</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-gray-600 block">노출 여부 *</label>
                          <select
                            value={postForm.visible ? "true" : "false"}
                            onChange={(e) => setPostForm({ ...postForm, visible: e.target.value === "true" })}
                            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF] font-semibold bg-white"
                          >
                            <option value="true">노출 (공개)</option>
                            <option value="false">미노출 (비공개)</option>
                          </select>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-bold text-gray-600 block">본문 내용 *</label>
                          <textarea 
                            rows={8}
                            required
                            placeholder="공고 및 내용을 육안 보기좋게 단락 줄바꿈을 포함해 작성해주세요."
                            value={postForm.content}
                            onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF] font-sans"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <div>
                          {editingPost && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setPostToDelete(editingPost.id);
                              }}
                              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow transition-colors"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            type="submit" 
                            className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-500 text-xs font-bold rounded-lg shadow"
                          >
                            {editingPost ? '발행안 수정완료' : '안내문 공식 발행하기'}
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : null}

                  {/* List of Notices in Admin */}
                  <div className="mt-6 space-y-3.5">
                    {notices.map((post) => (
                      <div key={post.id} className="p-4 bg-gray-50 rounded-xl border border-gray-150 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex items-center space-x-3 text-xs">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded shrink-0 leading-none ${
                            post.category === '공지사항' ? 'bg-red-50 text-red-600 border border-red-100' :
                            post.category === '제품소식' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {post.category}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-800 truncate leading-none">{post.title}</h4>
                            <p className="text-[10px] text-gray-400 mt-1">{post.createdAt} • 조회 {post.views}회</p>
                          </div>
                        </div>

                        {/* Control actions */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              startEditPost(post);
                            }}
                            className="p-1.5 hover:bg-blue-50 text-[#00A3FF] rounded-lg transition-colors cursor-pointer"
                            title="편집"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPostToDelete(post.id);
                            }}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer pointer-events-auto relative z-10"
                            title="영구 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 5: SITE SETTINGS & SEO MANAGER */}
            {activeTab === 'settings' && (
              <div className="space-y-6" id="admin-subtab-settings">
                <form onSubmit={handleSettingsSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                  <div>
                    <h2 className="text-base font-extrabold text-gray-800">페이지 설정</h2>
                    <p className="text-xs text-gray-400 mt-1">네이버, 구글 검색 노출 설명글과 대표번호, 본사 주소 등의 웹사이트 설정을 편집합니다.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-gray-600 block">웹사이트 타이틀 (Meta Title) *</label>
                      <input 
                        type="text"
                        required
                        value={settingsForm.title}
                        onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF] font-semibold text-gray-800"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-gray-600 block">웹사이트 설명 (Meta Description) *</label>
                      <textarea 
                        rows={2}
                        required
                        value={settingsForm.description}
                        onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF] text-gray-700"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-gray-600 block">회사명 *</label>
                      <input 
                        type="text"
                        required
                        value={settingsForm.companyName || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 font-semibold text-gray-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 block">대표 문의전화 *</label>
                      <input 
                        type="text"
                        required
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-300 font-bold text-gray-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 block">수신 이메일 상담계정 *</label>
                      <input 
                        type="email"
                        required
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-300 font-semibold"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-gray-600 block">본사 공장 소재지 주소 *</label>
                      <input 
                        type="text"
                        required
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-300"
                      />
                    </div>

                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button 
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-[#00A3FF] text-white hover:opacity-90 font-extrabold text-xs rounded-xl shadow-lg transition-transform transform active:scale-95"
                    >
                      페이지 설정 변경 사항 저장
                    </button>
                  </div>
                </form>

                {/* Admin Password Reset Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                  <div>
                    <h2 className="text-base font-extrabold text-gray-800">관리자 비밀번호 재설정</h2>
                    <p className="text-xs text-gray-400 mt-1">CMS 로그인용 관리자 비밀번호를 안전하고 일관적으로 변경할 수 있습니다.</p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 block">현재 비밀번호 *</label>
                      <input 
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setPwdError('');
                          setPwdSuccess('');
                        }}
                        placeholder="현재 비밀번호를 입력해주세요."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF] text-gray-800 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 block">새 비밀번호 *</label>
                      <input 
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPwdError('');
                          setPwdSuccess('');
                        }}
                        placeholder="새 비밀번호를 입력해주세요."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF] text-gray-800 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 block">새 비밀번호 확인 *</label>
                      <input 
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPwdError('');
                          setPwdSuccess('');
                        }}
                        placeholder="새 비밀번호를 다시 입력해주세요."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A3FF] text-gray-800 font-medium"
                      />
                    </div>

                    {pwdError && (
                      <p className="text-red-500 font-bold text-xs mt-1.5 flex items-center animate-fade-in">
                        <span className="mr-1">⚠️</span> {pwdError}
                      </p>
                    )}

                    {pwdSuccess && (
                      <p className="text-emerald-500 font-bold text-xs mt-1.5 flex items-center animate-fade-in">
                        <span className="mr-1">✅</span> {pwdSuccess}
                      </p>
                    )}

                    <div className="pt-2">
                       <button 
                         type="submit"
                         className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-xs rounded-xl shadow transition-transform transform active:scale-95 cursor-pointer"
                       >
                         비밀번호 변경
                       </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Delete Inquiry Confirmation Modal */}
      {inquiryToDelete && (
        <div className="fixed inset-0 bg-[#212529]/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans" id="inquiry-delete-confirm-modal">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-2 bg-red-50 text-red-500 rounded-full shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-[#212529] leading-snug">견적문의 삭제</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-semibold">
                  삭제한 견적문의는 복구할 수 없습니다. 정말 삭제하시겠습니까?
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setInquiryToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-750 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  handleInquiryDelete(inquiryToDelete);
                  setInquiryToDelete(null);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Post Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 bg-[#212529]/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans" id="post-delete-confirm-modal">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-2 bg-red-50 text-red-500 rounded-full shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-[#212529] leading-snug">게시물 삭제</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-semibold">
                  삭제한 게시물은 복구할 수 없습니다. 정말 삭제하시겠습니까?
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-750 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (handlePostDelete(postToDelete)) {
                    setIsCreatingPost(false);
                    setEditingPost(null);
                  }
                  setPostToDelete(null);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

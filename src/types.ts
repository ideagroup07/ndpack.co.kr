/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  purpose: string[];
  shape: '삼방형' | 'T형' | '파우치형' | '지퍼형' | 'M형' | '레토르트형' | '자동롤형';
  description: string;
  imageUrl: string;
  applications: string[];
  thumbnailUrl?: string;
  thumbnailType?: 'image' | 'pdf' | 'external';
  thumbnailFileName?: string;
  thumbnailStoragePath?: string;
  thumbnailSource?: 'upload' | 'url' | 'sample' | 'none';
  createdAt?: string;
  visible?: boolean;
}

export interface Inquiry {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  purpose: string;
  shape: string;
  dimensions: string; // 가로 x 세로 x 폭
  quantity: string;
  attachmentName?: string;
  content: string;
  status: '대기중' | '검토중' | '답변완료';
  createdAt: string;
}

export interface NoticeBoardAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  storagePath?: string;
}

export interface NoticeBoardPost {
  id: string;
  title: string;
  category: '공지사항' | '제품소식' | '보도자료';
  content: string;
  imageUrl?: string;
  createdAt: string;
  views: number;
  imageType?: 'image' | 'pdf' | 'external';
  imageSource?: 'upload' | 'url' | 'none';
  imageFileName?: string;
  imageStoragePath?: string;
  attachments?: NoticeBoardAttachment[];
  visible?: boolean;
}

export interface SiteSettings {
  title: string;
  description: string;
  keywords: string;
  facebook: string;
  instagram: string;
  kakaotalk: string;
  address: string;
  phone: string;
  email: string;
  bizNum: string;
  ceoName: string;
  mobile?: string;
  fax?: string;
  companyName?: string;
}

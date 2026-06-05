/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, NoticeBoardPost, SiteSettings } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-3side',
    name: '삼방형 포장재',
    purpose: ['제과제빵용', '농·축·수산물용', '가공식품용', '공산품용'],
    shape: '삼방형',
    description: '세 면을 접착하여 수납성이 우수한 가장 표준적인 기본 포장 형태입니다. 강력한 실링으로 소형 제품과 다양한 식품·비식품 포장에 두루 안전하게 활용 가능합니다.',
    applications: ['분말제품', '스틱포장', '소형 한약재/즙', '생활가전 부품 및 잡화'],
    imageUrl: '/images/product/product-01.jpg',
    visible: true
  },
  {
    id: 'prod-t-type',
    name: 'T형 포장재',
    purpose: ['제과제빵용', '공산품용', '가공식품용'],
    shape: 'T형',
    description: '제품 후면에 봉합선을 두고 상/하단을 일자형 접착하는 형태입니다. 전면부 디자인을 온전하게 살릴 수 있어 매장 진열 시 최상의 브랜드 가독성을 가집니다.',
    applications: ['스낵류/쿠키류', '사탕 및 초콜릿', '벌크 소포장 상품', '건양 가공품'],
    imageUrl: '/images/product/product-02.jpg',
    visible: true
  },
  {
    id: 'prod-pouch',
    name: '파우치형 포장재',
    purpose: ['제과제빵용', '농·축·수산물용', '가공식품용', '공산품용'],
    shape: '파우치형',
    description: '휴대성과 입체적 보관이 강점인 스탠드업 형태입니다. 하단의 확장 구조 덕분에 액체 및 소스류 충진에 유연하며, 가판 진열 시 독립적으로 서 있는 연출이 가능합니다.',
    applications: ['과일주스/건강즙', '농·수산 가공식품', '액상 식자재/소스', '습기 차단용 분말'],
    imageUrl: '/images/product/product-03.jpg',
    visible: true
  },
  {
    id: 'prod-zipper',
    name: '지퍼형 포장재',
    purpose: ['제과제빵용', '농·축·수산물용', '가공식품용', '공산품용'],
    shape: '지퍼형',
    description: '상단부에 개폐가 가능한 특수 지퍼 레일을 장치한 포장재입니다. 한 번 개봉한 뒤에도 언제든지 기밀 상태로 안정적인 재밀봉이 가능하여 식품 원물의 보관 편의성이 좋습니다.',
    applications: ['견과류', '건어물 및 마른반찬', '애완동물 사료/간식', '곡물류 및 기능성 분말'],
    imageUrl: '/images/product/product-04.jpg',
    visible: true
  },
  {
    id: 'prod-m-type',
    name: 'M형 포장재',
    purpose: ['제과제빵용', '농·축·수산물용', '가공식품용', '공산품용'],
    shape: 'M형',
    description: '접이식 측면 확장 구조(M자 접지)를 적용하여 부피가 큰 내용물을 공간 효율적으로 보관합니다. 내용물을 채우면 밑면과 옆면이 안정적으로 펴져서 품격 있는 진열을 완성합니다.',
    applications: ['원두 및 분쇄 커피 가루', '차(Tea) 세트', '대포장 잡곡/쌀류', '베이커리 식빵 완제품'],
    imageUrl: '/images/product/product-05.jpg',
    visible: true
  },
  {
    id: 'prod-retort',
    name: '레토르트형 포장재',
    purpose: ['가공식품용'],
    shape: '레토르트형',
    description: '120℃ 이상의 고온 가압 증기 멸균 공정을 완벽히 견디는 초강력 특수 적층 합지 제조 공정 신소재입니다. 방부제 없이도 기밀 보존성이 대단히 탁월하여 상온 장기 보존에 어울립니다.',
    applications: ['즉석카레/짜장', '가정간편식 국물요리/간편탕', '이유식 및 영양죽'],
    imageUrl: '/images/product/product-06.jpg',
    visible: true
  },
  {
    id: 'prod-auto-roll',
    name: '자동롤형 포장재',
    purpose: ['농·축·수산물용', '가공식품용', '공산품용', '제과제빵용'],
    shape: '자동롤형',
    description: 'B2B 대량 고속 자동 설비에 연계하여 직접 충진 성형할 수 있도록 슬리팅 가공된 고정밀 롤 필름 형태입니다. 규격 폭단위 오차 없는 제어를 통해 산업용 연속 가동 생산성을 실현합니다.',
    applications: ['소포장 소스 자동 충진 롤', '스틱 커피 팩 연속 롤', '낱개 마스크 밀봉 포장용'],
    imageUrl: '/images/product/product-07.png',
    visible: true
  }
];

export const INITIAL_NOTICES: NoticeBoardPost[] = [
  {
    id: 'post-1',
    title: '엔디팩(ND Pack) 차세대 B2B 오더 허브 & 실시간 온라인 견적 시스템 출시',
    category: '공지사항',
    content: '안녕하십니까, 엔디팩 대표이사 정하용입니다.\n당사는 지난 1990년 창립 이래 최고급 비닐팩, 파우치 가공을 비롯하여 NY, PET, OPP 등의 다양한 특수 기능성 고분자 합지 및 인쇄 배리어 가공 기술을 기반으로 전국의 식품 가공업체와 대구 성서공단을 포함한 국내 유수의 산업체에 최상의 포장 솔루션을 안정적으로 공급하여 왔습니다.\n\n이번 대규모 온라인 오더 허브 웹사이트 개편을 통해, 다소 번거롭던 그간의 우편 및 일반 유선 견적 상담을 마우스 클릭 단 한 번에 가능하도록 "실시간 비대면 인터랙티브 견적 의뢰 솔루션"과 "클라이언트 즉각 상태 현황 조회 기능"을 런칭하게 되었습니다.\n\n고객사 중심의 원스톱 맞춤형 제백 기술과 빠른 발송을 약속드리며, 홈페이지 내 "견적문의"를 이용해 규격과 사양을 남겨 주시면 전담 엔지니어가 1영업일 이내 무상 맞춤 상담을 제공하도록 하겠습니다. 늘 한결같은 신뢰를 보내주시는 고객사에 감사의 인사를 드립니다.',
    imageUrl: '/images/news/ceo-greeting.jpg',
    createdAt: '2026-05-20',
    views: 312
  },
  {
    id: 'post-2',
    title: '[기술보도] 천연 다당류 함유 초고차단 친환경 가용 식품 합지 필름 특허 등록',
    category: '제품소식',
    content: '엔디팩 부설 포장재 연구소(ND R&D)에서 3년간의 지속 연구개발 끝에 기존 합성 폴리머 필름 대비 매립 시 분해 속도가 4.8배 빠르면서도 원두 기름, 레토르트 카레 고온 오염 성분 등에 대한 내수성 및 산소차단율은 그대로 충족하는 친환경 식용 다층 배리어 성형 특허를 특허청에 등재 완료하였습니다.\n\n해당 신기술은 베이커리 포장에서 장시간 보관할 때 필름 배어남을 억제하고 신선 유효기간을 최적화할 수 있어 ESG 경영을 선포한 식음료 대기업 고객사들로부터 사전 독점 도입 문의가 빗발치고 있습니다.\n본 기술력이 도입된 파우치/롤필름 샘플 신청을 원하시는 제과제빵 및 식품공장 담당자 분께서는 본 웹사이트 고객센터 문의를 통하여 발송 주소지를 접수해 주시기 바랍니다.',
    imageUrl: '/images/news/design-sketch.jpg',
    createdAt: '2026-05-18',
    views: 184
  },
  {
    id: 'post-3',
    title: '동종 업계 최상위 등급 ‘식품용 위생 및 오염 가용 제어(Grade S - Clean Room)’ 달성',
    category: '보도자료',
    content: '엔디팩이 본사 및 제 2 합지, 제백 전용 가공공장에서 매년 실시하는 외부 공인 위생 청정도 종합 평가에서 올해 당당히 오염 가용 차단 최우수 기준인 "Grade S" 클린룸 등급을 연속 취득하였습니다.\n\n미세 먼지 0.3㎛ 이하의 미립자 입자를 실시간 제백 및 다중 그레이팅하는 첨단 설비 클린룸을 가동함으로써 분말 스틱 포장에 눈에 보이지 않는 공기 중 홀 침입 유기물을 제로(0.00%) 수준으로 모니터링 관리 중에 있습니다.\n의약품 및 이유식 분유 등을 의뢰하시는 고객사들께서는 더욱 안심하고 최고의 수지 위생 컨디션을 당사 30년 역사에서 공급받으실 수 있습니다.',
    imageUrl: '/images/news/cleanroom-worker.jpg',
    createdAt: '2026-05-15',
    views: 145
  }
];

export const INITIAL_INQUIRIES = [
  {
    id: 'inq-1',
    companyName: '(주)서울우리밀베이커리',
    contactName: '김민준 팀장',
    phone: '010-1234-5678',
    email: 'minjun.k@koreabread.com',
    purpose: '제과제빵용',
    shape: '지퍼형',
    dimensions: '180mm x 240mm x 40mm',
    quantity: '50,000 장',
    content: '베이커리 매장에서 활용한 호두 파이 및 수제 유기농 쿠키 보관용 지퍼스탠드 파우치 제작 의뢰 드립니다. 전면에는 투명창 가공이 약간 세로 슬릿으로 들어가서 제품 상태가 보였으면 합니다. 추천하시는 견적과 제작 리드타임을 알려주시면 감사드리겠습니다.',
    status: '대기중' as const,
    createdAt: '2026-05-25'
  },
  {
    id: 'inq-2',
    companyName: '제주푸른수산물영농조합',
    contactName: '이하은 과장',
    phone: '064-777-8899',
    email: 'haeun.jeju@blueocean.co.kr',
    purpose: '농·축·수산물용',
    shape: '삼방형',
    dimensions: '220mm x 320mm (평면)',
    quantity: '100,000 장',
    content: '급속 동결 포장 후 냉동 탑차로 이송되는 제주산 손질 갈치 및 자반 고등어 진공 보관 무광 나일론 삼방 포장 봉투 견적 의뢰합니다. 냉동 중 영하 20도 미만의 환경에서 터지지 않는 고유연 내냉 PE수지로 강밀한 투명 합지를 제안해 주세요. 대랑 주문 시 가격 혜택을 원합니다.',
    status: '검토중' as const,
    createdAt: '2026-05-24'
  }
];

export const DEFAULT_SETTINGS: SiteSettings = {
  title: 'ND PACK 엔디팩 | 비닐팩·파우치·NY·PET·OPP 포장재 전문 제조기업',
  description: '1990년 창립 이후 비닐팩, 파우치 가공 및 NY, PET, OPP 기능성 특수 포장재 합지 제조 역량을 바탕으로 최고의 가치를 선사하는 엔디팩 공식 웹사이트입니다.',
  keywords: '엔디팩, New Developing Pack, 비닐팩, 파우치, NY, PET, OPP, 포장 봉투 제작, 수지 파우치, 삼방 봉투, 지퍼백, 알루미늄 포장재, 식품 포장, 농산품 진공백, 비닐 롤필름, 그라비어 인쇄 공장, 친환경 포장 기술',
  facebook: '',
  instagram: '',
  kakaotalk: '',
  address: '대구광역시 달서구 성서공단로35길 24-13 (갈산동)',
  phone: '053-584-1048',
  email: 'jungha0205@hanmail.net',
  bizNum: '282-63-00214',
  ceoName: '정하용',
  mobile: '010-3811-1048',
  fax: '053-565-1048',
  companyName: '엔디팩 (ND Pack)',
};

// History Timeline Data
export interface HistoryMilestone {
  year: string;
  month: string;
  event: string;
}

export const HISTORY_DATA: HistoryMilestone[] = [
  { year: '1990', month: '11', event: '남대문 실업 포장재 상사 창립 (since 1990)' },
  { year: '1995', month: '04', event: '동판 4도 그라비어 인쇄 및 비닐팩·파우치 제1제백 공장 설립' },
  { year: '2001', month: '08', event: '"남대 포장" 법인전환 및 엔디팩(ND Pack - New Developing Pack) 상표권 공식 출원' },
  { year: '2008', month: '10', event: '식품 가공용 무용제 드라이 합지 친환경 무독성 공정 1호 도입' },
  { year: '2014', month: '05', event: '대구 성서공단 통합 제조공정 본사 신축 이전 및 크린룸 Grade S 설비 신설' },
  { year: '2019', month: '03', event: '초고속 고정밀 슬리터 3기 증설 및 자동 9도 초고성능 그라비어 설비 완성 (NY·PET·OPP 특장화)' },
  { year: '2023', month: '06', event: '친환경 및 재생 수지 활용 고차단성 다층 가열 합지 신물질 배리어 특허 정식 등록' },
  { year: '2026', month: '05', event: '온라인 실시간 하이브리드 자동 견적 및 CMS 스마트 관리 시스템 개편' }
];

// Production steps workflow data
export interface ProcessStep {
  step: string;
  title: string;
  description: string;
  details: string[];
  imageUrl: string;
}

export const PROCESS_DATA: ProcessStep[] = [
  {
    step: '01',
    title: '기획 및 디자인 (Planning & Design)',
    description: '고객사의 포장 내용물의 물성(수분, 오염도, 빛 차단 요구)을 면밀히 분석하고, 최상의 재질 최적의 두께와 고급스런 도안을 제안합니다.',
    details: ['제품별 최적 합지 스펙 설계', 'Adobe Illustrator 설계 및 도판 배율 세밀 조정', '가상 3D 목업 렌더링을 통한 오류 사전 차단'],
    imageUrl: '/images/common/design-sketch.jpg'
  },
  {
    step: '02',
    title: 'AM TECH 9도 동판 인쇄 (High-End Printing)',
    description: '최대 9도 색상을 원색에 가장 선명하게 도색하는 AM TECH 초고속 자동 그라비어 회전식 동판인쇄 및 초정밀 컬러 오버레이 핀맞춤 인쇄를 수행합니다.',
    details: ['AM TECH 최대 9도 동판 그라비어 인쇄 설계', '마이크로 센서를 통한 미세 문자 뭉개짐 및 핀 맞춤 제어', '친환경 유해성 제로 고착 잉크 규격 실무 적용'],
    imageUrl: '/images/common/printing-tech.jpg'
  },
  {
    step: '03',
    title: '친환경 드라이 합지 및 건조 (Lamination & Dry)',
    description: '합지 장비의 2~4층 롤러 압착 기술을 이용해, 방습, 산소 차단, 가열 차단, 극저온 보존 등 복합 시너지 기능을 실현하기 위해 다른 극성 기재들을 특수 접착하여 합판합니다.',
    details: ['AM TECH 장비를 통한 친환경 논솔벤트(Non-Solvent) 합합 가공', '경도 조정을 거쳐 균일한 접착 강도를 만드는 챔버 건조 시스템', '기밀성 및 외력 인장강도 최상화 확보'],
    imageUrl: '/images/common/lamination-dry.jpg'
  },
  {
    step: '04',
    title: '정밀 슬리팅 (Slitting)',
    description: '인쇄/합지가 완결된 대형 폭의 점보 롤 원단을 고객사가 운용할 충진용 자동롤 기계의 기어폭 혹은 규정 제백백 기어의 폭단위 규격으로 초고속 칼날 분할합니다.',
    details: ['오차 ±0.2mm 이내의 초정밀 오토 디텍팅 날 정렬 복합 슬리터', '고속 회전 중 미세 칼날 분진을 제거하는 자동 집진 흡입 가동', '감김 풀림 장착 인장 텐션의 디지털 감지 및 편차 극복 제어'],
    imageUrl: '/images/common/cleanroom-worker.jpg'
  },
  {
    step: '05',
    title: '제백 및 가열 실링 (Bag Making / Sealing)',
    description: '삼방, T방, 지퍼스탠드, M형 봉투 등 최종 모양으로 꺾어 접어 올리고 가열 봉합 압착한 다음, 수량별 밴딩해서 최종 박스 입적하여 납품합니다.',
    details: ['지퍼 봉합 및 와이드 폴더 접이 자동 백메이킹 라인 가동', '밀봉 핫 압착과 연속 워터 냉각 냉풍 건조로 실링 단면의 미려함 구축', '자동 정렬 및 규정 개수별 밴딩 출하 전 철저 전수 육안 센서 검사'],
    imageUrl: '/images/common/bag-making.jpg'
  }
];

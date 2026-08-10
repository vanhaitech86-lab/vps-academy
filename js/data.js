// ============================================================
// VPS Academy – Data Layer v2.0 (localStorage)
// ============================================================

const DB_KEYS = {
  users: 'vps_users', categories: 'vps_categories', courses: 'vps_courses',
  lessons: 'vps_lessons', quizzes: 'vps_quizzes', results: 'vps_results',
  enrollments: 'vps_enrollments', progress: 'vps_progress', session: 'vps_session',
};
const DB_VERSION = '2.3';

// ─── Default Data ─────────────────────────────────────────────
const DEFAULT_USERS = [
  { id: 1, name: 'Văn Hải Admin', email: 'vanhaitech.86@gmail.com', password: 'Admin6789a@', role: 'admin', phone: '0988739896', department: 'Ban Giám Đốc', avatar: '', status: 'active', createdAt: '2026-01-01' },
  { id: 2, name: 'Nguyễn Văn An', email: 'nhanvien.moi@vps.vn', password: '123456', role: 'employee_new', phone: '0912345678', department: 'Kinh doanh', avatar: '', status: 'active', createdAt: '2026-06-01' },
  { id: 3, name: 'Trần Thị Bình', email: 'nhanvien.cu@vps.vn', password: '123456', role: 'employee_old', phone: '0923456789', department: 'Kỹ thuật', avatar: '', status: 'active', createdAt: '2025-01-15' },
  { id: 4, name: 'Lê Minh Cường', email: 'khachhang@gmail.com', password: '123456', role: 'customer', phone: '0934567890', department: '', avatar: '', status: 'active', createdAt: '2026-03-10' },
  { id: 5, name: 'Phạm Thu Hà', email: 'phamtuha@vps.vn', password: '123456', role: 'employee_new', phone: '0945678901', department: 'Hỗ trợ kỹ thuật', avatar: '', status: 'active', createdAt: '2026-07-01' },
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'AI cho Doanh nghiệp', icon: '🤖', color: '#7c3aed', description: 'Ứng dụng trí tuệ nhân tạo để tối ưu quy trình kinh doanh và văn phòng' },
  { id: 2, name: 'Máy photocopy & Máy in', icon: '🖨️', color: '#1a3a6b', description: 'Vận hành và bảo trì máy photocopy, máy in HP, FUJIFILM, Ricoh...' },
  { id: 3, name: 'Thiết bị văn phòng', icon: '💻', color: '#0891b2', description: 'Máy tính, máy scan, máy hủy tài liệu và thiết bị văn phòng đa năng' },
  { id: 4, name: 'Thiết bị họp & Bảo mật', icon: '📹', color: '#059669', description: 'Thiết bị họp trực tuyến, HDD Box và giải pháp bảo mật dữ liệu doanh nghiệp' },
  { id: 5, name: 'Giải pháp in ấn', icon: '🔧', color: '#d97706', description: 'HP Advanced, PaperCut, WXP – Giải pháp quản lý in ấn chuyên nghiệp' },
  { id: 6, name: 'Kỹ năng mềm & Bán hàng', icon: '💡', color: '#f5a623', description: 'Kỹ năng giao tiếp, tư vấn và bán hàng thiết bị văn phòng chuyên nghiệp' },
  { id: 7, name: 'Quy trình Nội bộ', icon: '📋', color: '#28a745', description: 'Quy trình, quy định và văn hóa doanh nghiệp VPS' },
  { id: 8, name: 'Văn hóa Doanh nghiệp', icon: '🏢', color: '#e11d48', description: 'Giá trị cốt lõi, văn hóa doanh nghiệp VPS – Haitech AI và môi trường làm việc chuyên nghiệp' },
];

const DEFAULT_COURSES = [
  // ── Cat 1: AI cho Doanh nghiệp ──
  { id: 1, title: 'AI cho Doanh nghiệp – Nhập môn & Ứng dụng thực tế', description: 'Khóa học tổng quan về trí tuệ nhân tạo và các ứng dụng AI thiết thực trong công việc hàng ngày tại doanh nghiệp. Phù hợp cho mọi đối tượng không cần nền tảng kỹ thuật.', categoryId: 1, instructor: 'Nguyễn Minh Tuấn – AI Consultant', thumbnail: '', duration: '6 giờ', totalLessons: 4, level: 'Cơ bản', allowedRoles: ['admin', 'employee_new', 'employee_old', 'customer'], lessonIds: [1,2,3,4], quizId: 1, rating: 4.9, enrollCount: 0, status: 'active', createdAt: '2024-01-15', tags: ['AI', 'ChatGPT', 'doanh nghiệp', 'nhập môn'] },
  { id: 2, title: 'AI tự động hóa quy trình văn phòng nâng cao', description: 'Ứng dụng AI để tự động hóa các tác vụ văn phòng: xử lý tài liệu, phân tích dữ liệu, tạo báo cáo tự động và tích hợp AI vào quy trình kinh doanh thực tế với Copilot, Make.com.', categoryId: 1, instructor: 'Trần Hoàng Anh – Digital Transformation Expert', thumbnail: '', duration: '10 giờ', totalLessons: 4, level: 'Nâng cao', allowedRoles: ['admin', 'employee_old'], lessonIds: [5,6,7,8], quizId: 2, rating: 4.8, enrollCount: 0, status: 'active', createdAt: '2024-02-01', tags: ['AI automation', 'Copilot', 'Make.com', 'workflow'] },

  // ── Cat 2: Máy photocopy & Máy in ──
  { id: 3, title: 'Máy photocopy – Vận hành, Bảo trì & Xử lý sự cố', description: 'Hướng dẫn toàn diện về vận hành máy photocopy: các tính năng cơ bản và nâng cao, bảo trì định kỳ, xử lý sự cố thường gặp. Áp dụng cho FUJIFILM, Ricoh, Canon, Konica Minolta.', categoryId: 2, instructor: 'Phạm Văn Đức – Kỹ thuật viên cao cấp', thumbnail: '', duration: '5 giờ', totalLessons: 4, level: 'Cơ bản', allowedRoles: ['admin', 'employee_new', 'employee_old', 'customer'], lessonIds: [9,10,11,12], quizId: 3, rating: 4.7, enrollCount: 0, status: 'active', createdAt: '2024-02-10', tags: ['máy photocopy', 'FUJIFILM', 'Ricoh', 'bảo trì'] },
  { id: 4, title: 'Máy in HP, FUJIFILM, Ricoh – Từ cơ bản đến nâng cao', description: 'Tổng quan về các dòng máy in chuyên nghiệp HP, FUJIFILM, Ricoh. Hướng dẫn cài đặt, cấu hình, bảo trì và lựa chọn thiết bị phù hợp với nhu cầu doanh nghiệp.', categoryId: 2, instructor: 'Lê Thành Công – Product Specialist', thumbnail: '', duration: '7 giờ', totalLessons: 4, level: 'Cơ bản', allowedRoles: ['admin', 'employee_new', 'employee_old', 'customer'], lessonIds: [13,14,15,16], quizId: 4, rating: 4.8, enrollCount: 0, status: 'active', createdAt: '2024-02-20', tags: ['máy in', 'HP', 'FUJIFILM', 'Ricoh', 'laser'] },

  // ── Cat 3: Thiết bị văn phòng ──
  { id: 5, title: 'Máy tính văn phòng – Cấu hình, Sử dụng & Tối ưu hiệu suất', description: 'Kiến thức về cấu hình máy tính phù hợp cho từng vị trí, cài đặt phần mềm, bảo mật và tối ưu hóa hiệu suất máy tính trong môi trường doanh nghiệp.', categoryId: 3, instructor: 'Nguyễn Đức Thành – IT Specialist', thumbnail: '', duration: '4 giờ', totalLessons: 3, level: 'Cơ bản', allowedRoles: ['admin', 'employee_new', 'employee_old', 'customer'], lessonIds: [17,18,19], quizId: 5, rating: 4.6, enrollCount: 0, status: 'active', createdAt: '2024-03-01', tags: ['máy tính', 'PC', 'laptop', 'hiệu suất'] },
  { id: 6, title: 'Máy scan & Quản lý tài liệu số hóa', description: 'Hướng dẫn sử dụng máy scan văn phòng, số hóa tài liệu, quản lý file PDF và tích hợp với hệ thống lưu trữ đám mây. Xây dựng quy trình văn phòng không giấy tờ.', categoryId: 3, instructor: 'Trần Thị Lan – Document Management Expert', thumbnail: '', duration: '4 giờ', totalLessons: 3, level: 'Cơ bản', allowedRoles: ['admin', 'employee_new', 'employee_old', 'customer'], lessonIds: [20,21,22], quizId: 6, rating: 4.7, enrollCount: 0, status: 'active', createdAt: '2024-03-10', tags: ['máy scan', 'số hóa', 'PDF', 'cloud'] },
  { id: 7, title: 'Máy hủy tài liệu – Bảo mật & An toàn thông tin', description: 'Hướng dẫn sử dụng máy hủy tài liệu đúng cách, phân loại tài liệu cần hủy, tiêu chuẩn bảo mật DIN 66399 và quy trình hủy tài liệu an toàn trong doanh nghiệp.', categoryId: 3, instructor: 'Vũ Hoàng Minh – Information Security Specialist', thumbnail: '', duration: '3 giờ', totalLessons: 3, level: 'Cơ bản', allowedRoles: ['admin', 'employee_new', 'employee_old', 'customer'], lessonIds: [23,24,25], quizId: 7, rating: 4.5, enrollCount: 0, status: 'active', createdAt: '2024-03-15', tags: ['máy hủy tài liệu', 'DIN 66399', 'bảo mật'] },

  // ── Cat 4: Thiết bị họp & Bảo mật ──
  { id: 8, title: 'Thiết bị họp trực tuyến – Hướng dẫn lắp đặt & Sử dụng', description: 'Tổng quan về thiết bị họp trực tuyến chuyên nghiệp: camera hội nghị, loa hội nghị, màn hình tương tác. Hướng dẫn cấu hình với Zoom, Teams, Google Meet.', categoryId: 4, instructor: 'Nguyễn Thị Mai – AV Solutions Expert', thumbnail: '', duration: '5 giờ', totalLessons: 4, level: 'Cơ bản', allowedRoles: ['admin', 'employee_new', 'employee_old', 'customer'], lessonIds: [26,27,28,29], quizId: 8, rating: 4.8, enrollCount: 0, status: 'active', createdAt: '2024-03-20', tags: ['thiết bị họp', 'Zoom', 'Teams', 'camera hội nghị'] },
  { id: 9, title: 'HDD Box – Thiết bị bảo mật & Quản lý dữ liệu máy photocopy', description: 'Tìm hiểu về thiết bị bảo mật HDD Box: nguyên lý hoạt động, phân loại, tiêu chuẩn mã hóa AES 256-bit và cách triển khai HDD Box cho từng dòng máy FUJIFILM, Ricoh.', categoryId: 4, instructor: 'Lê Văn Bình – Security Solutions Expert', thumbnail: '', duration: '4 giờ', totalLessons: 3, level: 'Trung cấp', allowedRoles: ['admin', 'employee_new', 'employee_old'], lessonIds: [30,31,32], quizId: 9, rating: 4.7, enrollCount: 0, status: 'active', createdAt: '2024-04-01', tags: ['HDD Box', 'bảo mật', 'AES 256', 'data security'] },

  // ── Cat 5: Giải pháp in ấn ──
  { id: 10, title: 'HP Advanced Print – Giải pháp in ấn thông minh cho doanh nghiệp', description: 'Khám phá giải pháp HP Advanced: quản lý thiết bị in tập trung, theo dõi sử dụng, tối ưu chi phí in ấn, Pull Printing và bảo mật tài liệu với HP JetAdvantage.', categoryId: 5, instructor: 'Phạm Thu Hà – HP Solution Specialist', thumbnail: '', duration: '6 giờ', totalLessons: 4, level: 'Trung cấp', allowedRoles: ['admin', 'employee_new', 'employee_old'], lessonIds: [33,34,35,36], quizId: 10, rating: 4.8, enrollCount: 0, status: 'active', createdAt: '2024-04-10', tags: ['HP Advanced', 'HP JetAdvantage', 'Pull Printing', 'fleet management'] },
  { id: 11, title: 'PaperCut – Giải pháp quản lý & Kiểm soát in ấn toàn diện', description: 'Triển khai và quản trị PaperCut MF/NG: thiết lập quota in, theo dõi chi phí, báo cáo sử dụng, chính sách in an toàn và tích hợp với Active Directory.', categoryId: 5, instructor: 'Trần Hoàng Nam – PaperCut Certified Admin', thumbnail: '', duration: '8 giờ', totalLessons: 4, level: 'Trung cấp', allowedRoles: ['admin', 'employee_new', 'employee_old'], lessonIds: [37,38,39,40], quizId: 11, rating: 4.9, enrollCount: 0, status: 'active', createdAt: '2024-04-15', tags: ['PaperCut', 'print management', 'quota', 'Active Directory'] },
  { id: 12, title: 'WXP & Giải pháp FUJIFILM/Ricoh – Managed Print Services', description: 'Tổng quan WXP và các giải pháp quản lý in ấn của FUJIFILM, Ricoh: Cloud Print, Follow-Me Print, Scan Workflow và tích hợp hệ thống ERP/DMS cho doanh nghiệp.', categoryId: 5, instructor: 'Nguyễn Đức Hùng – MPS Consultant', thumbnail: '', duration: '7 giờ', totalLessons: 4, level: 'Nâng cao', allowedRoles: ['admin', 'employee_old'], lessonIds: [41,42,43,44], quizId: 12, rating: 4.7, enrollCount: 0, status: 'active', createdAt: '2024-04-20', tags: ['WXP', 'FUJIFILM', 'Ricoh', 'MPS', 'Follow-Me Print'] },

  // ── Cat 6: Kỹ năng mềm & Bán hàng ──
  { id: 13, title: 'Kỹ năng tư vấn & Bán hàng thiết bị văn phòng chuyên nghiệp', description: 'Phát triển kỹ năng tư vấn cho nhân viên kinh doanh: phân tích nhu cầu khách hàng, demo sản phẩm, xử lý phản đối và chốt hợp đồng thiết bị văn phòng hiệu quả.', categoryId: 6, instructor: 'Vũ Thị Linh – Sales Director', thumbnail: '', duration: '6 giờ', totalLessons: 4, level: 'Cơ bản', allowedRoles: ['admin', 'employee_new', 'employee_old'], lessonIds: [45,46,47,48], quizId: 13, rating: 4.8, enrollCount: 0, status: 'active', createdAt: '2024-05-01', tags: ['bán hàng', 'tư vấn', 'chốt sale', 'demo sản phẩm'] },

  // ── Cat 7: Quy trình Nội bộ ──
  { id: 14, title: 'Quy trình tiếp nhận, Xử lý đơn hàng & Bảo hành nội bộ', description: 'Nắm vững quy trình từ tiếp nhận yêu cầu đến giao hàng, lắp đặt và bảo hành. Quy định xử lý hợp đồng, hóa đơn và hỗ trợ kỹ thuật sau bán hàng.', categoryId: 7, instructor: 'Nguyễn Văn Đức – Operations Manager', thumbnail: '', duration: '4 giờ', totalLessons: 3, level: 'Cơ bản', allowedRoles: ['admin', 'employee_new', 'employee_old'], lessonIds: [49,50,51], quizId: 14, rating: 4.6, enrollCount: 0, status: 'active', createdAt: '2024-05-10', tags: ['quy trình', 'đơn hàng', 'bảo hành', 'giao hàng'] },

  // ── Cat 8: Văn hóa Doanh nghiệp ──
  { id: 15, title: 'Văn hóa Doanh nghiệp VPS – Giá trị cốt lõi & Môi trường làm việc', description: 'Khám phá văn hóa doanh nghiệp VPS – Haitech AI: giá trị cốt lõi, cam kết với khách hàng, tinh thần đội nhóm và môi trường làm việc chuyên nghiệp. Nền tảng quan trọng cho mọi nhân viên.', categoryId: 8, instructor: 'Ban Giám đốc VPS – Haitech AI', thumbnail: '', duration: '3 giờ', totalLessons: 3, level: 'Cơ bản', allowedRoles: ['admin', 'employee_new', 'employee_old', 'customer'], lessonIds: [52,53,54], quizId: 15, rating: 5.0, enrollCount: 0, status: 'active', createdAt: '2026-01-01', tags: ['văn hóa', 'doanh nghiệp', 'giá trị cốt lõi', 'VPS', 'onboarding'] },
];

const DEFAULT_LESSONS = [
  // ── Course 1: AI Nhập môn ──
  {
    id:1, courseId:1,
    title:'Bài 1: AI là gì? Tổng quan trí tuệ nhân tạo',
    description:'Giới thiệu về AI, Machine Learning và ứng dụng thực tế trong doanh nghiệp.',
    videoUrl:'', duration:'45 phút', order:1,
    docName:'bai1-tong-quan-ai.pdf', docUrl:'', type:'video',
    interactiveQs: [
      { id:101, timestamp:60, text:'AI (Trí tuệ nhân tạo) là gì?',
        options:['Một loại robot thông minh','Khả năng của máy tính mô phỏng trí thông minh người','Phần mềm diệt virus','Hệ thống máy tính thế hệ mới'],
        correct:1 },
    ]
  },
  {
    id:2, courseId:1,
    title:'Bài 2: ChatGPT, Claude, Gemini – Công cụ AI phổ biến',
    description:'Hướng dẫn sử dụng các AI tools phổ biến trong công việc hàng ngày.',
    videoUrl:'', duration:'50 phút', order:2,
    docName:'bai2-chatgpt-ai-tools.pdf', docUrl:'', type:'video',
    interactiveQs: [
      { id:102, timestamp:90, text:'ChatGPT do công ty nào phát triển?',
        options:['Google','Microsoft','OpenAI','Meta'],
        correct:2 },
    ]
  },
  { id:3, courseId:1, title:'Bài 3: Ứng dụng AI trong soạn thảo & Email', description:'Dùng AI để soạn email, viết báo cáo, tóm tắt tài liệu và tạo nội dung.', videoUrl:'', duration:'40 phút', order:3, docName:'', docUrl:'', type:'video', interactiveQs:[] },
  { id:4, courseId:1, title:'Bài 4: AI trong phân tích dữ liệu & Báo cáo', description:'Sử dụng AI để phân tích số liệu và tạo báo cáo kinh doanh tự động.', videoUrl:'', duration:'55 phút', order:4, docName:'bai4-ai-phan-tich-du-lieu.pdf', docUrl:'', type:'video', interactiveQs:[] },

  // ── Course 2: AI Nâng cao ──
  { id:5,  courseId:2, title:'Bài 1: Quy trình tự động hóa với Make.com & Zapier', description:'Xây dựng quy trình tự động hóa kết hợp AI và các ứng dụng doanh nghiệp.', videoUrl:'', duration:'60 phút', order:1, docName:'bai1-ai-workflow.pdf', docUrl:'', type:'video', interactiveQs:[] },
  { id:6,  courseId:2, title:'Bài 2: Microsoft Copilot trong Office 365', description:'Tích hợp Copilot trong Word, Excel, PowerPoint, Outlook.', videoUrl:'', duration:'65 phút', order:2, docName:'bai2-ms-copilot.pdf', docUrl:'', type:'video', interactiveQs:[] },
  { id:7,  courseId:2, title:'Bài 3: AI xử lý tài liệu & OCR thông minh', description:'Dùng AI OCR để số hóa và trích xuất thông tin từ hóa đơn, hợp đồng.', videoUrl:'', duration:'55 phút', order:3, docName:'', docUrl:'', type:'video', interactiveQs:[] },
  { id:8,  courseId:2, title:'Bài 4: Xây dựng Chatbot AI cho doanh nghiệp', description:'Tạo chatbot AI hỗ trợ khách hàng và thu thập thông tin tự động.', videoUrl:'', duration:'70 phút', order:4, docName:'bai4-chatbot-ai.pdf', docUrl:'', type:'video', interactiveQs:[] },

  // ── Course 3: Máy photocopy ──
  { id:9,  courseId:3, title:'Bài 1: Tổng quan máy photocopy & Các dòng sản phẩm', description:'Giới thiệu FUJIFILM, Ricoh, Canon, Konica Minolta. Phân biệt tính năng.', videoUrl:'', duration:'30 phút', order:1, docName:'may-photocopy-tong-quan.pdf', type:'video' },
  { id:10, courseId:3, title:'Bài 2: Vận hành máy photocopy cơ bản', description:'Các chức năng: photocopy, in, scan, fax. Cài đặt chất lượng và tùy chọn.', videoUrl:'', duration:'40 phút', order:2, docName:'', type:'video' },
  { id:11, courseId:3, title:'Bài 3: Bảo trì định kỳ & Thay thế vật tư', description:'Vệ sinh máy, thay toner, drum, nạp giấy và lịch bảo trì định kỳ.', videoUrl:'', duration:'35 phút', order:3, docName:'bao-tri-dinh-ky.pdf', type:'video' },
  { id:12, courseId:3, title:'Bài 4: Xử lý sự cố thường gặp', description:'Xử lý kẹt giấy, mờ bản in, lỗi kết nối mạng và các thông báo lỗi.', videoUrl:'', duration:'45 phút', order:4, docName:'xu-ly-su-co.pdf', type:'video' },

  // ── Course 4: Máy in HP FUJIFILM Ricoh ──
  { id:13, courseId:4, title:'Bài 1: Các dòng máy in HP, FUJIFILM, Ricoh', description:'So sánh máy in laser, inkjet, đa năng – lựa chọn phù hợp nhu cầu.', videoUrl:'', duration:'35 phút', order:1, docName:'may-in-tong-quan.pdf', type:'video' },
  { id:14, courseId:4, title:'Bài 2: Cài đặt driver & Kết nối máy in mạng', description:'Cài driver, kết nối USB, WiFi, LAN và chia sẻ máy in doanh nghiệp.', videoUrl:'', duration:'40 phút', order:2, docName:'cai-dat-may-in.pdf', type:'video' },
  { id:15, courseId:4, title:'Bài 3: Tối ưu cài đặt in & Tiết kiệm mực', description:'In 2 mặt tự động, chế độ tiết kiệm mực và quản lý hàng đợi in.', videoUrl:'', duration:'30 phút', order:3, docName:'', type:'video' },
  { id:16, courseId:4, title:'Bài 4: Bảo trì & Xử lý sự cố máy in', description:'Thay mực, vệ sinh đầu in, kẹt giấy, lỗi in mờ và sự cố thường gặp.', videoUrl:'', duration:'45 phút', order:4, docName:'bao-tri-may-in.pdf', type:'video' },

  // ── Course 5: Máy tính văn phòng ──
  { id:17, courseId:5, title:'Bài 1: Lựa chọn cấu hình máy tính phù hợp', description:'Tiêu chí chọn PC/Laptop theo vị trí: kế toán, thiết kế, kỹ thuật, quản lý.', videoUrl:'', duration:'30 phút', order:1, docName:'lua-chon-may-tinh.pdf', type:'video' },
  { id:18, courseId:5, title:'Bài 2: Cài đặt phần mềm & Bảo mật cơ bản', description:'Cài Windows, phần mềm văn phòng, antivirus và backup dữ liệu.', videoUrl:'', duration:'45 phút', order:2, docName:'', type:'video' },
  { id:19, courseId:5, title:'Bài 3: Tối ưu hiệu suất & Xử lý sự cố máy tính', description:'Dọn dẹp máy, tăng tốc khởi động và xử lý các sự cố phổ biến.', videoUrl:'', duration:'35 phút', order:3, docName:'toi-uu-may-tinh.pdf', type:'video' },

  // ── Course 6: Máy scan ──
  { id:20, courseId:6, title:'Bài 1: Giới thiệu máy scan & Phân loại', description:'Máy scan flatbed, ADF, di động – tiêu chí lựa chọn theo nhu cầu.', videoUrl:'', duration:'25 phút', order:1, docName:'may-scan-tong-quan.pdf', type:'video' },
  { id:21, courseId:6, title:'Bài 2: Vận hành & Cài đặt chất lượng scan', description:'Scan tài liệu, cài đặt DPI, định dạng file PDF/JPEG/TIFF, scan nhiều trang.', videoUrl:'', duration:'35 phút', order:2, docName:'', type:'video' },
  { id:22, courseId:6, title:'Bài 3: Số hóa tài liệu & Lưu trữ đám mây', description:'OCR nhận dạng chữ, tổ chức thư mục và tích hợp Google Drive, OneDrive.', videoUrl:'', duration:'40 phút', order:3, docName:'so-hoa-tai-lieu.pdf', type:'video' },

  // ── Course 7: Máy hủy tài liệu ──
  { id:23, courseId:7, title:'Bài 1: Tổng quan máy hủy tài liệu & Tiêu chuẩn DIN 66399', description:'Các cấp độ hủy P-1 đến P-7 và ứng dụng cho từng loại thông tin mật.', videoUrl:'', duration:'25 phút', order:1, docName:'may-huy-din66399.pdf', type:'video' },
  { id:24, courseId:7, title:'Bài 2: Vận hành & Bảo trì máy hủy tài liệu', description:'Sử dụng đúng cách, loại tài liệu có thể hủy, bảo dưỡng dao cắt.', videoUrl:'', duration:'30 phút', order:2, docName:'', type:'video' },
  { id:25, courseId:7, title:'Bài 3: Quy trình hủy tài liệu mật trong doanh nghiệp', description:'Phân loại, lưu trữ và hủy tài liệu theo quy định pháp luật và bảo mật nội bộ.', videoUrl:'', duration:'35 phút', order:3, docName:'quy-trinh-huy-tai-lieu.pdf', type:'video' },

  // ── Course 8: Thiết bị họp trực tuyến ──
  { id:26, courseId:8, title:'Bài 1: Tổng quan thiết bị phòng họp hiện đại', description:'Camera hội nghị, loa hội nghị, màn hình tương tác, collaboration bar.', videoUrl:'', duration:'35 phút', order:1, docName:'thiet-bi-hop-tong-quan.pdf', type:'video' },
  { id:27, courseId:8, title:'Bài 2: Lắp đặt & Cấu hình thiết bị phòng họp', description:'Lắp đặt camera, loa hội nghị, kết nối màn hình cho các quy mô phòng họp.', videoUrl:'', duration:'45 phút', order:2, docName:'', type:'video' },
  { id:28, courseId:8, title:'Bài 3: Kết nối Zoom, Microsoft Teams, Google Meet', description:'Cấu hình thiết bị với Zoom Rooms, Teams Rooms và Google Meet.', videoUrl:'', duration:'40 phút', order:3, docName:'ket-noi-zoom-teams.pdf', type:'video' },
  { id:29, courseId:8, title:'Bài 4: Xử lý sự cố & Bảo trì thiết bị họp', description:'Âm thanh kém, video lag, mạng không ổn định – cách khắc phục nhanh.', videoUrl:'', duration:'30 phút', order:4, docName:'', type:'video' },

  // ── Course 9: HDD Box ──
  { id:30, courseId:9, title:'Bài 1: HDD Box – Bảo mật dữ liệu trên máy photocopy', description:'Tại sao máy photocopy là rủi ro bảo mật và vai trò của HDD Box.', videoUrl:'', duration:'30 phút', order:1, docName:'hdd-box-tong-quan.pdf', type:'video' },
  { id:31, courseId:9, title:'Bài 2: Phân loại HDD Box & Tiêu chuẩn mã hóa AES 256-bit', description:'So sánh các loại HDD Box phù hợp với FUJIFILM, Ricoh, Konica Minolta.', videoUrl:'', duration:'35 phút', order:2, docName:'hdd-box-tieu-chuan.pdf', type:'video' },
  { id:32, courseId:9, title:'Bài 3: Lắp đặt HDD Box & Quy trình xử lý khi hủy máy', description:'Cài đặt HDD Box, xóa dữ liệu và quy trình thu hồi khi hết hợp đồng.', videoUrl:'', duration:'40 phút', order:3, docName:'quy-trinh-hdd-box.pdf', type:'video' },

  // ── Course 10: HP Advanced ──
  { id:33, courseId:10, title:'Bài 1: Giới thiệu HP Advanced & HP Smart App', description:'Tổng quan HP Advanced Print: quản lý thiết bị tập trung và HP Smart.', videoUrl:'', duration:'40 phút', order:1, docName:'hp-advanced-intro.pdf', type:'video' },
  { id:34, courseId:10, title:'Bài 2: Cài đặt HP JetAdvantage & Universal Print Driver', description:'Cài đặt JetAdvantage Security Manager và quản lý chính sách in.', videoUrl:'', duration:'50 phút', order:2, docName:'hp-jetadvantage-setup.pdf', type:'video' },
  { id:35, courseId:10, title:'Bài 3: Theo dõi chi phí & Báo cáo in ấn HP Web Jetadmin', description:'Theo dõi số lượng in, chi phí mực và phân bổ chi phí theo phòng ban.', videoUrl:'', duration:'45 phút', order:3, docName:'', type:'video' },
  { id:36, courseId:10, title:'Bài 4: HP Cloud Print & Pull Printing bảo mật', description:'Cài đặt HP Cloud Print, in theo yêu cầu với mã PIN bảo mật.', videoUrl:'', duration:'40 phút', order:4, docName:'hp-cloud-print.pdf', type:'video' },

  // ── Course 11: PaperCut ──
  { id:37, courseId:11, title:'Bài 1: Giới thiệu PaperCut MF/NG & Kiến trúc hệ thống', description:'Phân biệt PaperCut MF và NG, kiến trúc client-server, yêu cầu hệ thống.', videoUrl:'', duration:'40 phút', order:1, docName:'papercut-intro.pdf', type:'video' },
  { id:38, courseId:11, title:'Bài 2: Cài đặt & Tích hợp Active Directory', description:'Cài đặt PaperCut Server, cấu hình LDAP/AD và đồng bộ người dùng.', videoUrl:'', duration:'55 phút', order:2, docName:'papercut-setup-ad.pdf', type:'video' },
  { id:39, courseId:11, title:'Bài 3: Thiết lập Quota, Policy & Cost Center', description:'Cấu hình quota in, chính sách in 2 mặt và phân bổ chi phí theo trung tâm.', videoUrl:'', duration:'50 phút', order:3, docName:'papercut-quota-policy.pdf', type:'video' },
  { id:40, courseId:11, title:'Bài 4: Báo cáo, Giám sát & Troubleshooting PaperCut', description:'Xem báo cáo, giám sát real-time và xử lý các vấn đề thường gặp.', videoUrl:'', duration:'45 phút', order:4, docName:'', type:'video' },

  // ── Course 12: WXP & FUJIFILM/Ricoh ──
  { id:41, courseId:12, title:'Bài 1: Giới thiệu WXP & Managed Print Services', description:'Tổng quan WXP, khái niệm MPS của FUJIFILM và Ricoh.', videoUrl:'', duration:'40 phút', order:1, docName:'wxp-mps-intro.pdf', type:'video' },
  { id:42, courseId:12, title:'Bài 2: FUJIFILM Cloud & Scan Workflow tự động', description:'Cấu hình FUJIFILM Cloud, scan-to-cloud, scan-to-email và tự động hóa workflow.', videoUrl:'', duration:'50 phút', order:2, docName:'fujifilm-cloud-workflow.pdf', type:'video' },
  { id:43, courseId:12, title:'Bài 3: Ricoh Smart Integration & Follow-Me Print', description:'Triển khai Ricoh Smart Platform và Follow-Me Print đa thiết bị.', videoUrl:'', duration:'55 phút', order:3, docName:'ricoh-follow-me-print.pdf', type:'video' },
  { id:44, courseId:12, title:'Bài 4: Tích hợp ERP/DMS & Báo cáo MPS TCO', description:'Kết nối giải pháp in ấn với ERP/DMS và lập báo cáo ROI.', videoUrl:'', duration:'50 phút', order:4, docName:'', type:'video' },

  // ── Course 13: Kỹ năng bán hàng ──
  { id:45, courseId:13, title:'Bài 1: Thấu hiểu nhu cầu khách hàng về thiết bị văn phòng', description:'Phân tích nhu cầu, câu hỏi khảo sát và đánh giá môi trường văn phòng.', videoUrl:'', duration:'35 phút', order:1, docName:'phan-tich-nhu-cau-kh.pdf', type:'video' },
  { id:46, courseId:13, title:'Bài 2: Demo sản phẩm & Thuyết phục khách hàng', description:'Kỹ thuật demo máy photocopy, máy in tại văn phòng khách hàng.', videoUrl:'', duration:'40 phút', order:2, docName:'demo-san-pham.pdf', type:'video' },
  { id:47, courseId:13, title:'Bài 3: Xử lý phản đối & Đàm phán giá', description:'Xử lý phản đối giá cao và kỹ thuật tạo gói giải pháp hấp dẫn.', videoUrl:'', duration:'45 phút', order:3, docName:'', type:'video' },
  { id:48, courseId:13, title:'Bài 4: Chốt hợp đồng & Chăm sóc sau bán hàng', description:'Kỹ thuật chốt sale và xây dựng mối quan hệ khách hàng lâu dài.', videoUrl:'', duration:'40 phút', order:4, docName:'cham-soc-sau-ban.pdf', type:'video' },

  // ── Course 14: Quy trình nội bộ ──
  { id:49, courseId:14, title:'Bài 1: Quy trình tiếp nhận yêu cầu & Báo giá', description:'Từ nhận yêu cầu đến báo giá: khảo sát, lập báo giá và phê duyệt nội bộ.', videoUrl:'', duration:'30 phút', order:1, docName:'quy-trinh-bao-gia.pdf', type:'video' },
  { id:50, courseId:14, title:'Bài 2: Ký kết hợp đồng & Giao hàng lắp đặt', description:'Ký hợp đồng, lên lịch giao hàng, lắp đặt và bàn giao kỹ thuật.', videoUrl:'', duration:'35 phút', order:2, docName:'quy-trinh-giao-hang.pdf', type:'video' },
  { id:51, courseId:14, title:'Bài 3: Bảo hành, Bảo trì & Hỗ trợ kỹ thuật sau bán', description:'Chính sách bảo hành, SLA hỗ trợ kỹ thuật và xử lý khiếu nại.', videoUrl:'', duration:'40 phút', order:3, docName:'chinh-sach-bao-hanh.pdf', type:'video' },

  // ── Course 15: Văn hóa Doanh nghiệp ──
  { id:52, courseId:15, title:'Bài 1: Giá trị cốt lõi & Tầm nhìn VPS – Haitech AI', description:'Tìm hiểu về lịch sử hình thành, giá trị cốt lõi, tầm nhìn và sứ mệnh của VPS – Haitech AI trong lĩnh vực thiết bị văn phòng và công nghệ AI.', videoUrl:'', duration:'30 phút', order:1, docName:'gia-tri-cot-loi-vps.pdf', type:'video' },
  { id:53, courseId:15, title:'Bài 2: Văn hóa làm việc & Quy tắc ứng xử', description:'Quy tắc ứng xử nội bộ, văn hóa giao tiếp chuyên nghiệp, tinh thần đội nhóm và thái độ phục vụ khách hàng VPS.', videoUrl:'', duration:'35 phút', order:2, docName:'van-hoa-ung-xu-vps.pdf', type:'video' },
  { id:54, courseId:15, title:'Bài 3: Chính sách nhân sự & Phúc lợi VPS', description:'Giới thiệu chính sách nhân sự, lộ trình thăng tiến, phúc lợi và cam kết phát triển của doanh nghiệp đối với nhân viên.', videoUrl:'', duration:'25 phút', order:3, docName:'chinh-sach-nhan-su.pdf', type:'video' },
];

const DEFAULT_QUIZZES = [
  { id:1, courseId:1, title:'Kiểm tra: AI cho Doanh nghiệp – Nhập môn', timeLimit:15, passingScore:70,
    questions:[
      {id:1, text:'AI (Trí tuệ nhân tạo) là gì?', options:['Phần mềm máy tính thông thường','Hệ thống có khả năng học hỏi và ra quyết định tương tự con người','Robot cơ học','Công cụ tìm kiếm Internet'], correct:1},
      {id:2, text:'ChatGPT được phát triển bởi công ty nào?', options:['Google','Microsoft','OpenAI','Meta'], correct:2},
      {id:3, text:'AI có thể hỗ trợ soạn thảo email như thế nào?', options:['Gửi email thay người dùng','Gợi ý nội dung, chỉnh sửa văn phong và dịch thuật','Lưu trữ email trong máy chủ','Chặn email spam'], correct:1},
      {id:4, text:'Prompt là gì trong ngữ cảnh sử dụng AI?', options:['Lệnh tắt trên bàn phím','Câu hỏi hoặc hướng dẫn bạn nhập vào AI để nhận kết quả','Tên gọi của máy chủ AI','Kết quả đầu ra của AI'], correct:1},
      {id:5, text:'Microsoft Copilot được tích hợp vào bộ phần mềm nào?', options:['Google Workspace','Adobe Creative Suite','Microsoft Office 365','AutoCAD'], correct:2},
      {id:6, text:'AI OCR (Optical Character Recognition) được dùng để làm gì?', options:['Tạo hình ảnh từ văn bản','Nhận dạng và chuyển đổi chữ viết/in thành văn bản số','Dịch ngôn ngữ','Tạo âm thanh từ văn bản'], correct:1},
      {id:7, text:'Lợi ích lớn nhất của AI trong công việc văn phòng là gì?', options:['Thay thế hoàn toàn nhân viên','Tăng năng suất và tiết kiệm thời gian cho các tác vụ lặp lại','Loại bỏ nhu cầu máy tính','Tự động hóa 100% mọi công việc'], correct:1},
      {id:8, text:'Công cụ nào KHÔNG phải là AI Chatbot?', options:['ChatGPT','Claude','Microsoft Excel (phiên bản cũ)','Gemini'], correct:2},
    ]
  },
  { id:2, courseId:2, title:'Kiểm tra: AI tự động hóa văn phòng nâng cao', timeLimit:20, passingScore:75,
    questions:[
      {id:1, text:'Make.com được dùng chủ yếu để làm gì?', options:['Thiết kế đồ họa','Tự động hóa workflow kết nối nhiều ứng dụng','Quản lý dự án','Phân tích tài chính'], correct:1},
      {id:2, text:'Chatbot AI có thể làm được điều nào sau đây?', options:['Thay thế hoàn toàn nhân viên','Trả lời câu hỏi thường gặp, thu thập thông tin 24/7','Ra quyết định chiến lược','Ký hợp đồng với khách hàng'], correct:1},
      {id:3, text:'Microsoft Copilot trong Excel có thể hỗ trợ:', options:['Chỉ tô màu ô','Phân tích dữ liệu, tạo công thức và giải thích bằng ngôn ngữ tự nhiên','Kết nối Internet','In tự động'], correct:1},
      {id:4, text:'Khi dùng AI để phân tích dữ liệu, bước đầu tiên cần làm là:', options:['Xuất báo cáo ngay','Chuẩn bị và làm sạch dữ liệu đầu vào','Chia sẻ kết quả','Cài đặt AI'], correct:1},
      {id:5, text:'Google Drive và OneDrive là ví dụ về loại dịch vụ nào?', options:['Phần mềm diệt virus','Lưu trữ đám mây (Cloud Storage)','Hệ điều hành','Công cụ video conference'], correct:1},
      {id:6, text:'Zapier giúp:', options:['Thiết kế website','Kết nối và tự động hóa các ứng dụng web không cần code','Phân tích dữ liệu lớn','Quản lý email server'], correct:1},
    ]
  },
  { id:3, courseId:3, title:'Kiểm tra: Máy photocopy – Vận hành & Bảo trì', timeLimit:15, passingScore:70,
    questions:[
      {id:1, text:'Khi máy photocopy bị kẹt giấy, bước đầu tiên cần làm là gì?', options:['Tắt nguồn ngay lập tức','Kéo mạnh tờ giấy ra','Mở nắp theo hướng dẫn màn hình và gỡ giấy cẩn thận','Gọi kỹ thuật viên ngay'], correct:2},
      {id:2, text:'Toner trong máy photocopy là gì?', options:['Nước làm mát','Mực dạng bột để in và photocopy','Dầu bôi trơn bánh trục','Giấy cuộn đặc biệt'], correct:1},
      {id:3, text:'ADF (Automatic Document Feeder) là tính năng gì?', options:['Tự động nạp giấy in từ khay','Tự động nạp tài liệu gốc để scan/copy liên tục','Tự động tắt máy','Tự động đặt hàng mực'], correct:1},
      {id:4, text:'Khi bản photocopy bị sọc đen dọc, nguyên nhân thường là:', options:['Máy hết mực hoàn toàn','Kính scan bị bẩn hoặc trầy xước','Giấy bị ẩm','Lỗi kết nối mạng'], correct:1},
      {id:5, text:'DPI đo lường điều gì trong máy photocopy?', options:['Tốc độ in (trang/phút)','Độ phân giải (chấm/inch)','Dung lượng bộ nhớ','Kích thước khay giấy'], correct:1},
      {id:6, text:'Bảo lâu nên vệ sinh máy photocopy một lần?', options:['Hàng ngày','Định kỳ theo khuyến cáo nhà sản xuất hoặc khi bản sao bị mờ','Chỉ khi máy hỏng','Mỗi 5 năm'], correct:1},
      {id:7, text:'Drum (trống) trong máy photocopy có chức năng gì?', options:['Làm nóng tờ giấy','Chuyển toner lên giấy thông qua điện tích tĩnh','Cắt giấy','Kết nối mạng'], correct:1},
    ]
  },
  { id:4, courseId:4, title:'Kiểm tra: Máy in HP, FUJIFILM, Ricoh', timeLimit:15, passingScore:70,
    questions:[
      {id:1, text:'Máy in Laser khác máy in Inkjet ở điểm gì chính?', options:['Laser dùng mực nước, inkjet dùng toner','Laser dùng toner và nhiệt, inkjet dùng mực nước phun','Laser chỉ in đen trắng','Inkjet nhanh hơn laser'], correct:1},
      {id:2, text:'PPM trong thông số máy in là gì?', options:['Pixels Per Millimeter','Pages Per Minute – Số trang in mỗi phút','Parts Per Machine','Print Per Month'], correct:1},
      {id:3, text:'Chế độ in Duplex là gì?', options:['In màu chất lượng cao','In 2 mặt tự động','In nhiều bản cùng lúc','In trên giấy đặc biệt'], correct:1},
      {id:4, text:'Khi máy in báo "Low Toner", bạn nên làm gì?', options:['Tắt máy in ngay','Lắc nhẹ hộp mực để dùng thêm và chuẩn bị mực mới','Đổ thêm mực vào hộp','Bỏ qua thông báo'], correct:1},
      {id:5, text:'HP JetAdvantage được dùng để làm gì?', options:['Tăng tốc độ in','Quản lý thiết bị in HP trong doanh nghiệp tập trung','Thay thế driver máy in','Kết nối máy in với điện thoại'], correct:1},
      {id:6, text:'Để chia sẻ máy in trong mạng LAN, cần gì?', options:['Driver và chia sẻ qua mạng Windows/Print Server','Chỉ cần USB từ máy in sang từng máy tính','Mua thêm máy in khác','Kết nối Bluetooth'], correct:0},
    ]
  },
  { id:5, courseId:5, title:'Kiểm tra: Máy tính văn phòng', timeLimit:15, passingScore:70,
    questions:[
      {id:1, text:'RAM trong máy tính có chức năng gì?', options:['Lưu trữ dữ liệu lâu dài','Bộ nhớ tạm thời xử lý dữ liệu đang chạy','Kết nối internet','Hiển thị hình ảnh'], correct:1},
      {id:2, text:'SSD khác HDD ở điểm nào?', options:['SSD chậm hơn nhưng rẻ hơn','SSD nhanh hơn, ít tiêu điện và bền hơn HDD','HDD đọc dữ liệu nhanh hơn','Không có sự khác biệt'], correct:1},
      {id:3, text:'Vì sao nên cài phần mềm diệt virus?', options:['Để tăng tốc máy','Bảo vệ dữ liệu khỏi malware, ransomware và tấn công mạng','Tiết kiệm pin','Cải thiện chất lượng màn hình'], correct:1},
      {id:4, text:'Backup dữ liệu quan trọng nên được thực hiện:', options:['Chỉ khi máy sắp hỏng','Định kỳ và lưu ở nhiều nơi khác nhau','Một lần khi mua máy mới','Không cần nếu có antivirus'], correct:1},
      {id:5, text:'Khi máy tính bị chậm, bước đơn giản nhất cần thử là:', options:['Mua máy tính mới','Khởi động lại và kiểm tra ứng dụng chạy nền','Cài lại Windows ngay','Tăng độ sáng màn hình'], correct:1},
    ]
  },
  { id:6, courseId:6, title:'Kiểm tra: Máy scan & Quản lý tài liệu số', timeLimit:15, passingScore:70,
    questions:[
      {id:1, text:'OCR trong máy scan là công nghệ gì?', options:['Optical Color Recognition – nhận dạng màu','Optical Character Recognition – nhận dạng chữ thành văn bản số','Online Cloud Repository','Original Copy Resolution'], correct:1},
      {id:2, text:'Máy scan ADF phù hợp cho loại công việc nào?', options:['Scan ảnh nghệ thuật chất lượng cao','Scan nhiều trang tài liệu liên tiếp tự động','Scan vật dày như sách','Scan phim âm bản'], correct:1},
      {id:3, text:'DPI khi scan tài liệu văn bản thông thường nên là:', options:['72 DPI','150-300 DPI','600 DPI trở lên','DPI không ảnh hưởng'], correct:1},
      {id:4, text:'Lợi ích của lưu tài liệu trên Cloud là:', options:['Tốc độ truy cập nhanh hơn ổ cứng','Truy cập từ mọi nơi, chia sẻ dễ dàng và sao lưu tự động','Tiết kiệm điện năng','Không cần internet'], correct:1},
      {id:5, text:'Để số hóa hóa đơn và nhận dạng thông tin tự động, cần dùng:', options:['Scan PDF thông thường','OCR kết hợp AI để trích xuất dữ liệu','Chụp ảnh điện thoại','In lại hóa đơn'], correct:1},
    ]
  },
  { id:7, courseId:7, title:'Kiểm tra: Máy hủy tài liệu', timeLimit:10, passingScore:70,
    questions:[
      {id:1, text:'Tiêu chuẩn DIN 66399 quy định điều gì?', options:['Kích thước máy hủy','Mức độ bảo mật của việc hủy tài liệu (P-1 đến P-7)','Công suất điện của máy','Thương hiệu được chứng nhận'], correct:1},
      {id:2, text:'Cấp độ bảo mật nào cao nhất theo DIN 66399?', options:['P-1','P-3','P-5','P-7'], correct:3},
      {id:3, text:'Loại tài liệu nào KHÔNG nên cho vào máy hủy thông thường?', options:['Giấy A4','Tài liệu có ghim dập (kẹp kim)','Báo cáo kinh doanh','Phong bì giấy'], correct:1},
      {id:4, text:'Khi nào cần dùng máy hủy cấp P-5 trở lên?', options:['Hủy tài liệu thông thường','Hủy tài liệu bí mật, thông tin tài chính nhạy cảm','Hủy báo cũ','Hủy giấy nháp'], correct:1},
      {id:5, text:'Máy hủy tài liệu cần được bảo trì như thế nào?', options:['Không cần bảo trì','Tra dầu dao cắt định kỳ theo hướng dẫn','Thay dao cắt mỗi tháng','Chỉ bảo trì khi hỏng'], correct:1},
    ]
  },
  { id:8, courseId:8, title:'Kiểm tra: Thiết bị họp trực tuyến', timeLimit:15, passingScore:70,
    questions:[
      {id:1, text:'Camera hội nghị khác webcam thông thường ở điểm gì?', options:['Không có sự khác biệt','Góc rộng hơn, thu âm xa hơn và chất lượng video chuyên nghiệp hơn','Webcam đắt hơn','Chỉ dùng được với Zoom'], correct:1},
      {id:2, text:'Loa hội nghị có tính năng quan trọng nào?', options:['Kết nối Bluetooth chỉ','Khử tiếng vang (echo cancellation) và tiếng ồn xung quanh','Âm lượng cực lớn','Chỉ nghe, không có micro'], correct:1},
      {id:3, text:'Zoom Rooms là gì?', options:['Ứng dụng Zoom cho điện thoại','Giải pháp phòng họp tích hợp phần cứng và phần mềm Zoom','Phòng họp ảo metaverse','Công cụ đặt lịch họp'], correct:1},
      {id:4, text:'Khi video bị lag trong cuộc họp, nguyên nhân phổ biến nhất là:', options:['Camera bị hỏng','Đường truyền internet không ổn định','Phòng họp quá sáng','Micro không hoạt động'], correct:1},
      {id:5, text:'Băng thông tối thiểu cho cuộc họp video HD là:', options:['128 Kbps','512 Kbps','1-2 Mbps trở lên cho mỗi người','10 Mbps bắt buộc'], correct:2},
      {id:6, text:'Màn hình tương tác (Interactive Display) trong phòng họp dùng để:', options:['Chỉ chiếu PowerPoint','Vẽ tay, chia sẻ nội dung và cộng tác real-time','Thay thế TV','Kết nối internet'], correct:1},
    ]
  },
  { id:9, courseId:9, title:'Kiểm tra: HDD Box – Bảo mật dữ liệu', timeLimit:15, passingScore:75,
    questions:[
      {id:1, text:'Tại sao máy photocopy là rủi ro bảo mật?', options:['Phát ra bức xạ điện từ','Ổ cứng trong máy lưu lại hình ảnh tài liệu đã scan/copy','Kết nối internet không bảo mật','Mực chứa hóa chất độc'], correct:1},
      {id:2, text:'HDD Box có chức năng gì?', options:['Tăng tốc độ in','Mã hóa và bảo vệ dữ liệu trên ổ cứng của máy photocopy','Lưu trữ giấy tờ vật lý','Kết nối WiFi'], correct:1},
      {id:3, text:'Tiêu chuẩn AES 256-bit có mức độ bảo mật như thế nào?', options:['Thấp, dễ bị phá vỡ','Rất cao, được chính phủ và quân đội sử dụng','Chỉ phù hợp cho cá nhân','Không có ý nghĩa thực sự'], correct:1},
      {id:4, text:'Khi hết hợp đồng thuê máy photocopy, cần xử lý HDD như thế nào?', options:['Để lại không cần lo ngại','Xóa dữ liệu theo tiêu chuẩn hoặc yêu cầu nhà cung cấp xử lý HDD','Chỉ cần format đơn giản','Đập vỡ là cách duy nhất'], correct:1},
      {id:5, text:'Doanh nghiệp nào CẦN HDD Box nhất?', options:['Cửa hàng tạp hóa nhỏ','Văn phòng luật sư, ngân hàng, bệnh viện, cơ quan chính phủ','Chỉ công ty đa quốc gia','Tất cả đều không cần'], correct:1},
    ]
  },
  { id:10, courseId:10, title:'Kiểm tra: HP Advanced Print', timeLimit:20, passingScore:75,
    questions:[
      {id:1, text:'HP Web Jetadmin được dùng để làm gì?', options:['In ảnh chất lượng cao','Quản lý tập trung nhiều thiết bị in HP trong mạng doanh nghiệp','Kết nối máy in với Internet','Thiết kế tài liệu in'], correct:1},
      {id:2, text:'Pull Printing (in theo yêu cầu) là gì?', options:['In trực tiếp không cần máy tính','Bản in chỉ được in khi người dùng xác thực tại máy in','In nhiều bản cùng lúc','In qua đường dây điện thoại'], correct:1},
      {id:3, text:'Lợi ích của Pull Printing là:', options:['Tăng tốc độ in','Bảo mật tài liệu, giảm lãng phí và tiết kiệm chi phí mực','Giảm số máy in','Không có lợi ích thực tế'], correct:1},
      {id:4, text:'HP JetAdvantage Security Manager giúp:', options:['Tăng tốc độ in','Đảm bảo thiết bị HP tuân thủ chính sách bảo mật doanh nghiệp','Thiết kế form in','Quản lý kho mực'], correct:1},
      {id:5, text:'HP Smart App hỗ trợ:', options:['Chỉ in từ điện thoại','In, scan, theo dõi mực và quản lý máy in từ thiết bị di động','Chỉ cho máy in HP gia đình','Không tương thích iOS'], correct:1},
    ]
  },
  { id:11, courseId:11, title:'Kiểm tra: PaperCut – Quản lý in ấn', timeLimit:20, passingScore:75,
    questions:[
      {id:1, text:'Quota trong PaperCut là gì?', options:['Báo cáo in hàng tháng','Giới hạn số trang in phân bổ cho người dùng/nhóm','Số máy in được quản lý','Chi phí tổng cộng'], correct:1},
      {id:2, text:'PaperCut tích hợp với Active Directory để:', options:['Thay thế Active Directory','Đồng bộ người dùng và nhóm, phân quyền tự động','Quản lý password','Backup dữ liệu AD'], correct:1},
      {id:3, text:'Tính năng "Find Me Printing" trong PaperCut là gì?', options:['Tìm kiếm máy in gần nhất','Người dùng gửi lệnh in một lần, lấy bản in tại bất kỳ máy nào','In từ điện thoại','Theo dõi vị trí máy in'], correct:1},
      {id:4, text:'Cost Center trong PaperCut dùng để:', options:['Tính chi phí vật tư','Phân bổ chi phí in theo phòng ban, dự án hoặc khách hàng','Quản lý ngân sách IT','Theo dõi hóa đơn'], correct:1},
      {id:5, text:'Chính sách in mặc định 2 mặt (Duplex) giúp:', options:['Tăng tốc độ in','Giảm 50% lượng giấy tiêu thụ và chi phí in ấn','Cải thiện chất lượng in','Bảo vệ máy in lâu hơn'], correct:1},
      {id:6, text:'PaperCut MF và PaperCut NG khác nhau như thế nào?', options:['Không có sự khác biệt','MF hỗ trợ copy/scan trên MFP; NG chỉ quản lý máy in','NG đắt hơn MF','MF cho văn phòng nhỏ'], correct:1},
    ]
  },
  { id:12, courseId:12, title:'Kiểm tra: WXP & FUJIFILM/Ricoh MPS', timeLimit:20, passingScore:75,
    questions:[
      {id:1, text:'MPS (Managed Print Services) là gì?', options:['Phần mềm quản lý máy in','Dịch vụ quản lý toàn diện hạ tầng in ấn bởi nhà cung cấp bên ngoài','Máy in đa chức năng','Tiêu chuẩn bảo mật in'], correct:1},
      {id:2, text:'Follow-Me Print của Ricoh hoạt động như thế nào?', options:['Máy in theo sau người dùng','Người dùng xác thực tại bất kỳ máy Ricoh nào để lấy bản in','In tự động theo lịch','Theo dõi số lượng in real-time'], correct:1},
      {id:3, text:'TCO (Total Cost of Ownership) bao gồm:', options:['Chỉ giá mua thiết bị','Tổng chi phí: thiết bị, mực, giấy, bảo trì và nhân lực trong vòng đời','Chỉ chi phí điện và mực','Phí phần mềm quản lý'], correct:1},
      {id:4, text:'FUJIFILM Cloud Integration cho phép:', options:['In không cần mạng','Scan và lưu tài liệu trực tiếp lên cloud, chia sẻ và cộng tác','Tự động đặt mực','Kết nối với MES'], correct:1},
      {id:5, text:'Lợi ích chính của giải pháp WXP là:', options:['Giảm xuống còn 1 máy in','Tối ưu quy trình in ấn, giảm chi phí và tăng bảo mật','Loại bỏ việc dùng giấy','Thay thế hệ thống email'], correct:1},
    ]
  },
  { id:13, courseId:13, title:'Kiểm tra: Kỹ năng tư vấn & Bán hàng', timeLimit:15, passingScore:70,
    questions:[
      {id:1, text:'Bước đầu tiên trong quy trình bán hàng thiết bị văn phòng là:', options:['Báo giá ngay','Khảo sát nhu cầu và môi trường làm việc của khách hàng','Demo sản phẩm','Ký hợp đồng'], correct:1},
      {id:2, text:'USP (Unique Selling Proposition) là gì?', options:['Giá bán đặc biệt','Điểm khác biệt và lợi thế nổi bật của sản phẩm so với đối thủ','Điều khoản hợp đồng','Chương trình khuyến mãi'], correct:1},
      {id:3, text:'Khi khách hàng nói "Giá đắt hơn đối thủ", bạn nên:', options:['Giảm giá ngay','Giải thích giá trị gia tăng: bảo hành, hỗ trợ kỹ thuật, chất lượng dịch vụ','Phủ nhận so sánh','Kết thúc cuộc gặp'], correct:1},
      {id:4, text:'Demo sản phẩm hiệu quả cần:', options:['Nói nhiều tính năng nhất có thể','Tập trung vào tính năng giải quyết đúng vấn đề của khách hàng đó','Chỉ demo tính năng đẹp nhất','Đọc từ catalogue'], correct:1},
      {id:5, text:'Chăm sóc khách hàng sau bán hàng quan trọng vì:', options:['Chỉ để hoàn thiện quy trình','Tăng hài lòng, tạo cơ hội upsell và nhận nguồn khách referral','Bắt buộc theo pháp luật','Không quan trọng sau khi ký hợp đồng'], correct:1},
    ]
  },
  { id:14, courseId:14, title:'Kiểm tra: Quy trình nội bộ', timeLimit:15, passingScore:80,
    questions:[
      {id:1, text:'Bước đầu tiên khi nhận yêu cầu từ khách hàng là:', options:['Giao hàng ngay','Xác nhận yêu cầu, thu thập thông tin chi tiết và ghi vào hệ thống','Lập hóa đơn','Báo cáo giám đốc'], correct:1},
      {id:2, text:'SLA (Service Level Agreement) là gì?', options:['Bảng lương nhân viên kỹ thuật','Cam kết về thời gian phản hồi và giải quyết sự cố với khách hàng','Quy trình an toàn lao động','Hợp đồng phần mềm'], correct:1},
      {id:3, text:'Khi nhận khiếu nại từ khách hàng, thái độ đúng là:', options:['Phủ nhận lỗi ngay','Lắng nghe, ghi nhận, xin lỗi và cam kết giải quyết trong thời gian cụ thể','Chuyển ngay cho kỹ thuật','Yêu cầu khiếu nại bằng văn bản trước'], correct:1},
      {id:4, text:'Biên bản bàn giao thiết bị cần có:', options:['Chỉ tên thiết bị','Thông tin thiết bị, ngày bàn giao, tình trạng, serial number và chữ ký hai bên','Chỉ chữ ký khách hàng','Không cần nếu có hóa đơn'], correct:1},
      {id:5, text:'Thời gian bảo hành tiêu chuẩn thường là:', options:['30 ngày','3 tháng','12 tháng (1 năm) trở lên theo hợp đồng','5 năm bắt buộc'], correct:2},
    ]
  },
];

// ─── Storage Helpers ──────────────────────────────────────────
function getDB(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
function setDB(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

function initDB() {
  const storedVer = localStorage.getItem('vps_db_version');

  // Khi version thay đổi: KHÔNG xóa data admin đã nhập.
  // Chỉ update version tag và merge thêm categories/lessons còn thiếu.
  localStorage.setItem('vps_db_version', DB_VERSION);

  // Chỉ khởi tạo nếu KEY chưa có (không ghi đè data đã save)
  if (!localStorage.getItem(DB_KEYS.users))        setDB(DB_KEYS.users, DEFAULT_USERS);
  if (!localStorage.getItem(DB_KEYS.courses))      setDB(DB_KEYS.courses, DEFAULT_COURSES);
  if (!localStorage.getItem(DB_KEYS.lessons))      setDB(DB_KEYS.lessons, DEFAULT_LESSONS);
  if (!localStorage.getItem(DB_KEYS.quizzes))      setDB(DB_KEYS.quizzes, DEFAULT_QUIZZES);
  if (!localStorage.getItem(DB_KEYS.results))      setDB(DB_KEYS.results, []);
  if (!localStorage.getItem(DB_KEYS.enrollments))  setDB(DB_KEYS.enrollments, []);
  if (!localStorage.getItem(DB_KEYS.progress))     setDB(DB_KEYS.progress, []);

  // ── Smart merge categories: thêm category mới mà không xóa cái cũ ──
  const storedCats = getDB(DB_KEYS.categories);
  if (!storedCats.length) {
    setDB(DB_KEYS.categories, DEFAULT_CATEGORIES);
  } else {
    let changed = false;
    DEFAULT_CATEGORIES.forEach(dc => {
      const exists = storedCats.find(sc => sc.id === dc.id || sc.name === dc.name);
      if (!exists) { storedCats.push(dc); changed = true; }
    });
    if (changed) setDB(DB_KEYS.categories, storedCats);
  }

  // ── Smart merge lessons: thêm field mới vào lesson cũ nếu thiếu ──
  // (cần thiết khi cấu trúc lesson có trường mới: docUrl, interactiveQs)
  const storedLessons = getDB(DB_KEYS.lessons);
  let lessonChanged = false;
  storedLessons.forEach(l => {
    if (l.docUrl === undefined)         { l.docUrl = '';         lessonChanged = true; }
    if (l.interactiveQs === undefined)  { l.interactiveQs = [];  lessonChanged = true; }
  });
  if (lessonChanged) setDB(DB_KEYS.lessons, storedLessons);

  // ── Luôn đồng bộ thông tin admin (id=1) từ DEFAULT_USERS ──
  // Đảm bảo đổi email/mật khẩu trong code là có hiệu lực ngay
  const adminDefault = DEFAULT_USERS.find(u => u.id === 1);
  if (adminDefault) {
    const storedUsers = getDB(DB_KEYS.users);
    const adminIdx = storedUsers.findIndex(u => u.id === 1);
    if (adminIdx >= 0) {
      storedUsers[adminIdx].email    = adminDefault.email;
      storedUsers[adminIdx].password = adminDefault.password;
      storedUsers[adminIdx].name     = adminDefault.name;
      storedUsers[adminIdx].role     = 'admin';
      setDB(DB_KEYS.users, storedUsers);
    }
  }
}


// Expose globals for admin.js usage
window.DB_KEYS = DB_KEYS;
window._setDB  = setDB;

// ─── User CRUD ────────────────────────────────────────────────
const UserDB = {
  getAll: () => getDB(DB_KEYS.users),
  getById: (id) => getDB(DB_KEYS.users).find(u => u.id === parseInt(id)),
  getByEmail: (email) => getDB(DB_KEYS.users).find(u => u.email === email),
  create: (data) => { const users = getDB(DB_KEYS.users); const u = { ...data, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] }; users.push(u); setDB(DB_KEYS.users, users); return u; },
  update: (id, data) => { const users = getDB(DB_KEYS.users); const i = users.findIndex(u => u.id === parseInt(id)); if (i < 0) return null; users[i] = { ...users[i], ...data }; setDB(DB_KEYS.users, users); return users[i]; },
  delete: (id) => { setDB(DB_KEYS.users, getDB(DB_KEYS.users).filter(u => u.id !== parseInt(id))); },
};

// ─── Course CRUD ──────────────────────────────────────────────
const CourseDB = {
  getAll: () => getDB(DB_KEYS.courses),
  getById: (id) => getDB(DB_KEYS.courses).find(c => c.id === parseInt(id)),
  getByRole: (role) => getDB(DB_KEYS.courses).filter(c => c.allowedRoles.includes(role) && c.status === 'active'),
  create: (data) => { const courses = getDB(DB_KEYS.courses); const c = { ...data, id: Date.now(), enrollCount: 0, createdAt: new Date().toISOString().split('T')[0] }; courses.push(c); setDB(DB_KEYS.courses, courses); return c; },
  update: (id, data) => { const courses = getDB(DB_KEYS.courses); const i = courses.findIndex(c => c.id === parseInt(id)); if (i < 0) return null; courses[i] = { ...courses[i], ...data }; setDB(DB_KEYS.courses, courses); return courses[i]; },
  delete: (id) => { setDB(DB_KEYS.courses, getDB(DB_KEYS.courses).filter(c => c.id !== parseInt(id))); },
};

// ─── Lesson CRUD ──────────────────────────────────────────────
const LessonDB = {
  getAll: () => getDB(DB_KEYS.lessons),
  getById: (id) => getDB(DB_KEYS.lessons).find(l => l.id === parseInt(id)),
  getByCourse: (courseId) => getDB(DB_KEYS.lessons).filter(l => l.courseId === parseInt(courseId)).sort((a,b) => a.order - b.order),
  create: (data) => { const l = getDB(DB_KEYS.lessons); const n = { ...data, id: Date.now() }; l.push(n); setDB(DB_KEYS.lessons, l); return n; },
  update: (id, data) => { const l = getDB(DB_KEYS.lessons); const i = l.findIndex(x => x.id === parseInt(id)); if (i < 0) return null; l[i] = { ...l[i], ...data }; setDB(DB_KEYS.lessons, l); return l[i]; },
  delete: (id) => { setDB(DB_KEYS.lessons, getDB(DB_KEYS.lessons).filter(l => l.id !== parseInt(id))); },
};

// ─── Quiz CRUD ────────────────────────────────────────────────
const QuizDB = {
  getAll: () => getDB(DB_KEYS.quizzes),
  getByCourse: (courseId) => getDB(DB_KEYS.quizzes).find(q => q.courseId === parseInt(courseId)),
  getById: (id) => getDB(DB_KEYS.quizzes).find(q => q.id === parseInt(id)),
  create: (data) => { const q = getDB(DB_KEYS.quizzes); const n = { ...data, id: Date.now() }; q.push(n); setDB(DB_KEYS.quizzes, q); return n; },
  update: (id, data) => { const q = getDB(DB_KEYS.quizzes); const i = q.findIndex(x => x.id === parseInt(id)); if (i < 0) return null; q[i] = { ...q[i], ...data }; setDB(DB_KEYS.quizzes, q); return q[i]; },
  delete: (id) => { setDB(DB_KEYS.quizzes, getDB(DB_KEYS.quizzes).filter(q => q.id !== parseInt(id))); },
};

// ─── Results ─────────────────────────────────────────────────
const ResultDB = {
  getAll: () => getDB(DB_KEYS.results),
  getByUser: (userId) => getDB(DB_KEYS.results).filter(r => r.userId === parseInt(userId)),
  getByCourse: (courseId) => getDB(DB_KEYS.results).filter(r => r.courseId === parseInt(courseId)),
  getUserCourseResult: (userId, courseId) => getDB(DB_KEYS.results).find(r => r.userId === parseInt(userId) && r.courseId === parseInt(courseId)),
  save: (data) => {
    const results = getDB(DB_KEYS.results);
    const i = results.findIndex(r => r.userId === data.userId && r.courseId === data.courseId);
    const n = { ...data, id: i >= 0 ? results[i].id : Date.now(), submittedAt: new Date().toISOString() };
    if (i >= 0) results[i] = n; else results.push(n);
    setDB(DB_KEYS.results, results); return n;
  },
};

// ─── Progress ─────────────────────────────────────────────────
const ProgressDB = {
  get: (userId, courseId) => getDB(DB_KEYS.progress).find(p => p.userId === parseInt(userId) && p.courseId === parseInt(courseId)) || { completedLessons: [] },
  markComplete: (userId, courseId, lessonId) => {
    const all = getDB(DB_KEYS.progress);
    const i = all.findIndex(p => p.userId === parseInt(userId) && p.courseId === parseInt(courseId));
    if (i >= 0) { if (!all[i].completedLessons.includes(lessonId)) all[i].completedLessons.push(lessonId); all[i].lastActivity = new Date().toISOString(); }
    else all.push({ userId: parseInt(userId), courseId: parseInt(courseId), completedLessons: [lessonId], lastActivity: new Date().toISOString() });
    setDB(DB_KEYS.progress, all);
  },
};

// ─── Enrollment ───────────────────────────────────────────────
const EnrollmentDB = {
  getAll: () => getDB(DB_KEYS.enrollments),
  isEnrolled: (userId, courseId) => getDB(DB_KEYS.enrollments).some(e => e.userId === parseInt(userId) && e.courseId === parseInt(courseId)),
  enroll: (userId, courseId) => {
    const e = getDB(DB_KEYS.enrollments);
    if (!e.some(x => x.userId === parseInt(userId) && x.courseId === parseInt(courseId))) {
      e.push({ userId: parseInt(userId), courseId: parseInt(courseId), enrolledAt: new Date().toISOString() });
      setDB(DB_KEYS.enrollments, e);
      const courses = getDB(DB_KEYS.courses); const i = courses.findIndex(c => c.id === parseInt(courseId));
      if (i >= 0) { courses[i].enrollCount = (courses[i].enrollCount || 0) + 1; setDB(DB_KEYS.courses, courses); }
    }
  },
  getByUser: (userId) => getDB(DB_KEYS.enrollments).filter(e => e.userId === parseInt(userId)),
};

// ─── Category CRUD ────────────────────────────────────────────
const CategoryDB = {
  getAll: () => getDB(DB_KEYS.categories),
  getById: (id) => getDB(DB_KEYS.categories).find(c => c.id === parseInt(id)),
  create: (data) => { const c = getDB(DB_KEYS.categories); const n = { ...data, id: Date.now() }; c.push(n); setDB(DB_KEYS.categories, c); return n; },
  update: (id, data) => { const c = getDB(DB_KEYS.categories); const i = c.findIndex(x => x.id === parseInt(id)); if (i < 0) return null; c[i] = { ...c[i], ...data }; setDB(DB_KEYS.categories, c); return c[i]; },
  delete: (id) => { setDB(DB_KEYS.categories, getDB(DB_KEYS.categories).filter(c => c.id !== parseInt(id))); },
};

// ─── Constants ────────────────────────────────────────────────
const ROLE_LABELS = { admin: 'Quản trị viên', employee_new: 'Nhân viên mới', employee_old: 'Nhân viên', customer: 'Khách hàng' };
const ROLE_COLORS = { admin: '#dc3545', employee_new: '#17a2b8', employee_old: '#1a3a6b', customer: '#28a745' };
const LEVEL_COLORS = { 'Cơ bản': '#28a745', 'Trung cấp': '#f5a623', 'Nâng cao': '#dc3545' };

function formatDate(s) { if (!s) return '—'; const d = new Date(s); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; }
function generateStars(r) { let s = ''; for (let i = 0; i < Math.floor(r); i++) s += '★'; if (r % 1 >= 0.5) s += '☆'; return s; }

// Init
initDB();

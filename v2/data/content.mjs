// Edit seasonal facts here, then run: node v2/tools/build-site.mjs (from poet/).
// Sources: Website Flow (17 Oct 2026); campaign dossier, pages noted below.
export const pending = 'Đang cần cập nhật';
// Home visual reference only. These are NOT verified campaign/API figures.
// Keep separate from season's confirmed facts and never feed payment reporting.
export const homepageFundraisingPreview = Object.freeze({
  source: 'Original prototype supplied 20 October 2026',
  raised: 78450000, individuals: 248, businesses: 14
});
export const season = {
  id: 'season-6', name: 'Mùa 6', year: '2026–2027', title: 'Công Viên Niềm Vui',
  art: 'season-6/lettering/cong-vien-niem-vui.webp',
  location: 'Ea Kiết, Đắk Lắk', beneficiaries: 300, targetAmount: 121950000,
  timeframe: '09/2026 – 01/2027', trip: '22–24/01/2027',
  headline: 'Trao nụ cười, dựng sân chơi',
  fundraisingIntro: 'Nhận thấy không gian để các em vui chơi, vận động, khám phá và học hỏi vẫn còn khá hạn chế, POET chính thức bắt đầu hoạt động gây quỹ đầu tiên mang tên Big Joy Little Joy. Hành trình gây quỹ của POET được xây dựng qua chuỗi hoạt động xuyên suốt (Tháng 10/2026 – Tháng 01/2027) bao gồm:',
  fundraisingActivities: [
    'Quỹ Big Joy Little Joy',
    'Kêu gọi tài trợ và kêu gọi quyên góp từ cộng đồng',
    'Bộ sưu tập Young Joy Collection (Đang trong quá trình thực hiện)',
    'Không gian trải nghiệm Big Joy Pop-up (Dự kiến: Cuối tháng 12/2026)',
    'Chuyến đi cuối cùng đến điểm trường (Dự kiến: Tháng 01/2027)'
  ],
  summary: 'Cùng tạo thêm không gian vui chơi, vận động và học hỏi cho 300 em học sinh tại điểm trường thuộc Trường Tiểu học & Trung học cơ sở Hoàng Văn Thụ, xã Ea Kiết, tỉnh Đắk Lắk.',
  narrative: [
    'Sau một thời gian chuẩn bị cho mùa hoạt động mới, POET chính thức lựa chọn Điểm trường thuộc Trường Tiểu học & Trung học cơ sở Hoàng Văn Thụ, xã Ea Kiết, tỉnh Đắk Lắk làm điểm đến cho mùa POET 2026–2027.',
    'Cũng qua chuyến tiền trạm ấy, POET nhận ra rằng không gian để các em vui chơi, vận động, khám phá và học hỏi vẫn còn khá hạn chế. Vì vậy, POET dự định tổ chức “Công viên niềm vui” tại điểm trường — các góc vui chơi, trải nghiệm và vận động; đồng thời cải thiện không gian sinh hoạt tại trường, để mỗi ngày đến trường của các em có thêm nhiều niềm vui và những kỷ niệm đáng nhớ.',
    'Hành trình gây quỹ của POET được xây dựng qua chuỗi hoạt động xuyên suốt, bao gồm quỹ Big Joy Little Joy, bộ sưu tập Young Joy Collection, không gian trải nghiệm Big Joy Pop-up (dự kiến diễn ra vào cuối tháng 12), cùng các chương trình kêu gọi tài trợ và quyên góp từ cộng đồng. Khép lại chuỗi sự kiện gây quỹ, POET sẽ thực hiện chuyến đi thực tế Final Trip đến điểm trường để trực tiếp trao tặng những món quà ý nghĩa và cùng các em nhỏ hòa mình vào các hoạt động giao lưu đầy thú vị tại sân chơi.'
  ],
  destinationPhotos: [], // Add only approved, identified Mùa 6 school photos.
  school: 'Trường Tiểu học & Trung học cơ sở Hoàng Văn Thụ',
  schoolNote: 'Điểm trường Tiểu học Mạc Thị Bưởi cũ',
  schoolContext: [
    'Điểm trường đón các em học sinh tiểu học, đa số là người H’Mông. Sân rải đá trở nên lầy, trơn vào mùa mưa; thiết bị vui chơi hiện có đã hư hỏng.',
    'Trường đã được hỗ trợ thêm lớp học, điện mặt trời và nước lọc. POET muốn góp tiếp một phần để việc học và giờ ra chơi của các em an toàn hơn.'
  ],
  // The existing donation API is global. No campaign-scoped progress is supplied.
  raised: null, individuals: null, businesses: null,
  budget: [ // Dossier p8; source notebook unit-price typo deliberately omitted.
    ['Quạt treo tường', '17 cái', 5950000], ['Xe đạp', '6 chiếc', 12000000],
    ['Dụng cụ học tập', '300 phần', 21000000], ['Vở trắng 5 ô ly', '300 phần, 10 quyển/phần', 30000000],
    ['Áo đồng phục', '300 áo', 45000000], ['Góc trò chơi', '2 gói', 3000000],
    ['Hoạt động tại trường', '1 gói', 5000000]
  ]
};
export const journey = [ // Dossier p10. Planned dates, not a ticket announcement.
  ['Onboard', '09/2026', 'Little Joy tham gia cùng POET và thống nhất cách đồng hành.'],
  ['Collect The Little Joys', '10–12/2026', 'Thương hiệu góp một phần doanh thu và cùng POET chia sẻ câu chuyện gây quỹ.'],
  ['Big Joy Pop Up', '20–22/12/2026', 'Dự kiến hội chợ giao lưu và bán hàng gây quỹ. Thông tin mở bán chưa công bố.'],
  ['Joy, Delivered', season.trip, 'Dự kiến chuyến đi trao những đóng góp thành điều kiện học tập và vui chơi tốt hơn.']
];
export const activities = [
  {title:`POET ${season.year}`,tag:season.name,description:`Cùng xây ${season.title} cho ${season.beneficiaries} em học sinh tại Ea Kiết.`,art:'season',photo:'playground-joy',focus:'50% 42%',href:'du-an/#dang-thuc-hien',meta:season.timeframe},
  {title:'Big Joy Little Joy',tag:'Thương hiệu đồng hành',description:'Những đóng góp nhỏ, từ công việc mỗi ngày, cùng tạo nên niềm vui lớn.',art:'bjl-j',photo:'bicycle-joy',focus:'50% 58%',href:'dong-hanh/#doanh-nghiep',meta:'10 cột mốc đồng hành'},
  {title:'Young Joy Collection',tag:'Sắp được bật mí',description:'Bộ sưu tập merchandise gây quỹ cùng POET. Sản phẩm và thông tin mở bán sẽ được công bố sau.',art:'collection',photo:'community-day',focus:'50% 50%',href:'dong-hanh/#collection',meta:'Chưa mở bán'},
  {title:'Big Joy Pop-up',tag:'Sắp được bật mí',description:'Không gian trải nghiệm và hội chợ cộng đồng kết nối các Little Joy, dự kiến vào cuối tháng 12.',art:'popup',photo:'poet-volunteers',focus:'50% 45%',href:'dong-hanh/#pop-up',meta:'Chưa mở bán vé'}
];
// One project collection powers Home, the completed-project tab and detail routes.
export const recruitment={open:false,seasonLabel:'Mùa tiếp theo',applicationUrl:null,deadline:null,videos:[]};
export const departments=['Vận hành','Nhân sự','Truyền thông','Đối ngoại'];
export const highlights = [
  {id:'vet-nut',title:'Đêm nhạc “Vết Nứt”',tag:'Âm nhạc gây quỹ',description:'Một đêm nhạc acoustic tại TP. Hồ Chí Minh, góp sức cải thiện điều kiện học tập tại Mỹ Thạnh Bắc, Long An.',metrics:['2022','Âm nhạc & cộng đồng'],source:'Tiền Phong, 19/07/2022',pending:'Bài viết chi tiết và ảnh chọn lọc đang chờ hoàn thiện.'},
  {id:'go-ngai',title:'Chuyến đi Gò Ngãi',tag:'Dự án giáo dục · Mùa 5',description:'Hoạt động vui chơi chạy trạm về môi trường và trao tặng vật phẩm học tập tại Trường Tiểu học Mỹ Thạnh Bắc, Long An.',metrics:['42,2 triệu đồng','35 thành viên','30 người thụ hưởng'],source:'Hồ sơ POET, trang 4',pending:'Bài viết chi tiết và ảnh chọn lọc đang chờ hoàn thiện.'}
];
export const projectStories = highlights.map(item=>({...item,season:item.id==='vet-nut'?'Dấu ấn 2022':'Mùa 5',status:'completed',year:item.id==='vet-nut'?2022:null,
  href:`du-an/${item.id}/`,cover:`story-${item.id}`,gallery:[`story-${item.id}`],
  photoCaption:item.id==='vet-nut'?'Các bạn tham gia đêm nhạc — ảnh từ album Vết Nứt của POET.':'Các thành viên tại chuyến đi — ảnh từ album Final Trip của POET.',
  paragraphs:[item.description],
  sources:item.id==='vet-nut'?[{title:'Tiền Phong · 19/07/2022',url:'https://tienphong.vn/ban-tre-gap-sao-huong-ung-dem-nhac-chua-lanh-gay-quy-thien-nguyen-post1454826.tpo'}]:[],
  album:item.id==='vet-nut'?'https://drive.google.com/drive/folders/1E4uZ1FYLX3H3x6YzxEtiGgbcaRdO0iSv':'https://drive.google.com/drive/folders/1qQuLoEB6SYtZSqAtHzARUNReY_G2mLXl'
}));
export const impact = [ // Season 5 only, dossier p4; never cumulative totals.
  [42200000,'đồng gây quỹ'],[35,'thành viên'],[30,'người thụ hưởng'],[5,'nguồn lực đồng hành']
];
export const media = [ // Original titles/dates from the URLs explicitly supplied by Flow.
  {publication:'Tiền Phong',date:'2022-07-19',title:'Bạn trẻ gấp sao, hưởng ứng đêm nhạc ‘chữa lành’ gây quỹ thiện nguyện',description:'Bài viết về đêm nhạc “Vết Nứt” và hoạt động gấp sao gây quỹ của POET.',url:'https://tienphong.vn/ban-tre-gap-sao-huong-ung-dem-nhac-chua-lanh-gay-quy-thien-nguyen-post1454826.tpo'},
  {publication:'Tiền Phong',date:'2022-12-17',title:'Sáng tạo để lan tỏa nhiệt huyết tận hiến',description:'Câu chuyện về cách các bạn trẻ thiết kế những hoạt động cộng đồng, trong đó có POET.',url:'https://tienphong.vn/sang-tao-de-lan-toa-nhiet-huyet-tan-hien-post1494246.tpo'},
  {publication:'Hoa Học Trò',date:'2022-12-13',title:'Những “thủ lĩnh” Gen Z năng nổ sáng tạo hoạt động Đoàn, lan tỏa nhiệt huyết tận hiến',description:'Góc nhìn về các dự án thiện nguyện do người trẻ khởi xướng và phát triển.',url:'https://hoahoctro.tienphong.vn/nhung-thu-linh-gen-z-nang-no-sang-tao-hoat-dong-doan-lan-toa-nhiet-huyet-tan-hien-post1494482.tpo'}
];
export const pressLogos = [
  {name:'Hoa Học Trò',image:'press/hoa-hoc-tro.png',width:172,height:111,displayWidth:56,href:media[2].url},
  {name:'Báo Tiền Phong',image:'press/tien-phong.png',width:390,height:83,displayWidth:108,href:media[0].url}
];
export const contacts = {email:'poet.npo@gmail.com',people:[
  {name:'Hoài Phương',role:'Trưởng Ban Điều Hành',phone:'0903872278'},
  {name:'Phương Minh',role:'Trưởng Ban Đối Ngoại',phone:'0815852427'}
]};
export const socials = [
  ['Facebook','https://www.facebook.com/poetorganization'],['Instagram','https://www.instagram.com/poet.npo/'],
  ['Threads','https://www.threads.com/@poet.npo'],['TikTok','https://www.tiktok.com/@poet.npo']
];
// Incremental benefits, not a claim that any KOC/brand has already committed.
// Dossier pp13–20, reconciled with the benefits URL explicitly selected by Flow.
// Explicit terms in that higher-priority reference override differing dossier rows.
// Neither source establishes an actual KOC/brand commitment. Updated PDF is pending.
export const tiers = [
  {amount:1,name:'BABY STEP',phases:[
    ['Bài công bố chung sự tham gia của Little Joy trên Facebook và Instagram theo từng tuần.','Sử dụng ảnh tiền trạm trong 12 tháng, theo phạm vi hai bên thống nhất.','Cập nhật tiến độ gây quỹ và quyền lợi.'],
    ['Phát voucher của Little Joy kèm vé tham dự Pop Up.'],
    ['Chứng nhận đồng hành sau khi hoàn tất nghĩa vụ.','Ưu tiên đối tác CSR và ưu đãi gói đồng hành chương trình tiếp theo.','Cơ hội đồng sáng tạo hoạt động cộng đồng cùng POET.']]},
  {amount:3,name:'SPARK',phases:[['Được nhắc trong bình luận các bài cập nhật cột mốc 30, 50 và 100 triệu đồng.'],['1 vé tham dự Pop Up miễn phí.','Xuất hiện trong bài recap chung Pop Up trên Facebook và Instagram.','Sử dụng bộ ảnh Pop Up trong 12 tháng từ khi nhận, theo phạm vi thống nhất.'],[]]},
  {amount:5,name:'GROW',phases:[['1 video UGC 20–30 giây do team POET thực hiện, đăng trên kênh Creator team POET.'],['Không gian quầy hàng 5 m².','Xuất hiện 5 giây trong video recap Pop Up chung.'],[]]},
  {amount:10,name:'RISE',phases:[['Bài công bố riêng trên Facebook và Instagram; 1 bài giới thiệu nổi bật trên Facebook POET.','1 video TikTok 30 giây có nhắc đến Little Joy.','3 video unboxing túi quà của Creator POET, đăng trên kênh Creator.','Bộ 10 ảnh sản phẩm và trải nghiệm; địa điểm chụp trong TP. Hồ Chí Minh.'],['Tổng 2 vé Pop Up; logo bằng 1/5 logo POET trên ấn phẩm tại sự kiện.','1 video UGC dưới 30 giây trên kênh Creator team POET.'],['Xuất hiện trong bài recap chung chuyến đi trên Facebook và Instagram POET.']]},
  {amount:15,name:'SHINE',phases:[['1 video POET unboxing túi quà, đăng trên kênh POET.'],['Tổng 10 giây trong video recap Pop Up chung.','1 story nhắc Little Joy chung trên Instagram POET.'],['Sử dụng ảnh và video chuyến đi trong 12 tháng từ khi nhận, theo phạm vi thống nhất.']]},
  {amount:20,name:'TURNING POINT',phases:[['1 video dưới 60 giây do KOC thực hiện và đăng trên kênh KOC.','Tổng 3 video lồng ghép sản phẩm, 20–30 giây/video, trên kênh Creator team POET.'],['1 story riêng trên Instagram POET.'],['1 bài recap riêng chuyến đi trên Facebook và Instagram POET.']]},
  {amount:25,name:'THRIVE',phases:[['Tổng 2 video TikTok 30 giây có nhắc đến Little Joy.'],['Quầy hàng 8 m²; tổng 3 vé tham dự Pop Up.','Logo bằng 1/2 logo POET trên ấn phẩm sự kiện.','1 bài recap Pop Up riêng trên Instagram và 1 video recap Little Joy 30 giây.'],['Xuất hiện 5 giây trong video recap chuyến đi.']]},
  {amount:30,name:'SPREAD',phases:[['Tổng 2 video do KOC thực hiện và đăng trên kênh KOC.'],['Ưu tiên lựa chọn vị trí quầy; tổng 2 story riêng.','Thêm 1 video UGC dưới 30 giây trên kênh Creator team POET.'],['1 vé tham gia chuyến đi, gồm ăn uống, di chuyển và ở.','Đại diện chia sẻ 2 phút và tham gia trao tặng, bàn giao.','1 story riêng chuyến đi; bộ 10 ảnh thương hiệu tại chuyến đi.']]},
  {amount:35,name:'AMPLIFY',phases:[[],[],['Tổng 2 vé tham gia chuyến đi, gồm ăn uống, di chuyển và ở.']]},
  {amount:40,name:'TRIUMPH',phases:[['Tổng 3 video TikTok POET; tổng 5 video KOC.','Tổng 5 video lồng ghép sản phẩm trên kênh Creator team POET.'],['Ưu tiên độc quyền ngành hàng.','Hỗ trợ quầy tiêu chuẩn với ngân sách dưới 1 triệu đồng; phần thiết kế riêng ngoài phạm vi hỗ trợ do thương hiệu chi trả.','Tổng 4 vé Pop Up; logo bằng kích thước logo POET.','Tổng 3 story riêng; thêm 3 video Pop Up trên kênh Creator team POET.'],['Tổng 3 vé chuyến đi, gồm ăn uống, di chuyển và ở.','Cơ hội người thụ hưởng trải nghiệm sản phẩm trong chương trình.','1 video recap riêng Little Joy.']]}
];

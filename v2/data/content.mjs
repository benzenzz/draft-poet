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
// Dossier p10. Planned dates. start = ngày bắt đầu chặng, dùng để tính bé Hoa đang ở đâu (UI-011)
export const journeyIntro = {
  eyebrow: 'Lộ trình Big Joy Little Joy',
  title: 'Bốn chặng,<br>cùng một điểm đến.',
  text: 'Kế hoạch 4 giai đoạn từ 09/2026 đến 01/2027, đi cùng các Little Joy từ ngày đầu tới chuyến trao quà.',
  nowLabel: 'Bé Hoa đang ở'
};
export const journey = [
  { name: 'Onboard', date: '09/2026', start: '2026-09-01', note: 'Little Joy tham gia cùng POET và thống nhất cách đồng hành.' },
  { name: 'Collect The Little Joys', date: '10–12/2026', start: '2026-10-01', note: 'Thương hiệu góp một phần doanh thu và cùng POET chia sẻ câu chuyện gây quỹ.' },
  { name: 'Big Joy Pop Up', date: '20–22/12/2026', start: '2026-12-20', note: 'Hội chợ giao lưu và bán hàng gây quỹ. Thông tin mở bán sắp được bật mí.' },
  { name: 'Joy, Delivered', date: season.trip, start: '2027-01-22', note: 'Chuyến đi trao những đóng góp thành điều kiện học tập và vui chơi tốt hơn cho các em.' }
];
export const activities = [
  {title:`POET ${season.year}`,tag:season.name,description:`Cùng xây ${season.title} cho ${season.beneficiaries} em học sinh tại Ea Kiết.`,art:'season',photo:'playground-joy',focus:'50% 42%',href:'du-an/#dang-thuc-hien',meta:season.timeframe},
  {title:'Big Joy Little Joy',tag:'Thương hiệu đồng hành',description:'Những đóng góp nhỏ, từ công việc mỗi ngày, cùng tạo nên niềm vui lớn.',art:'bjl-j',photo:'bicycle-joy',focus:'50% 58%',href:'dong-hanh/#doanh-nghiep',meta:'10 cột mốc đồng hành'},
  {title:'Young Joy Collection',tag:'Sắp được bật mí',description:'Bộ sưu tập merchandise gây quỹ cùng POET. Sản phẩm và thông tin mở bán sẽ được công bố sau.',art:'collection',photo:'community-day',focus:'50% 50%',href:'dong-hanh/#collection',meta:'Chưa mở bán'},
  {title:'Big Joy Pop-up',tag:'Sắp được bật mí',description:'Không gian trải nghiệm và hội chợ cộng đồng kết nối các Little Joy, dự kiến vào cuối tháng 12.',art:'popup',photo:'poet-volunteers',focus:'50% 45%',href:'dong-hanh/#pop-up',meta:'Chưa mở bán vé'}
];
// One project collection powers Home, the completed-project tab and detail routes.
// Volunteer tab notice (UI-014). open=false: Mùa 6 đã đóng đơn, mời theo dõi Facebook.
export const recruitment = {
  open: false,
  seasonLabel: 'Mùa 7',
  closedLabel: 'Mùa 6 · đã đóng đơn',
  applicationUrl: null,
  deadline: null,
  videos: [],
  notice: {
    kicker: 'Thông báo tuyển quân',
    closed: {
      title: 'Hẹn bạn<br><span>ở mùa sau nhé!</span>',
      text: 'Đơn tuyển tình nguyện viên Mùa 6 đã đóng mất rồi. POET vẫn luôn chờ những đồng đội mới cho hành trình Mùa 7. Theo dõi Facebook POET để nhận thông tin tuyển quân sớm nhất nha!',
      cta: 'Theo dõi Facebook POET'
    },
    open: {
      title: 'Đăng ký làm<br><span>tình nguyện viên POET</span>',
      text: 'Đơn tuyển tình nguyện viên đang mở. Đọc kỹ thông tin và gửi đơn trước hạn nhé!',
      cta: 'Đăng ký ngay'
    }
  }
};
export const departments=['Vận hành','Nhân sự','Truyền thông','Đối ngoại'];
// Approved previews: POET WEBSITE_ĐẶC BIỆT ĐỌC KĨ.md, image 34.
// The 42.2m fundraising total belongs to Mùa 5, not to the concert alone.
export const highlights = [
  {id:'vet-nut',title:'Đêm nhạc acoustic gây quỹ “Vết Nứt”',tag:'Mùa 5 · TP. Hồ Chí Minh',description:'Với sự tham gia của 120 khán giả và 5 nhà tài trợ, chương trình đã lan tỏa thông điệp tích cực về sức khỏe tinh thần, tạo sân chơi cho các nghệ sĩ trẻ và góp quỹ cải thiện chất lượng học tập tại Trường Tiểu học Mỹ Thạnh Bắc (Đức Huệ, Long An).',metrics:['120 khán giả','5 nhà tài trợ'],source:'Nội dung hoạt động do POET cung cấp; Tiền Phong, 19/07/2022',pending:'Bài viết chi tiết và ảnh chọn lọc đang chờ hoàn thiện.'},
  {id:'go-ngai',title:'Chương trình thiện nguyện tại Trường Tiểu học Mỹ Thạnh Bắc',tag:'Mùa 5 · Mỹ Thạnh Bắc, Long An',description:'POET trao tặng 30 suất đồ dùng học tập, 10 suất học bổng, 5 xe đạp, 3 quạt treo tường và 3 tủ nhôm đựng tài liệu cho 3 lớp học tại điểm trường. Các em còn cùng tham gia hoạt động vui chơi chạy trạm với chủ đề bảo vệ môi trường.',metrics:['30 suất đồ dùng học tập','10 suất học bổng','5 xe đạp'],source:'Nội dung hoạt động do POET cung cấp; Hồ sơ POET, trang 4',pending:'Bài viết chi tiết và ảnh chọn lọc đang chờ hoàn thiện.'}
];
export const projectStories = highlights.map(item=>({...item,season:'Mùa 5',status:'completed',year:item.id==='vet-nut'?2022:null,
  href:`du-an/${item.id}/`,cover:`story-${item.id}`,gallery:[`story-${item.id}`],
  photoCaption:item.id==='vet-nut'?'Các bạn tham gia đêm nhạc — ảnh từ album Vết Nứt của POET.':'Các thành viên tại chuyến đi — ảnh từ album Final Trip của POET.',
  paragraphs:[item.description],
  sources:item.id==='vet-nut'?[{title:'Tiền Phong · 19/07/2022',url:'https://tienphong.vn/ban-tre-gap-sao-huong-ung-dem-nhac-chua-lanh-gay-quy-thien-nguyen-post1454826.tpo'}]:[],
  album:item.id==='vet-nut'?'https://drive.google.com/drive/folders/1E4uZ1FYLX3H3x6YzxEtiGgbcaRdO0iSv':'https://drive.google.com/drive/folders/1qQuLoEB6SYtZSqAtHzARUNReY_G2mLXl'
}));
export const impact = [ // Season 5 only, dossier p4; never cumulative totals.
  [42200000,'đồng gây quỹ'],[35,'thành viên'],[30,'người thụ hưởng'],[5,'nguồn lực đồng hành']
];
// About intro stats (UI-006): cumulative across seasons. kol stays null until POET confirms the number.
export const reach = [
  {value:300, suffix:'K+', title:'Lượt tiếp cận',     text:'trên mạng xã hội',   tone:'coral'},
  {value:60,  suffix:'K+', title:'Lượt tương tác',    text:'từ cộng đồng',       tone:'green'},
  {value:null,suffix:'+',  title:'KOL/KOC đồng hành', text:'cùng lan toả dự án', tone:'blue'} // TODO: số thật từ POET
];

// About “Sứ mệnh của POET”: card copy approved in the ABOUT-002 brief/prototype; photos user-supplied (ASSET_STATUS.md).
export const mission = {
  eyebrow:'Điều chúng mình theo đuổi',title:'Sứ mệnh của POET',
  items:[
    {number:'01',audience:'Cho các em',tone:'coral',title:'Học đủ đầy, cả vật chất lẫn tinh thần',points:['Sửa chữa, bổ sung cơ sở vật chất thiết yếu cho trường','Tặng dụng cụ học tập, xe đạp cho học sinh khó khăn','Hoạt động “học là chơi, chơi là học” để các em vui và hiểu mình hơn'],image:'mission-children',position:'50% 38%',alt:'Các em nhỏ cười, giơ tay hình chữ V trong một hoạt động của POET.'},
    {number:'02',audience:'Cho tình nguyện viên',tone:'green',title:'Sân chơi để học hỏi và lớn lên',text:'Được định hướng rõ, giao việc đúng thế mạnh và đủ nguồn lực, để vừa làm tốt vừa học thêm qua mỗi chuyến đi.',image:'mission-volunteers',position:'50% 50%',alt:'Tay các tình nguyện viên POET cùng cầm những tấm thiệp giấy kraft vẽ tay trên bàn.'},
    {number:'03',audience:'Cho cộng đồng',tone:'blue',title:'Lan toả giá trị tích cực',text:'Chỉn chu, công khai, minh bạch và kết nối mọi người cùng góp sức.',image:'mission-community',position:'50% 30%',alt:'Ảnh tập thể thành viên POET mặc áo “(dân) YOUNG (chơi) JOY”, cùng làm hình trái tim bằng tay.'}
  ]
};

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
  {name:'Hoài Phương',role:'Trưởng Ban Điều hành',phone:'0903872278'},
  {name:'Phương Minh',role:'Trưởng Ban Đối ngoại',phone:'0815852427'}
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
  {amount:1,name:'BABY STEP',tagline:'Bước đầu tiên để thương hiệu có mặt trong hành trình.',booth:null,popTickets:0,tripTickets:0,phases:[
    ['Bài công bố chung sự tham gia của Little Joy trên Facebook và Instagram theo từng tuần.','Sử dụng ảnh tiền trạm trong 12 tháng, theo phạm vi hai bên thống nhất.','Cập nhật tiến độ gây quỹ và quyền lợi.'],
    ['Phát voucher của Little Joy kèm vé tham dự Pop Up.'],
    ['Chứng nhận đồng hành sau khi hoàn tất nghĩa vụ.','Ưu tiên đối tác CSR và ưu đãi gói đồng hành chương trình tiếp theo.','Cơ hội đồng sáng tạo hoạt động cộng đồng cùng POET.']]},
  {amount:3,name:'SPARK',tagline:'Có mặt tại Pop Up và trong bài recap chung.',booth:null,popTickets:1,tripTickets:0,phases:[['Được nhắc trong bình luận các bài cập nhật cột mốc 30, 50 và 100 triệu đồng.'],['1 vé tham dự Pop Up miễn phí.','Xuất hiện trong bài recap chung Pop Up trên Facebook và Instagram.','Sử dụng bộ ảnh Pop Up trong 12 tháng từ khi nhận, theo phạm vi thống nhất.'],[]]},
  {amount:5,name:'GROW',tagline:'Có quầy hàng riêng và video giới thiệu sản phẩm.',booth:'5m²',popTickets:1,tripTickets:0,phases:[['1 video UGC 20–30 giây do team POET thực hiện, đăng trên kênh Creator team POET.'],['Không gian quầy hàng 5 m².','Xuất hiện 5 giây trong video recap Pop Up chung.'],[]]},
  {amount:10,name:'RISE',tagline:'Bài công bố riêng và bộ nội dung sản phẩm đầy đủ hơn.',booth:'5m²',popTickets:2,tripTickets:0,phases:[['Bài công bố riêng trên Facebook và Instagram; 1 bài giới thiệu nổi bật trên Facebook POET.','1 video TikTok 30 giây có nhắc đến Little Joy.','3 video unboxing túi quà của Creator POET, đăng trên kênh Creator.','Bộ 10 ảnh sản phẩm và trải nghiệm; địa điểm chụp trong TP. Hồ Chí Minh.'],['Tổng 2 vé Pop Up; logo bằng 1/5 logo POET trên ấn phẩm tại sự kiện.','1 video UGC dưới 30 giây trên kênh Creator team POET.'],['Xuất hiện trong bài recap chung chuyến đi trên Facebook và Instagram POET.']]},
  {amount:15,name:'SHINE',tagline:'Thêm unboxing trên kênh POET và quyền dùng ảnh chuyến đi.',booth:'5m²',popTickets:2,tripTickets:0,phases:[['1 video POET unboxing túi quà, đăng trên kênh POET.'],['Tổng 10 giây trong video recap Pop Up chung.','1 story nhắc Little Joy chung trên Instagram POET.'],['Sử dụng ảnh và video chuyến đi trong 12 tháng từ khi nhận, theo phạm vi thống nhất.']]},
  {amount:20,name:'TURNING POINT',tagline:'Bắt đầu có KOC và bài recap riêng sau chuyến đi.',booth:'5m²',popTickets:2,tripTickets:0,phases:[['1 video dưới 60 giây do KOC thực hiện và đăng trên kênh KOC.','Tổng 3 video lồng ghép sản phẩm, 20–30 giây/video, trên kênh Creator team POET.'],['1 story riêng trên Instagram POET.'],['1 bài recap riêng chuyến đi trên Facebook và Instagram POET.']]},
  {amount:25,name:'THRIVE',tagline:'Quầy rộng hơn, logo lớn hơn, recap Pop Up riêng.',booth:'8m²',popTickets:3,tripTickets:0,phases:[['Tổng 2 video TikTok 30 giây có nhắc đến Little Joy.'],['Quầy hàng 8 m²; tổng 3 vé tham dự Pop Up.','Logo bằng 1/2 logo POET trên ấn phẩm sự kiện.','1 bài recap Pop Up riêng trên Instagram và 1 video recap Little Joy 30 giây.'],['Xuất hiện 5 giây trong video recap chuyến đi.']]},
  {amount:30,name:'SPREAD',tagline:'Đại diện thương hiệu cùng lên đường trao quà.',booth:'8m²',popTickets:3,tripTickets:1,phases:[['Tổng 2 video do KOC thực hiện và đăng trên kênh KOC.'],['Ưu tiên lựa chọn vị trí quầy; tổng 2 story riêng.','Thêm 1 video UGC dưới 30 giây trên kênh Creator team POET.'],['1 vé tham gia chuyến đi, gồm ăn uống, di chuyển và ở.','Đại diện chia sẻ 2 phút và tham gia trao tặng, bàn giao.','1 story riêng chuyến đi; bộ 10 ảnh thương hiệu tại chuyến đi.']]},
  {amount:35,name:'AMPLIFY',tagline:'Khuếch đại trải nghiệm trực tiếp và thêm một người cùng lên đường.',booth:'8m²',popTickets:3,tripTickets:2,phases:[[],[],['Tổng 2 vé tham gia chuyến đi, gồm ăn uống, di chuyển và ở.']]},
  {amount:40,name:'TRIUMPH',tagline:'Độc quyền ngành hàng và hiện diện đầy đủ nhất.',booth:'8m²',popTickets:4,tripTickets:3,phases:[['Tổng 3 video TikTok POET; tổng 5 video KOC.','Tổng 5 video lồng ghép sản phẩm trên kênh Creator team POET.'],['Ưu tiên độc quyền ngành hàng.','Hỗ trợ quầy tiêu chuẩn với ngân sách dưới 1 triệu đồng; phần thiết kế riêng ngoài phạm vi hỗ trợ do thương hiệu chi trả.','Tổng 4 vé Pop Up; logo bằng kích thước logo POET.','Tổng 3 story riêng; thêm 3 video Pop Up trên kênh Creator team POET.'],['Tổng 3 vé chuyến đi, gồm ăn uống, di chuyển và ở.','Cơ hội người thụ hưởng trải nghiệm sản phẩm trong chương trình.','1 video recap riêng Little Joy.']]}
];
// Partner page, tier section (UI-012)
export const tierIntro = {
  eyebrow: 'Mức đồng hành Little Joy',
  title: 'Hành trình niềm vui<br><span>bắt đầu.</span>',
  text: 'Hành trình tài trợ linh hoạt với <b>10 cột mốc từ 1.000.000 đến 40.000.000 VNĐ</b>.',
  phases: [
    ['01 / Trước sự kiện', 'Lan toả trên mạng xã hội'],
    ['02 / Pop Up · 20–22.12.2026', 'Chạm nhau ngoài đời'],
    ['03 / Chuyến đi · ' + season.trip.replace(/\//g, '.'), 'Để niềm vui đi xa']
  ]
};
// Quyền lợi cũ được một mốc cao hơn thay thế (vd 1 vé → tổng 2 vé), để danh sách cộng dồn không mâu thuẫn.
// Key: "chỉ số mốc.chỉ số chặng.chỉ số dòng" trong tiers. Value: chỉ số mốc thay thế.
export const tierReplaced = {
  '1.1.0':3, '2.1.0':6, '2.1.1':4, '3.1.0':6, '3.0.1':6, '3.2.0':5, '5.0.0':7, '5.1.0':7,
  '6.0.0':9, '7.0.0':9, '5.0.1':9, '6.1.0':9, '6.1.1':9, '7.2.0':8, '8.2.0':9
};
// Partner page, sponsor panel + contact (UI-013)
export const sponsorIntro = {
  eyebrow: 'Nhà tài trợ',
  title: 'Cùng tạo điều kiện<br><span>cho những giờ ra chơi.</span>',
  text: 'Hỗ trợ hiện kim hoặc nguồn lực thiết thực cho Công viên niềm vui. POET trao đổi từng đề xuất theo nhu cầu điểm trường và khả năng của đơn vị.',
  cash: { title: 'Tài trợ hiện kim', text: 'Góp sức cho dự toán Mùa 6: vật phẩm học tập, đồng phục, góc trò chơi và hoạt động tại trường.', figureLabel: 'Dự toán Mùa 6' },
  kind: { title: 'Tài trợ hiện vật', text: 'Những nhu cầu đang có trong kế hoạch của điểm trường:', items: ['Quạt treo tường', 'Xe đạp', 'Dụng cụ học tập', 'Vở', 'Áo đồng phục', 'Góc trò chơi'] },
  cta: 'Trao đổi cơ hội tài trợ',
  stepsTitle: 'Bắt đầu như thế nào?',
  steps: [
    ['Chia sẻ đề xuất', 'Nguồn lực, ngân sách hoặc ý tưởng của đơn vị.'],
    ['Cùng đối chiếu', 'POET đối chiếu nhu cầu điểm trường, thống nhất phạm vi và cách tiếp nhận.'],
    ['Ghi nhận & tổng kết', 'Thống nhất cách cập nhật, ghi nhận và tổng kết phù hợp.']
  ],
  note: 'Hình thức ghi nhận, quyền lợi và quy trình cụ thể được hai bên xác nhận trước khi thực hiện.'
};
export const contactIntro = {
  eyebrow: 'Liên hệ trực tiếp',
  title: 'POET <span>nghe bạn.</span>',
  text: 'Chia sẻ ý tưởng, sản phẩm hoặc cách bạn muốn đồng hành. Ban Đối ngoại sẽ phản hồi và cùng bạn chọn phương án phù hợp.',
  formTitle: 'Gửi lời nhắn kết nối',
  formText: 'Xem lại bản nháp trước khi gửi. POET chỉ nhận khi bạn chủ động gửi email.',
  privacy: 'Thông tin chỉ dùng để soạn email trên máy bạn, không được lưu lại.'
};
// Partner page, individual tab (UI-008)
export const individualWays = {
  eyebrow: 'Hình thức quyên góp cá nhân',
  title: 'Góp một phần,<br>theo cách của bạn.',
  open: {
    icon: 'qr-code',
    title: 'Chuyển khoản trực tiếp qua VietQR',
    text: 'Ủng hộ tự nguyện, tuỳ tâm vào số tài khoản thiện nguyện chính thức của CLB.',
    checks: ['Mọi đóng góp đều có sao kê để đối chiếu', 'Quét mã bằng app ngân hàng, không cần tạo tài khoản'],
    cta: 'Nhận mã QR chuyển khoản',
    note: 'Từ 10.000 đ'
  },
  soon: [
    {id:'pop-up',     icon:'ticket',       tone:'yellow', status:'Sắp mở bán vé',   title:'Vé tham dự Big Joy Pop Up',  text:'Hội chợ cộng đồng, nơi các thương hiệu đồng hành mang sản phẩm đến giao lưu. Tiền vé góp vào quỹ chương trình.', cta:'Mua vé Big Joy Pop Up'},
    {id:'collection', icon:'shopping-bag', tone:'blue',   status:'Sắp được bật mí', title:'Merch Young Joy Collection', text:'Bộ sưu tập merch của POET. Toàn bộ doanh thu góp vào quỹ chung.', cta:'Mua merch, góp vào quỹ'}
  ]
};
// Partner page, message wall (UI-009)
export const messageWall = {
  eyebrow: 'Những lời nhắn gửi',
  title: 'Tường lời nhắn yêu thương',
  sub: 'Nơi những câu chuyện được lan toả, niềm vui được sẻ chia.',
  boardSign: 'POET Community',
  writeCta: 'Viết lời nhắn', closeCta: 'Đóng khung viết',
  formTitle: 'Viết lời nhắn lên giấy nhắn POET',
  sendCta: 'Dán lên tường',
  formNote: 'Lời nhắn sẽ được POET xem qua trước khi hiện trên tường. Vui lòng không ghi số điện thoại, địa chỉ cụ thể.',
  searchPlaceholder: 'Tìm theo tên…',
  sortNew: 'Mới nhất', sortAmount: 'Ủng hộ nhiều nhất',
  empty: 'Chưa có lời nhắn công khai. Bạn có thể gửi lời nhắn cùng lượt ủng hộ của mình.',
  noMatch: 'Chưa thấy lời nhắn nào khớp tên này.',
  loadError: 'Chưa tải được tường lời nhắn. Bạn thử lại nhé.',
  soonNote: 'Tính năng gửi lời nhắn tự do sắp mở. Bạn có thể gửi lời nhắn kèm lượt ủng hộ ở mục phía trên nhé.',
  soonLink: 'Tới mục ủng hộ',
  // Order matters: saved notes pick a paper and icon by hash index.
  papers: [['yellow','Giấy vàng'],['mint','Giấy xanh bạc hà'],['peach','Giấy cam đào'],['blue','Giấy xanh dương'],['pink','Giấy hồng']],
  glyphs: [['heart','Trái tim'],['star','Ngôi sao'],['flower','Bông hoa'],['sun','Mặt trời'],['leaf','Chiếc lá'],['book-open','Quyển sách']]
};
// Free-form wall notes have no backend yet (UI-009); false removes the composer from the page.
export const WALL_COMPOSER_ENABLED = true;
// Partner page, business tab intro (UI-010)
export const businessIntro = {
  eyebrow: 'Doanh nghiệp cùng POET · Mùa 6',
  title: 'Chiến dịch gây quỹ<br>Big Joy Little Joy',
  text: 'Thương hiệu và doanh nghiệp có thể đồng hành cùng POET theo hai cách: trở thành <b>Thương hiệu đồng hành</b> (Little Joy) góp một phần doanh thu, hoặc <b>Nhà tài trợ</b> cho chương trình.',
  quote: 'Vì POET tin rằng, những niềm vui nhỏ khi được trao đi cùng nhau, sẽ trở thành một niềm vui thật lớn.',
  switchLabel: 'Chọn hình thức:'
};

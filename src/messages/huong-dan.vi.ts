/**
 * Chu cua trang Huong dan su dung (/admin/huong-dan), tach khoi vi.ts vi qua dai.
 *
 * `chu` cua moi buoc la CHU THICH theo thu tu mui ten tren anh — so phan tu phai
 * bang so moc trong scripts/chup-huong-dan.mts. Mang khai `as const` nen ban tieng
 * Anh (huong-dan.en.ts) bi kieu BoChu ep co DUNG so phan tu nhu ban nay.
 */
export const HUONG_DAN_VI = {
  tieu_de: "Hướng dẫn sử dụng",
  nut_menu: "Hướng dẫn",
  mo_ta: "Từ lúc tìm mẫu, tạo catalogue, gửi link cho khách tới lúc theo dõi link đã gửi. Mỗi bước có ảnh màn hình thật; số trên ảnh ứng với số trong phần chú thích ngay dưới ảnh.",
  buoc: "Bước {n}",
  phan_so: "Phần {n}",
  chua_co_anh: "Ảnh minh hoạ cho bước này chưa được chụp.",
  muc_luc: "Mục lục",
  luu_y: "Lưu ý",
  chi_quan_tri: "Chỉ quản trị",
  ve_muc_luc: "Về mục lục",
  hoi_dap: "Câu hỏi thường gặp",

  phan: {
    bat_dau: "Bắt đầu",
    chon_mau: "Tìm và chọn mẫu",
    tao: "Tạo catalogue",
    khach: "Khách nhận được gì",
    quan_ly: "Quản lý link đã gửi",
    gop_y: "Góp ý",
    quan_tri: "Quản trị",
  },

  dang_nhap: {
    ten: "Đăng nhập",
    mo_ta: "Mở hpcatalogue.app rồi bấm Đăng nhập bằng Google với Gmail công ty. Nếu không dùng được Google, bấm dòng chữ nhỏ bên dưới để đăng nhập bằng email và mật khẩu do quản trị cấp.",
    chu: [
      "Bấm đây nếu dùng Gmail công ty (@ctyhp.vn, @ctyhp.com…).",
      "Bấm dòng Không đăng nhập được bằng Google? rồi điền email và mật khẩu quản trị cấp cho anh.",
    ],
    meo: [
      "Gmail ngoài công ty không vào được — hệ thống sẽ báo và đăng xuất ngay.",
      "Lần đầu đăng nhập bằng Google, hệ thống tự tạo tài khoản vai trò Sale cho anh.",
      "Tài khoản bị khoá thì trang đăng nhập báo rõ — liên hệ quản trị để mở lại.",
    ],
  },

  thanh_dau_trang: {
    ten: "Thanh đầu trang và menu",
    mo_ta: "Thanh trên cùng có ba trang làm việc hằng ngày, nút đổi ngôn ngữ và tên của anh. Bấm vào tên để mở menu. Tab Góp ý luôn đứng ở mép phải màn hình.",
    chu: [
      "Ba trang chính: Catalogue Online (tìm và chọn mẫu), Catalogue đã tạo (link đã gửi), Hướng dẫn (trang này).",
      "Đổi chữ trên màn hình giữa tiếng Việt và tiếng Anh. Việc này không đổi ngôn ngữ của catalogue gửi khách.",
      "Bấm tên của anh để mở menu: xem email đang đăng nhập.",
      "Chỉ quản trị thấy hai mục Hộp góp ý và Tài khoản trong menu này.",
      "Đăng xuất khỏi hệ thống.",
      "Tab Góp ý: bấm để báo chỗ hỏng hoặc góp ý, ở bất kỳ màn hình nào.",
    ],
    meo: [
      "Trên màn hình hẹp (điện thoại, máy tính bảng), ba trang chính nằm trong nút Menu.",
      "Bấm logo HUNG PHAT để về trang Catalogue Online.",
    ],
  },

  tim_mau: {
    ten: "Tìm và lọc mẫu",
    mo_ta: "Trang Catalogue Online đọc dữ liệu từ bảng tính. Gõ tìm, bấm ô chỉ số hoặc chọn bộ lọc — danh sách thu hẹp ngay, không cần bấm Enter hay nút Tìm.",
    chu: [
      "Ô tìm kiếm: mã mẫu, SKU, MO, SO hoặc vài chữ trong mô tả, có dấu hay không dấu đều ra. Bảng gợi ý cho biết chữ đó nằm ở mục nào và có bao nhiêu mẫu.",
      "Ô chỉ số: tổng số mẫu và số mẫu thiếu ảnh, thiếu SKU, lệch TL vàng, trùng dòng. Bấm một ô để lọc đúng những mẫu đó, bấm lại để bỏ.",
      "Bảy ô lọc chọn được nhiều mục: chất liệu, loại SP, dòng SP, màu, size, loại xoàn, cảnh báo. Số bên cạnh mỗi mục là số mẫu còn lại nếu chọn mục đó.",
      "Lọc theo khoảng trọng lượng vàng (gam): điền Từ, Đến hoặc cả hai.",
      "Đổi kiểu xem: Bảng để đối chiếu với bảng tính, Lưới ảnh để lướt xem mẫu.",
      "Bấm tiêu đề cột để sắp xếp theo cột đó; bấm lần nữa để đảo chiều.",
    ],
    meo: [
      "Bộ lọc đang bật hiện thành các thẻ nhỏ dưới hàng ô lọc — bấm dấu × trên thẻ để bỏ riêng thẻ đó, hoặc bấm Xoá tất cả bộ lọc.",
      "Dòng chữ nhỏ dưới tiêu đề cho biết dữ liệu cập nhật từ bảng tính lúc nào. Sửa bảng tính xong, đợi vài phút rồi tải lại trang.",
      "Ở kiểu Lưới ảnh, cách sắp xếp nằm ngay trên lưới: thứ tự bảng tính, mã mẫu, loại SP, chất liệu, TL vàng, size.",
      "Cột Thư mục có tới ba biểu tượng — thư mục ảnh, ảnh concept, clip thô; rê chuột để xem tên, bấm để mở trên Google Drive. Cột Clip đã xử lý hiện tên clip, bấm để mở clip (chỉ tài khoản công ty xem được).",
      "Cuối trang có nút chuyển trang và dòng cho biết đang hiện mẫu thứ mấy tới thứ mấy.",
    ],
  },

  chi_tiet_mau: {
    ten: "Xem chi tiết một mẫu",
    mo_ta: "Bấm vào một dòng (hoặc một thẻ ở kiểu Lưới ảnh) để mở ngăn chi tiết bên phải: đủ thông số, liên kết Drive và toàn bộ thư viện ảnh của mẫu.",
    chu: [
      "Bấm Đóng, bấm ra vùng tối bên ngoài hoặc nhấn Esc để đóng ngăn.",
      "Toàn bộ thông số trên bảng tính, kể cả SKU, SO, MO và ổ chủ — những thứ này chỉ nhân viên thấy, không bao giờ lên catalogue gửi khách.",
      "Mở thư mục ảnh, thư mục ảnh concept hoặc clip thô của mẫu trên Google Drive.",
      "Thư viện ảnh. Bấm một ảnh để xem ảnh lớn; bấm vào ảnh lớn hoặc nhấn Esc để quay lại.",
    ],
    meo: [
      "Bấm vào ô tích hay các biểu tượng liên kết thì ngăn không mở — hai chỗ đó giữ đúng việc của chúng.",
      "Mẫu chưa có ảnh: ngăn nói rõ là mẫu chưa có thư mục ảnh trên bảng tính hay thư mục đang trống.",
    ],
  },

  tich_chon: {
    ten: "Tích chọn mẫu",
    mo_ta: "Tích những mẫu muốn gửi khách. Chọn bao nhiêu cũng được; thanh dưới cùng màn hình luôn cho biết đã chọn mấy mẫu.",
    chu: [
      "Ô tích đầu dòng. Ở kiểu Lưới ảnh, ô tích nằm ngay dưới ảnh.",
      "Thanh này hiện khi đã chọn ít nhất một mẫu và luôn nằm ở đáy màn hình.",
      "Bỏ chọn hết để làm lại từ đầu.",
      "Bấm Tạo catalogue để sang màn hình tạo.",
    ],
    meo: [
      "Danh sách đang chọn được nhớ trên trình duyệt: đổi bộ lọc, đổi trang, đổi kiểu xem hay tải lại trang đều không mất. Sang máy khác thì phải tích lại.",
      "Một mẫu nằm trên nhiều dòng (khác size, khác trọng lượng) chỉ có ô tích ở dòng đầu; các dòng sau hiện chữ Cùng mẫu. Mỗi mẫu chỉ vào catalogue một lần.",
      "Cứ tìm và lọc tiếp để chọn thêm — các mẫu đã tích vẫn giữ nguyên.",
    ],
  },

  ten_link: {
    ten: "Đặt tên catalogue và tên link",
    mo_ta: "Màn hình tạo catalogue đi từ trên xuống: tên, kiểu trình bày, thứ tự, rồi từng mẫu. Không ô nào bắt buộc — bỏ trống thì hệ thống dùng mặc định.",
    chu: [
      "Tên catalogue: để anh tìm lại trong danh sách, và là tiêu đề lớn khách thấy. Bỏ trống thì hệ thống tự đặt “Catalogue #12”.",
      "Tên link: chữ khách thấy trên đường dẫn. Mặc định theo tên catalogue; tên catalogue có tên khách thì nên gõ tên riêng ở đây, ví dụ “Nhẫn cưới 18K”.",
      "Đường dẫn sẽ trông như thế này. Đoạn mã ở cuối do hệ thống tự thêm lúc tạo, để người ngoài không đoán ra link của khách khác.",
    ],
    meo: [
      "Tên link tự bỏ dấu, viết thường và thay khoảng trắng bằng dấu gạch.",
      "Tạo xong vẫn đổi được tên link, và link cũ đã gửi khách vẫn mở được.",
    ],
  },

  chu_de: {
    ten: "Chọn nhanh một chủ đề",
    mo_ta: "Hàng Chủ đề ở đầu khung Kiểu trình bày đặt sẵn bố cục, tông màu và màu nhấn hợp nhau cho một dịp, một nhóm hàng hay một kiểu khách. Không bắt buộc.",
    chu: [
      "Chủ đề chia ba nhóm: theo dịp, theo nhóm hàng và theo khách.",
      "Bấm một chủ đề là bố cục, tông màu và màu nhấn bên dưới đổi theo ngay — ô đang chọn có viền đậm.",
      "Chỉnh tay bố cục, tông hay màu nhấn thì không còn chủ đề nào được chọn; catalogue theo đúng lựa chọn của anh.",
    ],
    meo: [
      "Chủ đề chỉ là lối tắt: không chọn chủ đề nào thì catalogue vẫn như trước.",
      "Chủ đề Khách VIP và Đồ cưới dùng bố cục Thư mời — điền tên khách ở Trang bìa để mỗi trang có dòng “Dành riêng cho” tên khách.",
    ],
  },

  bo_cuc_mau: {
    ten: "Chọn bố cục, tông màu và màu nhấn",
    mo_ta: "Khung Kiểu trình bày quyết định khách thấy catalogue ra sao. Bấm vào ô nào là chọn ô đó.",
    chu: [
      "Tám bố cục: Danh sách dọc (mặc định, dễ so sánh), Lưới ảnh (hợp nhiều mẫu), Lookbook và Triển lãm (ít mẫu, ảnh lớn), Khung cổ điển (dễ đọc thông số), Tạp chí (lướt nhanh), Bảng mẫu (khách sỉ, in gọn), Thư mời (mỗi mẫu một trang, cho khách VIP và đồ cưới).",
      "Mười ba tông màu nền. Nhiều tông tự chuyển màu nhấn cho hợp — ví dụ Champagne sang Vàng đồng, Than chì sang Xanh sapphire — vẫn đổi lại được.",
      "Dòng gợi ý cho biết tông đang chọn hợp với nhóm sản phẩm nào.",
      "Màu nhấn: màu của logo HUNG PHAT, số thứ tự và nút Gọi trên trang khách. Trên nền tối, chữ màu nhấn tự sáng hơn cho dễ đọc.",
    ],
    meo: [
      "Mọi lựa chọn trong khung này được chốt lúc bấm Tạo link. Đổi kiểu cho catalogue sau không ảnh hưởng catalogue đã gửi.",
      "Chưa chắc kiểu nào đẹp thì bấm Xem trước ở thanh dưới cùng — đổi, đóng, mở lại thoải mái trước khi tạo.",
      "Bản in PDF luôn dùng nền sáng cho dễ in, dù đang chọn tông tối (Nền tối, Xanh rêu, Đỏ rượu, Than chì, Xanh đêm).",
    ],
  },

  thong_so_ngon_ngu: {
    ten: "Thông số cho khách xem và ngôn ngữ",
    mo_ta: "Chọn những dòng thông số khách được thấy, và thứ tiếng của catalogue.",
    chu: [
      "Bỏ tích thông số nào thì khách không thấy dòng đó ở mọi mẫu — ví dụ bỏ TL vàng khi chưa muốn báo trọng lượng. SKU, MO, SO, chi tiết kỹ thuật và cảnh báo không bao giờ hiện cho khách.",
      "Ngôn ngữ catalogue: Tiếng Việt hoặc English. Chọn ở đây là chốt — khách không đổi được, và không phụ thuộc ngôn ngữ anh đang dùng hệ thống.",
    ],
    meo: [
      "Chọn English thì tên thông số, lời kêu gọi có sẵn và các nút Gọi, Nhắn tin đều sang tiếng Anh. Chữ anh tự gõ (tên catalogue, lời mở đầu, giới thiệu mẫu, lời kêu gọi tự viết) giữ nguyên.",
      "Giá trị thông số như “DÂY CHUYỀN”, “Yellow” lấy nguyên từ bảng tính, không tự dịch.",
    ],
  },

  lien_he: {
    ten: "Liên hệ đặt hàng và lời kêu gọi",
    mo_ta: "Khối liên hệ nằm cuối trang khách, là chỗ khách bấm gọi hoặc nhắn cho anh. Điền càng đủ, khách càng dễ đặt hàng.",
    chu: [
      "Người tư vấn: tên hiện trên trang bìa và cạnh nút Gọi.",
      "Điện thoại: gõ số Việt Nam (0909 123 456) hay số Mỹ ((408) 555-0199) đều được. Có số thì trang khách có nút Gọi.",
      "Cách nhắn tin cho nút thứ hai: Zalo, Tin nhắn (SMS/iMessage), WhatsApp, hoặc Chỉ gọi điện. Gõ số Việt Nam thì tự chọn Zalo, số Mỹ thì tự chọn Tin nhắn; bấm chọn tay rồi thì không tự đổi nữa.",
      "Lời kêu gọi: dòng tiêu đề to của khối liên hệ. Mỗi câu có sẵn hiện đúng như khách đọc — theo ngôn ngữ catalogue, đã điền tên người tư vấn.",
      "Hoặc tự viết câu của anh vào ô này — gõ vào là tự chọn Tự viết.",
    ],
    meo: [
      "Bỏ trống người tư vấn, điện thoại và để lời kêu gọi mặc định thì khối liên hệ không hiện.",
      "Chọn lời kêu gọi mà chưa có người tư vấn và điện thoại: khách chỉ thấy câu đó, không có nút gọi hay nhắn — màn hình sẽ nhắc ngay bên dưới.",
      "WhatsApp tự thêm mã quốc gia cho số Việt Nam và số Mỹ, cứ gõ số như bình thường.",
    ],
  },

  trang_bia: {
    ten: "Trang bìa",
    mo_ta: "Trang bìa là trang đầu tiên khách thấy, giống bìa một cuốn catalogue in.",
    chu: [
      "Tên khách hàng: dòng chữ nhỏ phía trên tiêu đề trang bìa.",
      "Lời mở đầu: vài câu chào khách, hiện giữa trang bìa, dưới tiêu đề.",
    ],
    meo: [
      "Điền ít nhất một trong hai ô là có trang bìa: logo HUNG PHAT, tên khách, tên catalogue, lời mở đầu và người tư vấn. Để trống cả hai thì không có trang bìa.",
    ],
  },

  thu_tu: {
    ten: "Thứ tự trình bày các mẫu",
    mo_ta: "Khung Thứ tự trình bày quyết định mẫu nào khách thấy trước. Thứ tự ở đây cũng là thứ tự các thẻ mẫu bên dưới.",
    chu: [
      "Sắp xếp nhanh một lần theo Loại sản phẩm (A→Z) hoặc Loại vàng (cao → thấp). Bấm Thứ tự lúc tích chọn để quay về như ban đầu.",
      "Kéo tay cầm sáu chấm để đổi chỗ bằng chuột.",
      "Hoặc bấm mũi tên lên / xuống — dùng được trên điện thoại và bằng bàn phím.",
    ],
    meo: [
      "Khung này chỉ hiện khi đã chọn từ hai mẫu. Không đụng tới thì giữ thứ tự lúc anh tích chọn.",
      "Sắp nhanh xong vẫn kéo tay được. Loại vàng tính theo tuổi vàng cao nhất ghi trong cột Chất liệu; mẫu không ghi tuổi vàng xếp cuối.",
    ],
  },

  gioi_thieu: {
    ten: "Giới thiệu từng mẫu",
    mo_ta: "Mỗi mẫu có một thẻ riêng: thông số, ô giới thiệu và thư viện ảnh.",
    chu: [
      "Giới thiệu mẫu này: vài câu anh muốn nói với khách (chất liệu, cách đeo, dịp tặng…). Không bắt buộc; bỏ trống thì trang khách không có gì thêm.",
      "Tối đa 300 ký tự, bộ đếm hiện khi bắt đầu gõ. Chỗ xuống dòng giữ nguyên trên trang khách.",
      "Gỡ mẫu này khỏi catalogue.",
    ],
    meo: [
      "Lời giới thiệu hiện ngay dưới thông số của mẫu ở mọi bố cục; ở Lưới ảnh nó nằm dưới ảnh đầu tiên của mẫu.",
      "Lời giới thiệu không tự dịch khi chọn English — viết bằng thứ tiếng khách đọc.",
    ],
  },

  anh_mau: {
    ten: "Chọn ảnh, sắp xếp ảnh và ảnh chính",
    mo_ta: "Mặc định giữ hết ảnh của mẫu, theo thứ tự trong thư mục Drive. Bỏ bớt ảnh không muốn gửi và đưa ảnh đẹp nhất lên đầu.",
    chu: [
      "Số ảnh đang giữ trên tổng số ảnh của mẫu.",
      "Bỏ tích (hoặc bấm vào ảnh) để bỏ ảnh đó khỏi catalogue; ảnh bị bỏ mờ đi. Tích lại để lấy lại.",
      "Ảnh chính: ảnh được tích đầu tiên. Đây là ảnh lớn ở Lookbook, Triển lãm và Tạp chí; Khung cổ điển dùng hai ảnh đầu.",
      "Đặt ảnh này làm ảnh chính: ảnh nhảy lên đầu. Ảnh đang bỏ tích sẽ được tích lại.",
      "Đưa ảnh lên trước hoặc ra sau một bậc. Trên máy tính cũng kéo thả ảnh được, bằng tay cầm sáu chấm.",
    ],
    meo: [
      "Kéo thả không dùng được trên điện thoại — dùng các nút mũi tên.",
      "Mẫu bỏ hết ảnh vẫn nằm trong catalogue, chỉ hiện thông số.",
    ],
  },

  xem_truoc: {
    ten: "Xem trước",
    mo_ta: "Bấm Xem trước ở thanh dưới cùng để xem đúng trang khách sẽ thấy, trước khi tạo link.",
    chu: [
      "Xem trước dựng đúng trang khách: cùng bố cục, tông màu, ngôn ngữ, trang bìa, thứ tự, lời giới thiệu và khối liên hệ.",
      "Bấm Đóng hoặc nhấn Esc để quay lại sửa tiếp. Chưa có gì được lưu cho tới khi bấm Tạo link gửi khách.",
      "Cuộn trong khung để xem hết các mẫu và khối liên hệ ở cuối.",
    ],
    meo: [
      "Xem trước không có khung phóng to ảnh và thanh Gọi / Nhắn dính ở đáy điện thoại — hai thứ đó chỉ có trên trang khách thật.",
      "Thanh dưới cùng còn đếm số mẫu và số ảnh đang chọn.",
    ],
  },

  tao_link: {
    ten: "Tạo link và gửi khách",
    mo_ta: "Bấm Tạo link gửi khách. Màn hình kết quả có link cùng các nút để gửi, xem thử và tải PDF.",
    chu: [
      "Link của catalogue. Link mở được trong 90 ngày kể từ hôm tạo.",
      "Đổi tên link ngay tại đây nếu muốn — link cũ vẫn tự chuyển sang link mới.",
      "Chép link rồi dán vào Zalo, iMessage, WhatsApp hoặc email gửi khách.",
      "Mở thử trong tab mới để xem đúng thứ khách thấy.",
      "Tải PDF mở bản in cùng hộp thoại in — chọn Lưu thành PDF. Khách mở link thì không thấy nút này.",
    ],
    meo: [
      "Nội dung được đóng băng lúc bấm Tạo link: bảng tính sửa về sau cũng không làm đổi cái khách đang xem. Muốn khách thấy dữ liệu mới thì tạo catalogue mới.",
      "Tạo xong, danh sách mẫu đã chọn được xoá để lần sau bắt đầu mới. Bấm Tạo catalogue khác để quay về danh sách mẫu.",
    ],
  },

  trang_khach: {
    ten: "Trang khách xem",
    mo_ta: "Khách mở link là thấy catalogue ngay, không cần đăng nhập. Ảnh dưới đây là một catalogue có trang bìa, bố cục Danh sách dọc.",
    chu: [
      "Trang bìa: logo HUNG PHAT, tên khách, tên catalogue và người tư vấn.",
      "Lời mở đầu anh viết.",
      "Mã mẫu là nhãn nhỏ, kèm số thứ tự của mẫu.",
      "Chỉ những thông số anh để tích mới hiện.",
      "Lời giới thiệu mẫu, đúng chỗ xuống dòng anh gõ.",
      "Khách bấm vào ảnh để xem ảnh lớn; bấm Ảnh trước / Ảnh sau hoặc phím mũi tên để chuyển ảnh, Esc để đóng.",
    ],
    meo: [
      "Trang khách không hiện SKU, MO, SO, chi tiết kỹ thuật hay cảnh báo nội bộ.",
      "Trang không lên kết quả tìm kiếm Google — chỉ ai có link mới mở được.",
      "Link hết hạn hoặc bị khoá: khách chỉ thấy dòng “Link này không còn hiệu lực.”, không thấy gì khác.",
    ],
  },

  lien_he_khach: {
    ten: "Khối liên hệ trên trang khách",
    mo_ta: "Cuối trang khách là khối liên hệ, dựng từ phần Liên hệ đặt hàng anh điền lúc tạo.",
    chu: [
      "Lời kêu gọi anh chọn hoặc tự viết.",
      "Tên người tư vấn.",
      "Nút Gọi kèm số điện thoại — trên điện thoại bấm là gọi ngay.",
      "Nút nhắn tin theo cách anh chọn: mở Zalo, WhatsApp, hoặc ứng dụng Tin nhắn của máy.",
    ],
    meo: [
      "Trên điện thoại, hai nút Gọi và Nhắn còn dính ở đáy màn hình suốt lúc khách cuộn.",
      "Chọn Chỉ gọi điện thì chỉ có nút Gọi.",
    ],
  },

  danh_sach: {
    ten: "Catalogue đã tạo",
    mo_ta: "Mọi link đã tạo đều nằm ở mục Catalogue đã tạo trên thanh đầu trang. Sale thấy catalogue của mình; quản trị thấy của cả công ty, thêm cột Người tạo.",
    chu: [
      "Tìm theo tên catalogue, đường dẫn hoặc người tạo.",
      "Hiệu lực: Đang mở kèm số ngày còn lại, Đã khoá hoặc Hết hạn.",
      "Đổi tên link — link cũ đã gửi khách vẫn mở được.",
      "Chép lại link để gửi lần nữa, không cần tạo lại.",
      "Khoá link: khách mở link sẽ thấy link không còn hiệu lực, ngay lập tức. Bấm Mở lại để mở lại.",
      "Tải PDF của catalogue này.",
    ],
    meo: [
      "Link tự hết hiệu lực sau 90 ngày kể từ lúc tạo. Link đã hết hạn thì không mở lại được — tạo catalogue mới.",
      "Bấm tên catalogue hoặc nút Mở để xem đúng trang khách đang thấy.",
      "Nội dung catalogue đã tạo không sửa được: chỉ đổi tên link, khoá hoặc mở lại. Cần đổi mẫu hay ảnh thì tạo catalogue mới.",
    ],
  },

  gop_y: {
    ten: "Gửi góp ý",
    mo_ta: "Gặp chỗ hỏng hay có ý muốn làm khác đi, bấm tab Góp ý ở mép phải ngay tại màn hình đó.",
    chu: [
      "Gửi kèm ảnh màn hình: hệ thống tự chụp phần màn hình anh đang nhìn lúc bấm Góp ý và hiện ở đây để anh xem trước. Bỏ tích nếu không muốn gửi ảnh.",
      "Chọn loại: Có chỗ hỏng hoặc Góp ý cải tiến.",
      "Viết điều muốn báo: chỗ nào hỏng, đã làm gì, mong muốn thế nào. Không cần ghi đang ở màn hình nào — hệ thống tự gửi kèm.",
      "Bấm Gửi góp ý. Hiện dòng “Đã gửi, cảm ơn anh chị” là xong.",
    ],
    meo: [
      "Mở Góp ý ngay tại chỗ đang gặp vấn đề, để ảnh chụp đúng chỗ đó.",
      "Chỉ quản trị đọc được góp ý và ảnh màn hình. Nội dung tối đa 4000 ký tự.",
    ],
  },

  hop_gop_y: {
    ten: "Hộp góp ý",
    mo_ta: "Bấm tên của anh ở góc trên bên phải rồi chọn Hộp góp ý. Dòng mô tả đầu trang đếm số góp ý chưa xử lý.",
    chu: [
      "Nội dung góp ý, giữ nguyên chỗ xuống dòng người gửi gõ.",
      "Xem ảnh màn hình người gửi chụp kèm (mở tab mới).",
      "Người gửi. Cột Màn hình bên trái cho biết họ đang ở trang nào lúc gửi.",
      "Xử lý xong thì bấm Đánh dấu đã xử lý — dòng mờ đi. Bấm Mở lại nếu cần xem lại.",
    ],
    meo: [],
  },

  tai_khoan: {
    ten: "Tài khoản và vai trò",
    mo_ta: "Bấm tên của anh ở góc trên bên phải rồi chọn Tài khoản. Vai trò là cái TÊN anh đặt cho hợp với công ty, nhưng quyền thì hệ thống chỉ cưỡng chế hai bậc, nên mỗi vai trò phải chọn một trong hai.",
    chu: [
      "Cột Quyền quyết định người mang vai trò làm được gì: Quản trị vào được mọi màn hình; Thường chỉ tìm mẫu và tạo catalogue. Hai vai trò gốc không đổi bậc, không xoá được.",
      "Thêm vai trò mới với tên tuỳ ý (GSNB, R&D, thực tập sinh…). Vai trò còn người giữ thì không xoá được — chuyển họ sang vai trò khác trước.",
      "Cấp tài khoản mới: điền email, họ tên, mật khẩu (tối thiểu 8 ký tự) và vai trò, rồi gửi mật khẩu cho người đó qua kênh riêng.",
      "Đổi vai trò của một người: chọn ở ô này rồi bấm Đổi vai trò bên cạnh.",
      "Đặt mật khẩu mới — khi họ quên, hoặc để người đang dùng Google có thêm cách đăng nhập bằng mật khẩu.",
      "Khoá tài khoản của người đã nghỉ; họ không vào được nữa. Bấm Mở khoá để mở lại.",
    ],
    meo: [
      "Nhân viên dùng Gmail công ty không cần cấp trước: lần đầu đăng nhập bằng Google, hệ thống tự tạo tài khoản vai trò Sale.",
      "Không tự khoá hay tự hạ quyền của chính mình được — để luôn còn người vào được màn hình này.",
      "Cột Cách đăng nhập cho biết người đó vào bằng Google, mật khẩu hay cả hai; cột Lần cuối vào cho biết tài khoản còn dùng không.",
    ],
  },

  cau_hoi: [
    {
      hoi: "Sửa bảng tính sau khi đã gửi link thì khách có thấy thay đổi không?",
      dap: "Không. Catalogue được đóng băng lúc bấm Tạo link — thông số và danh sách ảnh giữ nguyên như lúc tạo. Muốn khách thấy dữ liệu mới thì tạo catalogue mới và gửi link mới.",
    },
    {
      hoi: "Khách có thấy SKU, MO, SO hay cảnh báo nội bộ không?",
      dap: "Không. Trang khách chỉ có mã mẫu, những thông số anh để tích, ảnh anh giữ lại, lời giới thiệu và khối liên hệ.",
    },
    {
      hoi: "Link mở được bao lâu?",
      dap: "90 ngày kể từ lúc tạo. Anh có thể khoá sớm hơn ở mục Catalogue đã tạo. Link đã hết hạn thì không mở lại được.",
    },
    {
      hoi: "Đổi tên link rồi, khách đang giữ link cũ có mở được không?",
      dap: "Được. Đoạn mã cuối link giữ nguyên, nên link cũ tự chuyển sang link mới — trừ khi link đã bị khoá hoặc hết hạn.",
    },
    {
      hoi: "Sửa được catalogue đã tạo không?",
      dap: "Chỉ đổi được tên link, khoá hoặc mở lại. Muốn đổi mẫu, ảnh, kiểu trình bày hay lời giới thiệu thì tạo catalogue mới.",
    },
    {
      hoi: "Làm sao gửi PDF cho khách?",
      dap: "Bấm Tải PDF ở màn hình vừa tạo xong hoặc ở Catalogue đã tạo. Hộp thoại in mở ra — chọn Lưu thành PDF (Save as PDF), lưu tệp rồi gửi tệp đó.",
    },
    {
      hoi: "Đã tích chọn mẫu mà sang máy khác không thấy?",
      dap: "Danh sách đang chọn lưu trên trình duyệt của máy đang dùng. Sang máy khác, đổi trình duyệt hay xoá dữ liệu trình duyệt thì phải tích lại.",
    },
    {
      hoi: "Mẫu mới thêm vào bảng tính chưa thấy trên hệ thống?",
      dap: "Dữ liệu được đẩy từ bảng tính lên tự động; xem dòng “Dữ liệu cập nhật lúc…” dưới tiêu đề Catalogue Online. Đợi vài phút rồi tải lại trang. Lâu vẫn chưa thấy thì gửi góp ý kèm mã mẫu.",
    },
    {
      hoi: "Ảnh hiện ô xám hoặc biểu tượng ảnh gạch chéo?",
      dap: "Ô xám là ảnh đang tải — lần đầu mở, hệ thống phải lấy ảnh từ Google Drive nên mất vài giây. Biểu tượng gạch chéo là không tải được ảnh, thường do tệp trên Drive đã bị xoá hoặc đổi quyền.",
    },
    {
      hoi: "Không đăng nhập được bằng Google?",
      dap: "Chỉ Gmail công ty vào được. Dùng email khác thì nhờ quản trị cấp tài khoản email và mật khẩu, rồi bấm Không đăng nhập được bằng Google? ở trang đăng nhập.",
    },
    {
      hoi: "Kéo thả không được trên điện thoại?",
      dap: "Kéo thả chỉ dùng chuột. Trên điện thoại hay máy tính bảng, dùng các nút mũi tên và nút Đặt làm ảnh chính.",
    },
    {
      hoi: "Đổi ngôn ngữ hệ thống ở đâu?",
      dap: "Bấm nút ngôn ngữ (biểu tượng quả địa cầu) trên thanh đầu trang. Việc này chỉ đổi chữ trên màn hình của anh, không đổi ngôn ngữ của catalogue gửi khách.",
    },
  ],
} as const;

import type { BoChu } from "./index";

/**
 * English text for the user guide. Kieu BoChu["huong_dan"] ep dung bo khoa VA dung so
 * phan tu cua moi mang voi huong-dan.vi.ts — so chu thich phai khop so mui ten tren anh.
 */
export const HUONG_DAN_EN: BoChu["huong_dan"] = {
  tieu_de: "How to use it",
  nut_menu: "Guide",
  mo_ta: "From finding a model and building a catalogue to sending the link and keeping track of it. Each step has a real screenshot; the numbers on the picture match the notes right below it.",
  buoc: "Step {n}",
  phan_so: "Part {n}",
  chua_co_anh: "The screenshot for this step has not been captured yet.",
  muc_luc: "Contents",
  luu_y: "Good to know",
  chi_quan_tri: "Administrators only",
  ve_muc_luc: "Back to contents",
  hoi_dap: "Frequently asked questions",

  phan: {
    bat_dau: "Getting started",
    chon_mau: "Find and pick models",
    tao: "Build a catalogue",
    khach: "What your customer gets",
    quan_ly: "Manage the links you sent",
    gop_y: "Feedback",
    quan_tri: "Administration",
  },

  dang_nhap: {
    ten: "Sign in",
    mo_ta: "Open hpcatalogue.app and press Sign in with Google using your company Gmail. If Google will not work, use the small line underneath to sign in with the email and password your administrator gave you.",
    chu: [
      "Use this with your company Gmail (@ctyhp.vn, @ctyhp.com…).",
      "Press Cannot sign in with Google? and enter the email and password from your administrator.",
    ],
    meo: [
      "A Gmail address outside the company cannot get in — the system says so and signs it out straight away.",
      "The first time you sign in with Google, the system creates a Sales account for you.",
      "If your account is locked, the sign-in page says so — ask an administrator to unlock it.",
    ],
  },

  thanh_dau_trang: {
    ten: "The top bar and menu",
    mo_ta: "The top bar holds the three everyday pages, the language switch and your name. Click your name to open the menu. The Feedback tab always sits on the right edge of the screen.",
    chu: [
      "The three main pages: Online Catalogue (find and pick models), Catalogues (links you sent), Guide (this page).",
      "Switch the screen between Vietnamese and English. This does not change the language of a catalogue you send.",
      "Click your name to open the menu and see which email you are signed in with.",
      "Only administrators see Feedback inbox and Accounts in this menu.",
      "Sign out of the system.",
      "The Feedback tab: press it to report a problem or suggest something, on any screen.",
    ],
    meo: [
      "On a narrow screen (phone, tablet) the three main pages move into the Menu button.",
      "Click the HUNG PHAT logo to go back to the Online Catalogue.",
    ],
  },

  tim_mau: {
    ten: "Find and filter models",
    mo_ta: "The Online Catalogue reads from the spreadsheet. Type, click a metric card or pick a filter — the list narrows straight away, no Enter or Search button needed.",
    chu: [
      "Search box: model code, SKU, MO, SO or a few words of the description, with or without Vietnamese accents. The suggestions show where the words appear and how many models match.",
      "Metric cards: total models, and how many are missing images, missing SKU, have a gold weight mismatch or duplicate rows. Click a card to filter to exactly those; click again to clear.",
      "Seven multi-select filters: material, type, line, colour, size, diamond type, warnings. The number beside each option is how many models are left if you pick it.",
      "Filter by gold weight in grams: fill in From, To, or both.",
      "Switch view: Table to check against the spreadsheet, Image grid to browse.",
      "Click a column heading to sort by it; click again to reverse.",
    ],
    meo: [
      "Active filters show as small tags under the filter row — press × on a tag to drop just that one, or press Clear all filters.",
      "The small line under the title says when the data was last updated from the spreadsheet. After editing the spreadsheet, wait a few minutes and reload.",
      "In Image grid view the sort options sit above the grid: spreadsheet order, model code, type, material, gold weight, size.",
      "The Folder column has up to three icons — image folder, concept images, raw clips; hover to see which, click to open in Google Drive. The Edited clip column shows the clip name; click to open it (company accounts only).",
      "At the bottom are the page buttons and a line showing which models are on screen.",
    ],
  },

  chi_tiet_mau: {
    ten: "See one model in detail",
    mo_ta: "Click a row (or a card in Image grid view) to open the detail panel on the right: every field, the Drive links and the full image library.",
    chu: [
      "Press Close, click the dark area outside, or press Esc to close the panel.",
      "Every field from the spreadsheet, including SKU, SO, MO and main stone — staff only; these never appear in a catalogue you send.",
      "Open the model's image folder, concept image folder or raw clip folder in Google Drive.",
      "The image library. Click an image to see it large; click the large image or press Esc to go back.",
    ],
    meo: [
      "Clicking the tick box or a link icon does not open the panel — those keep their own jobs.",
      "A model with no images: the panel says whether the spreadsheet has no image folder or the folder is empty.",
    ],
  },

  tich_chon: {
    ten: "Tick the models",
    mo_ta: "Tick the models you want to send. Pick as many as you like; the bar at the bottom always shows how many are selected.",
    chu: [
      "The tick box at the start of the row. In Image grid view it sits under the picture.",
      "This bar appears once at least one model is selected and stays at the bottom of the screen.",
      "Clear selection to start over.",
      "Press Create catalogue to move to the build screen.",
    ],
    meo: [
      "Your selection is remembered in this browser: changing filters, pages or views, or reloading, keeps it. On another computer you tick again.",
      "A model spread over several rows (different sizes or weights) has a tick box only on its first row; later rows say Same model. Each model goes into a catalogue once.",
      "Keep searching and filtering to add more — models already ticked stay ticked.",
    ],
  },

  ten_link: {
    ten: "Name the catalogue and the link",
    mo_ta: "The build screen runs top to bottom: names, presentation, order, then each model. Nothing is required — leave a box empty and the system uses a default.",
    chu: [
      "Catalogue name: how you find it later, and the big title your customer sees. Leave it blank and it becomes “Catalogue #12”.",
      "Link name: the words your customer sees in the address. It follows the catalogue name; if that name includes the customer's name, type a separate one here, for example “Wedding rings 18K”.",
      "This is what the address will look like. The code at the end is added when you create it, so nobody can guess another customer's link.",
    ],
    meo: [
      "The link name drops accents, becomes lower case and turns spaces into hyphens.",
      "You can still rename the link after creating it, and the old link you sent keeps working.",
    ],
  },

  chu_de: {
    ten: "Pick a theme",
    mo_ta: "The Theme row at the top of the Presentation box sets a matching layout, colour and accent for an occasion, a product group or a kind of client. Optional.",
    chu: [
      "Themes come in three groups: by occasion, by product and by client.",
      "Pick a theme and the layout, colour and accent below change to match — the chosen one gets a dark border.",
      "Change the layout, colour or accent by hand and no theme stays selected; the catalogue follows exactly what you chose.",
    ],
    meo: [
      "A theme is only a shortcut: pick none and the catalogue works as before.",
      "VIP clients and Bridal use the Invitation layout — fill in the customer name under Cover page so every page gets a “Specially for” line.",
    ],
  },

  bo_cuc_mau: {
    ten: "Choose layout, colour and accent",
    mo_ta: "The Presentation box decides how your customer sees the catalogue. Click an option to choose it.",
    chu: [
      "Eight layouts: Vertical list (default, easy to compare), Image grid (many models), Lookbook and Gallery (few models, big pictures), Classic frame (easiest to read details), Magazine (quickest to skim), Line sheet (wholesale, prints tight), Invitation (one page per model, for VIP clients and bridal).",
      "Thirteen background colours. Many switch the accent to match — Champagne to Antique gold, Graphite to Sapphire blue, for example — and you can still change it back.",
      "The hint line says which kind of jewellery the chosen colour suits.",
      "Accent colour: the colour of the HUNG PHAT logo, the numbers and the Call button on the customer page. On dark backgrounds the accent text turns lighter so it stays easy to read.",
    ],
    meo: [
      "Everything in this box is locked in when you press Create customer link. Changing it for a later catalogue does not touch ones already sent.",
      "Not sure which looks best? Press Preview in the bottom bar — change, close and reopen as often as you like before creating.",
      "The PDF always prints on a light background, even with a dark colour chosen (Dark, Deep green, Wine red, Graphite, Midnight blue).",
    ],
  },

  thong_so_ngon_ngu: {
    ten: "Details shown and language",
    mo_ta: "Choose which detail lines your customer sees, and the catalogue's language.",
    chu: [
      "Untick a detail and your customer does not see that line on any model — for example untick Gold weight if you do not want to share weights yet. SKU, MO, SO, technical details and warnings never show to customers.",
      "Catalogue language: Tiếng Việt or English. This is final — the customer cannot switch it, and it does not depend on the language you use the system in.",
    ],
    meo: [
      "With English, detail names, the ready-made calls to action and the Call and message buttons are in English. Text you type yourself (catalogue name, opening note, About this piece, your own call to action) stays exactly as typed.",
      "Values such as “DÂY CHUYỀN” or “Yellow” come straight from the spreadsheet and are not translated.",
    ],
  },

  lien_he: {
    ten: "Ordering contact and call to action",
    mo_ta: "The contact block sits at the end of the customer page — where your customer calls or messages you. The more you fill in, the easier it is for them to order.",
    chu: [
      "Consultant: the name shown on the cover page and next to the Call button.",
      "Phone: a Vietnamese number (0909 123 456) or a US number ((408) 555-0199) both work. With a number, the customer page gets a Call button.",
      "How customers message you, for the second button: Zalo, Text message (SMS/iMessage), WhatsApp, or Call only. A Vietnamese number picks Zalo and a US number picks Text message automatically; once you choose by hand it stops switching.",
      "Call to action: the big heading of the contact block. Each ready-made line shows exactly as your customer will read it — in the catalogue's language, with the consultant's name filled in.",
      "Or write your own line in this box — typing here selects Write your own.",
    ],
    meo: [
      "Leave consultant and phone empty and keep the default call to action, and the contact block does not appear.",
      "If you choose a call to action but have no consultant or phone, your customer sees only that line with no call or message button — the screen reminds you just below.",
      "WhatsApp adds the country code for Vietnamese and US numbers, so type the number as usual.",
    ],
  },

  trang_bia: {
    ten: "Cover page",
    mo_ta: "The cover page is the first thing your customer sees, like the cover of a printed catalogue.",
    chu: [
      "Customer name: the small line above the cover title.",
      "Opening note: a few words of greeting, shown in the middle of the cover under the title.",
    ],
    meo: [
      "Fill in at least one of the two and the catalogue gets a cover: HUNG PHAT logo, customer name, catalogue name, opening note and consultant. Leave both empty and there is no cover.",
    ],
  },

  thu_tu: {
    ten: "Order of the models",
    mo_ta: "The Presentation order box decides which model your customer sees first. It is also the order of the model cards below.",
    chu: [
      "Quick sort once by Product type (A→Z) or Gold karat (high → low). Press Order you picked to go back to the start.",
      "Drag the six-dot handle to move a model with the mouse.",
      "Or press the up / down arrows — works on phones and with the keyboard.",
    ],
    meo: [
      "This box appears only with two or more models. Leave it alone and the order is the order you ticked them.",
      "You can still drag after a quick sort. Gold karat uses the highest karat in the Material column; models without a karat go last.",
    ],
  },

  gioi_thieu: {
    ten: "About each model",
    mo_ta: "Each model has its own card: details, an About box and the image library.",
    chu: [
      "About this piece: a few words for your customer (material, how it wears, a gift idea…). Optional; leave it empty and nothing extra shows.",
      "Up to 300 characters; the counter appears once you type. Line breaks are kept on the customer page.",
      "Remove this model from the catalogue.",
    ],
    meo: [
      "The text appears right under the model's details in every layout; in Image grid it sits under the model's first picture.",
      "It is not translated when you choose English — write it in your customer's language.",
    ],
  },

  anh_mau: {
    ten: "Pick, order and choose the main image",
    mo_ta: "Every image is kept by default, in the order of the Drive folder. Drop the ones you do not want and move the best one to the front.",
    chu: [
      "Images kept out of the model's total.",
      "Untick (or click the picture) to leave it out; dropped images fade. Tick again to bring it back.",
      "Main image: the first ticked image. It is the big picture in Lookbook, Gallery and Magazine; Classic frame uses the first two.",
      "Make this the main image: it jumps to the front. An unticked image is ticked again.",
      "Move the image one place earlier or later. On a computer you can also drag it by the six-dot handle.",
    ],
    meo: [
      "Dragging does not work on phones — use the arrow buttons.",
      "A model with every image dropped stays in the catalogue with just its details.",
    ],
  },

  xem_truoc: {
    ten: "Preview",
    mo_ta: "Press Preview in the bottom bar to see exactly what your customer will see before you create the link.",
    chu: [
      "The preview builds the real customer page: same layout, colours, language, cover, order, About text and contact block.",
      "Press Close or Esc to go back and keep editing. Nothing is saved until you press Create customer link.",
      "Scroll inside the frame to see every model and the contact block at the end.",
    ],
    meo: [
      "The preview has no image zoom and no sticky Call / message bar — those only exist on the real customer page.",
      "The bottom bar also counts the models and images selected.",
    ],
  },

  tao_link: {
    ten: "Create the link and send it",
    mo_ta: "Press Create customer link. The result screen shows the link and buttons to send it, try it and download a PDF.",
    chu: [
      "The catalogue's link. It works for 90 days from today.",
      "Rename the link here if you like — the old link still redirects to the new one.",
      "Copy link, then paste it into Zalo, iMessage, WhatsApp or an email.",
      "Open it in a new tab to see exactly what your customer sees.",
      "Download PDF opens the print view and the print dialog — choose Save as PDF. Customers opening the link never see this button.",
    ],
    meo: [
      "The contents are frozen when you press Create customer link: later spreadsheet edits do not change what your customer sees. To show new data, create a new catalogue.",
      "After creating, your selection is cleared so the next catalogue starts fresh. Press Create another catalogue to go back to the models.",
    ],
  },

  trang_khach: {
    ten: "The customer page",
    mo_ta: "Your customer opens the link and sees the catalogue straight away — no sign-in. Below is a catalogue with a cover page in the Vertical list layout.",
    chu: [
      "Cover page: HUNG PHAT logo, customer name, catalogue name and consultant.",
      "Your opening note.",
      "The model code is a small label with the model's number.",
      "Only the details you left ticked are shown.",
      "The About text, with your line breaks.",
      "Your customer clicks a picture to see it large; Previous image / Next image or the arrow keys move between pictures, Esc closes.",
    ],
    meo: [
      "The customer page never shows SKU, MO, SO, technical details or internal warnings.",
      "The page is hidden from Google search — only people with the link can open it.",
      "An expired or locked link shows only “This link is no longer active.” and nothing else.",
    ],
  },

  lien_he_khach: {
    ten: "The contact block your customer sees",
    mo_ta: "At the end of the customer page is the contact block, built from the Ordering contact you filled in.",
    chu: [
      "The call to action you chose or wrote.",
      "The consultant's name.",
      "The Call button with the phone number — on a phone, one tap calls you.",
      "The message button, as you chose: opens Zalo, WhatsApp or the phone's Messages app.",
    ],
    meo: [
      "On phones the Call and message buttons also stick to the bottom of the screen while your customer scrolls.",
      "With Call only there is just the Call button.",
    ],
  },

  danh_sach: {
    ten: "Catalogues created",
    mo_ta: "Every link you created is under Catalogues in the top bar. Sales staff see their own; administrators see everyone's, with a Created by column.",
    chu: [
      "Search by catalogue name, address or creator.",
      "Status: Active with the days left, Locked or Expired.",
      "Rename link — the old link you sent keeps working.",
      "Copy the link again to resend it, no need to recreate it.",
      "Lock link: anyone opening it sees that the link is no longer active, immediately. Press Unlock to open it again.",
      "Download the PDF of this catalogue.",
    ],
    meo: [
      "A link stops working 90 days after it was created. An expired link cannot be reopened — create a new catalogue.",
      "Click the catalogue name or Open to see exactly what your customer sees.",
      "A created catalogue's contents cannot be edited: you can only rename the link, lock or unlock it. To change models or images, create a new catalogue.",
    ],
  },

  gop_y: {
    ten: "Send feedback",
    mo_ta: "Found something broken or have an idea? Press the Feedback tab on the right edge, on that very screen.",
    chu: [
      "Send a screenshot too: the system captures what you were looking at when you pressed Feedback and shows it here first. Untick it if you do not want to send the picture.",
      "Pick a kind: Something is broken or Suggestion.",
      "Describe it: what is broken, what you did, what you would like instead. No need to say which screen — that is sent automatically.",
      "Press Send. When “Sent — thank you” appears, you are done.",
    ],
    meo: [
      "Open Feedback right where the problem is, so the screenshot shows that spot.",
      "Only administrators can read feedback and screenshots. Up to 4000 characters.",
    ],
  },

  hop_gop_y: {
    ten: "Feedback inbox",
    mo_ta: "Click your name at the top right and choose Feedback inbox. The line under the title counts the items not yet handled.",
    chu: [
      "What was reported, with the sender's line breaks kept.",
      "View the screenshot the sender attached (opens a new tab).",
      "The sender. The Screen column to the left shows which page they were on.",
      "When it is dealt with, press Mark handled — the row fades. Press Reopen to bring it back.",
    ],
    meo: [],
  },

  tai_khoan: {
    ten: "Accounts and roles",
    mo_ta: "Click your name at the top right and choose Accounts. A role is a NAME you choose to match your company, but access comes in only two levels the system can enforce, so every role picks one.",
    chu: [
      "The Access column decides what someone can do: Administrator reaches every screen; Standard only finds models and builds catalogues. The two built-in roles cannot change level or be deleted.",
      "Add a role with any name (internal audit, R&D, interns…). A role someone still holds cannot be deleted — move them to another role first.",
      "Create an account: enter email, name, a password (at least 8 characters) and a role, then send the password to that person privately.",
      "Change someone's role: pick it in this box, then press Change role beside it.",
      "Set a new password — when someone forgets theirs, or to give a Google user a password sign-in as well.",
      "Lock the account of someone who has left; they can no longer sign in. Press Unlock to reopen it.",
    ],
    meo: [
      "Staff with a company Gmail need no account in advance: their first Google sign-in creates a Sales account.",
      "You cannot lock yourself or lower your own access — so someone can always reach this screen.",
      "The Sign-in method column shows Google, password or both; Last seen shows whether the account is still in use.",
    ],
  },

  cau_hoi: [
    {
      hoi: "If I edit the spreadsheet after sending a link, does my customer see the change?",
      dap: "No. A catalogue is frozen when you press Create customer link — details and images stay as they were. To show new data, create a new catalogue and send the new link.",
    },
    {
      hoi: "Can my customer see SKU, MO, SO or internal warnings?",
      dap: "No. The customer page has only the model code, the details you left ticked, the images you kept, your About text and the contact block.",
    },
    {
      hoi: "How long does a link work?",
      dap: "90 days from when it was created. You can lock it earlier under Catalogues. An expired link cannot be reopened.",
    },
    {
      hoi: "I renamed a link — does the old one my customer has still work?",
      dap: "Yes. The code at the end stays the same, so the old link redirects to the new one — unless the link is locked or expired.",
    },
    {
      hoi: "Can I edit a catalogue after creating it?",
      dap: "Only the link name, and lock or unlock. To change models, images, presentation or About text, create a new catalogue.",
    },
    {
      hoi: "How do I send a PDF?",
      dap: "Press Download PDF on the result screen or under Catalogues. The print dialog opens — choose Save as PDF, save the file and send it.",
    },
    {
      hoi: "I ticked models but they are gone on another computer?",
      dap: "Your selection is stored in the browser on the computer you used. On another computer or browser, or after clearing browser data, tick them again.",
    },
    {
      hoi: "A model I just added to the spreadsheet is not showing?",
      dap: "Data is pushed from the spreadsheet automatically; see “Data updated at…” under the Online Catalogue title. Wait a few minutes and reload. If it still does not appear, send feedback with the model code.",
    },
    {
      hoi: "An image shows a grey box or a crossed-out picture icon?",
      dap: "A grey box means it is loading — the first time, the system has to fetch it from Google Drive, which takes a few seconds. The crossed-out icon means it could not load, usually because the file was deleted or its sharing changed on Drive.",
    },
    {
      hoi: "I cannot sign in with Google?",
      dap: "Only company Gmail accounts can. With another email, ask an administrator for an email and password account, then press Cannot sign in with Google? on the sign-in page.",
    },
    {
      hoi: "Dragging does not work on my phone?",
      dap: "Dragging needs a mouse. On phones and tablets use the arrow buttons and Make this the main image.",
    },
    {
      hoi: "Where do I change the system language?",
      dap: "Press the language switch (the globe icon) in the top bar. It only changes the words on your screen, not the language of a catalogue you send.",
    },
  ],
};

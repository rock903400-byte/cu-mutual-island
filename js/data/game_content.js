/* ==========================================================================
   5 大攤位完整關卡、擴充題庫與動態出題引擎 (v14)
   - 每題嚴格核對 7 份官方 PDF 原始條文，並搭配台語金句彩蛋
   - 第 1 攤擴充至 24 題、第 2 攤擴充至 14 題（附需求診斷清單）
   - 第 3 攤支援「點時間軸找線索解鎖公式」＋動態數字隨機試算題
   - 第 4 攤支援「真輪盤雙風險事件＋跨階段保單延續條件」
   - 第 5 攤支援「25 號送件櫃檯實戰」動態日期情境題
   ========================================================================== */
window.GAME_CONTENT = {
  mascotQuotes: [
    '「歡迎登島！忘記條款隨時點右上角 📖 速查圖鑑偷看，遊戲會自動暫停計時喔～」',
    '「偷偷跟你說：馬戲團馴獸師、爆竹廠廠長跟高空彈跳教練都在意外險拒保黑名單裡！」',
    '「人壽儲蓄互助基金 LS 60 歲前存股金是 100% 加值，千萬不要輕易退股啦！」',
    '「松年意外超暖心，滿 80 歲前能初次加保、還能一路續約到 85 歲，還附實支實付 1 萬！」',
    '「各級幹部互助基金記得喔：全體幹部要選同一方案，教育委員最多 5 人、顧問 3 人！」',
    '「防癌等待期是第 31 天起，重大疾病等待期是 60 日以後，別搞混囉！」',
    '「送件口訣記起來：3 幹部、4 團體、6 防癌、8 重疾、9 意外、10 松年，每月 25 號前送件次月 1 號生效！」'
  ],

  /* ==================== 攤位 1：核保快刷！過關還是退件？（24 題） ==================== */
  swipeCases: [
    {
      id: 'sw1', diff: 'both', fund: '社員團體意外互助基金',
      name: '阿獅伯', age: '38 歲', job: '馬戲團馴獸師', avatar: '🦁', imgKey: 'char_tamer',
      note: '「我在馬戲團跟獅子感情超好，想初次投保意外險計畫四！」',
      approve: false,
      explain: '動物園、馬戲團馴獸師屬於團體意外與松年意外「不承保職業類別」，必須退件！',
      taigi: '母湯喔！馴獸師在不承保職業黑名單啦！', voiceKey: 'taigi_tamer'
    },
    {
      id: 'sw2', diff: 'both', fund: '社員松年意外互助基金',
      name: '阿美阿嬤', age: '78 歲（初次加保）', job: '退休家管', avatar: '👵', imgKey: 'char_grandma',
      note: '「我身體硬朗愛去公園散步，想第一次參加松年意外互助基金！」',
      approve: true,
      explain: '松年意外初次參加年齡為「滿 15 歲至滿 80 歲前」，78 歲退休家管完全符合資格，核准！',
      taigi: '水啦！松年意外未滿 80 歲攏可以初次加保！'
    },
    {
      id: 'sw3', diff: 'both', fund: '社員團體互助基金（E 計畫）',
      name: '小豆芽', age: '3 歲', job: '幼稚園小朋友', avatar: '👶', imgKey: 'char_baby',
      note: '「爸媽幫我辦了入社，想初次參加 812 元的 E 計畫！」',
      approve: true,
      explain: '社員團體 E 計畫專為「0 歲至 15 歲（未滿）」小朋友設計，符合資格直接核准！',
      taigi: '讚喔！E 計畫就是給 15 歲以下乖孫保的！'
    },
    {
      id: 'sw4', diff: 'both', fund: '社員團體意外互助基金',
      name: '阿豪哥', age: '31 歲', job: '極限攀岩與高空彈跳教練', avatar: '🧗', imgKey: 'char_climber',
      note: '「我平常帶學員跳高空彈跳跟攀岩，想保意外計畫三防萬一！」',
      approve: false,
      explain: '高空彈跳（含教練）與攀岩（含教練）均名列不承保職業運動員清單，不予承保！',
      taigi: '拍謝喔！攀岩跟高空彈跳教練不能承保！'
    },
    {
      id: 'sw5', diff: 'both', fund: '社員團體互助基金（D 計畫）',
      name: '大明哥', age: '48 歲（初次加保）', job: '國小老師', avatar: '👨‍🏫', imgKey: 'char_teacher',
      note: '「我看 D 計畫保障最高，我 48 歲第一次保，幫我選 D 計畫！」',
      approve: false,
      explain: '團體互助基金 D 計畫初次參加年齡限定「15 足歲至 45 歲（未滿）」！48 歲只能改選 A、B、C、F 計畫。',
      taigi: '差一點點！D 計畫要 45 歲未滿才能保喔！'
    },
    {
      id: 'sw6', diff: 'both', fund: '社員防癌互助基金（計畫一）',
      name: '小安媽咪', age: '剛出生已正常出院', job: '新生兒社員', avatar: '🍼', imgKey: 'char_baby',
      note: '「寶寶剛健康出院，我們附上了健康聲明書，想初次投保防癌計畫一！」',
      approve: true,
      explain: '防癌計畫一、二初次參加年齡為「自出生至正常出院日起至未滿 65 歲」，附健康聲明書送核保，合格！',
      taigi: '真內行！防癌基金出生正常出院就能申請！'
    },
    {
      id: 'sw7', diff: 'both', fund: '社員團體意外互助基金',
      name: '跨社阿發', age: '45 歲', job: '雜貨店老闆', avatar: '🏪', imgKey: 'char_shop',
      note: '「我同時在太陽社跟月亮社都是舊跨社社員，我想兩社都各保一份意外計畫四領雙倍！」',
      approve: false,
      explain: '全系列互助基金均明訂「跨社社員只能選擇其中一社參加」，不能兩社重複投保！',
      taigi: '麥假喔！跨社社員只能選一社參加啦！'
    },
    {
      id: 'sw8', diff: 'both', fund: '社員重大疾病互助基金',
      name: '曉玲姐', age: '52 歲（初次加保）', job: '會計師', avatar: '👩‍💼', imgKey: 'char_office',
      note: '「我身體健康，已填妥健康聲明書，想初次投保 15 萬重大疾病（年繳 1,560 元）。」',
      approve: true,
      explain: '重大疾病初次加保至 65 歲未滿，50~60 歲未滿費率為 1,560 元且附健康聲明書，完全正確！',
      taigi: '水啦！資格跟年齡費率攏對喔！'
    },
    {
      id: 'sw9', diff: 'both', fund: '社員松年意外互助基金',
      name: '勇伯', age: '84 歲（續約社員）', job: '退休農夫', avatar: '👴', imgKey: 'char_grandpa',
      note: '「我去年就有保松年意外了，今年 84 歲要繼續續約！」',
      approve: true,
      explain: '松年意外續約社員可一路「續約至滿 85 歲止」，84 歲續約完全沒問題！',
      taigi: '讚啦！松年意外續約可以保到滿 85 歲！'
    },
    {
      id: 'sw10', diff: 'both', fund: '社員團體意外互助基金',
      name: '爆破阿強', age: '40 歲', job: '火藥爆竹製造廠廠長', avatar: '🧨', imgKey: 'char_pyro',
      note: '「我只是當廠長管廠務，沒有親手包炮竹，應該可以保意外險吧？」',
      approve: false,
      explain: '條文特別括號寫明「火藥爆竹製造及處理人員（包括廠務管理及廠長）」皆屬不承保職業！',
      taigi: '母湯喔！連爆竹廠廠長也在拒保名單裡！'
    },
    {
      id: 'sw19', diff: 'both', fund: '社員團體意外互助基金',
      name: '旺來阿公', age: '73 歲（初次加保）', job: '退休木工', avatar: '👴', imgKey: 'char_grandpa',
      note: '「我以前沒保過團體意外，今年 73 歲想第一次加入團體意外計畫三！」',
      approve: false,
      explain: '團體意外「初次參加」限滿 15 歲至滿 70 歲前（續約才到 75 歲）！73 歲初次應改保「松年意外互助基金」（未滿 80 歲可初次參加）！',
      taigi: '阿公換保松年意外啦！73 歲初次保團體意外超齡囉！'
    },
    {
      id: 'sw20', diff: 'both', fund: '社員防癌互助基金（計畫二）',
      name: '秀琴姨', age: '62 歲（初次加保）', job: '社區志工', avatar: '👵', imgKey: 'char_grandma',
      note: '「我今年 62 歲身體很健康，已附上健康聲明書，想趁 65 歲前初次參加防癌計畫二！」',
      approve: true,
      explain: '防癌計畫一、二初次參加年齡至「未滿 65 歲」，附健康聲明書送核保，62 歲完全符合資格！',
      taigi: '真巧喔！65 歲前趕緊保起來，未來滿 70 歲還能接計畫三！'
    },
    {
      id: 'sw21', diff: 'both', fund: '社員團體互助基金（D 計畫）',
      name: '志成爸爸', age: '42 歲（初次加保）', job: '水電技師', avatar: '👨‍🔧', imgKey: 'char_teacher',
      note: '「聽說 D 計畫 45 歲以後就不能初次加保了，我今年 42 歲附健康聲明書搶搭 D 計畫！」',
      approve: true,
      explain: '團體 D 計畫初次參加年齡為「15 足歲至 45 歲（未滿）」，42 歲附健康聲明書核保通過即可享有最高身故與疾病住院保障！',
      taigi: '內行爸爸！45 歲前卡位 D 計畫就對了！'
    },
    // --- Hard 幹部魔王專屬刁鑽題 ---
    {
      id: 'sw11', diff: 'hard', fund: '各級幹部互助基金',
      name: '陽光社名冊', age: '理監事＋聘任人員', job: '含 5 位教育委員、4 位顧問', avatar: '📋', imgKey: 'char_officer',
      note: '「本社全體幹部統一選 A3，名冊共報理監事 12 人、教育委員 5 人、顧問 4 人！」',
      approve: false,
      explain: '聘任幹部名額上限為「教育委員每社最多 5 人、顧問每社最多 3 人」！報 4 位顧問超額，退件補正！',
      taigi: '抓到了！顧問每社最多只能報 3 個人啦！'
    },
    {
      id: 'sw12', diff: 'hard', fund: '社員防癌互助基金（計畫三）',
      name: '林阿姨', age: '71 歲（初次新保）', job: '退休護理師', avatar: '👵', imgKey: 'char_grandma',
      note: '「我以前沒保過防癌基金，聽說計畫三是給 70~75 歲的，我現在 71 歲想直接初次加入計畫三！」',
      approve: false,
      explain: '防癌計畫三僅限「已參加計畫一或計畫二且未罹患癌症之續約社員」滿 70 歲後銜接續保，不能初次直接加入！',
      taigi: '歹勢喔！防癌計畫三限舊保戶續約銜接！'
    },
    {
      id: 'sw13', diff: 'hard', fund: '各級幹部互助基金（A3）',
      name: '陳理事長', age: '58 歲', job: '同時任「社理事」與「區會幹部」', avatar: '🎖️', imgKey: 'char_officer',
      note: '「我們社跟區會全體都選 A3，我想用社理事和區會幹部『雙重身分』各保一份 A3！」',
      approve: false,
      explain: '承保公司風險控管規定：同時具備社、區會或協會幹部身分者，欲選 A3「僅能擇一身分」參加 A3！',
      taigi: '抓包！雙重幹部身分選 A3 只能擇一參加！'
    },
    {
      id: 'sw14', diff: 'hard', fund: '社員團體意外互助基金',
      name: '阿龍', age: '35 歲（中途轉職）', job: '原上班族 → 剛改當遠洋漁船船員', avatar: '⚓', imgKey: 'char_sailor',
      note: '「我去年 9 月就承保了，今年 2 月換工作上遠洋漁船，反正已核保就繼續放著吧？」',
      approve: false,
      explain: '規定明訂：參加社員如中途因職業變更為不承保職業類別（如遠洋漁船船員）時，「須辦理退保」！',
      taigi: '母湯放著喔！中途轉做拒保職業一定要辦退保！'
    },
    {
      id: 'sw15', diff: 'hard', fund: '社員防癌互助基金（計畫二）',
      name: '王大哥', age: '56 歲（曾罹癌續約）', job: '自由業', avatar: '🧑', imgKey: 'char_office',
      note: '「我原本保防癌計畫一，前年確診癌症領過給付，今年續約我想升級成計畫二！」',
      approve: false,
      explain: '防癌基金除外責任明訂：「已罹患癌症之續約社員，不得轉換參加計畫」！只能維持原計畫續約。',
      taigi: '不能升級喔！已罹癌的續約社員不得轉換計畫！'
    },
    {
      id: 'sw16', diff: 'hard', fund: '社員團體意外互助基金',
      name: '阿哲', age: '42 歲', job: '室內裝潢設計師（領有 2 級失能手冊）', avatar: '🎨', imgKey: 'char_office',
      note: '「我的職業很安全不是高危險工作，只是身體狀況已達第 2 級失能程度，想加保意外計畫一！」',
      approve: false,
      explain: '團體意外與松年意外投保限制明訂：「已罹患精神官能症者及身體狀況已達 1~3 級失能程度者皆不予承保」！',
      taigi: '要看仔細！1 到 3 級失能程度屬於不予承保！'
    },
    {
      id: 'sw17', diff: 'hard', fund: '各級幹部互助基金',
      name: '山海社名冊', age: '15~75 歲內全體幹部', job: '理事想保 A1，監事想保 A3', avatar: '🏛️', imgKey: 'char_officer',
      note: '「我們社理事年紀大想保含疾病的 A1，監事常出差想保高意外的 A3，分開報可以吧？」',
      approve: false,
      explain: '各級幹部互助基金規定：「社、區會、協會幹部擇一方案參加，全體幹部須參加同一方案」！不得分開選。',
      taigi: '不行分開啦！全體幹部愛參加同一個方案！'
    },
    {
      id: 'sw18', diff: 'hard', fund: '社員重大疾病互助基金',
      name: '周伯伯', age: '68 歲（續約社員）', job: '退休公務員', avatar: '👴', imgKey: 'char_grandpa',
      note: '「我 63 歲就開始保重大疾病了，今年 68 歲繳 2,820 元辦理續保！」',
      approve: true,
      explain: '重大疾病初次加保至 65 歲未滿，但「續保年齡可至滿 70 歲」，年繳 2,820 元完全符合！',
      taigi: '內行喔！重大疾病續保可以保到滿 70 歲！'
    },
    {
      id: 'sw22', diff: 'hard', fund: '社員松年意外互助基金',
      name: '阿電師', age: '28 歲', job: '高壓電塔工程維修員', avatar: '⚡', imgKey: 'char_pyro',
      note: '「團體意外不保我，聽說松年意外滿 15 歲就能保，我改來保松年意外可以吧？」',
      approve: false,
      explain: '松年意外的投保職業限制與團體意外完全相同！高壓電工程人員同樣屬不承保職業類別，不可投保！',
      taigi: '行不通喔！松年意外一樣拒保高壓電工程人員！'
    },
    {
      id: 'sw23', diff: 'hard', fund: '社員團體意外互助基金',
      name: '小文', age: '45 歲', job: '行政專員（已罹患精神官能症）', avatar: '🧑‍💼', imgKey: 'char_office',
      note: '「我在冷氣房上班很安全，只是健康告知欄有寫到已罹患精神官能症，想保意外計畫一。」',
      approve: false,
      explain: '團體意外與松年意外均明訂：「已罹患精神官能症者及身體狀況達 1~3 級失能程度者皆不予承保」！',
      taigi: '這條要記牢！已罹患精神官能症不予承保意外基金！'
    },
    {
      id: 'sw24', diff: 'hard', fund: '各級幹部互助基金',
      name: '平安社名冊', age: '理監事＋聘任人員', job: '含 6 位教育委員、2 位顧問', avatar: '📋', imgKey: 'char_officer',
      note: '「我們社全體選 A2 方案，顧問只報 2 位沒超額，但教育委員很熱心想報 6 位！」',
      approve: false,
      explain: '聘任幹部每社上限：「教育委員最多 5 人、顧問最多 3 人」！教育委員報 6 位已超額，須刪減至 5 位以內！',
      taigi: '教育委員最多 5 個啦！不能拿顧問名額去補喔！'
    }
  ],

  /* ==================== 攤位 2：互助配對診所（14 題，含診斷核對清單） ==================== */
  clinicCases: [
    {
      id: 'cl1', diff: 'both',
      name: '新手爸媽與 1 歲小橘子', avatar: '👶', imgKey: 'char_baby',
      speech: '「我們想幫 1 歲寶寶保一個便宜的團體意外住院＋骨折保障，不用身故給付沒關係，每年預算 1,000 元以內！」',
      clues: ['年齡：1 歲（未滿 15 歲）', '需求：意外住院＋骨折', '預算：1,000 元以內'],
      options: [
        { title: '社員團體互助基金－E 計畫', sub: '年繳 812 元｜0~15歲未滿專屬｜意外住院 1,000/日＋加護/燒燙傷另 2,000/日＋骨折', ok: true, checks: [true, true, true] },
        { title: '社員團體互助基金－F 計畫', sub: '年繳 805 元｜15~70歲未滿｜基本身故保障（無住院日額）', ok: false, checks: [false, false, true] },
        { title: '社員團體意外互助基金－計畫一', sub: '年繳 820 元｜15~70歲未滿｜意外身故 100 萬', ok: false, checks: [false, false, true] },
        { title: '社員松年意外互助基金', sub: '年繳 2,000 元｜15~80歲未滿｜意外實支實付 1 萬', ok: false, checks: [false, true, false] }
      ],
      explain: '未滿 15 歲的兒童無法參加一般成人意外或 F 計畫！唯有「團體互助基金 E 計畫（$812）」是 0~15 歲未滿專屬，有意外住院 1,000/日、加護/燒燙傷另 2,000/日、門診手術與骨折未住院！',
      taigi: '水啦！812 元 E 計畫是小朋友最讚的守護傘！'
    },
    {
      id: 'cl2', diff: 'both',
      name: '76 歲愛爬山的春嬌阿姨', avatar: '👵', imgKey: 'char_grandma',
      speech: '「我今年 76 歲，以前沒保過社裡的意外險。現在常出門走走怕跌倒要自費醫材，想第一次加保意外＋實支實付！」',
      clues: ['年齡：76 歲（初次投保）', '需求：意外住院＋實支實付', '重視高齡可續約'],
      options: [
        { title: '社員松年意外互助基金', sub: '年繳 2,000 元｜初次至未滿 80 歲、續約至 85 歲｜含意外實支實付 1 萬＋住院日額 1,000', ok: true, checks: [true, true, true] },
        { title: '社員團體意外互助基金－計畫四', sub: '年繳 2,330 元｜初次限未滿 70 歲、續約至 75 歲', ok: false, checks: [false, false, false] },
        { title: '社員團體互助基金－B 計畫', sub: '年繳 2,420 元｜初次限未滿 70 歲、無意外實支實付', ok: false, checks: [false, false, false] },
        { title: '社員重大疾病互助基金', sub: '年繳 2,820 元｜初次限未滿 65 歲｜7 大重疾 15 萬', ok: false, checks: [false, false, false] }
      ],
      explain: '76 歲已超過一般團體與團體意外的 70 歲初次門檻！唯有「松年意外互助基金（$2,000）」開放未滿 80 歲初次投保（續約至 85 歲），還獨家附帶意外醫療實支實付 1 萬元！',
      taigi: '揪甘心！松年意外就是長輩的頭號救星！'
    },
    {
      id: 'cl3', diff: 'both',
      name: '32 歲業務飛人阿凱', avatar: '✈️', imgKey: 'char_office',
      speech: '「我天天搭高鐵、捷運，還常飛澎湖出差！想花 2,500 元以內拉高空中／陸上大眾運輸意外保障，還要附意外住院與骨折未住院。」',
      clues: ['年齡：32 歲', '需求：大眾運輸加倍＋意外住院骨折', '預算：2,500 元內'],
      options: [
        { title: '社員團體意外－計畫四', sub: '年繳 2,330 元｜意外 200 萬、陸水 400 萬、空中 600 萬＋住院 1,000/日與骨折', ok: true, checks: [true, true, true] },
        { title: '社員團體意外－計畫二', sub: '年繳 1,650 元｜空中 600 萬，但「沒有」意外住院日額與骨折給付', ok: false, checks: [true, false, true] },
        { title: '社員團體互助基金－B 計畫', sub: '年繳 2,420 元｜意外身故 30 萬，無大眾運輸加倍', ok: false, checks: [true, false, true] },
        { title: '社員松年意外互助基金', sub: '年繳 2,000 元｜一般意外 50 萬，無大眾運輸加倍', ok: false, checks: [true, false, true] }
      ],
      explain: '團體意外「計畫四（$2,330）」同時給你最高空中大眾運輸 600 萬、陸水/火災/電梯 400 萬，加上住院 1,000/日、加護 3,000/日、手術 5,000 與骨折未住院！',
      taigi: '超專業！計畫四陸海空加倍又顧住院！'
    },
    {
      id: 'cl4', diff: 'both',
      name: '38 歲家庭支柱建華', avatar: '👨', imgKey: 'char_teacher',
      speech: '「我是家裡唯一經濟來源，希望一張單同時有『最高一般身故＋意外身故＋疾病住院＋意外住院』，年繳預算 5,500 元內！」',
      clues: ['年齡：38 歲（未滿 45 歲）', '需求：一般身故＋疾病住院全包', '預算：5,500 元內'],
      options: [
        { title: '社員團體互助基金－D 計畫', sub: '年繳 5,350 元｜45歲未滿限定！一般身故 50 萬、意外 100 萬、疾病住院 1,000、意外住院 2,000', ok: true, checks: [true, true, true] },
        { title: '社員團體互助基金－C 計畫', sub: '年繳 4,640 元｜一般身故 20 萬、疾病住院 500/日', ok: false, checks: [true, false, true] },
        { title: '社員團體意外－計畫四', sub: '年繳 2,330 元｜純意外險，不含一般身故與疾病住院', ok: false, checks: [true, false, true] },
        { title: '社員防癌－計畫二', sub: '年繳 3,520 元｜僅限癌症相關給付', ok: false, checks: [true, false, true] }
      ],
      explain: '趁未滿 45 歲當然要把握「團體互助基金 D 計畫（$5,350）」！它是團體基金裡保障最頂規的一張：一般身故 50 萬、意外 100 萬、疾病住院 1,000/日、意外住院 2,000/日！',
      taigi: '懂買喔！45 歲前限定 D 計畫滿配超划算！'
    },
    {
      id: 'cl5', diff: 'both',
      name: '28 歲小資女怡君', avatar: '👩', imgKey: 'char_office',
      speech: '「剛出社會手頭緊，家族有心肌梗塞和中風病史，想用一年不到 500 元先補一筆 15 萬元重大疾病應急金！」',
      clues: ['年齡：28 歲（15~40歲未滿）', '需求：心肌梗塞／腦中風等 7 大重疾', '預算：500 元以內'],
      options: [
        { title: '社員重大疾病互助基金', sub: '15~40 歲未滿年繳只要 330 元！保額 15 萬元（涵蓋 7 大重疾）', ok: true, checks: [true, true, true] },
        { title: '社員防癌互助基金－計畫一', sub: '年繳 1,760 元｜僅保障癌症，不含心肌梗塞與腦中風', ok: false, checks: [true, false, false] },
        { title: '社員團體互助基金－F 計畫', sub: '年繳 805 元｜一般身故 5 萬，無重大疾病一次金', ok: false, checks: [true, false, false] },
        { title: '社員團體意外－計畫一', sub: '年繳 820 元｜純意外事故，不含疾病', ok: false, checks: [true, false, false] }
      ],
      explain: '重大疾病互助基金對 15~40 歲未滿的年輕社員超佛心——一年只要「330 元」就能擁有 15 萬元 7 大重疾保障！',
      taigi: '330 元換 15 萬保障，CP 值破表！'
    },
    {
      id: 'cl6', diff: 'both',
      name: '豐年社理監事團隊', avatar: '🏛️', imgKey: 'char_officer',
      speech: '「我們社的理監事平均年紀偏長，大家開會決定全體幹部都要有『一般身故＋疾病住院日額＋門診手術／創傷縫合』的保障！」',
      clues: ['身分：全體社理監事', '需求：含「疾病住院」與一般身故', '全體須選同一方案'],
      options: [
        { title: '各級幹部互助基金－A1 方案', sub: '年繳 3,075 元｜唯一含一般身故 20 萬、疾病住院(500~750/日)、門診手術 1,000', ok: true, checks: [true, true, true] },
        { title: '各級幹部互助基金－A2 方案', sub: '年繳 1,675 元｜純意外高日額(2,000/日)，不含一般身故與疾病住院', ok: false, checks: [true, false, true] },
        { title: '各級幹部互助基金－A3 方案', sub: '年繳 3,000 元｜高意外身故 200 萬＋實支實付 1 萬，不含疾病住院', ok: false, checks: [true, false, true] },
        { title: '一半報 A1、一半報 A3', sub: '違反全體幹部須參加同一方案之規定', ok: false, checks: [true, false, false] }
      ],
      explain: '幹部三方案中只有「A1（$3,075）」涵蓋一般身故 20 萬、疾病住院日額與門診手術／創傷縫合處置！',
      taigi: '精準配對！要顧疾病住院一定要選幹部 A1！'
    },
    {
      id: 'cl10', diff: 'both',
      name: '55 歲精省阿伯', avatar: '👴', imgKey: 'char_grandpa',
      speech: '「我平時生活很省，每年預算 900 元以內，只想補一張最基本的一般身故＋意外身故團體保障就好！」',
      clues: ['年齡：55 歲', '需求：基本一般身故＋意外身故', '預算：900 元以內'],
      options: [
        { title: '社員團體互助基金－F 計畫', sub: '年繳只要 805 元｜一般身故 5 萬、意外身故 15 萬＋重大燒燙傷 2.5 萬', ok: true, checks: [true, true, true] },
        { title: '社員團體互助基金－E 計畫', sub: '年繳 812 元｜僅限 0~15 歲未滿兒童，且無身故保障', ok: false, checks: [false, false, true] },
        { title: '社員團體互助基金－A 計畫', sub: '年繳 1,610 元｜超出 900 元預算', ok: false, checks: [true, true, false] },
        { title: '社員團體意外－計畫一', sub: '年繳 820 元｜純意外險，不含一般身故保障', ok: false, checks: [true, false, true] }
      ],
      explain: '「團體互助基金 F 計畫（$805）」是全系列最親民的成人基本壽險＋意外保障方案，一年不到千元就有一般身故 5 萬與意外身故 15 萬！',
      taigi: '精打細算！805 元 F 計畫入門無負擔！'
    },
    {
      id: 'cl11', diff: 'both',
      name: '35 歲新婚雅婷', avatar: '👩', imgKey: 'char_office',
      speech: '「因為家族長輩有癌症病史，我想專攻癌症住院日額 2,000 元、外科手術 6 萬元的高額防癌保障，預算 4,000 元內！」',
      clues: ['年齡：35 歲（未滿 65 歲）', '需求：癌症住院 2,000＋手術 6 萬', '預算：4,000 元內'],
      options: [
        { title: '社員防癌互助基金－計畫二', sub: '年繳 3,520 元｜癌症住院 2,000/日、外科手術 6 萬/次、門診 1,600、身故 20 萬', ok: true, checks: [true, true, true] },
        { title: '社員防癌互助基金－計畫一', sub: '年繳 1,760 元｜癌症住院 1,000/日、手術 3 萬（未達加倍需求）', ok: false, checks: [true, false, true] },
        { title: '社員防癌互助基金－計畫三', sub: '年繳 4,550 元｜限滿 70 歲舊保戶續約銜接', ok: false, checks: [false, false, false] },
        { title: '社員重大疾病互助基金', sub: '保額 15 萬一次金，不含分項癌症住院手術給付', ok: false, checks: [true, false, true] }
      ],
      explain: '防癌「計畫二（$3,520）」給付金額為計畫一的雙倍：癌症住院 2,000/日、外科手術 60,000/次、門診 1,600/次、癌症身故 20 萬元！',
      taigi: '計畫二雙倍防護，有家族史趁年輕保起來最安心！'
    },
    {
      id: 'cl12', diff: 'both',
      name: '60 歲商務飛人林董', avatar: '✈️', imgKey: 'char_teacher',
      speech: '「我自己已經有很完整的住院醫療險了，現在預算 2,000 元內，只想要最高額度的純意外身故保障（特別是搭飛機空中 600 萬）！」',
      clues: ['年齡：60 歲（未滿 70 歲）', '需求：純意外空中 600 萬（免住院日額）', '預算：2,000 元內'],
      options: [
        { title: '社員團體意外－計畫二', sub: '年繳 1,650 元｜一般意外 200 萬、陸水 400 萬、空中 600 萬、燒燙傷 80 萬', ok: true, checks: [true, true, true] },
        { title: '社員團體意外－計畫四', sub: '年繳 2,330 元｜雖有空中 600 萬，但含重複住院醫療且超過 2,000 元預算', ok: false, checks: [true, true, false] },
        { title: '社員團體意外－計畫一', sub: '年繳 820 元｜空中大眾運輸為 300 萬，非最高 600 萬', ok: false, checks: [true, false, true] },
        { title: '社員松年意外互助基金', sub: '年繳 2,000 元｜一般意外 50 萬，無空中大眾運輸加倍', ok: false, checks: [true, false, true] }
      ],
      explain: '如果本身已有住院醫療、只想拉高身故槓桿，「團體意外計畫二（$1,650）」CP 值最高：空中 600 萬、陸水 400 萬、一般意外 200 萬一次到位！',
      taigi: '超聰明配法！1,650 元直接拉滿空中 600 萬！'
    },
    // --- Hard 進階配對 ---
    {
      id: 'cl7', diff: 'hard',
      name: '71 歲舊防癌保戶阿珠姐', avatar: '👵', imgKey: 'char_grandma',
      speech: '「我從 60 歲就一直續保防癌計畫一而且從未罹癌，今年剛滿 70 歲過生日，還能繼續保防癌嗎？要轉哪個計畫？」',
      clues: ['年齡：71 歲', '資歷：原保防癌計畫一且未罹癌', '需求：延續防癌保障至 75 歲'],
      options: [
        { title: '社員防癌互助基金－計畫三', sub: '年繳 4,550 元｜專供已保計畫一/二且未罹癌續約社員滿 70 歲銜接至滿 75 歲', ok: true, checks: [true, true, true] },
        { title: '繼續續約防癌計畫一', sub: '計畫一、二續約年齡僅至滿 70 歲止', ok: false, checks: [false, true, false] },
        { title: '改轉防癌計畫二加倍保障', sub: '計畫二續約也只到滿 70 歲，無法續保', ok: false, checks: [false, false, false] },
        { title: '已滿 70 歲無法再保防癌', sub: '其實還有計畫三可以續保 5 年喔！', ok: false, checks: [false, false, false] }
      ],
      explain: '防癌計畫一、二雖只續約至滿 70 歲，但未罹癌的舊保戶滿 70 歲後可無縫銜接「防癌計畫三（$4,550）」繼續保障到滿 75 歲止！',
      taigi: '真內行！滿 70 歲別忘了幫舊保戶接防癌計畫三！'
    },
    {
      id: 'cl8', diff: 'hard',
      name: '星光社幹部預算審查會', avatar: '🎖️', imgKey: 'char_officer',
      speech: '「我們社年度預算有限，希望幹部互助費控制在每人 2,000 元以內，但又想把意外住院日額、加護病房跟意外住院手術津貼拉到最高！」',
      clues: ['身分：全體社幹部', '預算：每人 2,000 元以內', '重點：意外住院 2,000／加護 6,000／手術 1 萬'],
      options: [
        { title: '各級幹部互助基金－A2 方案', sub: '年繳僅 1,675 元！意外住院 2,000/日、加護/燒燙傷 6,000/日、住院手術 1 萬元（三方案最高！）', ok: true, checks: [true, true, true] },
        { title: '各級幹部互助基金－A3 方案', sub: '年繳 3,000 元超預算；且意外住院 1,000/日、手術 5,000 元較 A2 低', ok: false, checks: [true, false, false] },
        { title: '各級幹部互助基金－A1 方案', sub: '年繳 3,075 元超預算；手術津貼僅 2,500 元', ok: false, checks: [true, false, false] },
        { title: '社員團體意外－計畫四', sub: '年繳 2,330 元超預算，且非幹部專屬方案', ok: false, checks: [false, false, false] }
      ],
      explain: '「幹部 A2 方案（$1,675）」是意外醫療日額神單：保費最親民，意外住院 2,000 元、加護 6,000 元、手術 1 萬元全是三方案最高！',
      taigi: '挖到寶啦！幹部 A2 便宜又大碗！'
    },
    {
      id: 'cl9', diff: 'hard',
      name: '46 歲剛滿 45 歲的 D 計畫續約社員', avatar: '👨‍💼', imgKey: 'char_office',
      speech: '「我原本參加社員團體 D 計畫，今年剛滿 45 足歲了！我希望繼續保留『疾病住院日額』保障，續約該轉哪個計畫？」',
      clues: ['年齡：46 歲（原 D 計畫續約）', '需求：一定要保留疾病住院日額', '續約轉軌規則'],
      options: [
        { title: '轉至社員團體－C 計畫', sub: '年繳 4,640 元｜滿 45 歲後唯一仍含疾病住院 500/日＋意外住院 1,000/日，可續至 75 歲', ok: true, checks: [true, true, true] },
        { title: '繼續續約團體 D 計畫至 75 歲', sub: 'D 計畫滿 45 足歲後必須轉至 A、B、C、F 計畫', ok: false, checks: [false, true, false] },
        { title: '轉至社員團體－B 計畫', sub: 'B 計畫僅含意外住院，沒有疾病住院日額', ok: false, checks: [true, false, true] },
        { title: '轉至社員團體－A 計畫', sub: 'A 計畫僅有身故與燒燙傷，無住院日額', ok: false, checks: [true, false, true] }
      ],
      explain: '團體基金規定 D 計畫滿 45 足歲後可轉至 A、B、C、F 繼續至 75 歲；其中只有「C 計畫（$4,640）」仍包含疾病住院日額（每日 500 元）！',
      taigi: '算得清清楚楚！轉 C 計畫疾病住院不中斷！'
    },
    {
      id: 'cl13', diff: 'hard',
      name: '海風社理監事出差團', avatar: '🎖️', imgKey: 'char_officer',
      speech: '「我們社理監事常搭高鐵、飛離島開會，希望全體幹部方案有『空中 600 萬＋特定意外 400 萬＋意外醫療實支實付 1 萬』，預算每人 3,000 元！」',
      clues: ['身分：全體社幹部', '需求：空中 600 萬＋實支實付 1 萬', '預算：每人 3,000 元'],
      options: [
        { title: '各級幹部互助基金－A3 方案', sub: '年繳 3,000 元｜意外身故 200 萬、陸水 400 萬、空中 600 萬＋實支實付 1 萬元！', ok: true, checks: [true, true, true] },
        { title: '各級幹部互助基金－A1 方案', sub: '年繳 3,075 元｜無特定大眾運輸加倍與實支實付', ok: false, checks: [true, false, false] },
        { title: '各級幹部互助基金－A2 方案', sub: '年繳 1,675 元｜無特定大眾運輸加倍與實支實付', ok: false, checks: [true, false, true] },
        { title: '社員團體意外－計畫四', sub: '年繳 2,330 元｜無意外醫療實支實付，非幹部專屬方案', ok: false, checks: [false, false, true] }
      ],
      explain: '「幹部 A3（$3,000）」是唯一同時擁有特定大眾運輸最高 600 萬、高意外身故 200 萬、且獨家附帶「意外傷害醫療實支實付 1 萬元」的幹部方案！',
      taigi: '出差幹部必選 A3，高倍數又有實支實付！'
    },
    {
      id: 'cl14', diff: 'hard',
      name: '30 歲上班族小宇', avatar: '🧑‍💻', imgKey: 'char_office',
      speech: '「我預算 2,500 元以內，想在一張團體單裡兼顧『一般身故 10 萬＋意外身故 30 萬＋意外住院 1,000/日＋門診手術 2,000＋住院手術 5,000』！」',
      clues: ['年齡：30 歲', '需求：一般身故＋意外住院／門診手術', '預算：2,500 元內'],
      options: [
        { title: '社員團體互助基金－B 計畫', sub: '年繳 2,420 元｜一般 10 萬、意外 30 萬、意外住院 1,000/日、門診手術 2,000、住院手術 5,000', ok: true, checks: [true, true, true] },
        { title: '社員團體互助基金－A 計畫', sub: '年繳 1,610 元｜無意外住院日額與手術津貼', ok: false, checks: [true, false, true] },
        { title: '社員團體互助基金－C 計畫', sub: '年繳 4,640 元｜超出 2,500 元預算', ok: false, checks: [true, true, false] },
        { title: '社員團體意外－計畫四', sub: '年繳 2,330 元｜純意外險，不含一般身故保障', ok: false, checks: [true, false, true] }
      ],
      explain: '「社員團體 B 計畫（$2,420）」正好介於 A 與 C 之間：保留一般身故 10 萬，又多了意外住院 1,000/日、加護另 2,000/日、門診手術 2,000 與住院手術 5,000！',
      taigi: 'B 計畫小資全能，門診手術 2 千嘛有賠！'
    }
  ],

  /* ==================== 攤位 3：理賠神算偵探社（10 經典題＋動態題生成器） ==================== */
  detectiveCases: [
    {
      id: 'dt1', diff: 'both', tag: 'LP 貸款安全｜因病削減',
      title: '案件 01：貸款 4 個月突發高血壓',
      story: '某社員 64 歲（太陽社最高給付 60 萬），於 110 年 2 月 1 日貸款 40 萬元，110 年 6 月 10 日因「高血壓（疾病）」不幸身故，當日貸款結餘為 30 萬元且無逾期。',
      timeline: [
        { label: '貸款日', val: '110/02/01（貸 40 萬）' },
        { label: '身故日', val: '110/06/10（經 4 個月餘）' },
        { label: '身故原因', val: '高血壓（因病）' },
        { label: '貸款結餘', val: '300,000 元' }
      ],
      clueIndex: 1,
      clueHint: '🔑 LP 因病削減表：0~3 月 0%、3~6 月未滿 25%、6~9 月未滿 50%、9~12 月未滿 75%、12 月後 100%！本案經 4 個月餘，適用 25% 乘以貸款結餘！',
      question: '請問貸款安全互助基金 (LP) 可給付多少互助金償還貸款？',
      choices: [
        { amount: '75,000 元', reason: '因病 3~6 個月未滿 → 結餘 × 25%', ok: true },
        { amount: '300,000 元', reason: '全額 100% 償還結餘', ok: false },
        { amount: '150,000 元', reason: '依比例給付 50%', ok: false },
        { amount: '0 元', reason: '未滿半年不予給付', ok: false }
      ],
      explain: 'LP 因病死亡削減規定：貸款後 3~6 個月未滿給付比例為 25%。故 300,000 × 25% = 75,000 元！（PDF 原文經典例題！）',
      taigi: '神算喔！因病 3 到 6 個月未滿就是 25%！'
    },
    {
      id: 'dt2', diff: 'both', tag: 'LP 貸款安全｜意外身故',
      title: '案件 02：貸款 7 個月遭遇車禍意外',
      story: '某社員 64 歲（該社最高給付 40 萬），於 110 年 1 月 10 日向儲互社貸款 30 萬元，110 年 8 月 10 日因「車禍意外」身故，當日貸款結餘為 20 萬元且還款正常。',
      timeline: [
        { label: '貸款日', val: '110/01/10（貸 30 萬）' },
        { label: '身故日', val: '110/08/10（經 7 個月）' },
        { label: '身故原因', val: '車禍（意外死亡）' },
        { label: '貸款結餘', val: '200,000 元' }
      ],
      clueIndex: 2,
      clueHint: '🔑 關鍵破案線索在「車禍（意外死亡）」！LP 條文規定：意外所致死亡或永久完全失能，不受 12 個月削減表限制，依結餘 100% 全額給付！',
      question: '這次是「車禍意外」死亡，LP 互助金應給付多少？',
      choices: [
        { amount: '200,000 元', reason: '意外死亡不受削減限制 → 結餘 × 100%', ok: true },
        { amount: '100,000 元', reason: '6~9 個月未滿削減為 50%', ok: false },
        { amount: '150,000 元', reason: '依 75% 比例計算', ok: false },
        { amount: '300,000 元', reason: '以原始貸款金額給付', ok: false }
      ],
      explain: 'LP 條文清楚寫明：「意外所致死亡或永久完全失能之給付，不受 12 個月削減限制」！在社最高額度 40 萬內，依結餘 200,000 × 100% 全額給付！',
      taigi: '記超牢！意外死亡免削減，結餘全額給付！'
    },
    {
      id: 'dt3', diff: 'both', tag: '團體意外｜大眾運輸加倍',
      title: '案件 03：搭高鐵遇重大事故',
      story: '阿文參加「社員團體意外互助基金－計畫四（年繳 2,330 元）」，某日搭乘高鐵（陸上大眾運輸工具）不幸發生意外身故。',
      timeline: [
        { label: '投保方案', val: '團體意外－計畫四' },
        { label: '一般意外保額', val: '200 萬元' },
        { label: '事故地點', val: '高鐵（陸上大眾運輸）' }
      ],
      clueIndex: 2,
      clueHint: '🔑 團體意外計畫四特定事故表：一般意外 200 萬、陸水大眾運輸／火災／電梯 400 萬、空中大眾運輸 600 萬（均已含一般意外）！',
      question: '家屬總共可以領到多少意外身故互助金（含一般意外身故）？',
      choices: [
        { amount: '400 萬元', reason: '計畫四陸上大眾運輸特定事故（含一般）', ok: true },
        { amount: '200 萬元', reason: '僅給付一般意外身故 200 萬', ok: false },
        { amount: '600 萬元', reason: '比照空中大眾運輸 600 萬', ok: false },
        { amount: '300 萬元', reason: '比照計畫三空中運輸 300 萬', ok: false }
      ],
      explain: '團體意外「計畫四」特定事故：陸上／水上大眾運輸、公共建築物火災、電梯為 400 萬元（含一般意外身故 200 萬）；空中大眾運輸才為 600 萬元！',
      taigi: '破案成功！計畫四搭高鐵是 400 萬喔！'
    },
    {
      id: 'dt4', diff: 'both', tag: '重大疾病｜60 日等待期',
      title: '案件 04：核保第 45 天突發重度心肌梗塞',
      story: '阿明初次投保「社員重大疾病互助基金（保額 15 萬）」，契約於 10 月 1 日生效。結果在生效後第 45 天（11 月 14 日）突發急性心肌梗塞（重度）。',
      timeline: [
        { label: '契約生效日', val: '10 月 1 日' },
        { label: '發病日', val: '生效後第 45 天' },
        { label: '診斷病名', val: '急性心肌梗塞（重度）' }
      ],
      clueIndex: 1,
      clueHint: '🔑 紅旗警告！防癌與團體疾病等待期是 31 天，但「重大疾病互助基金」等待期是持續有效「60 日以後」！第 45 天尚未滿 60 天！',
      question: '請問這次重大疾病互助基金可以給付多少？',
      choices: [
        { amount: '0 元', reason: '未滿 60 日等待期，不在給付範圍', ok: true },
        { amount: '150,000 元', reason: '已超過 30 天即可全額給付', ok: false },
        { amount: '75,000 元', reason: '等待期內折半給付 50%', ok: false },
        { amount: '37,500 元', reason: '依 25% 比例給付', ok: false }
      ],
      explain: '魔鬼藏在天數裡！防癌和團體 C/D 疾病等待期是「第 31 天起」，但重大疾病等待期是「契約生效日起持續有效 60 日以後」！第 45 天還在等待期內，故不予給付。',
      taigi: '好眼力！重大疾病等待期是 60 天，不是 30 天喔！'
    },
    {
      id: 'dt5', diff: 'both', tag: 'LS 人壽儲蓄｜因病扣前 6 月',
      title: '案件 05：57 歲心臟病身故的股金加值',
      story: '某社員 57 歲，於 110 年 8 月 2 日因「心臟病（疾病）」死亡，當日股金結餘 75,000 元；半年前（110 年 2 月 1 日）股金結餘為 73,000 元（每月存入均未超 3,000 元，社上限 10 萬）。',
      timeline: [
        { label: '年齡階段', val: '57 歲（60足歲前 100%）' },
        { label: '死亡前 6 個月結餘', val: '73,000 元' },
        { label: '死亡當日結餘', val: '75,000 元（因病死亡）' }
      ],
      clueIndex: 2,
      clueHint: '🔑 LS 條文關鍵：因病（或自然）死亡時，須扣除「死亡日往前 6 個月所存股金」（意外死亡才不扣）！故以半年前結餘計算！',
      question: '家屬除了領回原本股金外，LS 人壽儲蓄互助金可領多少？',
      choices: [
        { amount: '73,000 元', reason: '因病扣死亡前 6 個月所存股金 → 73,000 × 100%', ok: true },
        { amount: '75,000 元', reason: '依死亡當日結餘全額給付', ok: false },
        { amount: '54,750 元', reason: '73,000 × 75% 計算', ok: false },
        { amount: '0 元', reason: '因病死亡無法領取 LS', ok: false }
      ],
      explain: 'LS 規定：因病（自然）死亡時，自死亡日往前 6 個月所存股金（本案近半年存的 2,000 元）扣除不計；如果是「車禍意外死亡」就不扣，可領 75,000 元！',
      taigi: '厲害喔！因病要扣前 6 個月存入的股金！'
    },
    {
      id: 'dt6', diff: 'hard', tag: 'LS 人壽儲蓄｜退股降級陷阱',
      title: '案件 06：62 歲退股 1 萬後又補存 2 萬！',
      story: '（PDF 最經典魔王題！）社員 60 足歲前股金結餘為 60,000 元；62 歲時退股 10,000 元（結餘剩 50,000 元）；之後又續存 20,000 元，於 64 歲意外身故時股金結餘為 70,000 元。',
      timeline: [
        { label: '60 足歲前', val: '結餘 60,000 元 (100%)' },
        { label: '62 歲退股 1 萬', val: '結餘降為 50,000 元！' },
        { label: '62~64 歲續存 2 萬', val: '64 歲身故結餘 70,000 元' }
      ],
      clueIndex: 1,
      clueHint: '🔑 LS 退股水位鐵律：62 歲退股後結餘剩 50,000，導致 60 歲前 100% 額度永久降為 50,000；後面補存的 20,000 只能用 60~65 歲級距 75% 計！',
      question: '這筆退股把 60 歲前水位拉低了！請問最終 LS 最高給付金額是多少？',
      choices: [
        { amount: '65,000 元', reason: '50,000×100% + 20,000×75% = 65,000', ok: true },
        { amount: '67,500 元', reason: '60,000×100% + 10,000×75% = 67,500', ok: false },
        { amount: '70,000 元', reason: '意外身故全額 70,000×100%', ok: false },
        { amount: '52,500 元', reason: '全部按 64 歲 75% 計算', ok: false }
      ],
      explain: 'LS 退股鐵律：退股後結餘（50,000）低於前年齡級距所存（60,000），所以 60 足歲前 100% 額度永久降為 50,000！後續補存的 20,000 只能算 60~65 歲的 75%（15,000），合計 65,000 元！',
      taigi: '哇你太神了！這題連資深幹部都會算錯！'
    },
    {
      id: 'dt7', diff: 'hard', tag: 'LP 貸款安全｜逾期 18 個月',
      title: '案件 07：逾期 18 個月又逢意外身故',
      story: '某社員 55 歲向社貸款 50 萬元，借據約定每月應還 10,000 元。至意外身故日止累計應還 300,000 元，但實際只還了 120,000 元（貸款結餘尚有 38 萬）。',
      timeline: [
        { label: '應還金額', val: '300,000 元' },
        { label: '實際已還', val: '120,000 元（差額 18 萬）' },
        { label: '每月應還', val: '10,000 元' }
      ],
      clueIndex: 1,
      clueHint: '🔑 逾期月數 = (30萬 - 12萬) ÷ 1萬 = 18 個月！LP 明訂逾期累積達「18 個月（含）」者，不論意外或疾病均不予給付！',
      question: '先算逾期月數：(應還－實還) ÷ 每月應還！請問 LP 可給付多少？',
      choices: [
        { amount: '0 元', reason: '逾期達 18 個月(含) → 不予給付！', ok: true },
        { amount: '380,000 元', reason: '因為是意外身故，全額給付', ok: false },
        { amount: '180,000 元', reason: '扣除逾期部分後給付差額', ok: false },
        { amount: '190,000 元', reason: '逾期減半給付 50%', ok: false }
      ],
      explain: '逾期月數 = (300,000 - 120,000) ÷ 10,000 = 18 個月！LP 規定貸款逾期未還累積超過「18 個月（含）」者，不論意外或疾病均不予給付！',
      taigi: '算盤打超準！逾期滿 18 個月含在內就不給付！'
    },
    {
      id: 'dt8', diff: 'hard', tag: 'LS 107 年上限規則',
      title: '案件 08：太陽社 106 年底 13.5 萬股金上限謎題',
      story: '太陽社於 106/12/31 社個人最高給付上限為 16 萬元。社員乙於 106/12/31 合格股金結餘為 135,000 元，107 年 1、2 月又各存入 2,000 元使股金結餘來到 139,000 元（均在 60 足歲前且未退股）。',
      timeline: [
        { label: '社 106 年上限', val: '160,000 元' },
        { label: '106/12/31 結餘', val: '135,000 元（已超 10 萬）' },
        { label: '107/02/15 結餘', val: '139,000 元' }
      ],
      clueIndex: 1,
      clueHint: '🔑 107/1/1 調整條文：106 年底已超過 10 萬但未達社上限者，直接鎖定「106/12/31 當時之結餘」為未來最高給付上限！',
      question: '依 107/1/1 調整規定，社員乙的「未來最高給付金額」是多少？',
      choices: [
        { amount: '135,000 元', reason: '鎖定 106/12/31 當時之結餘', ok: true },
        { amount: '139,000 元', reason: '可繼續往上累積到 16 萬社上限', ok: false },
        { amount: '100,000 元', reason: '一律砍回 10 萬元上限', ok: false },
        { amount: '160,000 元', reason: '直接享有社最高上限 16 萬', ok: false }
      ],
      explain: '107/1/1 調整條文：107/1/1 前股金已超過 10 萬但未達 106 年度社上限者，以「106 年 12 月 31 日之股金結餘（135,000 元）」鎖定為未來最高給付金額！',
      taigi: '專業督導等級！106 年底結餘鎖定這題都難不倒你！'
    },
    {
      id: 'dt9', diff: 'hard', tag: '防癌基金｜升級等待期重算',
      title: '案件 09：防癌計畫一升級計畫二第 20 天確診',
      story: '小芬保防癌「計畫一」已滿 3 年。今年 6 月 1 日續約時通過健康聲明書升級為「計畫二」，結果在 6 月 20 日（升級生效第 20 天）確診罹癌並住院 5 天！',
      timeline: [
        { label: '原保資歷', val: '計畫一續約 3 年' },
        { label: '6/1 續約升級', val: '改選計畫二（等待期重算！）' },
        { label: '6/20 確診', val: '新計畫生效第 20 天' }
      ],
      clueIndex: 1,
      clueHint: '🔑 防癌條文規定：年度續約由「計畫一改選計畫二」時，須附健康聲明書核保，且「31 天等待期需重新計算」！',
      question: '依防癌基金「等待期間」條文，這次轉換計畫二的等待期會怎麼處理？',
      choices: [
        { amount: '等待期需重新計算（31天）', reason: '計畫一升計畫二須重算 31 天等待期', ok: true },
        { amount: '免等待期直接領計畫二雙倍', reason: '因已續保 3 年直接享有住院 2,000/日', ok: false },
        { amount: '須重新計算 60 天等待期', reason: '防癌升級等待期為 60 天', ok: false },
        { amount: '因升級違規直接撤銷原契約', reason: '原保障一併作廢', ok: false }
      ],
      explain: '防癌互助基金明確規定：「由計畫一改選擇計畫二時，其等待期（第 31 天起）需重新計算！」轉換計畫前一定要提醒社員注意喔！',
      taigi: '抓到重點！防癌一升二等待期愛重算 31 天！'
    },
    {
      id: 'dt10', diff: 'hard', tag: '團體意外｜骨折未住院比例',
      title: '案件 10：滑倒骨頭龜裂未住院怎麼算？',
      story: '阿華參加「團體意外計畫四（住院日額 1,000 元）」，在家滑倒導致手腕「龜裂（未住院）」，假設該部位表訂骨折日數為 40 日。',
      timeline: [
        { label: '投保計畫', val: '團體意外計畫四（日額 1,000 元）' },
        { label: '傷勢程度', val: '龜裂（未住院）' },
        { label: '表訂骨折日數', val: '40 日' }
      ],
      clueIndex: 1,
      clueHint: '🔑 骨折未住院口訣：完全骨折 1/2、不完全骨折 1/4、龜裂 1/8！算法 = 表訂日數 × 住院日額 × 比例！',
      question: '依「完全骨折 1/2、不完全骨折 1/4、龜裂 1/8」計算，可領多少？',
      choices: [
        { amount: '5,000 元', reason: '40 日 × 1,000 元 × 1/8', ok: true },
        { amount: '10,000 元', reason: '誤以 1/4 計算', ok: false },
        { amount: '20,000 元', reason: '誤以 1/2 計算', ok: false },
        { amount: '0 元', reason: '沒有住院就完全不能申請', ok: false }
      ],
      explain: '意外計畫三/四、松年意外及團體 B/C/D/E 皆含「骨折未住院給付」：40 × 1,000 × 1/8 = 5,000 元！',
      taigi: '龜裂也有得領！1/2、1/4、1/8 口訣記起來！'
    }
  ],

  // 動態數學試算題產生器（每次遊玩都會隨機出不同金額、月數與傷勢，大幅提升耐玩度！）
  buildDynamicDetectiveCases(isHard) {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const out = [];

    // Dynamic 1: LP Loan Reduction / Accident randomizer
    const bal = pick([200000, 280000, 320000, 400000]);
    const scenarios = [
      { months: '2 個月（未滿 3 月）', cause: '急性肺炎（因病）', rate: 0, label: '0%' },
      { months: '5 個月（3~6 月未滿）', cause: '心肌梗塞（因病）', rate: 0.25, label: '25%' },
      { months: '8 個月（6~9 月未滿）', cause: '肝病惡化（因病）', rate: 0.5, label: '50%' },
      { months: '10 個月（9~12 月未滿）', cause: '中風（因病）', rate: 0.75, label: '75%' },
      { months: '5 個月（未滿半年）', cause: '工地墜落（意外死亡）', rate: 1.0, label: '100%（意外免削減）' }
    ];
    const sc = pick(scenarios);
    const ans = Math.round(bal * sc.rate);
    const candRates = [0, 0.25, 0.5, 0.75, 1.0].filter(r => r !== sc.rate);
    const distractors = candRates.sort(() => Math.random() - 0.5).slice(0, 3).map(r => ({
      amount: `${Math.round(bal * r).toLocaleString()} 元`,
      reason: r === 0 ? '未達最低期間不給付' : `依結餘 × ${Math.round(r * 100)}% 計算`,
      ok: false
    }));
    out.push({
      id: 'dyn_lp_' + Date.now(),
      diff: 'both',
      tag: '🎲 隨機精算｜LP 貸款安全',
      title: `現場卷宗：貸款 ${sc.months.split('（')[0]} 突發事故`,
      story: `某 58 歲社員向儲互社貸款並正常還款（無逾期、未超社上限）。貸款經過 ${sc.months} 時因「${sc.cause}」不幸身故，當日貸款結餘為 ${bal.toLocaleString()} 元。`,
      timeline: [
        { label: '貸款結餘', val: `${bal.toLocaleString()} 元` },
        { label: '貸款經過期間', val: sc.months },
        { label: '事故原因', val: sc.cause },
        { label: '繳款紀錄', val: '正常無逾期' }
      ],
      clueIndex: sc.rate === 1.0 ? 2 : 1,
      clueHint: sc.rate === 1.0
        ? '🔑 破案紅旗在「意外死亡」！LP 意外身故不受 12 個月削減限制，直接按貸款結餘 100% 給付！'
        : `🔑 LP 因病削減表：0~3月 0%、3~6月 25%、6~9月 50%、9~12月 75%、滿12月 100%。本案適用 ${sc.label}！`,
      question: `本案 LP 貸款安全互助金應給付多少元？`,
      choices: [
        { amount: `${ans.toLocaleString()} 元`, reason: `適用給付比例 ${sc.label}`, ok: true },
        ...distractors
      ],
      explain: `依 LP 給付規則，本案比例為 ${sc.label}，${bal.toLocaleString()} × ${Math.round(sc.rate * 100)}% = ${ans.toLocaleString()} 元！`,
      taigi: '現算現準！換個數字嘛難不倒你！'
    });

    // Dynamic 2: Fracture without hospitalization randomizer
    const daily = pick([500, 1000]);
    const planName = daily === 1000 ? '松年意外（住院日額 1,000 元）' : '團體意外計畫三（住院日額 500 元）';
    const days = pick([24, 32, 40, 48]);
    const sev = pick([
      { name: '完全骨折（未住院）', frac: 0.5, fracText: '1/2' },
      { name: '不完全骨折（未住院）', frac: 0.25, fracText: '1/4' },
      { name: '骨頭龜裂（未住院）', frac: 0.125, fracText: '1/8' }
    ]);
    const fAns = Math.round(days * daily * sev.frac);
    const otherFracs = [0.5, 0.25, 0.125, 1.0].filter(f => f !== sev.frac);
    const fDistractors = otherFracs.map(f => ({
      amount: `${Math.round(days * daily * f).toLocaleString()} 元`,
      reason: f === 1.0 ? '誤用全額住院日額計算' : `誤以比例 1/${Math.round(1 / f)} 計算`,
      ok: false
    }));
    out.push({
      id: 'dyn_frac_' + Date.now(),
      diff: 'both',
      tag: '🎲 隨機精算｜骨折未住院',
      title: `現場卷宗：${sev.name}理賠試算`,
      story: `社員投保「${planName}」，不慎跌倒造成「${sev.name}」，醫師開立診斷書該部位骨折表訂日數為 ${days} 日。`,
      timeline: [
        { label: '投保方案', val: planName },
        { label: '傷勢類型', val: sev.name },
        { label: '表訂骨折日數', val: `${days} 日` }
      ],
      clueIndex: 1,
      clueHint: `🔑 骨折未住院公式：完全骨折 1/2、不完全骨折 1/4、龜裂 1/8。本案為 ${sev.name}，應以 ${days} 日 × ${daily} 元 × ${sev.fracText} 計算！`,
      question: '這筆骨折未住院給付總共可以領到多少元？',
      choices: [
        { amount: `${fAns.toLocaleString()} 元`, reason: `${days} 日 × ${daily} 元 × ${sev.fracText}`, ok: true },
        ...fDistractors
      ],
      explain: `骨折未住院依程度給 1/2、1/4、1/8：${days} × ${daily.toLocaleString()} × ${sev.fracText} = ${fAns.toLocaleString()} 元！`,
      taigi: '骨折公式熟透透，一秒就算出答案！'
    });

    if (isHard) {
      // Dynamic 3 (Hard): LS age-tier withdrawal calculation
      const pre60 = pick([60000, 80000]);
      const wd = pick([10000, 20000]);
      const addAfter = pick([20000, 40000]);
      const lowWater = pre60 - wd;
      const lsAns = lowWater + Math.round(addAfter * 0.75);
      out.push({
        id: 'dyn_ls_' + Date.now(),
        diff: 'hard',
        tag: '🎲 魔王隨機精算｜LS 退股水位',
        title: `現場卷宗：61 歲退股 ${wd / 10000} 萬再補存 ${addAfter / 10000} 萬`,
        story: `社員 60 足歲前股金結餘 ${pre60.toLocaleString()} 元；61 歲時退股 ${wd.toLocaleString()} 元，之後於 62~63 歲又續存 ${addAfter.toLocaleString()} 元，64 歲意外身故。`,
        timeline: [
          { label: '60 足歲前結餘', val: `${pre60.toLocaleString()} 元 (100%)` },
          { label: `61 歲退股 ${wd / 10000} 萬`, val: `結餘跌至 ${lowWater.toLocaleString()} 元！` },
          { label: '62~63 歲補存', val: `續存 ${addAfter.toLocaleString()} 元 (75%級距)` }
        ],
        clueIndex: 1,
        clueHint: `🔑 退股後結餘 ${lowWater.toLocaleString()} 元成為新的 100% 額度上限；後續在 60~65 歲間補存的 ${addAfter.toLocaleString()} 元僅按 75% 計！`,
        question: '經退股降級重算後，本案 LS 互助金最高可領多少？',
        choices: [
          { amount: `${lsAns.toLocaleString()} 元`, reason: `${lowWater.toLocaleString()}×100% + ${addAfter.toLocaleString()}×75%`, ok: true },
          { amount: `${(lowWater + addAfter).toLocaleString()} 元`, reason: '誤將全部結餘皆以 100% 計', ok: false },
          { amount: `${Math.round((lowWater + addAfter) * 0.75).toLocaleString()} 元`, reason: '誤將全部結餘皆打 75 折', ok: false },
          { amount: `${(pre60 + Math.round((addAfter - wd) * 0.75)).toLocaleString()} 元`, reason: '誤以為 60 歲前額度不會下降', ok: false }
        ],
        explain: `60 歲前水位被拉低為 ${lowWater.toLocaleString()} 元（100%），補存的 ${addAfter.toLocaleString()} 元算 75%（${Math.round(addAfter * 0.75).toLocaleString()} 元），合計 ${lsAns.toLocaleString()} 元！`,
        taigi: '魔王級精算師就是你啦！'
      });
    }

    return out;
  },

  /* ==================== 攤位 4：互助人生 85 歲衝刺（真輪盤雙風險＋跨齡延續！） ==================== */
  lifeStages: [
    {
      ageLabel: '1 歲', stageTitle: '新生兒入社！黃金起步站', icon: '👶',
      story: '爸媽帶你加入儲蓄互助社！預算有限，趁出生剛出院把基礎兒童防護網搭好吧～',
      budget: 5000,
      riskRadar: '學步摔傷骨折 ／ 幼兒癌症住院',
      actions: [
        { id: 'buy_e', label: '保「團體 E 計畫」(0~15歲兒童專屬)', cost: 812, tag: '意外住院/骨折', lsAdd: 0, policy: 'E' },
        { id: 'buy_c1', label: '保「防癌計畫一」(出生正常出院即可保)', cost: 1760, tag: '癌症醫療', lsAdd: 0, policy: 'CANCER1', grants: 'cancerPrior' },
        { id: 'save_ls_1', label: '幫寶寶存股金 3,000 元 (滿6月 100% 加值)', cost: 3000, tag: 'LS 100%級距', lsAdd: 3000, lsRate: 1.0 }
      ],
      events: [
        {
          wedgeLabel: '沙發摔傷骨折', wedgeColor: '#E88B5A',
          title: '🎲 命運輪盤：學步期爬沙發摔落，手肘骨折未住院！',
          needPolicy: 'E',
          hitText: '幸好有保【團體 E 計畫】！理賠骨折未住院＋急診門診手術，守住 12,000 元醫藥費！',
          missText: '沒保團體 E 計畫，爸媽只好自掏腰包 12,000 元照顧費用（還好寶寶平安康復）。',
          shieldGain: 12000, missLoss: 12000
        },
        {
          wedgeLabel: '幼兒腫瘤治療', wedgeColor: '#C75284',
          title: '🎲 命運輪盤：健檢發現幼兒罕見腫瘤，需住院治療 6 天！',
          needPolicy: 'CANCER1',
          hitText: '還好出生出院就保了【防癌計畫一】！住院＋手術給付立即到位，守住 18,000 元！',
          missText: '沒想到這麼小也會遇到癌症風險，自費醫療花了 15,000 元（防癌出生正常出院就能保喔！）。',
          shieldGain: 18000, missLoss: 15000
        }
      ]
    },
    {
      ageLabel: '24 歲', stageTitle: '社會新鮮人！小資高 CP 值配置', icon: '🧑‍💻',
      story: '剛出社會每天騎車通勤！E 計畫已滿 15 歲結束，現在 15~40 歲未滿正是重大疾病 $330 超低費率時期！',
      budget: 7000,
      riskRadar: '通勤車禍住院 ／ 年輕重疾突發',
      actions: [
        { id: 'buy_acc4', label: '保「團體意外－計畫四」(含大眾運輸 400/600 萬)', cost: 2330, tag: '高意外+住院', policy: 'ACC4' },
        { id: 'buy_ci', label: '保「重大疾病」(15~40歲只要 $330！)', cost: 330, tag: '7大重疾15萬', policy: 'CI' },
        { id: 'save_ls_2', label: '強迫儲蓄存股金 4,000 元 (60歲前 100%！)', cost: 4000, tag: 'LS 100%級距', lsAdd: 4000, lsRate: 1.0 }
      ],
      events: [
        {
          wedgeLabel: '雨天騎車打滑', wedgeColor: '#DF5646',
          title: '🎲 命運輪盤：雨天騎車打滑住院 10 天＋門診追蹤！',
          needPolicy: 'ACC4',
          hitText: '有保【團體意外計畫四】！意外住院 1,000×10天＋前後門診＋手術津貼，獲賠 16,000 元！',
          missText: '少了意外醫療日額，請假休養加上醫療雜費倒貼 16,000 元！',
          shieldGain: 16000, missLoss: 16000
        },
        {
          wedgeLabel: '突發腦中風', wedgeColor: '#85538B',
          title: '🎲 命運輪盤：熬夜加班竟引發年輕型重度腦中風！',
          needPolicy: 'CI',
          hitText: '一年只要 330 元的【重大疾病】立大功！一次給付應急金，直接替家庭守住 25,000 元！',
          missText: '省了 330 元沒保重大疾病，急診復健支出倒貼 20,000 元！',
          shieldGain: 25000, missLoss: 20000
        }
      ]
    },
    {
      ageLabel: '38 歲', stageTitle: '成家立業！把握 45 歲前限定視窗', icon: '🏡',
      story: '買房貸款成家了！趁「未滿 45 歲」還有 D 計畫，同時有社裡免費附贈的 LP 貸款安全護身！',
      budget: 12000,
      riskRadar: '急性盲腸炎住院 ／ 早期癌症手術',
      actions: [
        { id: 'buy_d', label: '搶保「團體 D 計畫」(45歲未滿限定！含疾病住院)', cost: 5350, tag: '一般50萬+疾病住院', policy: 'D' },
        { id: 'buy_c2', label: '保「防癌計畫二」(高倍癌症醫療)', cost: 3520, tag: '住院2000/手術6萬', policy: 'CANCER2', grants: 'cancerPrior' },
        { id: 'save_ls_3', label: '穩健續存股金 6,000 元 (衝刺 60 歲前 100% 額度)', cost: 6000, tag: 'LS 100%級距', lsAdd: 6000, lsRate: 1.0 }
      ],
      events: [
        {
          wedgeLabel: '盲腸炎住院', wedgeColor: '#2C8C6D',
          title: '🎲 命運輪盤：工作太操勞，盲腸炎急性住院 8 天！',
          needPolicy: 'D',
          hitText: '還好趁 45 歲前保了【團體 D 計畫】！已過 31 天等待期，疾病住院 1,000×8 天守住 20,000 元！',
          missText: '意外險不賠疾病住院啊！這次住院自費病房和薪水損失花了 20,000 元。',
          shieldGain: 20000, missLoss: 20000
        },
        {
          wedgeLabel: '早期癌症手術', wedgeColor: '#C75284',
          title: '🎲 命運輪盤：健檢發現原位腫瘤，安排外科手術住院 5 天！',
          needPolicy: 'CANCER2',
          hitText: '【防癌計畫二】超給力！外科手術 6 萬＋住院日額 2,000×5 天，立刻守住 26,000 元！',
          missText: '沒配防癌計畫二，自費標靶與手術休養大失血 22,000 元！',
          shieldGain: 26000, missLoss: 22000
        }
      ]
    },
    {
      ageLabel: '52 歲', stageTitle: '熱心服務！獲選儲互社理事', icon: '🎖️',
      story: '獲選社理事！全體幹部正要決定方案，同時也是 60 歲前最後衝刺 LS 100% 加值的黃金窗口！',
      budget: 12500,
      riskRadar: '冠狀動脈繞道 ／ 社務活動摔傷',
      actions: [
        { id: 'buy_off_a2', label: '全體幹部選「幹部 A2」(1,675元超高住院/手術)', cost: 1675, tag: '意外住院2千/手術1萬', policy: 'OFF_A2' },
        { id: 'buy_ci_50', label: '續保「重大疾病」(50~60歲 $1,560)', cost: 1560, tag: '7大重疾15萬', policy: 'CI50' },
        { id: 'save_ls_4', label: '趁 60 歲前大存股金 9,000 元 (100%最後衝刺！)', cost: 9000, tag: 'LS 100%黃金窗', lsAdd: 9000, lsRate: 1.0 }
      ],
      events: [
        {
          wedgeLabel: '冠狀動脈繞道', wedgeColor: '#85538B',
          title: '🎲 命運輪盤：體檢發現冠狀動脈阻塞，安排繞道手術！',
          needPolicy: 'CI50',
          hitText: '【重大疾病互助基金】發威！冠狀動脈繞道屬 7 大重疾，一次給付 15 萬應急，守住 45,000 元！',
          missText: '沒有續保重大疾病基金，自費心導管支架與休養大失血 45,000 元！',
          shieldGain: 45000, missLoss: 45000
        },
        {
          wedgeLabel: '社務籌備摔傷', wedgeColor: '#C88312',
          title: '🎲 命運輪盤：佈置社員大會場地不慎跌傷，動手術住院 5 天！',
          needPolicy: 'OFF_A2',
          hitText: '【幹部 A2】CP 值封神！意外住院 2,000×5＋手術津貼 1 萬，直接守住 24,000 元！',
          missText: '少了幹部 A2 的高額意外日額與手術津貼，自費休養倒貼 20,000 元！',
          shieldGain: 24000, missLoss: 20000
        }
      ]
    },
    {
      ageLabel: '63 歲', stageTitle: '屆齡退休！面對「退股誘惑」大考驗', icon: '⚠️',
      story: '剛退休想出國玩，有人勸你先「退股 8,000 元」？小心 LS 退股降級水位！而且這裡續保防癌一，才能解鎖 72 歲防癌計畫三！',
      budget: 9000,
      riskRadar: 'LS 股金健檢 ／ 70 歲前防癌續約資格',
      actions: [
        { id: 'hold_ls', label: '守住 60 歲前股金不退股，另存 3,000 元 (75%級距)', cost: 3000, tag: '保住100%老本！', lsAdd: 3000, lsRate: 0.75, policy: 'HOLD_LS' },
        { id: 'withdraw_ls', label: '【陷阱】先退股 8,000 元去血拚（會把 100% 水位往下拉！）', cost: 0, tag: '⚠️ 退股降級風險', lsWithdraw: 8000, policy: 'WITHDRAW' },
        { id: 'keep_c1', label: '續保「防癌計畫一」($1,760)', cost: 1760, tag: '★ 解鎖 72 歲計畫三資格', policy: 'CANCER_KEEP', grants: 'cancer63' }
      ],
      events: [
        {
          wedgeLabel: '股金水位健檢', wedgeColor: '#2C8C6D',
          title: '🎲 命運輪盤：儲互社年度股金保障健檢！',
          needPolicy: 'HOLD_LS',
          hitText: '太聰明了！你守住 60 歲前 100% 滿額加值水位沒有亂退股，家庭身後資產增值獎勵 +25,000 元！',
          missText: '哎呀！63 歲退股把 60 歲前 100% 的高比例水位永久拉低了，資產評分扣 20,000 元！',
          shieldGain: 25000, missLoss: 20000
        },
        {
          wedgeLabel: '防癌資格審查', wedgeColor: '#C75284',
          title: '🎲 命運輪盤：滿 70 歲前防癌續保資格複查！',
          needPolicy: 'CANCER_KEEP',
          hitText: '太有遠見！你有持續續保防癌計畫一，滿 70 歲後將獲得「防癌計畫三」無縫銜接資格，獎勵 +18,000 元！',
          missText: '沒續保防癌計畫一，滿 70 歲後將失去銜接「防癌計畫三」的資格，保障出現缺口（-15,000 元）！',
          shieldGain: 18000, missLoss: 15000
        }
      ]
    },
    {
      ageLabel: '72 歲', stageTitle: '樂齡銀髮！70 歲後關鍵保單換軌', icon: '🌻',
      story: '滿 70 歲後 LP 貸款安全與防癌一/二到期！這裡要把握 80 歲前初次投保「松年意外」，並檢驗上一關有沒有取得「防癌計畫三」銜接資格！',
      budget: 8500,
      riskRadar: '澆花滑倒自費醫材 ／ 73 歲癌症門診',
      actions: [
        { id: 'buy_c3', label: '銜接「防癌計畫三」(70~75歲續約專屬 $4,550)', cost: 4550, tag: '需 63 歲續保防癌一', policy: 'CANCER3', requireFlag: 'cancer63', lockMsg: '🔒 需於 63 歲續保防癌計畫一才可滿 70 歲銜接計畫三！' },
        { id: 'buy_senior', label: '加保「松年意外」(未滿80可初次投保！)', cost: 2000, tag: '★ 解鎖 82 歲續約權', policy: 'SENIOR', grants: 'senior72' },
        { id: 'save_ls_5', label: '再小存股金 1,500 元 (70~75歲享 25% 加值)', cost: 1500, tag: 'LS 25%級距', lsAdd: 1500, lsRate: 0.25 }
      ],
      events: [
        {
          wedgeLabel: '澆花滑倒撞傷', wedgeColor: '#6C8B3E',
          title: '🎲 命運輪盤：早起澆花滑倒撞傷縫合＋住院 5 天，自費醫材 9,500 元！',
          needPolicy: 'SENIOR',
          hitText: '【松年意外】太神了！實支實付 1 萬元＋住院日額 5,000＋門診，理賠 18,000 元完全罩住！',
          missText: '70 歲後沒轉保松年意外，自費醫材和病房全自己扛，損失 18,000 元！',
          shieldGain: 18000, missLoss: 18000
        },
        {
          wedgeLabel: '73歲癌症治療', wedgeColor: '#C75284',
          title: '🎲 命運輪盤：73 歲定期追蹤需接受癌症門診與住院照護！',
          needPolicy: 'CANCER3',
          hitText: '還好 63 歲有續保、72 歲成功銜接【防癌計畫三】！癌症住院與門診理賠守住 22,000 元！',
          missText: '缺少防癌計畫三銜接，73 歲癌症治療自費支出 18,000 元（記得 70 歲前要持續續保喔！）。',
          shieldGain: 22000, missLoss: 18000
        }
      ]
    },
    {
      ageLabel: '82 歲', stageTitle: '85 歲圓滿終點站！松年續約守護', icon: '🎂',
      story: '已經 82 歲囉！一般團體與意外都只到 75 歲、滿 75 歲後存股金 LS 也為 0%；80 歲前若有保松年意外，現在就能一路續約到 85 歲！',
      budget: 4500,
      riskRadar: '進香扭傷住院 ／ 浴室滑倒急診',
      actions: [
        { id: 'renew_senior', label: '續約「松年意外」($2,000，守護到滿 85 歲！)', cost: 2000, tag: '需滿 80 歲前已投保', policy: 'SENIOR85', requireFlag: 'senior72', lockMsg: '🔒 松年意外初次限未滿 80 歲，需於 72 歲先加保才能在 82 歲續約！' },
        { id: 'enjoy_life', label: '留 2,000 元請子孫吃辦桌（75 歲前舊 LS 活到幾歲都有效！）', cost: 2000, tag: '老本加值終身有效', policy: 'FEAST' }
      ],
      events: [
        {
          wedgeLabel: '進香扭傷住院', wedgeColor: '#DD7540',
          title: '🎲 最終輪盤：83 歲跟社區去進香扭傷住院檢查 3 天！',
          needPolicy: 'SENIOR85',
          hitText: '83 歲依然有【松年意外】續約保護！醫藥費與住院日額領回 15,000 元，子孫直呼超有智慧！',
          missText: '少了松年意外續約保護，住院自費花了 15,000 元，幸好 75 歲前存的 LS 股金依舊穩穩守護家屬！',
          shieldGain: 15000, missLoss: 15000
        },
        {
          wedgeLabel: '浴室滑倒實支', wedgeColor: '#6C8B3E',
          title: '🎲 最終輪盤：84 歲清晨浴室滑倒掛急診，自費敷料與檢查！',
          needPolicy: 'SENIOR85',
          hitText: '84 歲【松年意外】實支實付 1 萬再次救場！急診與自費項目全額罩住，省下 15,000 元！',
          missText: '80 歲後沒有松年意外續約，急診自費花了 15,000 元，記得一定要在未滿 80 歲前先加保喔！',
          shieldGain: 15000, missLoss: 15000
        }
      ]
    }
  ],

  /* ==================== 攤位 5：25 號送件大亂鬥（3 種郵筒模式＋動態櫃檯實戰） ==================== */
  calendarMailboxes: {
    startMonths: [
      { id: 'm3', label: '3 月 1 日', hint: '3/1 ~ 次年 2 月底' },
      { id: 'm4', label: '4 月 1 日', hint: '4/1 ~ 次年 3/31' },
      { id: 'm6', label: '6 月 1 日', hint: '6/1 ~ 次年 5/31' },
      { id: 'm8', label: '8 月 1 日', hint: '8/1 ~ 次年 7/31' },
      { id: 'm9', label: '9 月 1 日', hint: '9/1 ~ 次年 8/31' },
      { id: 'm10', label: '10 月 1 日', hint: '10/1 ~ 次年 9/30' }
    ],
    cutoffs: [
      { id: 'c125', label: '次年 1 月 25 日', hint: '1/25 最後受理' },
      { id: 'c325', label: '次年 3 月 25 日', hint: '3/25 最後受理' },
      { id: 'c425', label: '次年 4 月 25 日', hint: '4/25 最後受理' },
      { id: 'c525', label: '次年 5 月 25 日', hint: '5/25 最後受理' },
      { id: 'c1125', label: '當年 11 月 25 日', hint: '11/25 最後受理' }
    ],
    counter25: [
      { id: 'next1', label: '次月 1 日生效', hint: '25 日前準時送達' },
      { id: 'delay1', label: '順延下下月 1 日', hint: '錯過當月 25 日截止' },
      { id: 'closed', label: '本年度已截止退件', hint: '超過年度最後受理日' }
    ]
  },
  calendarQuestions: [
    {
      id: 'cal1', diff: 'both', mode: 'startMonths', badge: '📅 開保起日郵筒',
      title: '🎖️ 各級幹部互助基金',
      sub: '全體理監事、教育委員與顧問的年度保障是幾月幾日起算？',
      answer: 'm3',
      explain: '各級幹部互助基金保障期間為「每年 3 月 1 日至次年 2 月底止」！',
      taigi: '記起來！幹部基金 3 月 1 日開跑！'
    },
    {
      id: 'cal2', diff: 'both', mode: 'startMonths', badge: '📅 開保起日郵筒',
      title: '👨‍👩‍👧‍👦 社員團體互助基金 (A~F)',
      sub: '包含兒童 E 計畫與青壯 D 計畫的團體基金，每年何時開保？',
      answer: 'm4',
      explain: '社員團體互助基金保障期間為「每年 4 月 1 日至次年 3 月 31 日」！',
      taigi: '答對囉！4 月兒童月記團體 E 計畫超好背！'
    },
    {
      id: 'cal3', diff: 'both', mode: 'startMonths', badge: '📅 開保起日郵筒',
      title: '🎗️ 社員防癌互助基金',
      sub: '114 年新版防癌計畫一、二、三的年度保障期間是哪一天起算？',
      answer: 'm6',
      explain: '社員防癌互助基金保障期間為「每年 6 月 1 日至次年 5 月 31 日」！',
      taigi: '水啦！6 月 1 日防癌準時開保！'
    },
    {
      id: 'cal4', diff: 'both', mode: 'startMonths', badge: '📅 開保起日郵筒',
      title: '❤️‍🩹 社員重大疾病互助基金',
      sub: '涵蓋 7 大重疾、保額 15 萬元的重大疾病基金何時起算？',
      answer: 'm8',
      explain: '社員重大疾病互助基金保障期間為「每年 8 月 1 日至次年 7 月 31 日」！',
      taigi: '讚喔！8 月父親節顧爸爸的重大疾病！'
    },
    {
      id: 'cal5', diff: 'both', mode: 'startMonths', badge: '📅 開保起日郵筒',
      title: '🛡️ 社員團體意外互助基金',
      sub: '計畫一到計畫四的團體意外基金，每年保障起算日是幾月？',
      answer: 'm9',
      explain: '社員團體意外互助基金保障期間為「每年 9 月 1 日至次年 8 月 31 日」！',
      taigi: '超準！9 月開學季保團體意外！'
    },
    {
      id: 'cal6', diff: 'both', mode: 'startMonths', badge: '📅 開保起日郵筒',
      title: '🌲 社員松年意外互助基金',
      sub: '守護高齡長輩到 85 歲的松年意外基金，每年何時開保？',
      answer: 'm10',
      explain: '社員松年意外互助基金保障期間為「每年 10 月 1 日至次年 9 月 30 日」（重陽敬老月超好記！）',
      taigi: '金讚！10 月重陽月就是松年意外啦！'
    },
    {
      id: 'cal7', diff: 'hard', mode: 'cutoffs', badge: '⏰ 年度最後受理截止日',
      title: '🎗️ 社員防癌互助基金（中途加退保）',
      sub: '每年 6/1 開保，中途加退保申請最晚受理到哪一天為止？',
      answer: 'c125',
      explain: '防癌基金（6/1~5/31）每年參加或退出申請受理至「次年 1 月 25 日」止！',
      taigi: '神記憶！防癌最後受理是次年 1/25！'
    },
    {
      id: 'cal8', diff: 'hard', mode: 'cutoffs', badge: '⏰ 年度最後受理截止日',
      title: '❤️‍🩹 社員重大疾病互助基金（中途加退保）',
      sub: '每年 8/1 開保，中途加退保申請最晚受理到哪一天為止？',
      answer: 'c325',
      explain: '重大疾病基金（8/1~7/31）加退保申請受理至「次年 3 月 25 日」為止！',
      taigi: '強喔！重疾最後受理日是次年 3/25！'
    },
    {
      id: 'cal9', diff: 'hard', mode: 'cutoffs', badge: '⏰ 年度最後受理截止日',
      title: '🛡️ 社員團體意外互助基金（中途加退保）',
      sub: '每年 9/1 開保，每年加、退保申請最晚受理到哪一天為止？',
      answer: 'c425',
      explain: '團體意外基金（9/1~8/31）每年加、退保申請受理至「次年 4 月 25 日」為止！',
      taigi: '有夠準！團體意外受理到次年 4/25！'
    },
    {
      id: 'cal10', diff: 'hard', mode: 'cutoffs', badge: '⏰ 年度最後受理截止日',
      title: '🌲 社員松年意外互助基金（中途加退保）',
      sub: '每年 10/1 開保，每年加、退保申請最晚受理到哪一天為止？',
      answer: 'c525',
      explain: '松年意外基金（10/1~9/30）每年加、退保申請受理至「次年 5 月 25 日」為止！',
      taigi: '厲害！松年意外受理到次年 5/25！'
    },
    {
      id: 'cal11', diff: 'hard', mode: 'cutoffs', badge: '⏰ 年度最後受理截止日',
      title: '🎖️ 各級幹部 ＆ 👨‍👩‍👧‍👦 社員團體互助基金',
      sub: '3/1 開保的幹部基金與 4/1 開保的團體基金，最晚受理到哪天？',
      answer: 'c1125',
      explain: '幹部互助基金與社員團體互助基金的加退保申請，都是受理至「當年度 11 月 25 日」為止！',
      taigi: '督導級水準！幹部跟團體都是當年 11/25 截止！'
    }
  ],

  // 25 號送件櫃檯實戰動態情境產生器
  buildDynamicCounterQuestions() {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const dayOnTime = pick([18, 20, 22, 24, 25]);
    const dayLate = pick([26, 27, 28, 29]);

    const pool = [
      {
        id: 'cnt_on1', mode: 'counter25', badge: '📮 25 號櫃檯實戰',
        title: `📬 社員團體意外：10 月 ${dayOnTime} 日送達協會`,
        sub: `社員 10 月 ${dayOnTime} 日把申請書寄達協會（團體意外受理至次年 4/25），何時生效？`,
        answer: 'next1',
        explain: `10 月 ${dayOnTime} 日在「當月 25 日（含）前」送達協會且未逾年度截止日，次月 1 日（11/1）準時生效！`,
        taigi: '25 號前寄到，下個月初一準時生效！',
        voiceKey: 'taigi_mail'
      },
      {
        id: 'cnt_late1', mode: 'counter25', badge: '📮 25 號櫃檯實戰',
        title: `📬 社員防癌基金：7 月 ${dayLate} 日才送達協會`,
        sub: `承辦人忙到 7 月 ${dayLate} 日才把防癌申請書送達協會（防癌受理至次年 1/25），結果如何？`,
        answer: 'delay1',
        explain: `7 月 ${dayLate} 日已經錯過 7 月 25 日收件截止線！無法 8/1 生效，將順延至下下個月 1 日（9/1）才生效！`,
        taigi: '超過 25 號囉！只好順延一個月生效啦！'
      },
      {
        id: 'cnt_closed1', mode: 'counter25', badge: '📮 25 號櫃檯實戰',
        title: '📬 社員團體 A~F：12 月 8 日才送達協會',
        sub: '團體互助基金（4/1~次年 3/31）在 12 月 8 日送件中途加保，協會會怎麼處理？',
        answer: 'closed',
        explain: '社員團體互助基金加退保只受理至「當年度 11 月 25 日止」！12 月 8 日已逾本年度最終截止日，須等下年度 4/1 再參加！',
        taigi: '過了 11/25 年度截止線，要等明年 4/1 開保囉！'
      },
      {
        id: 'cnt_closed2', mode: 'counter25', badge: '📮 25 號櫃檯實戰',
        title: '📬 社員松年意外：6 月 12 日送件本年度加保',
        sub: '松年意外（10/1~次年 9/30）年度受理只到 5 月 25 日，6 月 12 日送件結果如何？',
        answer: 'closed',
        explain: '松年意外年度最後受理日為「次年 5 月 25 日」！6 月 12 日已逾受理期限，須等新年度 10 月 1 日再投保！',
        taigi: '超過 5/25 啦！提醒阿公阿嬤 10 月新年度趕緊保！'
      },
      {
        id: 'cnt_on2', mode: 'counter25', badge: '📮 25 號櫃檯實戰',
        title: `📬 社員重大疾病：11 月 ${dayOnTime} 日送達協會`,
        sub: `社員 11 月 ${dayOnTime} 日送達重大疾病申請書（受理至次年 3/25），經核保後何時生效？`,
        answer: 'next1',
        explain: `11 月 ${dayOnTime} 日在每月 25 日前送達且於年度截止日 3/25 前，次月 1 日（12/1）準時生效（另起算 60 日等待期）！`,
        taigi: '準時送件，次月初一生效喔！',
        voiceKey: 'taigi_mail'
      }
    ];
    return pool.sort(() => Math.random() - 0.5).slice(0, 3);
  },

  // 長輩輕鬆安心版專屬：一句話白話「💡 問小管家」免費破題提示（不扣分、零挫折！）
  easyHints: {
    sw1: '馬戲團馴獸師屬於高危險的「不承保職業黑名單」，意外基金不能保喔！',
    sw2: '松年意外特別照顧長輩，只要「未滿 80 歲」都能初次加保喔！',
    sw3: '團體 E 計畫（$812）就是專門給「0~15 歲未滿」小朋友設計的！',
    sw4: '攀岩教練跟高空彈跳教練都屬於「高危險不承保職業」，不能保意外險喔！',
    sw5: '團體 D 計畫初次參加只限「未滿 45 歲」，超過 45 歲要改選 A/B/C/F 喔！',
    sw6: '防癌基金很貼心，寶寶只要「出生正常出院」就能附健康聲明書申請！',
    sw7: '跨社社員只能選擇「其中一社」參加，不能兩社重複加保領雙倍喔！',
    sw8: '重大疾病 65 歲前都能初次加保，50~60 歲年繳剛好就是 1,560 元！',
    sw9: '松年意外續約最長壽，可以一路續約守護到「滿 85 歲」喔！',
    sw10: '條文特別括號寫明：火藥爆竹廠「包含廠長與廠務管理」都屬拒保職業！',
    sw19: '一般團體意外初次加保只到「70 歲前」，73 歲第一次保要改選松年意外喔！',
    sw20: '防癌計畫一、二初次參加年齡到「未滿 65 歲」，62 歲剛好符合資格！',
    sw21: '團體 D 計畫初次限「15~45 歲未滿」，42 歲趁早卡位完全沒問題！',
    cl1: '未滿 15 歲的寶寶無法保成人方案，要選兒童專屬的「團體 E 計畫（$812）」喔！',
    cl2: '76 歲已超過一般意外 70 歲初次門檻，唯一能保又有實支實付的是「松年意外」！',
    cl3: '要同時有「空中 600 萬＋陸水 400 萬」又要附「住院與骨折」，選意外「計畫四」！',
    cl4: '未滿 45 歲想一次包辦最高一般身故＋疾病住院＋意外住院，就是「團體 D 計畫」！',
    cl5: '15~40 歲未滿買「重大疾病」一年只要 330 元，就有 15 萬 7 大重疾保障！',
    cl6: '幹部三方案裡，唯一包含「一般身故＋疾病住院日額」的就是「幹部 A1」！',
    cl10: '預算 900 元以內想買最基本的一般身故＋意外身故，選「團體 F 計畫（$805）」！',
    cl11: '想專攻癌症住院 2,000／手術 6 萬最高防癌保障，選「防癌計畫二（$3,520）」！',
    cl12: '只要純意外最高「空中 600 萬」、不需要住院日額，選「意外計畫二（$1,650）」最省！',
    cal1: '口訣開頭就是「3 幹部」——各級幹部互助基金是每年 3 月 1 日開保喔！',
    cal2: '口訣「4 團體」——4 月兒童節剛好配兒童 E 計畫，團體基金是 4 月 1 日！',
    cal3: '口訣「6 防癌」——防癌互助基金是每年 6 月 1 日開保喔！',
    cal4: '口訣「8 重疾」——8 月父親節顧爸爸健康，重大疾病是 8 月 1 日！',
    cal5: '口訣「9 意外」——9 月開學季，社員團體意外是 9 月 1 日開保！',
    cal6: '口訣「10 松年」——10 月重陽敬老月，松年意外就是 10 月 1 日開保！'
  },

  getEasyHint(kind, item) {
    if (!item) return '';
    if (this.easyHints[item.id]) return this.easyHints[item.id];
    if (kind === 'detective') {
      return item.clueHint || '先點選上方時間軸的證據卡，看看哪一條藏著關鍵天數或原因喔！';
    }
    if (kind === 'calendar') {
      if (item.mode === 'counter25') {
        return '記住兩個判斷步驟：① 先看有沒有超過「年度最後受理日」；② 沒超過的話，當月 25 日(含)前送達就是「次月 1 日生效」，超過 25 日就順延 1 個月！';
      }
      return '口訣：「3 幹部、4 團體、6 防癌、8 重疾、9 意外、10 松年」！';
    }
    if (kind === 'life') {
      const needLabels = (item.events || []).map(e => e.wedgeLabel).join('」或「');
      return `本站輪盤可能會遇到「${needLabels}」！優先把對應這兩種風險的保障勾起來，有剩預算再存 LS 股金就穩穩過關囉！`;
    }
    return '忘記規定沒關係，點右上角 📖 圖鑑翻一下就能找到答案喔！';
  }
};

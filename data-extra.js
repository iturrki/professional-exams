(() => {
  const cme1 = Array.isArray(window.EXAMS)
    ? window.EXAMS.find((exam) => exam.id === "cme1")
    : null;

  const test = cme1 && Array.isArray(cme1.tests)
    ? cme1.tests.find((item) => item.id === "test-1")
    : null;

  if (!test) return;
  if (!Array.isArray(test.questions)) test.questions = [];

  const extraQuestions = [
    {
      n: 31,
      text: "أي من السياسات التالية تُستخدم من قبل البنوك المركزية للتحكم في المعروض النقدي وأسعار الفائدة؟",
      options: [
        { key: "أ", text: "السياسة التجارية (Trade policy)." },
        { key: "ب", text: "السياسة الصناعية (Industrial policy)." },
        { key: "ج", text: "السياسة النقدية (Monetary policy)." },
        { key: "د", text: "السياسة المالية (Fiscal policy)." }
      ],
      answer: "ج"
    },
    {
      n: 32,
      text: "ما هي الميزة الرئيسية للاستثمار في صناديق الاستثمار البديلة (Alternative Investment Funds)؟",
      options: [
        { key: "أ", text: "رسوم إدارة منخفضة ومخاطر محدودة." },
        { key: "ب", text: "سيولة عالية وعوائد مضمونة." },
        { key: "ج", text: "تنويع المحفظة وإمكانية تحقيق عوائد غير مرتبطة بالأسواق التقليدية." },
        { key: "د", text: "سهولة الوصول للمستثمرين الأفراد." }
      ],
      answer: "ج"
    },
    {
      n: 33,
      text: "أي من الميزات التالية تُعد ميزة رئيسية لحاملي الأسهم العادية؟",
      options: [
        { key: "أ", text: "ضمان عائد ثابت على الاستثمار." },
        { key: "ب", text: "الأولوية في استلام توزيعات الأرباح الثابتة." },
        { key: "ج", text: "الأولوية في استرداد رأس المال عند تصفية الشركة." },
        { key: "د", text: "الحق في التصويت على قرارات الشركة الرئيسية." }
      ],
      answer: "د"
    },
    {
      n: 34,
      text: "ما هو الفرق الرئيسي بين الشركة الخاصة والشركة العامة؟",
      options: [
        { key: "أ", text: "الشركة الخاصة لا تدفع ضرائب، بينما الشركة العامة تدفع ضرائب." },
        { key: "ب", text: "الشركة الخاصة لا يمكنها جمع رأس المال من خلال إصدار السندات." },
        { key: "ج", text: "أسهم الشركة الخاصة لا يتم تداولها في البورصة، بينما أسهم الشركة العامة يتم تداولها علنًا." },
        { key: "د", text: "الشركة الخاصة لديها عدد أكبر من المساهمين من الشركة العامة." }
      ],
      answer: "ج"
    },
    {
      n: 35,
      text: "في أي نوع من الاقتصادات يكون تخصيص الموارد والإنتاج والأسعار محددًا بشكل أساسي من قبل قوى العرض والطلب؟",
      options: [
        { key: "أ", text: "الاقتصاد المختلط (Mixed economy)." },
        { key: "ب", text: "الاقتصاد الموجه (State-controlled economy)." },
        { key: "ج", text: "اقتصاد السوق (Market economy)." },
        { key: "د", text: "الاقتصاد المغلق (Closed economy)." }
      ],
      answer: "ج"
    },
    {
      n: 36,
      text: "ما هو المصطلح الذي يشير إلى سعر صرف العملة للتسليم الفوري؟",
      options: [
        { key: "أ", text: "سعر الفائدة (Interest Rate)." },
        { key: "ب", text: "سعر العرض (Bid Price)." },
        { key: "ج", text: "سعر الصرف الفوري (Spot Exchange Rate)." },
        { key: "د", text: "سعر الصرف الآجل (Forward Exchange Rate)." }
      ],
      answer: "ج"
    },
    {
      n: 37,
      text: "أي من الأدوات التالية تُعتبر أداة سوق نقد (Money Market Instrument)؟",
      options: [
        { key: "أ", text: "الأسهم العادية (Ordinary Shares)." },
        { key: "ب", text: "العقارات (Property)." },
        { key: "ج", text: "السندات طويلة الأجل (Long-term Bonds)." },
        { key: "د", text: "أذون الخزانة (Treasury Bills)." }
      ],
      answer: "د"
    },
    {
      n: 38,
      text: "ما هو الهدف الرئيسي من تنظيم الخدمات المالية؟",
      options: [
        { key: "أ", text: "ضمان أرباح عالية للمؤسسات المالية." },
        { key: "ب", text: "تقليل عدد المؤسسات المالية في السوق." },
        { key: "ج", text: "منع جميع المخاطر في الاستثمار." },
        { key: "د", text: "حماية المستثمرين، والحفاظ على استقرار الأسواق، وتعزيز المنافسة العادلة." }
      ],
      answer: "د"
    },
    {
      n: 39,
      text: "أي من الإجراءات التالية تُعد إجراءات الشركات (Corporate Action) التي تمنح المساهمين الحاليين الحق في شراء أسهم إضافية بسعر مخفض؟",
      options: [
        { key: "أ", text: "إعادة شراء الأسهم (Share Buyback)." },
        { key: "ب", text: "إصدار حقوق الأولوية (Rights Issue)." },
        { key: "ج", text: "تجزئة الأسهم (Stock Split)." },
        { key: "د", text: "إصدار أسهم المنحة (Bonus Issue)." }
      ],
      answer: "ب"
    },
    {
      n: 40,
      text: "ما هو نوع عقد المشتقات الذي يتضمن تبادل التدفقات النقدية بين طرفين بناءً على أصل أساسي أو سعر فائدة؟",
      options: [
        { key: "أ", text: "عقود المبادلة (Swaps)." },
        { key: "ب", text: "العقود الآجلة (Futures)." },
        { key: "ج", text: "عقود الفروقات (CFDs)." },
        { key: "د", text: "الخيارات (Options)." }
      ],
      answer: "أ"
    }
  ];

  const existingNumbers = new Set(test.questions.map((q) => q.n));
  for (const question of extraQuestions) {
    if (!existingNumbers.has(question.n)) {
      test.questions.push(question);
    }
  }

  test.questions.sort((a, b) => (a.n || 0) - (b.n || 0));
})();

/* ================================================================
   FILE DUY NHẤT CẦN SỬA KHI THÊM SẢN PHẨM HOẶC DANH MỤC
================================================================ */

const STORE = { perPage: 8, currency: "USD" };

const CATEGORY_MENU = [
  { key:"massage", zh:"按摩用品", en:"Massage", children:[
    {key:"massage-bed",zh:"按摩床",en:"Massage Table"},
    {key:"bed-sheet",zh:"床单",en:"Bed Sheet"},
    {key:"massage-cover",zh:"床罩",en:"Bed Cover"},
    {key:"towel",zh:"毛巾 / 浴巾",en:"Towel"},
    {key:"pillows",zh:"脸枕头 / 脚枕",en:"Pillows"},
    {key:"disposable",zh:"一次性品类",en:"Disposable Items"},
    {key:"therapeutic",zh:"各种理疗用品类",en:"Therapeutic Products"}
  ]},
  { key:"decorations", zh:"实用装饰工具", en:"Decorations", children:[
    {key:"lighting",zh:"灯类",en:"Lighting & Lamps"},
    {key:"shelves",zh:"置物架",en:"Shelves"},
    {key:"stools",zh:"旋转凳",en:"Stools"},
    {key:"speakers",zh:"养生小音箱",en:"Mini Speakers"},
    {key:"uniforms",zh:"各种风格工服",en:"Uniforms"}
  ]},
  { key:"customized", zh:"各种定制类", en:"Customized Products", children:[
    {key:"partitions",zh:"隔断间定制",en:"Partition Customization"},
    {key:"door-signage",zh:"门牌定制",en:"Door Signage"},
    {key:"custom-business-cards",zh:"名片定制",en:"Business Cards"},
    {key:"carpets",zh:"地毯定制",en:"Carpet Customization"}
  ]},
  { key:"printed", zh:"印刷广告类", en:"Printed Advertising", children:[
    {key:"posters",zh:"海报",en:"Posters"},
    {key:"price-lists",zh:"价目表",en:"Price Lists"},
    {key:"printed-business-cards",zh:"名片",en:"Business Cards"},
    {key:"brochures",zh:"宣传单",en:"Brochures"},
    {key:"coupons",zh:"优惠券",en:"Coupons"}
  ]},
  { key:"gifts", zh:"礼品类", en:"Gift Items", children:[
    {key:"magnets",zh:"冰箱贴",en:"Refrigerator Magnets"},
    {key:"crystal-keychains",zh:"水晶钥匙扣",en:"Crystal Keychains"},
    {key:"cartoon-keychains",zh:"卡通钥匙扣",en:"Cartoon Keychains"},
    {key:"promotional-pens",zh:"广告笔",en:"Promotional Pens"},
    {key:"stuffed-toys",zh:"毛绒娃娃",en:"Stuffed Toys"},
    {key:"blind-boxes",zh:"盲盒",en:"Blind Boxes"},
    {key:"seasonal-flowers",zh:"节日花束",en:"Seasonal Flower Arrangements"}
  ]}
];

const PRODUCTS = [
     {id:1,group:"massage",category:"massage-bed",categoryZh:"按摩床",categoryEn:"Massage Table",nameZh:"储水式头疗床",nameEn:"Water Storage Head Spa Bed",price:1299,oldPrice:1499,image:"images/massage-bed/bed1/bed1.1.png",images:["images/massage-bed/bed1/bed1.1.png","images/massage-bed/bed1/bed1.1.png","images/massage-bed/bed1/bed1.2.png"],descriptionZh:"专业头疗与水疗护理床，适合头部按摩、洗头和美容护理。",descriptionEn:"Professional head spa bed designed for scalp treatments, shampoo services, and beauty care.",featuresZh:["储水系统","舒适软垫","适合SPA店"],featuresEn:["Built-in water storage","Comfortable padded surface","Ideal for spa use"],badgeZh:"新品",badgeEn:"New",featured:true,inStock:true},
  {id:2,group:"massage",category:"massage-bed",categoryZh:"按摩床",categoryEn:"Massage Table",nameZh:"六腿不锈钢按摩床",nameEn:"Six-Leg Stainless Steel Massage Table",price:899,oldPrice:999,image:"images/massage-bed/bed2/bed2.1.jpg",images:["images/massage-bed/bed2/bed2.1.jpg","images/massage-bed/bed2/bed2.4.jpg","images/massage-bed/bed2/bed2.2.jpg","images/massage-bed/bed2/bed2.3.jpg"],descriptionZh:"六腿不锈钢结构，稳定耐用，适合专业按摩店长期使用。",descriptionEn:"Heavy-duty six-leg stainless steel massage table for professional daily use.",featuresZh:["六腿支撑","不锈钢框架","承重更强"],featuresEn:["Six-leg support","Stainless steel frame","High weight capacity"],badgeZh:"热销",badgeEn:"Best Seller",featured:false,inStock:true},
  {id:3,group:"massage",category:"bed-sheet",categoryZh:"床单",categoryEn:"Bed Sheet",nameZh:"纯棉按摩床单套装",nameEn:"Cotton Massage Sheet Set",price:79,oldPrice:95,image:"images/bed-sheet/cotton-massage-sheet-set/main.jpg",images:["images/bed-sheet/cotton-massage-sheet-set/main.jpg","images/bed-sheet/cotton-massage-sheet-set/full-set.jpg","images/bed-sheet/cotton-massage-sheet-set/fabric.jpg","images/bed-sheet/cotton-massage-sheet-set/colors.jpg"],descriptionZh:"柔软透气的纯棉按摩床单，适合频繁清洗和日常专业使用。",descriptionEn:"Soft breathable cotton massage sheets made for frequent washing and professional daily use.",featuresZh:["三件套","纯棉面料","可机洗"],featuresEn:["Three-piece set","Pure cotton fabric","Machine washable"],badgeZh:"优惠",badgeEn:"Sale",featured:false,inStock:true},
  {id:4,group:"decorations",category:"lighting",categoryZh:"灯类",categoryEn:"Lighting & Lamps",nameZh:"禅意香薰灯",nameEn:"Zen Aroma Lamp",price:89,oldPrice:null,image:"images/lighting/zen-aroma-lamp/main.jpg",images:["images/lighting/zen-aroma-lamp/main.jpg","images/lighting/zen-aroma-lamp/light-on.jpg"],descriptionZh:"柔和灯光与香薰功能，营造安静舒适的SPA空间。",descriptionEn:"Soft lighting and aroma diffusion create a calm and comfortable spa atmosphere.",featuresZh:["柔和灯光","香薰功能","静音设计"],featuresEn:["Soft lighting","Aroma diffusion","Quiet operation"],badgeZh:"新品",badgeEn:"New",featured:false,inStock:true},
  {id:5,group:"printed",category:"price-lists",categoryZh:"价目表",categoryEn:"Price Lists",nameZh:"双语SPA价目表",nameEn:"Bilingual Spa Price List",price:45,oldPrice:null,image:"images/price-lists/bilingual-spa-price-list/main.jpg",images:["images/price-lists/bilingual-spa-price-list/main.jpg","images/price-lists/bilingual-spa-price-list/front.jpg","images/price-lists/bilingual-spa-price-list/detail.jpg"],descriptionZh:"支持中英文双语设计，可定制店名、服务内容、价格和尺寸。",descriptionEn:"Custom bilingual spa price list with editable business name, services, pricing, and size.",featuresZh:["免费设计","支持定制","多种尺寸"],featuresEn:["Free design","Customizable","Multiple sizes"],badgeZh:"定制",badgeEn:"Custom",featured:false,inStock:true},
  {id:6,group:"printed",category:"price-lists",categoryZh:"价目表",categoryEn:"Price Lists",nameZh:"双语SPA价目表",nameEn:"Bilingual Spa Price List",price:45,oldPrice:null,image:"images/massage-bed/储水式头疗床/储水式头疗床1.png",images:["images/massage-bed/储水式头疗床/储水式头疗床1.png"],descriptionZh:"支持中英文双语设计，可定制店名、服务内容、价格和尺寸。",descriptionEn:"Custom bilingual spa price list with editable business name, services, pricing, and size.",featuresZh:["免费设计","支持定制","多种尺寸"],featuresEn:["Free design","Customizable","Multiple sizes"],badgeZh:"",badgeEn:"",featured:false,inStock:false},
  {id:7,group:"massage",category:"massage-bed",categoryZh:"按摩床",categoryEn:"Massage Table",nameZh:"储水式头疗床",nameEn:"Water Storage Head Spa Bed",price:0,oldPrice:1499,image:"images/massage-bed/储水式头疗床/储水式头疗床1.png",images:["images/massage-bed/储水式头疗床/储水式头疗床1.png","images/massage-bed/储水式头疗床/储水式头疗床2.png"],descriptionZh:"专业头疗与水疗护理床，适合头部按摩、洗头和美容护理。",descriptionEn:"Professional head spa bed designed for scalp treatments, shampoo services, and beauty care.",featuresZh:["储水系统","舒适软垫","适合SPA店"],featuresEn:["Built-in water storage","Comfortable padded surface","Ideal for spa use"],badgeZh:"新品",badgeEn:"New",featured:false,inStock:true},
  {id:8,group:"massage",category:"massage-bed",categoryZh:"按摩床",categoryEn:"Massage Table",nameZh:"六腿不锈钢按摩床",nameEn:"Six-Leg Stainless Steel Massage Table",price:0,oldPrice:999,image:"images/massage-bed/六腿不锈钢按摩床/储水式头疗床1.jpg",images:["images/massage-bed/六腿不锈钢按摩床/储水式头疗床1.jpg","images/massage-bed/六腿不锈钢按摩床/储水式头疗床2.jpg","images/massage-bed/六腿不锈钢按摩床/储水式头疗床3.jpg","images/massage-bed/六腿不锈钢按摩床/储水式头疗床4.jpg"],descriptionZh:"六腿不锈钢结构，稳定耐用，适合专业按摩店长期使用。",descriptionEn:"Heavy-duty six-leg stainless steel massage table for professional daily use.",featuresZh:["六腿支撑","不锈钢框架","承重更强"],featuresEn:["Six-leg support","Stainless steel frame","High weight capacity"],badgeZh:"热销",badgeEn:"Best Seller",featured:false,inStock:true},
  {id:9,group:"massage",category:"bed-sheet",categoryZh:"床单",categoryEn:"Bed Sheet",nameZh:"纯棉按摩床单套装",nameEn:"Cotton Massage Sheet Set",price:0,oldPrice:95,image:"images/bed-sheet/cotton-massage-sheet-set/main.jpg",images:["images/bed-sheet/cotton-massage-sheet-set/main.jpg","images/bed-sheet/cotton-massage-sheet-set/full-set.jpg","images/bed-sheet/cotton-massage-sheet-set/fabric.jpg","images/bed-sheet/cotton-massage-sheet-set/colors.jpg"],descriptionZh:"柔软透气的纯棉按摩床单，适合频繁清洗和日常专业使用。",descriptionEn:"Soft breathable cotton massage sheets made for frequent washing and professional daily use.",featuresZh:["三件套","纯棉面料","可机洗"],featuresEn:["Three-piece set","Pure cotton fabric","Machine washable"],badgeZh:"优惠",badgeEn:"Sale",featured:false,inStock:true},
  {id:10,group:"decorations",category:"lighting",categoryZh:"灯类",categoryEn:"Lighting & Lamps",nameZh:"禅意香薰灯",nameEn:"Zen Aroma Lamp",price:0,oldPrice:null,image:"images/lighting/zen-aroma-lamp/main.jpg",images:["images/lighting/zen-aroma-lamp/main.jpg","images/lighting/zen-aroma-lamp/light-on.jpg"],descriptionZh:"柔和灯光与香薰功能，营造安静舒适的SPA空间。",descriptionEn:"Soft lighting and aroma diffusion create a calm and comfortable spa atmosphere.",featuresZh:["柔和灯光","香薰功能","静音设计"],featuresEn:["Soft lighting","Aroma diffusion","Quiet operation"],badgeZh:"新品",badgeEn:"New",featured:true,inStock:true},
  {id:11,group:"printed",category:"price-lists",categoryZh:"价目表",categoryEn:"Price Lists",nameZh:"双语SPA价目表",nameEn:"Bilingual Spa Price List",price:0,oldPrice:null,image:"images/price-lists/bilingual-spa-price-list/main.jpg",images:["images/price-lists/bilingual-spa-price-list/main.jpg","images/price-lists/bilingual-spa-price-list/front.jpg","images/price-lists/bilingual-spa-price-list/detail.jpg"],descriptionZh:"支持中英文双语设计，可定制店名、服务内容、价格和尺寸。",descriptionEn:"Custom bilingual spa price list with editable business name, services, pricing, and size.",featuresZh:["免费设计","支持定制","多种尺寸"],featuresEn:["Free design","Customizable","Multiple sizes"],badgeZh:"定制",badgeEn:"Custom",featured:true,inStock:true},
  {id:12,group:"printed",category:"price-lists",categoryZh:"价目表",categoryEn:"Price Lists",nameZh:"双语SPA价目表",nameEn:"Bilingual Spa Price List",price:0,oldPrice:null,image:"images/massage-bed/储水式头疗床/储水式头疗床1.png",images:["images/massage-bed/储水式头疗床/储水式头疗床1.png"],descriptionZh:"支持中英文双语设计，可定制店名、服务内容、价格和尺寸。",descriptionEn:"Custom bilingual spa price list with editable business name, services, pricing, and size.",featuresZh:["免费设计","支持定制","多种尺寸"],featuresEn:["Free design","Customizable","Multiple sizes"],badgeZh:"",badgeEn:"",featured:false,inStock:false},
{id:13,group:"decorations",category:"lighting",categoryZh:"灯类",categoryEn:"Lighting & Lamps",nameZh:"禅意香薰灯",nameEn:"Zen Aroma Lamp",price:0,oldPrice:null,image:"images/lighting/zen-aroma-lamp/main.jpg",images:["images/lighting/zen-aroma-lamp/main.jpg","images/lighting/zen-aroma-lamp/light-on.jpg"],descriptionZh:"柔和灯光与香薰功能，营造安静舒适的SPA空间。",descriptionEn:"Soft lighting and aroma diffusion create a calm and comfortable spa atmosphere.",featuresZh:["柔和灯光","香薰功能","静音设计"],featuresEn:["Soft lighting","Aroma diffusion","Quiet operation"],badgeZh:"新品",badgeEn:"New",featured:true,inStock:true},
  {id:14,group:"printed",category:"price-lists",categoryZh:"价目表",categoryEn:"Price Lists",nameZh:"双语SPA价目表",nameEn:"Bilingual Spa Price List",price:0,oldPrice:null,image:"images/price-lists/bilingual-spa-price-list/main.jpg",images:["images/price-lists/bilingual-spa-price-list/main.jpg","images/price-lists/bilingual-spa-price-list/front.jpg","images/price-lists/bilingual-spa-price-list/detail.jpg"],descriptionZh:"支持中英文双语设计，可定制店名、服务内容、价格和尺寸。",descriptionEn:"Custom bilingual spa price list with editable business name, services, pricing, and size.",featuresZh:["免费设计","支持定制","多种尺寸"],featuresEn:["Free design","Customizable","Multiple sizes"],badgeZh:"定制",badgeEn:"Custom",featured:true,inStock:true},
  {id:15,group:"printed",category:"price-lists",categoryZh:"价目表",categoryEn:"Price Lists",nameZh:"双语SPA价目表",nameEn:"Bilingual Spa Price List",price:0,oldPrice:null,image:"images/massage-bed/储水式头疗床/储水式头疗床1.png",images:["images/massage-bed/储水式头疗床/储水式头疗床1.png"],descriptionZh:"支持中英文双语设计，可定制店名、服务内容、价格和尺寸。",descriptionEn:"Custom bilingual spa price list with editable business name, services, pricing, and size.",featuresZh:["免费设计","支持定制","多种尺寸"],featuresEn:["Free design","Customizable","Multiple sizes"],badgeZh:"",badgeEn:"",featured:false,inStock:false},

];

/* THÊM SẢN PHẨM: copy một object phía trên, đổi id, group, category và nội dung. */

import { wbPackaging, type WbPackaging } from './wb-dimensions.generated'
import { shopGallery } from './shop-gallery.generated'
export { shopCategories, type ShopCategory } from './shop-categories'

export type ShopItem = {
  id: number
  /**
   * Публичный адрес товара: /shop/<slug>. Значение зафиксировано в каталоге и
   * менять его нельзя — это сломает внешние ссылки и позиции в выдаче.
   * Изначально взят из карточки WB, одинаковые разведены суффиксом -2.
   */
  slug: string
  /** Артикул продавца (vendorCode на WB) — уходит в письмо о заказе. */
  sku: string
  /** Наличие. Ведётся вручную: на сайте свой склад, а не остатки WB. */
  inStock: boolean
  title: string
  category: string
  categoryName: string
  price: number
  /** Главное фото — оно же первое в `images`. */
  image: string
  /** Все фото товара. Первое совпадает с `image`. */
  images: string[]
  wbUrl: string
  /** Короткий текст для карточки в списке. Полный — в shop-descriptions.generated. */
  desc: string
  /** Габариты упаковки и вес — нужны для расчёта доставки. Из выгрузки WB. */
  packaging?: WbPackaging
}

/** Записи каталога как они лежат в файле: галерея и габариты подмешиваются ниже. */
type CatalogEntry = Omit<ShopItem, 'images' | 'packaging'>

const catalog: CatalogEntry[] = [
  {
    "id": 355794658,
    "slug": "dekorativnyj-serf-dlya-interera-summer-summer-summer",
    "sku": "surf_summer_summer_summer",
    "inStock": true,
    "title": "Декоративный серф для интерьера Summer summer summer",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/355794658.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/355794658/detail.aspx",
    "desc": "Добавьте оригинальности вашему интерьеру с помощью декоративного сёрфа. Этот стильный элемент станет отличным акцентом в любом помещении, будь то гостиная, спальня или офис. Сёрф имеет размеры 75х23,5 см, что делает его идеальным для размещения на ст"
  },
  {
    "id": 762364207,
    "slug": "dekorativnyj-serf-dlya-interera-surfer-girl-zheltyj",
    "sku": "surfer_girl",
    "inStock": true,
    "title": "Декоративный серф для интерьера Surfer Girl желтый",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/762364207.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/762364207/detail.aspx",
    "desc": "Будьте первыми, кто оценит новинку! Декоративный сёрф Surfer Girl в жёлтом цвете: яркий штрих для вашего интерьера  Этот стильный декоративный сёрф — не просто элемент оформления, а настоящее воплощение духа океана и беззаботного отдыха. Сочный жёлты"
  },
  {
    "id": 895567312,
    "slug": "dekorativnyj-serf-chanel-oblaka-75kh23-5kh0-6-sm",
    "sku": "chanel_pink_clouds",
    "inStock": true,
    "title": "Декоративный серф chanel (облака) , 75х23,5х0,6 см",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/895567312.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/895567312/detail.aspx",
    "desc": "Добавьте нотку парижской элегантности и прибрежного шика в ваш интерьер с декоративным серфом — стильным настенным панно, вдохновлённым эстетикой высокой моды.  Изящные линии и утончённый дизайн создают атмосферу лёгкости и роскоши, напоминая о сочет"
  },
  {
    "id": 895563652,
    "slug": "dekorativnyj-serf-chanel-bel-75kh23-5kh0-6-sm",
    "sku": "chanel_white",
    "inStock": true,
    "title": "Декоративный серф chanel (бел) , 75х23,5х0,6 см",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/895563652.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/895563652/detail.aspx",
    "desc": "Добавьте нотку парижской элегантности и прибрежного шика в ваш интерьер с декоративным серфом — стильным настенным панно, вдохновлённым эстетикой высокой моды.  Изящные линии и утончённый дизайн создают атмосферу лёгкости и роскоши, напоминая о сочет"
  },
  {
    "id": 895553579,
    "slug": "dekorativnyj-serf-dlya-interer-guchchi-zhelt-75kh23-5kh0-6-sm",
    "sku": "gucci_yellow",
    "inStock": true,
    "title": "Декоративный серф для интерьер гуччи (желт) , 75х23,5х0,6 см",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/895553579.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/895553579/detail.aspx",
    "desc": "Стильный декоративный серф с узнаваемым паттерном в духе эстетики Gucci — эффектное настенное панно, которое добавит интерьеру нотку итальянского шика и премиальности.  Изысканный принт с монограммным узором нанесён методом УФ‑печати — это обеспечива"
  },
  {
    "id": 895306269,
    "slug": "dekorativnyj-serf-dlya-interera-lui-vitton-75kh23-5kh0-6-sm",
    "sku": "louis_pattern",
    "inStock": true,
    "title": "Декоративный серф для интерьера луи виттон , 75х23,5х0,6 см",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/895306269.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/895306269/detail.aspx",
    "desc": "Добавьте в интерьер нотку парижского шика и утончённой роскоши с декоративным серфом — стильным настенным панно с изысканным геометрическим принтом, напоминающим винтажные монограммы.  Благородный узор в сочетании с элегантными пропорциями доски созд"
  },
  {
    "id": 895289684,
    "slug": "serf-dekor-lv-ufpechat-zolotogo-logotipa-7523-50-6-sm",
    "sku": "louis_gold",
    "inStock": true,
    "title": "Серф-декор LV, УФ‑печать золотого логотипа, 75×23,5×0,6 см",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/895289684.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/895289684/detail.aspx",
    "desc": "Роскошный декоративный серф с культовым логотипом LouisVuitton — эффектное настенное панно, которое добавит интерьеру нотку парижского шика и премиальности.  Крупный золотой логотип LouisVuitton нанесён методом УФ‑печати — это обеспечивает:  высокую "
  },
  {
    "id": 892849768,
    "slug": "dekorativnyj-serf-gucci-7523-50-6-sm-panno-na-stenu",
    "sku": "gucci_pink",
    "inStock": true,
    "title": "Декоративный серф Gucci, 75×23,5×0,6 см, панно на стену",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/892849768.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/892849768/detail.aspx",
    "desc": "Добавьте в интерьер нотку романтического шика и природной красоты с декоративным серфом — стильным настенным панно с изящным цветочным принтом в нежных розовых тонах.  Нежный розовый оттенок в сочетании с ботаническим орнаментом создаёт атмосферу уто"
  },
  {
    "id": 892560422,
    "slug": "dekorativnyj-serf-dlya-interera-chernyj-75kh23-5kh0-6-sm-1-sht",
    "sku": "chanel_black",
    "inStock": true,
    "title": "Декоративный серф для интерьера черный, 75х23,5х0,6 см, 1 шт",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/892560422.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/892560422/detail.aspx",
    "desc": "Добавьте нотку парижской элегантности и прибрежного шика в ваш интерьер с декоративным серфом — стильным настенным панно, вдохновлённым эстетикой высокой моды.  Изящные линии и утончённый дизайн создают атмосферу лёгкости и роскоши, напоминая о сочет"
  },
  {
    "id": 768647477,
    "slug": "dekorativnyj-serf-dlya-interera-live-in-motion",
    "sku": "live in motion",
    "inStock": true,
    "title": "Декоративный серф для интерьера live in motion",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/768647477.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/768647477/detail.aspx",
    "desc": "Будьте первыми, кто оценит новинку!  Декоративный сёрф «live in motion» — магия заката в вашем интерьере  Яркий арт‑объект с динамичной сценой: мальчик покоряет волну на сёрфе под закатным небом, где в нежных тонах сливаются фиолетовый, розовый (как "
  },
  {
    "id": 768615262,
    "slug": "dekorativnyj-serf-dlya-interera-summer-vibes-men",
    "sku": "summer_viber_new",
    "inStock": true,
    "title": "Декоративный серф для интерьера summer vibes men",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/768615262.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/768615262/detail.aspx",
    "desc": "Будьте первыми, кто оценит новинку!  Декоративный сёрф «Summer Vibes Men» — энергия пляжного лета в вашем интерьере Динамичный арт с бегущим по пляжу мужчиной воплощает дух свободного лета. Сёрф передаёт атмосферу беззаботного отдыха: песок, солнце и"
  },
  {
    "id": 767110860,
    "slug": "dekorativnyj-serf-dlya-interera-lazurnyj-plyazh",
    "sku": "лазурный пляж",
    "inStock": true,
    "title": "Декоративный серф для интерьера лазурный пляж",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/767110860.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/767110860/detail.aspx",
    "desc": "Будьте первыми, кто оценит новинку! Декоративный сёрф «Лазурный берег» — воплощение летнего релакса  Позвольте этому сёрфу перенести вас на идеальный пляж: лазурная вода, уютные лежаки в тени пальм и безмятежное солнце. Реалистичный принт создаёт эфф"
  },
  {
    "id": 766941530,
    "slug": "dekorativnyj-serf-dlya-interera-plyazh-s-kokosami",
    "sku": "сёрф_пляж_с_кокосами",
    "inStock": true,
    "title": "Декоративный серф для интерьера Пляж с кокосами",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/766941530.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/766941530/detail.aspx",
    "desc": "Будьте первыми, кто оценит новинку! Декоративный сёрф «Пляж с кокосами» — кусочек тропического рая у вас дома  Погрузитесь в атмосферу безмятежного отдыха с декоративным сёрфом, на котором запечатлён живописный пляжный пейзаж: золотистый песок, пальм"
  },
  {
    "id": 766679469,
    "slug": "dekorativnyj-serf-dlya-interera-osminog",
    "sku": "сёрф_осьминог",
    "inStock": true,
    "title": "Декоративный серф для интерьера Осьминог",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/766679469.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/766679469/detail.aspx",
    "desc": "Будьте первыми, кто оценит новинку! Декоративный сёрф «Осьминог» (ч/б) — арт‑объект с морским характером  Строгий чёрно‑белый сёрф с графическим изображением осьминога — это сочетание минимализма и морской романтики. Лаконичная палитра и выразительны"
  },
  {
    "id": 766652532,
    "slug": "dekorativnyj-serf-dlya-interera-life-comes-in-waves",
    "sku": "life comes in waves",
    "inStock": true,
    "title": "Декоративный серф для интерьера life comes in waves",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/766652532.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/766652532/detail.aspx",
    "desc": "Будьте первыми, кто оценит новинку! Декоративный сёрф «Life Comes in Waves» (ч/б) — лаконичный символ океанского ритма  Элегантный чёрно‑белый сёрф с надписью Life Comes in Waves — это не просто украшение стены, а философский акцент для тех, кто цени"
  },
  {
    "id": 766630278,
    "slug": "dekorativnyj-serf-dlya-interera-aloha-hawaii",
    "sku": "aloha_hawaii",
    "inStock": true,
    "title": "Декоративный серф для интерьера ALOHA HAWAII",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/766630278.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/766630278/detail.aspx",
    "desc": "Будьте первыми, кто оценит новинку! Декоративный сёрф «Aloha Hawaii» — взрыв тропического настроения в вашем интерьере  Яркий, сочный, полный энергии — сёрф «Aloha Hawaii» перенесёт вас прямиком на солнечные пляжи Гавайев. Насыщенные цвета, выразител"
  },
  {
    "id": 766603348,
    "slug": "dekorativnyj-serf-dlya-interera-life-is-a-beach",
    "sku": "surf_life_is_a_beach",
    "inStock": true,
    "title": "Декоративный серф для интерьера LIFE is a BEACH",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/766603348.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/766603348/detail.aspx",
    "desc": "Будьте первыми, кто оценит новинку! Декоративный сёрф «Life is a Beach» в молочно‑синем оттенке  Спокойствие океана и философия беззаботного отдыха — в лаконичном дизайне. Сёрф в изысканном молочно‑синем цвете с минималистичной надписью Life is a Bea"
  },
  {
    "id": 766395251,
    "slug": "dekorativnyj-serf-dlya-interera-born-to-surf",
    "sku": "burn_to_surf",
    "inStock": true,
    "title": "Декоративный серф для интерьера BORN to SURF",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/766395251.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/766395251/detail.aspx",
    "desc": "Будьте первыми, кто оценит новинку! Декоративный сёрф «Burn to Surf» в трендовых оттенках бургунди и молочного  Лаконичность, стиль и дух свободы — в каждой линии. Этот сёрф сочетает глубокий оттенок бургунди с нежным молочным тоном и минималистичной"
  },
  {
    "id": 766247563,
    "slug": "dekorativnyj-serf-dlya-interera-summer-vibes-2",
    "sku": "surf_sponge_bob",
    "inStock": true,
    "title": "Декоративный серф для интерьера Summer vibes",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/766247563.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/766247563/detail.aspx",
    "desc": "Будьте первыми, кто оценит новинку! Декоративный сёрф «Summer vibes» — веселье на волне!  Подарите себе и близким кусочек подводного веселья с декоративным сёрфом, на котором запечатлены любимые герои.  Почему этот сёрф станет хитом:  Яркий дизайн: с"
  },
  {
    "id": 766189423,
    "slug": "dekorativnyj-serf-dlya-interera-surfer-girl-rozovyj",
    "sku": "surfer girl_pink",
    "inStock": true,
    "title": "Декоративный серф для интерьера Surfer Girl розовый",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/766189423.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/766189423/detail.aspx",
    "desc": "Будьте первыми, кто оценит новинку! Декоративный сёрф Surfer Girl в ярко‑розовом цвете: смелый акцент для яркого интерьера  Этот энергичный декоративный сёрф — настоящий взрыв цвета и настроения! Сочный ярко‑розовый оттенок превращает его в эффектный"
  },
  {
    "id": 355794659,
    "slug": "dekorativnyj-serf-dlya-interera-summer-vibes",
    "sku": "surf_summer_vibes",
    "inStock": true,
    "title": "Декоративный серф для интерьера Summer vibes",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/355794659.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/355794659/detail.aspx",
    "desc": "Добавьте оригинальности вашему интерьеру с помощью декоративного сёрфа. Этот стильный элемент станет отличным акцентом в любом помещении, будь то гостиная, спальня или офис. Сёрф выполнен в сером цвете и имеет размеры 75х23,5 см, что делает его идеал"
  },
  {
    "id": 355782508,
    "slug": "dekorativnyj-serf-dlya-interera-ray-of-sunshine",
    "sku": "surf_ray_of_sunshine",
    "inStock": true,
    "title": "Декоративный серф для интерьера Ray of sunshine",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/355782508.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/355782508/detail.aspx",
    "desc": "Добавьте оригинальности вашему интерьеру с помощью декоративного сёрфа. Этот стильный элемент станет отличным акцентом в любом помещении, будь то гостиная, спальня или офис. Сёрф имеет размеры 75х23,5 см, что делает его идеальным для размещения на ст"
  },
  {
    "id": 355771751,
    "slug": "dekorativnyj-serf-dlya-interera-summer-state-mind",
    "sku": "surf_summer_state_mind",
    "inStock": true,
    "title": "Декоративный серф для интерьера Summer state mind",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/355771751.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/355771751/detail.aspx",
    "desc": "Добавьте оригинальности вашему интерьеру с помощью декоративного сёрфа. Этот стильный элемент станет отличным акцентом в любом помещении, будь то гостиная, спальня или офис. Сёрф имеет размеры 75х23,5 см, что делает его идеальным для размещения на ст"
  },
  {
    "id": 351070743,
    "slug": "dekorativnyj-serf-dlya-interera-find-your-flow",
    "sku": "surf_find your flow",
    "inStock": true,
    "title": "Декоративный серф для интерьера Find your flow",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/351070743.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/351070743/detail.aspx",
    "desc": "Добавьте оригинальности вашему интерьеру с помощью декоративного сёрфа. Этот стильный элемент станет отличным акцентом в любом помещении, будь то гостиная, спальня или офис. Сёрф имеет размеры 75х23,5 см, что делает его идеальным для размещения на ст"
  },
  {
    "id": 351065503,
    "slug": "dekorativnyj-serf-dlya-interera-follow-your-dream",
    "sku": "surf_follow_your_dream",
    "inStock": true,
    "title": "Декоративный серф для интерьера Follow your dream",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/351065503.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/351065503/detail.aspx",
    "desc": "Добавьте оригинальности вашему интерьеру с помощью декоративного сёрфа. Этот стильный элемент станет отличным акцентом в любом помещении, будь то гостиная, спальня или офис. Сёрф имеет размеры 75х23,5 см, что делает его идеальным для размещения на ст"
  },
  {
    "id": 263033507,
    "slug": "dekorativnyj-serf-dlya-interera-your-amazing-summer",
    "sku": "surf_amazing_summer",
    "inStock": true,
    "title": "Декоративный серф для интерьера Your amazing summer",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/263033507.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/263033507/detail.aspx",
    "desc": "Добавьте оригинальности вашему интерьеру с помощью декоративного сёрфа. Этот стильный элемент станет отличным акцентом в любом помещении, будь то гостиная, спальня или офис. Сёрф выполнен в сером цвете и имеет размеры 75х23,5 см, что делает его идеал"
  },
  {
    "id": 263033506,
    "slug": "dekorativnyj-serf-dlya-interera-ocean-spirit",
    "sku": "surf_ocean_spirit",
    "inStock": true,
    "title": "Декоративный серф для интерьера Ocean Spirit",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/263033506.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/263033506/detail.aspx",
    "desc": "Добавьте оригинальности вашему интерьеру с помощью декоративного сёрфа. Этот стильный элемент станет отличным акцентом в любом помещении, будь то гостиная, спальня или офис. Сёрф выполнен в сером цвете и имеет размеры 75х23,5 см, что делает его идеал"
  },
  {
    "id": 263030506,
    "slug": "dekorativnyj-serf-dlya-interera-hello-summer",
    "sku": "surf_hello_summer",
    "inStock": true,
    "title": "Декоративный серф для интерьера Hello Summer",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 1790,
    "image": "/shop-images/263030506.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/263030506/detail.aspx",
    "desc": "Добавьте оригинальности вашему интерьеру с помощью декоративного сёрфа. Этот стильный элемент станет отличным акцентом в любом помещении, будь то гостиная, спальня или офис. Сёрф выполнен в сером цвете и имеет размеры 75х23,5 см, что делает его идеал"
  },
  {
    "id": 186737476,
    "slug": "sortirovshhik-detalej-konstruktora-lego",
    "sku": "sortlego5level",
    "inStock": true,
    "title": "Сортировщик деталей конструктора лего",
    "category": "konstruktory",
    "categoryName": "Конструкторы",
    "price": 13900,
    "image": "/shop-images/186737476.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/186737476/detail.aspx",
    "desc": "Сортировщик деталей конструктора LEGO от \"Центр лазерной резки\" - это незаменимый помощник для всех любителей LEGO, независимо от возраста. Изготовленный из прочной березовой фанеры, он имеет 5 этажей с 4 фильтрами и дном, что позволяет удобно и комп"
  },
  {
    "id": 817567205,
    "slug": "sortirovshhik-detalej-konstruktora-po-razmeram-4-urovnya",
    "sku": "sortlego_mini",
    "inStock": true,
    "title": "Сортировщик деталей конструктора по размерам, 4 уровня",
    "category": "konstruktory",
    "categoryName": "Конструкторы",
    "price": 7600,
    "image": "/shop-images/817567205.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/817567205/detail.aspx",
    "desc": "Сортировщик деталей конструктора — ваш помощник в борьбе с хаосом  Устали перебирать тысячи деталей вручную? Наш сортировщик сделает это за вас: всего одно движение — и все элементы разложены по размерам!  Ключевые преимущества:  Автоматизация: не ну"
  },
  {
    "id": 963848845,
    "slug": "altar-runicheskij-valknut-koltsa-borromeo-bestsvetnyj",
    "sku": "big_valknut_colorless",
    "inStock": true,
    "title": "Алтарь рунический Валькнут кольца Борромео бесцветный",
    "category": "runy",
    "categoryName": "Предсказания сувенирные",
    "price": 1590,
    "image": "/shop-images/963848845.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/963848845/detail.aspx",
    "desc": "Алтарь для гадания диаметром 25 см с рисунком Валькнут и рунами старшего футарка из фанеры толщиной 6 мм, покрыт маслом с воском, цвет серый. Основной компонент покрытия это натуральное льняное масло, в первое время оно пахнет, в тепле за несколько д"
  },
  {
    "id": 592856777,
    "slug": "magicheskij-altar-zarya-alatyr-krest-svaroga-seryj",
    "sku": "altar_alatyr_gray",
    "inStock": true,
    "title": "Магический алтарь \"Заря-Алатырь, Крест Сварога\", серый",
    "category": "runy",
    "categoryName": "Предсказания сувенирные",
    "price": 1590,
    "image": "/shop-images/592856777.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/592856777/detail.aspx",
    "desc": "Магический алтарь \"Заря-Алатырь, Крест Сварога\" в сером цвете станет прекрасным дополнением к вашим ритуалам и практикам. Этот алтарь, выполненный в форме креста Сварога, поможет вам создать особую атмосферу для медитаций, гаданий и других магических"
  },
  {
    "id": 567285841,
    "slug": "magicheskij-altar-zarya-alatyr-krest-svaroga-bestsvetnyj",
    "sku": "altar_alatyr_colorless",
    "inStock": true,
    "title": "Магический алтарь \"Заря-Алатырь, Крест Сварога\", бесцветный",
    "category": "runy",
    "categoryName": "Предсказания сувенирные",
    "price": 1590,
    "image": "/shop-images/567285841.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/567285841/detail.aspx",
    "desc": "Алтарь \"Заря-Алатырь, Крест Сварога\" - это уникальный предмет, который станет прекрасным дополнением к вашим магическим практикам или просто интересным сувениром. Его бесцветный дизайн позволяет легко вписать его в любой интерьер, при этом он сохраня"
  },
  {
    "id": 541345760,
    "slug": "altar-runicheskij-s-risunkom-valknut-koltsa-borromeo-seryj",
    "sku": "big_valknut_gray",
    "inStock": true,
    "title": "Алтарь рунический с рисунком Валькнут кольца Борромео, серый",
    "category": "runy",
    "categoryName": "Предсказания сувенирные",
    "price": 1670,
    "image": "/shop-images/541345760.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/541345760/detail.aspx",
    "desc": "Алтарь для гадания диаметром 25 см с рисунком Валькнут и рунами старшего футарка из фанеры толщиной 6 мм, покрыт маслом с воском, цвет серый. Основной компонент покрытия это натуральное льняное масло, в первое время оно пахнет, в тепле за несколько д"
  },
  {
    "id": 200084636,
    "slug": "altar-dlya-ritualov-runicheskij-krug-s-risunkom-valknut-2",
    "sku": "altar_valknut_colorless",
    "inStock": true,
    "title": "Алтарь для ритуалов рунический круг с рисунком Валькнут",
    "category": "runy",
    "categoryName": "Предсказания сувенирные",
    "price": 1590,
    "image": "/shop-images/200084636.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/200084636/detail.aspx",
    "desc": "Алтарь для гадания диаметром 25 см с рисунком Валькнут и рунами старшего футарка из фанеры толщиной 6 мм, покрыт бесцветным маслом с воском. Основной компонент покрытия это натуральное льняное масло, в первое время оно пахнет, в тепле за несколько дн"
  },
  {
    "id": 155757277,
    "slug": "altar-dlya-ritualov-s-derevom-zhizni-tsvet-naturalnyj",
    "sku": "altar_tree_colorless",
    "inStock": true,
    "title": "Алтарь для ритуалов с деревом жизни цвет натуральный",
    "category": "runy",
    "categoryName": "Предсказания сувенирные",
    "price": 2385,
    "image": "/shop-images/155757277.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/155757277/detail.aspx",
    "desc": "Алтарь для гадания диаметром 25 см с рисунком Иггдрасиль и рунами старшего футарка, из фанеры толщиной 6 мм, покрыт маслом с воском, бецветный. Основной компонент покрытия это натуральное льняное масло, в первое время оно пахнет, в тепле за несколько"
  },
  {
    "id": 146375573,
    "slug": "altar-dlya-ritualov-runicheskij-krug-s-risunkom-valknut",
    "sku": "altar_valknut_gray",
    "inStock": true,
    "title": "Алтарь для ритуалов рунический круг с рисунком Валькнут",
    "category": "runy",
    "categoryName": "Предсказания сувенирные",
    "price": 1590,
    "image": "/shop-images/146375573.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/146375573/detail.aspx",
    "desc": "Алтарь для гадания диаметром 25 см с рисунком Валькнут и рунами старшего футарка из фанеры толщиной 6 мм, покрыт маслом с воском, цвет серый. Основной компонент покрытия это натуральное льняное масло, в первое время оно пахнет, в тепле за несколько д"
  },
  {
    "id": 146373712,
    "slug": "altar-dlya-ritualov-runicheskij-krug-s-derevom-zhizni-seryj",
    "sku": "altar_tree_gray",
    "inStock": true,
    "title": "Алтарь для ритуалов, рунический круг с деревом жизни серый",
    "category": "runy",
    "categoryName": "Предсказания сувенирные",
    "price": 2650,
    "image": "/shop-images/146373712.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/146373712/detail.aspx",
    "desc": "Алтарь для гадания диаметром 25 см с рисунком Иггдрасиль и рунами старшего футарка, из фанеры толщиной 6 мм, покрыт маслом с воском, цвет серый. Основной компонент покрытия это натуральное льняное масло, в первое время оно пахнет, в тепле за нескольк"
  },
  {
    "id": 943569661,
    "slug": "gerb-sakhalinskaya-oblast",
    "sku": "gerb_sakhalinskaya_oblast",
    "inStock": true,
    "title": "Герб Сахалинская область",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2670,
    "image": "/shop-images/943569661.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/943569661/detail.aspx",
    "desc": "Настенный щит с гербом Сахалинской области — выразительный элемент декора, подчёркивающий связь с уникальным регионом России. Изделие выполнено из МДФ толщиной 6 мм, изображение нанесено с помощью УФ‑чернил — они не выцветают со временем и сохраняют "
  },
  {
    "id": 943605517,
    "slug": "gerb-uglegorskogo-rajona-sakhalinskoj-oblasti",
    "sku": "gerb uglerodskogo rayona sakhalinskoy oblasti",
    "inStock": true,
    "title": "Герб Углегорского района Сахалинской области",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2670,
    "image": "/shop-images/943605517.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/943605517/detail.aspx",
    "desc": "Настенный щит с гербом Углегорского района Сахалинской области — выразительный элемент декора, подчёркивающий связь с самобытным регионом Дальнего Востока. Изделие выполнено из фанеры и напечатано УФ‑чернилами, размещено на щите из МДФ толщиной 6 мм."
  },
  {
    "id": 320858711,
    "slug": "lyustra-loft-potolochnaya-podvesnaya-shishka",
    "sku": "lustra_shishka",
    "inStock": true,
    "title": "Люстра лофт потолочная подвесная \"Шишка\"",
    "category": "lustry",
    "categoryName": "Люстры",
    "price": 8127,
    "image": "/shop-images/320858711.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/320858711/detail.aspx",
    "desc": "Люстра \"Шишка\" из фанеры станет стильным и функциональным дополнением к вашему интерьеру. Ее лаконичный дизайн в стиле винтаж, лофт или скандинавский органично впишется в гостиную, кабинет или мансарду. Матовый плафон с декоративными лепестками рассе"
  },
  {
    "id": 322268543,
    "slug": "lyustra-loft-potolochnaya-podvesnaya-evolyutsiya",
    "sku": "lustra_evolution",
    "inStock": true,
    "title": "Люстра лофт потолочная подвесная \"Эволюция\"",
    "category": "lustry",
    "categoryName": "Люстры",
    "price": 4100,
    "image": "/shop-images/322268543.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/322268543/detail.aspx",
    "desc": "Люстра \"Эволюция\" из фанеры станет стильным и функциональным дополнением к вашему интерьеру. Ее лаконичный дизайн в стиле винтаж, лофт или скандинавский органично впишется в гостиную, кабинет или мансарду. Матовый плафон с декоративными ламелями расс"
  },
  {
    "id": 924989835,
    "slug": "panno-znaki-urbanart-your-way-50kh62sm-mdf",
    "sku": "znak_your_way",
    "inStock": true,
    "title": "Панно-знаки: урбанарт your way 50х62см, мдф",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2250,
    "image": "/shop-images/924989835.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/924989835/detail.aspx",
    "desc": "Декоративные панно в виде дорожных знаков — добавьте урбанистический шик в свой интерьер!  Хотите сделать пространство уникальным и запоминающимся? Представляем коллекцию декоративных панно в форме дорожных знаков — идеальное решение для тех, кто цен"
  },
  {
    "id": 922780000,
    "slug": "panno-znaki-urbanart-stop-50kh50sm-mdf",
    "sku": "znak_stop",
    "inStock": true,
    "title": "Панно-знаки: урбанарт stop 50х50см, мдф",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 4500,
    "image": "/shop-images/922780000.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/922780000/detail.aspx",
    "desc": "Декоративные панно в виде дорожных знаков — добавьте урбанистический шик в свой интерьер!  Хотите сделать пространство уникальным и запоминающимся? Представляем коллекцию декоративных панно в форме дорожных знаков — идеальное решение для тех, кто цен"
  },
  {
    "id": 924980141,
    "slug": "panno-znaki-urbanart-no-mercy-white-50kh50sm-mdf",
    "sku": "znak_no_mercy_white",
    "inStock": true,
    "title": "Панно-знаки: урбанарт no mercy white 50х50см, мдф",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2250,
    "image": "/shop-images/924980141.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/924980141/detail.aspx",
    "desc": "Декоративные панно в виде дорожных знаков — добавьте урбанистический шик в свой интерьер!  Хотите сделать пространство уникальным и запоминающимся? Представляем коллекцию декоративных панно в форме дорожных знаков — идеальное решение для тех, кто цен"
  },
  {
    "id": 924977920,
    "slug": "panno-znaki-urbanart-no-mercy-black-50kh50sm-mdf",
    "sku": "znak_no_mercy_black",
    "inStock": true,
    "title": "Панно-знаки: урбанарт no mercy black 50х50см, мдф",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2250,
    "image": "/shop-images/924977920.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/924977920/detail.aspx",
    "desc": "Декоративные панно в виде дорожных знаков — добавьте урбанистический шик в свой интерьер!  Хотите сделать пространство уникальным и запоминающимся? Представляем коллекцию декоративных панно в форме дорожных знаков — идеальное решение для тех, кто цен"
  },
  {
    "id": 924983092,
    "slug": "panno-znaki-urbanart-no-limits-black-50kh50sm-mdf",
    "sku": "znak_no_limits",
    "inStock": true,
    "title": "Панно-знаки: урбанарт no limits black 50х50см, мдф",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2250,
    "image": "/shop-images/924983092.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/924983092/detail.aspx",
    "desc": "Декоративные панно в виде дорожных знаков — добавьте урбанистический шик в свой интерьер!  Хотите сделать пространство уникальным и запоминающимся? Представляем коллекцию декоративных панно в форме дорожных знаков — идеальное решение для тех, кто цен"
  },
  {
    "id": 922778456,
    "slug": "panno-znaki-urbanart-eyes-50kh57sm-mdf",
    "sku": "znak_eyes",
    "inStock": true,
    "title": "Панно-знаки: урбанарт eyes 50х57см, мдф",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2250,
    "image": "/shop-images/922778456.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/922778456/detail.aspx",
    "desc": "Декоративные панно в виде дорожных знаков — добавьте урбанистический шик в свой интерьер!  Хотите сделать пространство уникальным и запоминающимся? Представляем коллекцию декоративных панно в форме дорожных знаков — идеальное решение для тех, кто цен"
  },
  {
    "id": 924966578,
    "slug": "panno-znaki-urbanart-dont-panic-50kh50sm-mdf",
    "sku": "znak_dontpanic",
    "inStock": true,
    "title": "Панно-знаки: урбанарт dont panic 50х50см, мдф",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2250,
    "image": "/shop-images/924966578.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/924966578/detail.aspx",
    "desc": "Декоративные панно в виде дорожных знаков — добавьте урбанистический шик в свой интерьер!  Хотите сделать пространство уникальным и запоминающимся? Представляем коллекцию декоративных панно в форме дорожных знаков — идеальное решение для тех, кто цен"
  },
  {
    "id": 924972620,
    "slug": "panno-znaki-urbanart-disrup-50kh50sm-mdf",
    "sku": "znak_disrup",
    "inStock": true,
    "title": "Панно-знаки: урбанарт disrup 50х50см, мдф",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2250,
    "image": "/shop-images/924972620.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/924972620/detail.aspx",
    "desc": "Декоративные панно в виде дорожных знаков — добавьте урбанистический шик в свой интерьер!  Хотите сделать пространство уникальным и запоминающимся? Представляем коллекцию декоративных панно в форме дорожных знаков — идеальное решение для тех, кто цен"
  },
  {
    "id": 924997223,
    "slug": "panno-znaki-urbanart-obsession-50kh46sm-mdf",
    "sku": "znak_obsession",
    "inStock": true,
    "title": "Панно-знаки: урбанарт obsession 50х46см, мдф",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2250,
    "image": "/shop-images/924997223.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/924997223/detail.aspx",
    "desc": "Декоративные панно в виде дорожных знаков — добавьте урбанистический шик в свой интерьер!  Хотите сделать пространство уникальным и запоминающимся? Представляем коллекцию декоративных панно в форме дорожных знаков — идеальное решение для тех, кто цен"
  },
  {
    "id": 901681341,
    "slug": "stellazh-montessori-s-zadnej-stenkoj-3-urovnya-77kh75kh36-sm",
    "sku": "polka_montessory",
    "inStock": true,
    "title": "Стеллаж Монтессори с задней стенкой, 3 уровня, 77х75х36 см",
    "category": "stellazhi",
    "categoryName": "Стеллажи",
    "price": 5000,
    "image": "/shop-images/901681341.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/901681341/detail.aspx",
    "desc": "Стеллаж Монтессори: порядок, безопасность и развитие в каждой детали  Практичный стеллаж в стиле Монтессори — идеальное решение для организации пространства в детской комнате, спальне, прихожей или гостиной. Модель с 3вместительными полками и защитно"
  },
  {
    "id": 903431735,
    "slug": "gerb-adygeya-nastennaya-dekoratsiya",
    "sku": "gerb_adygea",
    "inStock": true,
    "title": "Герб Адыгея настенная декорация",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 4500,
    "image": "/shop-images/903431735.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/903431735/detail.aspx",
    "desc": "Герб Республики Адыгея — символ истории и традиций на стене вашего дома  Почувствуйте связь с богатой культурой и наследием Адыгеи, украсив интерьер настоящим произведением геральдического искусства!  Настенный герб Республики Адыгея — это не просто "
  },
  {
    "id": 815153196,
    "slug": "gerb-tatarstana-na-stenu",
    "sku": "gerb_tatarstan",
    "inStock": true,
    "title": "Герб Татарстана на стену",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2492,
    "image": "/shop-images/815153196.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/815153196/detail.aspx",
    "desc": "Герб Татарстана на стену от Центра лазерной резки станет стильным и оригинальным украшением вашего интерьера. Изготовленный с высокой точностью лазерной резки, герб выполнен в ярком красном цвете и привнесет в ваш дом или офис нотку национального кол"
  },
  {
    "id": 861431291,
    "slug": "gerb-tatarstana-na-stenu-2",
    "sku": "tatartstan_2_gerb",
    "inStock": true,
    "title": "Герб Татарстана на стену",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2492,
    "image": "/shop-images/861431291.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/861431291/detail.aspx",
    "desc": "Герб Татарстана на стену от Центра лазерной резки станет стильным и оригинальным украшением вашего интерьера. Изготовленный с высокой точностью лазерной резки, герб выполнен в ярком красном цвете и привнесет в ваш дом или офис нотку национального кол"
  },
  {
    "id": 861520779,
    "slug": "gerb-bashkortostana-nastennaya-dekoratsiya",
    "sku": "gerb_bashkortostan",
    "inStock": true,
    "title": "Герб Башкортостана настенная декорация",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2492,
    "image": "/shop-images/861520779.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/861520779/detail.aspx",
    "desc": "Герб Республики Башкортостан на МДФ с УФ‑печатью: символ региона в безупречном исполнении  Подчеркните статусность и связь с традициями — оформите интерьер с помощью качественного герба Республики Башкортостан. Изделие идеально подойдёт для кабинетов"
  },
  {
    "id": 223845904,
    "slug": "gerb-rossii-na-stenu",
    "sku": "gerb_russia",
    "inStock": true,
    "title": "Герб России на стену",
    "category": "dekor",
    "categoryName": "Декорации настенные",
    "price": 2670,
    "image": "/shop-images/223845904.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/223845904/detail.aspx",
    "desc": "Настенный щит с гербом Российской Федерации, выполненный из фанеры и напечатанный УФ-чернилами.  Двуглавый Орел - это официальный государственный символ, станет прекрасным декором для кабинета, офиса или дома. Герб России на стену добавит штрих офици"
  },
  {
    "id": 874246986,
    "slug": "nastennaya-stellazh-polka-organajzer-dlya-instrumentov-v-garazh",
    "sku": "Polka_organaizer_instr",
    "inStock": true,
    "title": "Настенная стеллаж полка органайзер для инструментов в гараж",
    "category": "organajzery",
    "categoryName": "Органайзеры подвесные",
    "price": 2250,
    "image": "/shop-images/874246986.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/874246986/detail.aspx",
    "desc": "Наведите порядок в гараже: настенная полка‑органайзер для шуруповёрта и УШМ  Забудьте о беспорядке и долгих поисках нужного инструмента! Настенная полка‑органайзер — идеальное решение для гаража. Всё под рукой: шуруповёрт, угловая шлифовальная машина"
  },
  {
    "id": 293800230,
    "slug": "kormushka-na-okno-dlya-ptits-prozrachnaya-na-prisoskakh",
    "sku": "kormushka_3_okna",
    "inStock": true,
    "title": "Кормушка на окно для птиц прозрачная на присосках",
    "category": "kormushki",
    "categoryName": "Кормушки для животных",
    "price": 2450,
    "image": "/shop-images/293800230.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/293800230/detail.aspx",
    "desc": "Прозрачная кормушка на окно изготовлена из акрила, что обеспечивает долговечность и устойчивость к погодным условиям. Прозрачные стенки позволяют наблюдать за птицами, не выходя из дома.  Надежная фиксация на окне  Две большие присоски диаметром 40 м"
  },
  {
    "id": 234003775,
    "slug": "3d-konstruktor-iz-orgstekla-kotyonok",
    "sku": "cat",
    "inStock": true,
    "title": "3D конструктор из оргстекла Котёнок",
    "category": "konstruktory",
    "categoryName": "Конструкторы",
    "price": 2700,
    "image": "/shop-images/234003775.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/234003775/detail.aspx",
    "desc": "3D конструктор из оргстекла Котёнок - это оригинальная игрушка, которая сочетает в себе характеристики конструктора, головоломки и объемных фигур. Высота сборной модели – 10 см, количество деталей – 29. Поставляется в разобранном виде  ЛЕГКАЯ СБОРКА:"
  },
  {
    "id": 316175243,
    "slug": "kormushka-na-okno-dlya-ptits-prozrachnaya-na-prisoskakh-antigolub",
    "sku": "kormushka_2_okna",
    "inStock": true,
    "title": "Кормушка на окно для птиц прозрачная на присосках антиголубь",
    "category": "kormushki",
    "categoryName": "Кормушки для животных",
    "price": 2450,
    "image": "/shop-images/316175243.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/316175243/detail.aspx",
    "desc": "Прозрачная кормушка на окно изготовлена из акрила, что обеспечивает долговечность и устойчивость к погодным условиям. Прозрачные стенки позволяют наблюдать за птицами, не выходя из дома.  Надежная фиксация на окне  Две большие присоски диаметром 40 м"
  },
  {
    "id": 159057738,
    "slug": "runy-dlya-gadaniya-skandinavskie",
    "sku": "runes",
    "inStock": true,
    "title": "Руны для гадания скандинавские",
    "category": "runy",
    "categoryName": "Предсказания сувенирные",
    "price": 1560,
    "image": "/shop-images/159057738.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/159057738/detail.aspx",
    "desc": "Скандинавские деревянные руны Старшего Футарка из березы для гадания. В наборе 24 гадальные руны, рисунок нанесён лазерной гравировкой, отшлифованы и покрыты маслом с воском, очень приятные на ощупь. В комплекте мешочек со скандинавским узором, со шн"
  },
  {
    "id": 376412948,
    "slug": "klyuchnitsa-nastennaya-dlya-prikhozhej-v-stile-loft",
    "sku": "kluch_loft_cherniy",
    "inStock": true,
    "title": "Ключница настенная для прихожей в стиле лофт",
    "category": "klyuchnitsy",
    "categoryName": "Ключницы настенные",
    "price": 1367,
    "image": "/shop-images/376412948.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/376412948/detail.aspx",
    "desc": "Эта милая ключница станет отличным дополнением для вашего дома. Она предназначена для удобного хранения ключей и вещей, создавая атмосферу уюта в прихожей. Настенная полка легко крепится на стену без сверления с помощью клейкой ленты, или дюбель-гвоз"
  },
  {
    "id": 146469601,
    "slug": "zagotovka-derevo-zhizni-diametr-50-sm-pod-mokh-iz-fanery-6-mm",
    "sku": "tree50",
    "inStock": true,
    "title": "Заготовка Дерево жизни диаметр 50 см под мох из фанеры 6 мм",
    "category": "zagotovki",
    "categoryName": "Заготовки для поделок",
    "price": 2200,
    "image": "/shop-images/146469601.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/146469601/detail.aspx",
    "desc": "Заготовка \"Дерево жизни\" диаметром 50 см из фанеры высшего сорта, толщиной 6 мм. Можно использовать для выжигания, термопереноса, сублимации, декупажа, раскраски. Панно в форме Дерева можно повесить как отдельный элемент, так и сделать из него композ"
  },
  {
    "id": 365052748,
    "slug": "orgsteklo-prozrachnoe-10kh15-sm-2-mm",
    "sku": "steklo_10х15_5sht",
    "inStock": true,
    "title": "Оргстекло прозрачное 10х15 см 2 мм",
    "category": "orgsteklo",
    "categoryName": "Оргстекла",
    "price": 1500,
    "image": "/shop-images/365052748.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/365052748/detail.aspx",
    "desc": "Оргстекло, также известное как акриловое стекло, представляет собой современный и универсальный материал, обладающий множеством полезных свойств и широким спектром применения. Это прозрачное пластическое вещество является отличной альтернативой обычн"
  },
  {
    "id": 147753967,
    "slug": "shesterenki-iz-fanery-6-mm-10-sht",
    "sku": "shesterenki10sh6mm",
    "inStock": true,
    "title": "Шестеренки из фанеры 6 мм, 10 шт",
    "category": "zagotovki",
    "categoryName": "Заготовки для поделок",
    "price": 1560,
    "image": "/shop-images/147753967.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/147753967/detail.aspx",
    "desc": "Погрузитесь в мир креативности с нашими уникальными шестеренками для творчества! Эти деревянные шестеренки из фанеры идеально подойдут для вашего рукоделия, добавляя оригинальности и стиля в каждую работу. Каждый набор шестеренок — это не только заго"
  },
  {
    "id": 227895517,
    "slug": "kopilka-prozrachnaya-razbornaya-10kh10kh13-sm",
    "sku": "kopilka10x10x13",
    "inStock": true,
    "title": "Копилка прозрачная разборная 10х10х13 см",
    "category": "kopilki",
    "categoryName": "Копилки",
    "price": 1560,
    "image": "/shop-images/227895517.webp",
    "wbUrl": "https://www.wildberries.ru/catalog/227895517/detail.aspx",
    "desc": "Прозрачная разборная копилка - это функциональный и стильный аксессуар для хранения ваших сбережений. Изготовлена из прозрачного акрилового оргстекла толщиной 3 мм, что обеспечивает прочность и долговечность изделия.  Копилка имеет размеры 10х10х13 с"
  }
]

/**
 * Каталог редактируется вручную, а габариты и вес подтягиваются из выгрузки
 * карточек Wildberries (npm run gen:wb-dimensions) — так повторная выгрузка
 * не затирает цены и тексты.
 */
export const shopItems: ShopItem[] = catalog.map(item => ({
  ...item,
  images:    shopGallery[item.id] ?? [item.image],
  packaging: wbPackaging[item.id],
}))

/** Товар по slug — для страницы /shop/<slug>. */
export function shopItemBySlug(slug: string): ShopItem | undefined {
  return shopItems.find(i => i.slug === slug)
}

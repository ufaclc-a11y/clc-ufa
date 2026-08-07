/* АВТОГЕНЕРАЦИЯ — не редактировать вручную.
 * Источник: карточки Wildberries (basket-*.wbbasket.ru/.../info/ru/card.json).
 * Обновить: npm run gen:wb-dimensions
 * Выгружено: 2026-08-07
 *
 * Габариты — это размеры УПАКОВКИ (не изделия), они и нужны для расчёта доставки.
 * Вес приведён к граммам.
 */

/** Габариты упаковки и вес товара, как заведены в карточке Wildberries. */
export type WbPackaging = {
  packLengthCm?: number
  packWidthCm?:  number
  packHeightCm?: number
  weightGrams?:  number
  /** Сколько фото у карточки на WB — сколько можно выгрузить в галерею. */
  photoCount?:   number
  wbSlug?:       string
}

export const wbPackaging: Record<number, WbPackaging> = {
  146373712: { photoCount: 5, wbSlug: "altar-dlya-ritualov-runicheskij-krug-s-derevom-zhizni-seryj" },
  146375573: { photoCount: 5, wbSlug: "altar-dlya-ritualov-runicheskij-krug-s-risunkom-valknut" },
  146469601: { photoCount: 4, wbSlug: "zagotovka-derevo-zhizni-diametr-50-sm-pod-mokh-iz-fanery-6-mm" },
  147753967: { photoCount: 3, wbSlug: "shesterenki-iz-fanery-6-mm-10-sht" },
  155757277: { photoCount: 5, wbSlug: "altar-dlya-ritualov-s-derevom-zhizni-tsvet-naturalnyj" },
  159057738: { photoCount: 8, wbSlug: "runy-dlya-gadaniya-skandinavskie" },
  186737476: { packLengthCm: 41, packWidthCm: 41, packHeightCm: 51, weightGrams: 7000, photoCount: 4, wbSlug: "sortirovshhik-detalej-konstruktora-lego" },
  200084636: { photoCount: 5, wbSlug: "altar-dlya-ritualov-runicheskij-krug-s-risunkom-valknut" },
  223845904: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 4, wbSlug: "gerb-rossii-na-stenu" },
  227895517: { packLengthCm: 14, packWidthCm: 13, packHeightCm: 2, weightGrams: 200, photoCount: 5, wbSlug: "kopilka-prozrachnaya-razbornaya-10kh10kh13-sm" },
  234003775: { packLengthCm: 21, packWidthCm: 21, packHeightCm: 2, weightGrams: 500, photoCount: 11, wbSlug: "3d-konstruktor-iz-orgstekla-kotyonok" },
  263030506: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 5, wbSlug: "dekorativnyj-serf-dlya-interera-hello-summer" },
  263033506: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 5, wbSlug: "dekorativnyj-serf-dlya-interera-ocean-spirit" },
  263033507: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 5, wbSlug: "dekorativnyj-serf-dlya-interera-your-amazing-summer" },
  293800230: { packLengthCm: 14, packWidthCm: 13, packHeightCm: 4, weightGrams: 400, photoCount: 8, wbSlug: "kormushka-na-okno-dlya-ptits-prozrachnaya-na-prisoskakh" },
  316175243: { packLengthCm: 14, packWidthCm: 13, packHeightCm: 4, weightGrams: 400, photoCount: 9, wbSlug: "kormushka-na-okno-dlya-ptits-prozrachnaya-na-prisoskakh-antigolub" },
  320858711: { packLengthCm: 50, packWidthCm: 50, packHeightCm: 35, weightGrams: 2500, photoCount: 4, wbSlug: "lyustra-loft-potolochnaya-podvesnaya-shishka" },
  322268543: { packLengthCm: 30, packWidthCm: 20, packHeightCm: 20, weightGrams: 1300, photoCount: 4, wbSlug: "lyustra-loft-potolochnaya-podvesnaya-evolyutsiya" },
  351065503: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 3, wbSlug: "dekorativnyj-serf-dlya-interera-follow-your-dream" },
  351070743: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 3, wbSlug: "dekorativnyj-serf-dlya-interera-find-your-flow" },
  355771751: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-summer-state-mind" },
  355782508: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-ray-of-sunshine" },
  355794658: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-summer-summer-summer" },
  355794659: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-summer-vibes" },
  365052748: { packLengthCm: 17, packWidthCm: 11, packHeightCm: 2, photoCount: 5, wbSlug: "orgsteklo-prozrachnoe-10kh15-sm-2-mm" },
  376412948: { weightGrams: 300, photoCount: 7, wbSlug: "klyuchnitsa-nastennaya-dlya-prikhozhej-v-stile-loft" },
  541345760: { photoCount: 2, wbSlug: "altar-runicheskij-s-risunkom-valknut-koltsa-borromeo-seryj" },
  567285841: { photoCount: 2, wbSlug: "magicheskij-altar-zarya-alatyr-krest-svaroga-bestsvetnyj" },
  592856777: { photoCount: 2, wbSlug: "magicheskij-altar-zarya-alatyr-krest-svaroga-seryj" },
  762364207: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-surfer-girl-zheltyj" },
  766189423: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-surfer-girl-rozovyj" },
  766247563: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-summer-vibes" },
  766395251: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-born-to-surf" },
  766603348: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-life-is-a-beach" },
  766630278: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-aloha-hawaii" },
  766652532: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-life-comes-in-waves" },
  766679469: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-osminog" },
  766941530: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-plyazh-s-kokosami" },
  767110860: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-lazurnyj-plyazh" },
  768615262: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-summer-vibes-men" },
  768647477: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-live-in-motion" },
  815153196: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "gerb-tatarstana-na-stenu" },
  817567205: { packLengthCm: 41, packWidthCm: 31, packHeightCm: 31, weightGrams: 2500, photoCount: 2, wbSlug: "sortirovshhik-detalej-konstruktora-po-razmeram-4-urovnya" },
  861431291: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "gerb-tatarstana-na-stenu" },
  861520779: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "gerb-bashkortostana-nastennaya-dekoratsiya" },
  874246986: { weightGrams: 3500, photoCount: 5, wbSlug: "nastennaya-stellazh-polka-organajzer-dlya-instrumentov-v-garazh" },
  892560422: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-chernyj-75kh23-5kh0-6-sm-1-sht" },
  892849768: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-gucci-7523-50-6-sm-panno-na-stenu" },
  895289684: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "serf-dekor-lv-ufpechat-zolotogo-logotipa-7523-50-6-sm" },
  895306269: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interera-lui-vitton--75kh23-5kh0-6-sm" },
  895553579: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-dlya-interer-guchchi-zhelt--75kh23-5kh0-6-sm" },
  895563652: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-chanel-bel--75kh23-5kh0-6-sm" },
  895567312: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2, wbSlug: "dekorativnyj-serf-chanel-oblaka--75kh23-5kh0-6-sm" },
  901681341: { packLengthCm: 80, packWidthCm: 40, packHeightCm: 10, weightGrams: 8100, photoCount: 5, wbSlug: "stellazh-montessori-s-zadnej-stenkoj-3-urovnya-77kh75kh36-sm" },
  903431735: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 3, wbSlug: "gerb-adygeya-nastennaya-dekoratsiya" },
  922778456: { packLengthCm: 55, packWidthCm: 60, packHeightCm: 2, weightGrams: 495, photoCount: 2, wbSlug: "panno-znaki-urbanart-eyes-50kh57sm-mdf" },
  922780000: { packLengthCm: 55, packWidthCm: 55, packHeightCm: 2, weightGrams: 495, photoCount: 2, wbSlug: "panno-znaki-urbanart-stop-50kh50sm-mdf" },
  924966578: { packLengthCm: 55, packWidthCm: 55, packHeightCm: 2, weightGrams: 495, photoCount: 2, wbSlug: "panno-znaki-urbanart-dont-panic-50kh50sm-mdf" },
  924972620: { packLengthCm: 55, packWidthCm: 55, packHeightCm: 2, weightGrams: 495, photoCount: 2, wbSlug: "panno-znaki-urbanart-disrup-50kh50sm-mdf" },
  924977920: { packLengthCm: 55, packWidthCm: 55, packHeightCm: 2, weightGrams: 495, photoCount: 2, wbSlug: "panno-znaki-urbanart-no-mercy-black-50kh50sm-mdf" },
  924980141: { packLengthCm: 55, packWidthCm: 55, packHeightCm: 2, weightGrams: 495, photoCount: 2, wbSlug: "panno-znaki-urbanart-no-mercy-white-50kh50sm-mdf" },
  924983092: { packLengthCm: 55, packWidthCm: 55, packHeightCm: 2, weightGrams: 495, photoCount: 2, wbSlug: "panno-znaki-urbanart-no-limits-black-50kh50sm-mdf" },
  924989835: { packLengthCm: 55, packWidthCm: 67, packHeightCm: 2, weightGrams: 495, photoCount: 2, wbSlug: "panno-znaki-urbanart-your-way-50kh62sm-mdf" },
  924997223: { packLengthCm: 55, packWidthCm: 51, packHeightCm: 2, weightGrams: 495, photoCount: 2, wbSlug: "panno-znaki-urbanart-obsession-50kh46sm-mdf" },
  943569661: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 3, wbSlug: "gerb-sakhalinskaya-oblast" },
  943605517: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 3, wbSlug: "gerb-uglegorskogo-rajona-sakhalinskoj-oblasti" },
  963848845: { photoCount: 2, wbSlug: "altar-runicheskij-valknut-koltsa-borromeo-bestsvetnyj" },
}

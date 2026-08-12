/* АВТОГЕНЕРАЦИЯ — не редактировать вручную.
 * Источник: Content API продавца.
 * Обновить: npm run gen:wb-dimensions
 * Выгружено: 2026-08-12
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
  146373712: { packLengthCm: 26, packWidthCm: 26, packHeightCm: 1, weightGrams: 300, photoCount: 5 },
  146375573: { packLengthCm: 26, packWidthCm: 26, packHeightCm: 1, weightGrams: 300, photoCount: 5 },
  146469601: { packLengthCm: 51, packWidthCm: 51, packHeightCm: 2, weightGrams: 900, photoCount: 4 },
  147753967: { packLengthCm: 19, packWidthCm: 19, packHeightCm: 5, weightGrams: 500, photoCount: 3 },
  155757277: { packLengthCm: 26, packWidthCm: 26, packHeightCm: 1, weightGrams: 300, photoCount: 5 },
  159057738: { packLengthCm: 15, packWidthCm: 7, packHeightCm: 6, weightGrams: 270, photoCount: 8 },
  186737476: { packLengthCm: 41, packWidthCm: 41, packHeightCm: 51, weightGrams: 7000, photoCount: 4 },
  200084636: { packLengthCm: 26, packWidthCm: 26, packHeightCm: 1, weightGrams: 300, photoCount: 5 },
  223845904: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 4 },
  227895517: { packLengthCm: 14, packWidthCm: 13, packHeightCm: 2, weightGrams: 200, photoCount: 5 },
  234003775: { packLengthCm: 21, packWidthCm: 21, packHeightCm: 2, weightGrams: 500, photoCount: 11 },
  263030506: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 5 },
  263033506: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 5 },
  263033507: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 5 },
  293800230: { packLengthCm: 14, packWidthCm: 13, packHeightCm: 4, weightGrams: 500, photoCount: 8 },
  316175243: { packLengthCm: 14, packWidthCm: 13, packHeightCm: 4, weightGrams: 500, photoCount: 9 },
  320858711: { packLengthCm: 50, packWidthCm: 50, packHeightCm: 35, weightGrams: 2500, photoCount: 4 },
  322268543: { packLengthCm: 30, packWidthCm: 20, packHeightCm: 20, weightGrams: 1300, photoCount: 4 },
  351065503: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 3 },
  351070743: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 3 },
  355771751: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  355782508: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  355794658: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  355794659: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  365052748: { packLengthCm: 17, packWidthCm: 11, packHeightCm: 2, weightGrams: 270, photoCount: 5 },
  376412948: { packLengthCm: 32, packWidthCm: 12, packHeightCm: 22, weightGrams: 300, photoCount: 7 },
  541345760: { packLengthCm: 26, packWidthCm: 26, packHeightCm: 1, weightGrams: 300, photoCount: 2 },
  567285841: { packLengthCm: 26, packWidthCm: 26, packHeightCm: 1, weightGrams: 300, photoCount: 2 },
  592856777: { packLengthCm: 26, packWidthCm: 26, packHeightCm: 1, weightGrams: 300, photoCount: 2 },
  762364207: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  766189423: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  766247563: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  766395251: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  766603348: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  766630278: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  766652532: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  766679469: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  766941530: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  767110860: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  768615262: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  768647477: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  815153196: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  817567205: { packLengthCm: 41, packWidthCm: 31, packHeightCm: 31, weightGrams: 2500, photoCount: 2 },
  861431291: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  861520779: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  874246986: { packLengthCm: 60, packWidthCm: 15, packHeightCm: 10, weightGrams: 3500, photoCount: 5 },
  892560422: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  892849768: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  895289684: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  895306269: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  895553579: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  895563652: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  895567312: { packLengthCm: 77, packWidthCm: 25, packHeightCm: 2, weightGrams: 500, photoCount: 2 },
  901681341: { packLengthCm: 80, packWidthCm: 40, packHeightCm: 10, weightGrams: 8100, photoCount: 5 },
  903431735: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 3 },
  922778456: { packLengthCm: 55, packWidthCm: 60, packHeightCm: 2, weightGrams: 495, photoCount: 2 },
  922780000: { packLengthCm: 55, packWidthCm: 55, packHeightCm: 2, weightGrams: 495, photoCount: 2 },
  924966578: { packLengthCm: 55, packWidthCm: 55, packHeightCm: 2, weightGrams: 495, photoCount: 2 },
  924972620: { packLengthCm: 55, packWidthCm: 55, packHeightCm: 2, weightGrams: 495, photoCount: 2 },
  924977920: { packLengthCm: 55, packWidthCm: 55, packHeightCm: 2, weightGrams: 495, photoCount: 2 },
  924980141: { packLengthCm: 55, packWidthCm: 55, packHeightCm: 2, weightGrams: 495, photoCount: 2 },
  924983092: { packLengthCm: 55, packWidthCm: 55, packHeightCm: 2, weightGrams: 495, photoCount: 2 },
  924989835: { packLengthCm: 55, packWidthCm: 67, packHeightCm: 2, weightGrams: 495, photoCount: 2 },
  924997223: { packLengthCm: 55, packWidthCm: 51, packHeightCm: 2, weightGrams: 495, photoCount: 2 },
  943569661: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 3 },
  943605517: { packLengthCm: 45, packWidthCm: 39, packHeightCm: 2, weightGrams: 500, photoCount: 3 },
  963848845: { packLengthCm: 26, packWidthCm: 26, packHeightCm: 1, weightGrams: 300, photoCount: 2 },
}

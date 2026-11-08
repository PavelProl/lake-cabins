import largeCover from '../assets/large-house/cover-concept-v2.jpg'
import mediumCover from '../assets/medium-house/cover-concept.jpg'
import smallCover from '../assets/small-house/cover-concept.jpg'
import l09 from '../assets/large-house/exterior.jpg'
import l04 from '../assets/large-house/living.jpg'
import l06 from '../assets/large-house/living-wide.jpg'
import l01 from '../assets/large-house/dining.jpg'
import l07 from '../assets/large-house/panoramic-room.jpg'
import l08 from '../assets/large-house/bar.jpg'
import l03 from '../assets/large-house/bedroom-light.jpg'
import l05 from '../assets/large-house/bedroom-wood.jpg'
import l02 from '../assets/large-house/bedroom-extra.jpg'
import m02 from '../assets/medium-house/m02.jpg'
import m01 from '../assets/medium-house/m01.jpg'
import m17 from '../assets/medium-house/m17.jpg'
import m18 from '../assets/medium-house/m18.jpg'
import m04 from '../assets/medium-house/m04.jpg'
import m16 from '../assets/medium-house/m16.jpg'
import m14 from '../assets/medium-house/m14.jpg'
import m07 from '../assets/medium-house/m07.jpg'
import m15 from '../assets/medium-house/m15.jpg'
import m05 from '../assets/medium-house/m05.jpg'
import m03 from '../assets/medium-house/m03.jpg'
import m08 from '../assets/medium-house/m08.jpg'
import m11 from '../assets/medium-house/m11.jpg'
import m13 from '../assets/medium-house/m13.jpg'
import m10 from '../assets/medium-house/m10.jpg'
import m06 from '../assets/medium-house/m06.jpg'
import m12 from '../assets/medium-house/m12.jpg'
import m09 from '../assets/medium-house/m09.jpg'
import m19 from '../assets/medium-house/m19.jpg'
import s11 from '../assets/small-house/s11.jpg'
import s01 from '../assets/small-house/s01.jpg'
import s03 from '../assets/small-house/s03.jpg'
import s02 from '../assets/small-house/s02.jpg'
import s07 from '../assets/small-house/s07.jpg'
import s13 from '../assets/small-house/s13.jpg'
import s14 from '../assets/small-house/s14.jpg'
import s06 from '../assets/small-house/s06.jpg'
import s12 from '../assets/small-house/s12.jpg'
import s05 from '../assets/small-house/s05.jpg'
import s09 from '../assets/small-house/s09.jpg'
import s10 from '../assets/small-house/s10.jpg'
import s04 from '../assets/small-house/s04.jpg'
import s08 from '../assets/small-house/s08.jpg'

export interface House {
  id: string
  name: string
  titleLines: readonly string[]
  category: string
  description: string
  cover: string
  coverPosition: number
  gallery: readonly { src: string; alt: string; width: number; height: number }[]
}

export const houses: readonly House[] = [
  {
    id: 'large-log-house',
    name: 'Большой бревенчатый дом',
    titleLines: ['Большой', 'дом'],
    category: 'Бревенчатый дом',
    description:
      'Бревенчатые стены, деревянные лестницы и большие окна. В галерее — реальные фотографии фасада и комнат большого дома.',
    cover: largeCover,
    coverPosition: 57,
    gallery: [
      {
        src: l09,
        alt: 'Большой дом: фрагмент бревенчатого фасада с остеклением и наружной лестницей',
        width: 670,
        height: 980,
      },
      {
        src: l04,
        alt: 'Гостиная большого дома: диван, телевизор и деревянные стены',
        width: 960,
        height: 1280,
      },
      {
        src: l06,
        alt: 'Общий вид гостиной большого дома: диван и обеденный стол',
        width: 899,
        height: 1198,
      },
      {
        src: l01,
        alt: 'Обеденная зона большого дома: стол и стулья у окна',
        width: 960,
        height: 1280,
      },
      {
        src: l07,
        alt: 'Комната большого дома: высокое остекление, диван и печь',
        width: 912,
        height: 1216,
      },
      {
        src: l08,
        alt: 'Барная зона большого дома: деревянная стойка и полки',
        width: 904,
        height: 1205,
      },
      {
        src: l03,
        alt: 'Спальня большого дома: кровать под скатом крыши',
        width: 920,
        height: 1226,
      },
      {
        src: l05,
        alt: 'Спальня большого дома: кровать у окна и деревянные стены',
        width: 837,
        height: 1116,
      },
      { src: l02, alt: 'Спальная зона большого дома: кровать и шкаф', width: 960, height: 1280 },
    ],
  },
  {
    id: 'medium-house',
    name: 'Средний дом с баней',
    titleLines: ['Средний', 'дом'],
    category: 'С собственной баней',
    description:
      'Дом с собственной баней, деревянной отделкой и большими окнами. В галерее можно рассмотреть фасад, комнаты и интерьер среднего дома.',
    cover: mediumCover,
    coverPosition: 73,
    gallery: [
      {
        src: m02,
        alt: 'Средний дом: общий вид фасада с большими белыми оконными рамами',
        width: 1280,
        height: 960,
      },
      { src: m01, alt: 'Средний дом: внешний вид под углом среди берёз', width: 960, height: 1280 },
      {
        src: m17,
        alt: 'Гостиная среднего дома: вид со стороны лестницы',
        width: 960,
        height: 1280,
      },
      {
        src: m18,
        alt: 'Обеденная зона среднего дома: круглый стол у больших окон',
        width: 960,
        height: 1280,
      },
      {
        src: m04,
        alt: 'Гостиная среднего дома: вид сверху на диван и стол',
        width: 960,
        height: 1280,
      },
      {
        src: m16,
        alt: 'Гостиная среднего дома: дополнительный ракурс сверху',
        width: 960,
        height: 1280,
      },
      { src: m14, alt: 'Кухня среднего дома: общий вид с холодильником', width: 891, height: 1188 },
      {
        src: m07,
        alt: 'Кухня среднего дома: рабочая поверхность и лестница',
        width: 960,
        height: 1280,
      },
      {
        src: m15,
        alt: 'Кухня среднего дома: холодильник, плита и полка с посудой',
        width: 960,
        height: 1280,
      },
      { src: m05, alt: 'Спальня среднего дома: кровать у окна', width: 960, height: 1280 },
      {
        src: m03,
        alt: 'Верхний уровень среднего дома: спальные места под скатом',
        width: 862,
        height: 1149,
      },
      {
        src: m08,
        alt: 'Средний дом: помещение с ванной, креслами и высокими окнами',
        width: 960,
        height: 1280,
      },
      {
        src: m11,
        alt: 'Средний дом: ванна у окна и лестница на верхний уровень',
        width: 960,
        height: 1280,
      },
      { src: m13, alt: 'Средний дом: продольный вид помещения с ванной', width: 960, height: 1280 },
      { src: m10, alt: 'Средний дом: кресло у окна и верхний уровень', width: 960, height: 1280 },
      { src: m06, alt: 'Средний дом: вид сверху на ванну и кресла', width: 1280, height: 960 },
      {
        src: m12,
        alt: 'Санузел среднего дома: душевая кабина, раковина и унитаз',
        width: 960,
        height: 1280,
      },
      {
        src: m09,
        alt: 'Средний дом: душевая зона с деревянной отделкой',
        width: 960,
        height: 1280,
      },
      {
        src: m19,
        alt: 'Средний дом: деревянный проход с небольшим окном',
        width: 960,
        height: 1280,
      },
    ],
  },
  {
    id: 'small-house',
    name: 'Малый дом',
    titleLines: ['Малый', 'дом'],
    category: 'Два одинаковых дома',
    description:
      'Два одинаковых малых дома с асимметричной крышей и крытой террасой. В галерее — реальные фотографии дома снаружи и внутри.',
    cover: smallCover,
    coverPosition: 57,
    gallery: [
      {
        src: s11,
        alt: 'Малый дом: фасад с асимметричной крышей и навесом террасы',
        width: 1280,
        height: 960,
      },
      {
        src: s01,
        alt: 'Малый дом: внешний вид с большими окнами и террасой',
        width: 1280,
        height: 960,
      },
      { src: s03, alt: 'Малый дом: общий вид с подходом по склону', width: 960, height: 1280 },
      {
        src: s02,
        alt: 'Малый дом: вид со стороны светлого навеса террасы',
        width: 960,
        height: 1280,
      },
      { src: s07, alt: 'Малый дом: деревянный фасад и вход на террасу', width: 960, height: 1280 },
      { src: s13, alt: 'Терраса малого дома: настил и прозрачный навес', width: 960, height: 1280 },
      { src: s14, alt: 'Терраса малого дома: два кресла под навесом', width: 960, height: 1280 },
      { src: s06, alt: 'Гостиная малого дома: диван и круглый стол', width: 960, height: 1280 },
      {
        src: s12,
        alt: 'Обеденная зона малого дома: стол у высоких окон',
        width: 960,
        height: 1280,
      },
      { src: s05, alt: 'Малый дом: общий вид комнаты сверху', width: 960, height: 1280 },
      {
        src: s09,
        alt: 'Кухонная зона малого дома: рабочая поверхность и лестница',
        width: 960,
        height: 1280,
      },
      {
        src: s10,
        alt: 'Спальная зона малого дома: кровать под большим окном',
        width: 960,
        height: 1280,
      },
      {
        src: s04,
        alt: 'Спальная зона малого дома: дополнительный ракурс у окна',
        width: 960,
        height: 1280,
      },
      {
        src: s08,
        alt: 'Санузел малого дома: раковина и круглое зеркало',
        width: 920,
        height: 1227,
      },
    ],
  },
]

export function findHouse(id: string | undefined): House | undefined {
  return houses.find((house) => house.id === id)
}

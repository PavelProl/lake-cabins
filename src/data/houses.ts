import cover from '../assets/large-house/cover-concept.jpg'
import dining from '../assets/large-house/dining.jpg'
import living from '../assets/large-house/living.jpg'
import bedroomLight from '../assets/large-house/bedroom-light.jpg'
import bedroomWood from '../assets/large-house/bedroom-wood.jpg'

export interface House {
  id: string
  name: string
  titleLines: readonly string[]
  category: string
  cover: string
  gallery: readonly { src: string; alt: string; width: number; height: number }[]
}

export const houses: readonly House[] = [
  {
    id: 'large-log-house',
    name: 'Большой бревенчатый дом',
    titleLines: ['Большой', 'дом'],
    category: 'Бревенчатый дом',
    cover,
    gallery: [
      {
        src: living,
        alt: 'Гостиная большого дома: деревянные стены, диван и телевизор',
        width: 960,
        height: 1280,
      },
      {
        src: dining,
        alt: 'Обеденный стол у окна в большом доме',
        width: 960,
        height: 1280,
      },
      {
        src: bedroomLight,
        alt: 'Спальня на мансардном этаже с двуспальной кроватью',
        width: 960,
        height: 1280,
      },
      {
        src: bedroomWood,
        alt: 'Спальня с деревянными стенами и окном',
        width: 960,
        height: 1280,
      },
    ],
  },
]

export function findHouse(id: string | undefined): House | undefined {
  return houses.find((house) => house.id === id)
}

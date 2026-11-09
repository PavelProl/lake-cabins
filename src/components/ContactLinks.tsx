import { contacts } from '../data/site'

export function ContactLinks({
  houseName,
  reveal = true,
}: {
  houseName?: string
  reveal?: boolean
}) {
  const message = houseName
    ? `Здравствуйте! Подскажите, пожалуйста, свободные даты и стоимость дома «${houseName}».`
    : 'Здравствуйте! Хочу узнать о домиках у озера в «Роще». Подскажите свободные даты и стоимость.'

  return (
    <div className="contact-actions" data-reveal={reveal || undefined}>
      <a className="button-primary" href={contacts.primary.tel}>
        Позвонить ↗
      </a>
      <a
        className="button-secondary"
        href={`${contacts.whatsapp}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Написать в WhatsApp ↗
      </a>
    </div>
  )
}

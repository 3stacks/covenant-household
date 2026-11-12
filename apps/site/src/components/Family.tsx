import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'

const steps = [
  ['Sing', 'Sing the psalm together. If no one can lead the tune, Precentor plays it.'],
  ['Read', 'Read one lesson aloud. Talk about it with your children.'],
  ['Learn', 'Say a catechism answer together. Hearers helps each person learn it by heart.'],
  ['Pray', 'Pray the collect. Then pray for your family and your church.'],
]

export function Family() {
  return (
    <section
      id="family"
      aria-labelledby="family-title"
      className="scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32"
    >
      <Container>
        <SectionHeading number="3" id="family-title">
          Family
        </SectionHeading>
        <p className="mt-8 font-display text-4xl font-bold tracking-tight text-stone-900">
          Worship God at home, morning and evening.
        </p>
        <p className="mt-4 text-lg tracking-tight text-stone-700">
          The Westminster Directory for Family Worship (1647) asks each family to
          pray, to sing praise and to read the Scriptures each day. The head of
          the family leads. Daily Prayer gives you the order and the text.
        </p>
      </Container>
      <Container size="md" className="mt-16">
        <ol role="list" className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, text], i) => (
            <li key={title} className="rounded-2xl bg-white p-6 ring-1 ring-stone-200">
              <p className="font-mono text-sm text-brand-600">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-stone-900">{title}</h3>
              <p className="mt-2 text-sm text-stone-600">{text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}

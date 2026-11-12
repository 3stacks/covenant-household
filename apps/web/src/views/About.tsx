import { KOFI } from '@daily-prayer/core/links'

export function About() {
  return (
    <article className="about">
      <h1>About</h1>
      <p>
        Each day has a psalm, two Bible readings, a writing from the Reformed tradition, a hymn and a prayer. It also
        has a part of the confession. The readings follow the church year of the Book of Common Prayer.
      </p>
      <p>Each part links to the other free apps in this group:</p>
      <ul>
        <li>
          <a href="https://precentor.app">Precentor</a>: sing the psalm from the 1650 Scottish Psalter.
        </li>
        <li>
          <a href="https://haddingtonbible.org">The Self-Interpreting Bible</a>: read the passage with the notes of John
          Brown of Haddington.
        </li>
        <li>
          <a href="https://hearers.app">Hearers</a>: memorise the passage, or learn the confession section.
        </li>
      </ul>

      <h2 id="sources">Sources</h2>
      <dl className="credits">
        <dt>Lessons</dt>
        <dd>
          The Revised Tables of Lessons (1922), from the Church of England. They follow the church year of the Book of
          Common Prayer. Public domain. Transcription by{' '}
          <a href="http://www.eskimo.com/~lhowell/bcp1662/info/calendar.html">Lynda Howell</a>.
        </dd>
        <dt>Collects, Epistles and Gospels, and the order of the Psalter</dt>
        <dd>
          The Book of Common Prayer (1662). In the United Kingdom the Crown holds the rights in this text. Outside the United
          Kingdom it is in the public domain. Transcription by{' '}
          <a href="http://www.eskimo.com/~lhowell/bcp1662/">Lynda Howell</a>.
        </dd>
        <dt>The Apocrypha</dt>
        <dd>
          On some weekdays the 1922 table appoints a lesson from the Apocrypha. The Apocrypha is not part of the canon of
          Scripture (Westminster Confession 1.3), so the app reads a canonical lesson in its place. Each canonical lesson
          comes from the book that the Apocrypha book copies or describes. For example, Proverbs is in place of
          Ecclesiasticus, and Daniel is in place of 1 Maccabees.
        </dd>
        <dt>Bible text</dt>
        <dd>
          The King James Version, from the <a href="https://hearers.app">Hearers</a> data. Hearers takes it from{' '}
          <a href="https://github.com/scrollmapper/bible_databases">scrollmapper/bible_databases</a>. Public domain.
        </dd>
        <dt>Psalms</dt>
        <dd>
          The Psalms of David in Metre (1650), from the <a href="https://precentor.app">Precentor</a> data. Precentor takes
          it from <a href="https://github.com/kadencartwright/open-1650">open-1650</a> by Kaden Cartwright. The text is public
          domain. The transcription is CC0.
        </dd>
        <dt>Confessions and catechisms</dt>
        <dd>
          From the <a href="https://hearers.app">Hearers</a> data. Hearers takes them from{' '}
          <a href="https://github.com/NonlinearFruit/Creeds.json">Creeds.json</a>.
        </dd>
        <dt>Writings, hymns and prayers</dt>
        <dd>Each one names its source on the page.</dd>
      </dl>

      <h2>Support</h2>
      <p>
        Daily Prayer is free and has no advertisements. If it helps you, you can support it on{' '}
        <a href={KOFI} data-event="Ko-fi">
          Ko-fi
        </a>
        .
      </p>
    </article>
  )
}

import { StyleSheet, Text, View } from 'react-native'
import { KOFI } from '@daily-prayer/core/links'
import { A, H2, Li, P, Page } from '../components/Prose.tsx'
import { useColors } from '../lib/theme.ts'

function Credit({ term, children }: { term: string; children: React.ReactNode }) {
  const c = useColors()
  return (
    <View style={st.credit}>
      <Text style={[st.term, { color: c.ink }]}>{term}</Text>
      <Text style={[st.def, { color: c.muted }]}>{children}</Text>
    </View>
  )
}

export default function About() {
  return (
    <Page>
      <P>
        Each day has a psalm, two Bible readings, a writing from the Reformed tradition, a hymn and a prayer. It also has
        a part of the confession. The readings follow the church year of the Book of Common Prayer.
      </P>
      <P>Each part links to the other free apps in this group:</P>
      <Li>
        <A href="https://precentor.app">Precentor</A>: sing the psalm from the 1650 Scottish Psalter.
      </Li>
      <Li>
        <A href="https://haddingtonbible.org">The Self-Interpreting Bible</A>: read the passage with the notes of John
        Brown of Haddington.
      </Li>
      <Li>
        <A href="https://hearers.app">Hearers</A>: memorise the passage, or learn the confession section.
      </Li>

      <H2>Sources</H2>
      <Credit term="Lessons">
        The Revised Tables of Lessons (1922), from the Church of England. They follow the church year of the Book of
        Common Prayer. Public domain. Transcription by{' '}
        <A href="http://www.eskimo.com/~lhowell/bcp1662/info/calendar.html">Lynda Howell</A>.
      </Credit>
      <Credit term="Collects, Epistles and Gospels, and the order of the Psalter">
        The Book of Common Prayer (1662). In the United Kingdom the Crown holds the rights in this text. Outside the United
        Kingdom it is in the public domain. Transcription by <A href="http://www.eskimo.com/~lhowell/bcp1662/">Lynda Howell</A>.
      </Credit>
      <Credit term="The Apocrypha">
        On some weekdays the 1922 table appoints a lesson from the Apocrypha. The Apocrypha is not part of the canon of
        Scripture (Westminster Confession 1.3), so the app reads a canonical lesson in its place. Each canonical lesson
        comes from the book that the Apocrypha book copies or describes. For example, Proverbs is in place of
        Ecclesiasticus, and Daniel is in place of 1 Maccabees.
      </Credit>
      <Credit term="Bible text">
        The King James Version, from the <A href="https://hearers.app">Hearers</A> data. Hearers takes it from{' '}
        <A href="https://github.com/scrollmapper/bible_databases">scrollmapper/bible_databases</A>. Public domain. Choose
        another translation in Settings. The <A href="https://berean.bible">Berean Standard Bible</A>: its publishers
        dedicated it to the public domain on 30 April 2023. The Statenvertaling (1637), in the text of the 1888 edition:
        the transcription is by the <A href="https://github.com/Isidore-Guild/statenvertaling">Isidore Guild</A>, under
        CC0. The app leaves out the notes.
      </Credit>
      <Credit term="Psalms">
        The Psalms of David in Metre (1650), from the <A href="https://precentor.app">Precentor</A> data. Precentor takes it
        from <A href="https://github.com/kadencartwright/open-1650">open-1650</A> by Kaden Cartwright. The text is public
        domain. The transcription is CC0.
      </Credit>
      <Credit term="Confessions and catechisms">
        From the <A href="https://hearers.app">Hearers</A> data. Hearers takes them from{' '}
        <A href="https://github.com/NonlinearFruit/Creeds.json">Creeds.json</A>.
      </Credit>
      <Credit term="Writings, hymns and prayers">Each one names its source on the page.</Credit>

      <H2>Support</H2>
      <P>
        Covenant Household is free and has no advertisements. If it helps you, you can support it on <A href={KOFI}>Ko-fi</A>.
      </P>
    </Page>
  )
}

const st = StyleSheet.create({
  credit: { marginTop: 12 },
  term: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  def: { fontSize: 15, lineHeight: 22 },
})

import { B, H2, Li, P, Page } from '../components/Prose.tsx'

export default function HowToUse() {
  return (
    <Page>
      <P>
        Each day has a psalm, an Old Testament lesson, a New Testament lesson and a prayer. On Sundays and feasts it also
        has the Epistle and Gospel. Some days also have a proverb, a writing, a hymn and a part of the confession.
      </P>

      <H2>A short time of prayer</H2>
      <P>Use this order alone or with your family. It takes about 15 minutes.</P>
      <Li n={1}>Sing the psalm. Tap “Sing in Precentor” to hear the tune and follow each syllable.</Li>
      <Li n={2}>Read the Old Testament lesson.</Li>
      <Li n={3}>Read the New Testament lesson.</Li>
      <Li n={4}>Pray the collect, then pray in your own words.</Li>
      <P>When the day has a writing or a part of the confession, read it after the lessons.</P>

      <H2>Morning and evening</H2>
      <P>
        The Prayer Book gives lessons and psalms for the morning and for the evening. The page shows the morning ones
        first. Open “Evening” below a lesson, or “More psalms for today”, to read the others. In a month, the morning and
        evening psalms go through all 150 psalms.
      </P>

      <H2>With a family</H2>
      <P>
        The Westminster Directory for Family Worship (1647) asks each family to pray, to sing praise, to read the Scriptures
        and to learn the catechism each day. The head of the family leads. One way to do this:
      </P>
      <Li n={1}>Sing the psalm together.</Li>
      <Li n={2}>Read one lesson aloud. Talk about it.</Li>
      <Li n={3}>Read the confession or catechism part. Let the children say the answer.</Li>
      <Li n={4}>Pray the collect, then pray for your family and your church.</Li>

      <H2>The other apps</H2>
      <Li>
        <B>Sing in Precentor</B> plays the psalm tune in four parts and lights each syllable.
      </Li>
      <Li>
        <B>Self-Interpreting Bible notes</B> opens the passage with the notes of John Brown of Haddington.
      </Li>
      <Li>
        <B>Memorise in Hearers</B> adds the verse or the catechism answer to your memory work.
      </Li>

      <H2>The church year</H2>
      <P>
        The lessons follow the church year of the Book of Common Prayer. The heading under the date names the day, for
        example “Septuagesima” or “The Third Sunday in Advent”. The lessons are not a plan to read the whole Bible in a
        year. If you use such a plan, you can use this app as well.
      </P>

      <H2>Other days, and settings</H2>
      <P>
        Use the arrows beside the date to go to the day before or the day after. Tap the date to open the calendar. Use
        “Settings”, at the bottom of the page, to show or hide the proverb and the commemorations.
      </P>

      <H2>With no connection</H2>
      <P>
        All the readings are in the app, so you can read them with no connection. The links to Precentor, Hearers and the
        Self-Interpreting Bible need a connection.
      </P>
    </Page>
  )
}

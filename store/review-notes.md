# Covenant Household: notes for App Review

Apple asked for more information under Guideline 2.1. Copy the text below the line, from item 1 to
the end of item 6. Paste it into the field "App Review Notes". The field accepts 4,000 characters or less.
Before you copy the text, put the link to the video in place of `[video link]`.

---

## 1. Video of the app

The video shows the app on an iPhone. The video starts at the launch of the app: [video link]

The app also runs on the iPad. On the iPad, it shows the same screens in a centred column. It
turns to landscape, and it works in Split View.

The app has no account and no login. It has no content from users. It has no paid content. The reader
cannot buy anything in the app.

## 2. Purpose and audience

Covenant Household is a daily prayer book for family worship at home. It is for Christian families,
mainly in Reformed and Presbyterian churches.

For daily worship, a family needs a calendar of readings, a Bible, a psalter and a catechism. These
are usually in four books. The app puts the readings for each day on one page. The readings
follow the calendar of the Book of Common Prayer (1662). The app is free. It has no advertisements,
it collects no data, and it works with no connection.

## 3. How to use the app

No login is necessary.

1. Open the app.
2. At the first start, tap "English".
3. Tap a Bible. Then tap "Start".
4. Read the page of today. Scroll down to see morning worship, evening worship and "For the household".
5. To go to a part of the page, tap "Morning" or "Evening".
6. To go to the previous day or the next day, tap an arrow next to the date.
7. To open the calendar, tap the date.
8. To open Settings, tap the gear at the top right. In Settings, you can change the Bible.
9. At the end of the page, tap "How to use" or "About". The About page gives the source of each text.
10. To open a related website, tap a link, for example "Sing in Precentor".
11. To go back to the app, tap "Done".

## 4. External services

The main functions of the app use no external service. All the texts are in the app. The app sends
no data. It has no analytics, no advertisements and no server. It keeps the settings on the device.

Some links open a website in the in-app browser (SFSafariViewController). These links are optional:

- precentor.app: sing the psalm.
- hearers.app: memorise a verse or a catechism answer.
- haddingtonbible.org: read the passage with notes.

These three websites are free, and they are from the same developer. The About page also links to
the source of each text. The developer builds the app with Expo Application Services (EAS).

## 5. Regions

The app works the same in all regions. The interface is in English. In all regions, the reader can
choose an English Bible or a Dutch Bible.

## 6. Third-party material

Each text in the app is in the public domain, or it has a CC0 licence. The About page in the app
names each source.

- King James Version of the Bible (1769 text): public domain. In the United Kingdom, the Crown holds the rights.
- Berean Standard Bible: the publisher dedicated it to the public domain on 30 April 2023.
- Statenvertaling (1637), 1888 text: public domain. The transcription by the Isidore Guild is CC0.
- The Psalms of David in Metre (1650): public domain. The open-1650 transcription is CC0.
- Psalmberijming van 1773, in the edition of 1774: public domain. The source is the DBNL library.
- Book of Common Prayer (1662): public domain outside the United Kingdom. In the United Kingdom, the
  Crown holds the rights. The app uses its collects, Epistles, Gospels and order of the psalms.
- Revised Tables of Lessons (1922): public domain.
- Westminster Confession of Faith (1646), Larger Catechism (1648) and Shorter Catechism (1647): public domain.
- Canons of Dort (1619), in an old English translation: public domain. The source is Creeds.json.
- J. C. Ryle, "Expository Thoughts on the Gospels" (1856): public domain. The source is the Christian
  Classics Ethereal Library.
- The font EB Garamond: SIL Open Font License.

Lynda Howell made the transcription of the Book of Common Prayer and of the 1922 tables. The developer
wrote the code of the app.

---

## Manual steps

If the Maestro flow does not work on the iPhone, use these steps. The flow is in
`apps/mobile/.maestro/review-demo.yaml`.

1. Connect the iPhone to the Mac with a cable.
2. On the iPhone, delete the app.
3. Install the app again from TestFlight. Do not open it.
4. On the Mac, open QuickTime Player.
5. Select File, then New Movie Recording.
6. Click the arrow next to the record button.
7. Select the iPhone as the camera.
8. Click the record button.
9. On the iPhone, tap the "Household" icon on the Home Screen.
10. Do steps 2 to 9 of item 3. Stop on each screen for 2 or 3 seconds.
11. Tap "Sing in Precentor".
12. When the web page opens, tap "Done".
13. Tap the gear.
14. Tap "Berean Standard Bible".
15. Tap the back arrow at the top left.
16. Scroll down to a lesson.
17. Tap the gear again.
18. Tap "King James Version".
19. Tap the back arrow.
20. Scroll to the end of the page.
21. Tap "About".
22. Scroll down to "Support".
23. Tap the back arrow.
24. Scroll to the top of the page.
25. In QuickTime Player, click the stop button.
26. Select File, then Save.
27. Upload the video.
28. Put the link to the video in item 1.

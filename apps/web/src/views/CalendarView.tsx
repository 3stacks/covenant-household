import { useEffect, useRef, useState } from 'react'
import { addDays, dateKey, isoDate } from '@daily-prayer/core/calendar'
import { churchDay, HOLY_DAYS, type Season } from '@daily-prayer/core/churchYear'
import { feastName, SEASON_NAMES } from '@daily-prayer/core/labels'
import type { Commemoration } from '@daily-prayer/core/types'
import { calendar } from '../lib/calendar.ts'
import { calendarHref, dayHref } from '../router.ts'

interface Week {
  /** The name of the Sunday, or of the first day when the month starts mid-week. */
  title: string
  season: Season
  days: Date[]
}

/** The days of a month, in weeks that start on Sunday. */
function weeksOf(year: number, month: number): Week[] {
  const weeks: Week[] = []
  for (let d = new Date(year, month, 1); d.getMonth() === month; d = addDays(d, 1)) {
    if (d.getDay() === 0 || weeks.length === 0) {
      // Name the week after its Sunday, also when the month starts mid-week.
      const sunday = addDays(d, -d.getDay())
      const c = churchDay(sunday)
      weeks.push({ title: c.name, season: c.season, days: [] })
    }
    weeks[weeks.length - 1].days.push(d)
  }
  return weeks
}

export function CalendarView({ year, month }: { year: number; month: number }) {
  const [people, setPeople] = useState<Record<string, Commemoration>>({})
  useEffect(() => {
    let live = true
    // Load the commemorations of this month, for their names.
    calendar
      .loadCommemorations(month)
      .then((list) => live && setPeople(list))
      .catch(() => {
        // The calendar works with no commemorations.
      })
    return () => {
      live = false
    }
  }, [year, month])

  const today = isoDate(new Date())
  const todayRow = useRef<HTMLLIElement>(null)
  useEffect(() => {
    // Scroll to today when the month contains it. A user who asks for less motion gets an instant jump.
    const row = todayRow.current
    if (!row) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const frame = requestAnimationFrame(() => row.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' }))
    return () => cancelAnimationFrame(frame)
  }, [year, month])

  const first = new Date(year, month, 1)
  const title = first.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
  const prev = new Date(year, month - 1, 1)
  const next = new Date(year, month + 1, 1)

  return (
    <article className="calendar">
      <header className="date">
        <a className="step" href={calendarHref(prev)} aria-label="Previous month">
          ‹
        </a>
        <div>
          <h1>{title}</h1>
          <a className="small" href="#/">
            Go to today
          </a>
        </div>
        <a className="step" href={calendarHref(next)} aria-label="Next month">
          ›
        </a>
      </header>

      {weeksOf(year, month).map((week) => (
        <section key={isoDate(week.days[0])} className={`week season-${week.season}`}>
          <h2>
            <span className="season">{SEASON_NAMES[week.season]}</span>
            {week.title}
          </h2>
          <ol className="days">
            {week.days.map((d) => {
              const c = churchDay(d)
              const holy = c.holyDay ? HOLY_DAYS[c.holyDay.replace(/^holy-/, '')] : undefined
              const person = people[dateKey(d)]
              const sunday = d.getDay() === 0
              // The week heading names the Sunday, so its row shows only a saint's day or a person.
              const feast = feastName(d, c.name)
              return (
                <li
                  key={isoDate(d)}
                  ref={isoDate(d) === today ? todayRow : undefined}
                  className={`${sunday ? 'sunday' : ''} ${isoDate(d) === today ? 'today' : ''}`}>
                  <a href={dayHref(d)}>
                    <span className="num">
                      <strong>{d.getDate()}</strong>
                      <span>{d.toLocaleDateString('en-AU', { weekday: 'short' })}</span>
                    </span>
                    <span className="what">
                      {feast && <span className="name">{feast}</span>}
                      {holy && <span className="holy">{holy}</span>}
                      {person && <span className="person">{person.name}</span>}
                    </span>
                  </a>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </article>
  )
}

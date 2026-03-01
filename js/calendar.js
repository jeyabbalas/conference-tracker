// ICS file generation and Google Calendar URL building

function formatICSDate(dateStr) {
  return dateStr.replace(/-/g, '');
}

function nextDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function generateICS(conf) {
  const dtStart = formatICSDate(conf.conferenceDateStart);
  const dtEnd = nextDay(conf.conferenceDateEnd);
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const uid = `${conf.id}@conference-tracker`;

  let description = conf.fullName + '\\n' + conf.website;
  if (conf.notes) description += '\\n\\n' + conf.notes;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Conference Tracker//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${conf.abbreviation} — ${conf.fullName}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${conf.location.raw}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

export function downloadICS(conf) {
  const ics = generateICS(conf);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conf.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl(conf) {
  const dtStart = formatICSDate(conf.conferenceDateStart);
  const dtEnd = nextDay(conf.conferenceDateEnd);
  const title = `${conf.abbreviation} — ${conf.fullName}`;
  let details = conf.website;
  if (conf.notes) details += '\n\n' + conf.notes;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${dtStart}/${dtEnd}`,
    details: details,
    location: conf.location.raw,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const PATHS = {
  home: 'M4 11.5 12 4l8 7.5M6 10v9h12v-9',
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm-6-3a6 6 0 0 0 12 0M12 18v3',
  chart: 'M5 19V9m7 10V4m7 15v-7',
  spark: 'M12 3v4M12 17v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M3 12h4M17 12h4M4.2 19.8 7 17M17 7l2.8-2.8',
  play: 'M8 6.5v11l9-5.5-9-5.5Z',
  doc: 'M7 3h7l4 4v14H7V3Zm7 0v4h4',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a7.9 7.9 0 0 0-.2-1.8l2-1.6-2-3.4-2.4 1a8 8 0 0 0-3.1-1.8L14 2h-4l-.3 2.4a8 8 0 0 0-3.1 1.8l-2.4-1-2 3.4 2 1.6A7.9 7.9 0 0 0 4 12c0 .6.1 1.2.2 1.8l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 3.1 1.8L10 22h4l.3-2.4a8 8 0 0 0 3.1-1.8l2.4 1 2-3.4-2-1.6c.1-.6.2-1.2.2-1.8Z',
  logout: 'M15 17l5-5-5-5M20 12H9M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  notes: 'M6 3h9l4 4v14H6V3Zm0 8h11M6 15h11M6 7h5',
  camera: 'M3 7h3l1.5-2h7L16 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm9 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z',
  volume: 'M4 9v6h4l5 4V5L8 9H4Zm12.5-1.5a5 5 0 0 1 0 9',
  phoneOff: 'm3 3 18 18M10.7 10.7a3 3 0 0 0 .8 2.6l1 1c.6.6 1.6.7 2.3.2l1.2-.8a2 2 0 0 1 2.2.1l2.6 1.9c.6.5.7 1.4.2 2l-1.4 1.6a2 2 0 0 1-1.9.6C11.8 18.8 5.2 12.2 4 5.5a2 2 0 0 1 .6-1.9L6.2 2.2a1.5 1.5 0 0 1 2 .2l1.9 2.6c.4.6.4 1.5-.1 2.1l-.8 1.1',
  bell: 'M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Zm4.5 9a1.5 1.5 0 0 0 3 0',
  back: 'm14 6-6 6 6 6',
  check: 'm5 12 5 5L20 7',
  warn: 'M12 3 2 20h20L12 3Zm0 7v4m0 3h.01',
  flag: 'M5 21V4h13l-3 4 3 4H5',
}

export default function Icon({ name, className = 'h-5 w-5' }) {
  const d = PATHS[name]
  if (!d) return null
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

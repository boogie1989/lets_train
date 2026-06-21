// Shared line-icon set — currentColor so each skin tints them. Geometry is neutral;
// each design language sizes/places them in its own idiom.
const g = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
const sv = (s, body) => <svg width={s} height={s} viewBox="0 0 24 24" {...g}>{body}</svg>

export const Menu      = ({ s = 22 }) => sv(s, <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>)
export const Gear      = ({ s = 22 }) => sv(s, <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>)
export const ChevDown  = ({ s = 16 }) => sv(s, <polyline points="6 9 12 15 18 9" />)
export const ChevRight = ({ s = 16 }) => sv(s, <polyline points="9 6 15 12 9 18" />)
export const ChevLeft  = ({ s = 18 }) => sv(s, <polyline points="15 18 9 12 15 6" />)
export const Plus      = ({ s = 20 }) => sv(s, <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>)
export const Close     = ({ s = 18 }) => sv(s, <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>)
export const Clock     = ({ s = 14 }) => sv(s, <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></>)
export const Activity  = ({ s = 14 }) => sv(s, <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />)
export const Meal      = ({ s = 14 }) => sv(s, <><path d="M4 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3" /><line x1="6" y1="12" x2="6" y2="21" /><path d="M17 3c-1.5 0-2.5 1.6-2.5 4s1 4 2.5 4 2.5-1.6 2.5-4-1-4-2.5-4z" /><line x1="17" y1="11" x2="17" y2="21" /></>)
export const Plan      = ({ s = 13 }) => sv(s, <><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></>)
export const Check     = ({ s = 15 }) => sv(s, <><circle cx="12" cy="12" r="9" /><polyline points="8.5 12.2 11 14.7 15.5 9.5" /></>)
export const CheckMini = ({ s = 14 }) => sv(s, <polyline points="5 12 10 17 19 7" />)
export const Heart     = ({ s = 15 }) => sv(s, <path d="M20.8 8.6a5 5 0 0 0-8.8-2.6A5 5 0 0 0 3.2 8.6c0 4 4.8 7 8.8 10 4-3 8.8-6 8.8-10z" />)
export const Trash     = ({ s = 16 }) => sv(s, <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>)
export const Move      = ({ s = 16 }) => sv(s, <><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /><polyline points="10.5 13 13.5 16 10.5 19" /></>)
export const CalOff    = ({ s = 40 }) => sv(s, <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="10" y1="14" x2="14" y2="18" /><line x1="14" y1="14" x2="10" y2="18" /></>)
export const Barbell   = ({ s = 16 }) => <svg width={s} height={s * 0.5} viewBox="0 0 26 13" {...g}><rect x="0.8" y="3" width="4" height="7" rx="1" /><rect x="21.2" y="3" width="4" height="7" rx="1" /><line x1="4.8" y1="6.5" x2="21.2" y2="6.5" /></svg>

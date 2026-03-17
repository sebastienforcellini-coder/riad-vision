'use client'
import React from 'react'
import { STATUTS, calcPrixM2, EUR_RATE, fmtEUR, fmtMAD } from '@/lib/constants'
import type { Statut } from '@/types'

export function Chip({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: 11, color, background: color + '18', border: `1px solid ${color}22`,
    }}>{text}</span>
  )
}

export function StatutChip({ statut }: { statut: Statut | '' }) {
  const s = STATUTS[statut as Statut]
  if (!s) return null
  return <Chip text={s.l} color={s.c} />
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="card" style={style}>{children}</div>
}

export function Divider() {
  return <div className="divider" />
}

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="label">{children}</div>
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 16 }}>{children}</div>
}

export function FieldInput({
  label, value, onChange, type = 'text', placeholder, style,
}: {
  label: string; value: string | number | null | undefined
  onChange: (v: string) => void; type?: string; placeholder?: string; style?: React.CSSProperties
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Label>{label}</Label>
      <input
        className="field-input" type={type}
        value={value ?? ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? ''} style={style}
      />
    </div>
  )
}

export function FieldSelect({
  label, value, options, onChange,
}: {
  label: string; value: string; options: [string, string][]; onChange: (v: string) => void
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Label>{label}</Label>
      <select className="field-input" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}

export function StatRow({ label, value, color, serif }: { label: string; value: string; color?: string; serif?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ fontSize: 12, color: 'var(--mid)' }}>{label}</span>
      <span className={serif ? 'serif' : ''} style={{ fontSize: serif ? 16 : 13, color: color ?? 'var(--text)', fontWeight: serif ? 300 : 400 }}>{value}</span>
    </div>
  )
}

export function PrixM2Block({ prix, surface }: { prix: number | null; surface: number | null }) {
  const p = calcPrixM2(prix, surface)
  if (!p) {
    return (
      <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg)', borderRadius: 6, fontSize: 11, color: 'var(--soft)', fontStyle: 'italic' }}>
        Le prix au m² s&apos;affiche dès que le prix et la surface sont renseignés
      </div>
    )
  }
  return (
    <div style={{ background: 'var(--accent-bg)', border: '1px solid rgba(140,90,40,0.2)', borderRadius: 8, padding: '12px 14px', marginTop: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 8 }}>Prix au m²</div>
      <div style={{ display: 'flex', gap: 24 }}>
        <div>
          <div className="serif" style={{ fontSize: 20, color: 'var(--accent)', fontWeight: 300 }}>{fmtMAD(p.mad)}</div>
          <div style={{ fontSize: 10, color: 'var(--soft)', marginTop: 2 }}>par m²</div>
        </div>
        <div>
          <div style={{ fontSize: 15, color: 'var(--mid)' }}>{fmtEUR(p.eur)}</div>
          <div style={{ fontSize: 10, color: 'var(--soft)', marginTop: 2 }}>1€ = {EUR_RATE} MAD</div>
        </div>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
      <div>
        <h1 className="serif" style={{ fontSize: 26, fontWeight: 300, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--soft)', marginTop: 4 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  )
}

export function Btn({ label, onClick, primary, ghost, sm, style }: {
  label: string; onClick: () => void
  primary?: boolean; ghost?: boolean; sm?: boolean; style?: React.CSSProperties
}) {
  return (
    <button
      onClick={onClick}
      className={`btn${primary ? ' btn-primary' : ghost ? ' btn-ghost' : ''}${sm ? ' btn-sm' : ''}`}
      style={style}
    >
      {label}
    </button>
  )
}

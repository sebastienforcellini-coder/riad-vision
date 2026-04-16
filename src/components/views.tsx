'use client'
import { useState } from 'react'
import type { Riad, Estimation, TypeBien, CategorieRiad } from '@/types'
import { LEVELS, ETATS, ZONES, TRANSFORMATIONS, QUARTIERS, TYPES_BIEN, STATUTS, CATEGORIES_RIAD, QUARTIERS_MARCHE_DEFAULT, fmtM, fmtMAD, fmtEUR, calcEstimation } from '@/lib/constants'
import { Card, SectionLabel, Divider, StatutChip, FieldInput, FieldSelect, StatRow, PrixM2Block, PageHeader, Btn, Chip } from '@/components/ui'
import PhotoGallery from '@/components/PhotoGallery'
import { BtnMaps } from '@/components/CarteMarrakech'
import { AnalysePrix } from '@/components/Marche'

const EMPTY_RIAD: Partial<Riad> = {
  categorie: 'portefeuille', typeBien: 'riad', titre: false, meuble: false, enActivite: false,
  piscine: false, bassin: false, clim: false, photos: [], lat: null, lng: null,
}

// ── SECTION ACCORDÉON ────────────────────────────────────────────────────────
function Section({ title, badge, children, defaultOpen = false }: {
  title: string; badge?: string | null; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderRadius: 10, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '13px 20px', background: open ? 'var(--white)' : 'var(--bg)',
          border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{title}</span>
          {badge && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(58,125,92,0.2)' }}>
              {badge}
            </span>
          )}
          {!badge && (
            <span style={{ fontSize: 11, color: 'var(--soft)' }}>optionnel</span>
          )}
        </div>
        <span style={{ fontSize: 16, color: 'var(--soft)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>⌄</span>
      </button>
      {open && (
        <div style={{ padding: '4px 20px 20px', background: 'var(--white)', borderTop: '1px solid var(--line)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── RIADS LIST ──────────────────────────────────────────────────────────────
export function RiadsList({ riads, onNew, onEdit, onEstimate, onPresent, onDelete, onToggleCategorie }: {
  riads: Riad[]; onNew: () => void; onEdit: (r: Riad) => void
  onEstimate: (r: Riad) => void; onPresent: (r: Riad) => void; onDelete: (id: number) => void
  onToggleCategorie: (r: Riad) => void
}) {
  const [filtre, setFiltre] = useState<'tous' | 'visite' | 'negociation' | 'proposition' | 'signe'>('tous')

  const portefeuille = riads.filter(r => (r.categorie ?? 'portefeuille') === 'portefeuille')
  const prospection = riads.filter(r => r.categorie === 'prospection')
  const appliquerFiltre = (liste: Riad[]) => filtre === 'tous' ? liste : liste.filter(r => r.statut === filtre)

  const RiadCard = (r: Riad) => {
    const prix = r.prixN ?? r.prixD
    const m2mad = prix && r.surface ? Math.round(prix / r.surface) : null
    const m2eur = m2mad ? Math.round(m2mad / 11) : null
    return (
      <Card key={r.id} style={{ padding: 0, overflow: 'hidden' }}>
        {r.photos && r.photos.length > 0 && (
          <div style={{ height: 140, overflow: 'hidden', cursor: 'pointer' }} onClick={() => onEdit(r)}>
            <img src={`https://nsogcsmriufjcymlmatz.supabase.co/storage/v1/object/public/riad-photos/${r.photos[0]}`} alt={r.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div className="riad-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 20px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              {r.typeBien && r.typeBien !== 'riad' && (
                <span style={{ fontSize: 10, color: 'var(--mid)', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 4, padding: '2px 7px' }}>{TYPES_BIEN[r.typeBien]}</span>
              )}
              <span className="serif" style={{ fontSize: 18, color: 'var(--text)', fontStyle: 'italic', fontWeight: 300 }}>{r.nom}</span>
              <StatutChip statut={r.statut} />
              {r.titre && <Chip text="Titré" color="var(--green)" />}
              {r.enActivite && <Chip text="En activité" color="var(--accent)" />}
              {r.piscine && <Chip text="Piscine" color="#185FA5" />}
              {r.bassin && !r.piscine && <Chip text="Bassin" color="#185FA5" />}
            </div>
            <div style={{ fontSize: 12, color: 'var(--soft)', marginBottom: 8 }}>
              {r.quartier ? r.quartier + ' — ' : ''}{r.adresse || 'Adresse à renseigner'}
              {r.agenceSource ? <span style={{ marginLeft: 8, fontSize: 11 }}>· {r.agenceSource}</span> : ''}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {r.surface && <span style={{ fontSize: 12, color: 'var(--mid)' }}>{r.surface} m²</span>}
              {r.niveaux && <span style={{ fontSize: 12, color: 'var(--mid)' }}>{r.niveaux} niv.</span>}
              {r.chambres && <span style={{ fontSize: 12, color: 'var(--mid)' }}>{r.chambres} ch.</span>}
              {r.etat && <span style={{ fontSize: 12, color: 'var(--mid)' }}>{ETATS[r.etat]}</span>}
            </div>
          </div>
          <div className="riad-card-price" style={{ textAlign: 'right', minWidth: 120 }}>
            {prix ? (
              <>
                <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 2 }}>Prix {r.prixN ? 'négocié' : 'demandé'}</div>
                <div className="serif" style={{ fontSize: 20, color: r.prixN ? 'var(--accent)' : 'var(--mid)', fontWeight: 300 }}>{fmtM(prix)}</div>
                {m2mad && <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 2 }}>{new Intl.NumberFormat('fr-MA').format(m2mad)} MAD/m²</div>}
              </>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic' }}>Prix à renseigner</div>
            )}
            <div className="riad-card-btns" style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <BtnMaps lat={r.lat ?? null} lng={r.lng ?? null} nom={r.nom} sm />
              <Btn label="Présenter" onClick={() => onPresent(r)} sm />
              <Btn label="Estimer" onClick={() => onEstimate(r)} primary sm />
              <Btn label="Fiche" onClick={() => onEdit(r)} sm />
              <button onClick={() => onDelete(r.id)} style={{ padding: '6px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: 'var(--soft)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C0392B'; (e.currentTarget as HTMLElement).style.borderColor = '#f0b8b5' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--soft)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}>✕</button>
            </div>
            <button onClick={() => onToggleCategorie(r)} style={{ marginTop: 6, fontSize: 9, padding: '2px 8px', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--line)', background: 'transparent', color: 'var(--soft)' }}>
              {(r.categorie ?? 'portefeuille') === 'portefeuille' ? '→ Prospection' : '→ Portefeuille'}
            </button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <PageHeader title="Mes riads" subtitle={riads.length + ' biens'} action={<Btn label="+ Nouveau riad" onClick={onNew} primary sm />} />

      {/* Filtres rapides par statut */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['tous', 'visite', 'negociation', 'proposition', 'signe'] as const).map(f => {
          const count = f === 'tous' ? riads.length : riads.filter(r => r.statut === f).length
          const labels: Record<string, string> = { tous: 'Tous', visite: 'Visite', negociation: 'Négociation', proposition: 'Proposition', signe: 'Signé' }
          return (
            <button key={f} onClick={() => setFiltre(f)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              background: filtre === f ? 'var(--text)' : 'var(--white)',
              color: filtre === f ? 'var(--white)' : 'var(--mid)',
              border: `1px solid ${filtre === f ? 'var(--text)' : 'var(--line)'}`,
            }}>{labels[f]} ({count})</button>
          )
        })}
      </div>

      {/* Portefeuille */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, background: '#8C5A28', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', flexShrink: 0 }} />
          <div style={{ fontSize: 13, fontWeight: 500 }}>Portefeuille</div>
          <div style={{ fontSize: 12, color: 'var(--soft)' }}>{appliquerFiltre(portefeuille).length} bien{appliquerFiltre(portefeuille).length > 1 ? 's' : ''}</div>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>
        {appliquerFiltre(portefeuille).length === 0
          ? <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic', padding: '12px 0' }}>Aucun bien</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{appliquerFiltre(portefeuille).map(r => RiadCard(r))}</div>
        }
      </div>

      {/* Prospection */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, background: '#185FA5', borderRadius: 2, transform: 'rotate(45deg)', flexShrink: 0 }} />
          <div style={{ fontSize: 13, fontWeight: 500 }}>Prospection</div>
          <div style={{ fontSize: 12, color: 'var(--soft)' }}>{appliquerFiltre(prospection).length} repéré{appliquerFiltre(prospection).length > 1 ? 's' : ''}</div>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>
        {appliquerFiltre(prospection).length === 0
          ? <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic', padding: '12px 0' }}>Aucun bien en prospection</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{appliquerFiltre(prospection).map(r => RiadCard(r))}</div>
        }
      </div>
    </div>
  )
}

// ── RIAD FICHE (progressive) ─────────────────────────────────────────────────
export function RiadFiche({ initial, marchePrix, onSave, onCancel }: {
  initial: Partial<Riad> | null
  marchePrix?: Record<string, import('@/types').QuartierMarche>
  onSave: (r: Partial<Riad>) => void
  onCancel: () => void
}) {
  const [r, setR] = useState<Partial<Riad>>({ ...EMPTY_RIAD, ...(initial ?? {}) })
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const isNew = !r.id
  const set = (k: keyof Riad, v: unknown) => setR(prev => ({ ...prev, [k]: v }))
  const toggle = (k: keyof Riad) => setR(prev => ({ ...prev, [k]: !prev[k as keyof typeof prev] }))

  const handleImport = async () => {
    if (!importUrl) return
    setImporting(true); setImportMsg('')
    try {
      const res = await fetch('/api/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: importUrl }) })
      const json = await res.json()
      if (json.ok && json.data) {
        const d = json.data
        setR(prev => ({
          ...prev,
          nom: d.nom || prev.nom, typeBien: d.typeBien || prev.typeBien,
          reference: d.reference || prev.reference, agenceSource: d.agenceSource || prev.agenceSource,
          adresse: d.adresse || prev.adresse, quartier: d.quartier || prev.quartier,
          proximite: d.proximite || prev.proximite, vue: d.vue || prev.vue,
          surface: d.surface ?? prev.surface, niveaux: d.niveaux ?? prev.niveaux,
          chambres: d.chambres ?? prev.chambres, sdb: d.sdb ?? prev.sdb,
          terrasse: d.terrasse ?? prev.terrasse, prixD: d.prixD ?? prev.prixD,
          etat: d.etat || prev.etat, titre: d.titre ?? prev.titre,
          meuble: d.meuble ?? prev.meuble, enActivite: d.enActivite ?? prev.enActivite,
          piscine: d.piscine ?? prev.piscine, bassin: d.bassin ?? prev.bassin, clim: d.clim ?? prev.clim,
          potentiel: d.potentiel || prev.potentiel, notes: d.notes || prev.notes, lienSource: importUrl,
        }))
        setImportMsg('✓ Fiche pré-remplie — vérifiez et ajustez les données')
      } else { setImportMsg(json.error || "Impossible d'importer cette annonce") }
    } catch { setImportMsg('Erreur de connexion') }
    setImporting(false)
  }

  // Badges pour les sections fermées
  const badgeLocalisation = r.quartier || r.adresse ? (r.quartier || r.adresse || '') : null
  const badgeStructure = r.surface ? `${r.surface} m²${r.chambres ? ` · ${r.chambres} ch.` : ''}` : null
  const badgePrix = r.prixN ? `Négocié ${fmtM(r.prixN)}` : r.prixD ? `Demandé ${fmtM(r.prixD)}` : null
  const badgeLocatif = r.tarifNuit && r.tauxOccupation ? `${r.tarifNuit} MAD · ${r.tauxOccupation}%` : null
  const badgeNotes = r.potentiel || r.notes ? 'renseigné' : null
  const badgePhotos = r.photos && r.photos.length > 0 ? `${r.photos.length} photo${r.photos.length > 1 ? 's' : ''}` : null

  return (
    <div>
      <PageHeader
        title={isNew ? 'Nouveau riad' : (r.nom || 'Modifier la fiche')}
        subtitle={isNew ? 'Remplissez au minimum le nom, le quartier et le prix' : undefined}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Annuler" onClick={onCancel} />
            <Btn label={isNew ? 'Créer' : 'Enregistrer'} onClick={() => { if (r.nom) onSave(r) }} primary />
          </div>
        }
      />

      {/* Import annonce */}
      <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 8 }}>Pré-remplir depuis une annonce en ligne</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="field-input" type="url" value={importUrl} onChange={e => setImportUrl(e.target.value)}
            placeholder="https://cotemedina.com/… collez le lien" style={{ flex: 1 }} />
          <button onClick={handleImport} disabled={importing || !importUrl} style={{
            padding: '9px 18px', borderRadius: 6, fontSize: 12, cursor: importing ? 'wait' : 'pointer',
            background: importing ? 'var(--bg)' : 'var(--text)', color: importing ? 'var(--mid)' : 'var(--white)',
            border: '1px solid var(--line2)', whiteSpace: 'nowrap', opacity: !importUrl ? 0.4 : 1,
          }}>{importing ? 'Import...' : 'Importer'}</button>
        </div>
        {importMsg && (
          <div style={{ marginTop: 8, fontSize: 12, padding: '8px 12px', borderRadius: 6, background: importMsg.startsWith('✓') ? 'var(--green-bg)' : '#fdf0ef', color: importMsg.startsWith('✓') ? 'var(--green)' : '#C0392B' }}>
            {importMsg}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          ESSENTIEL — toujours visible
      ════════════════════════════════════════ */}
      <Card style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <span style={{ width: 22, height: 22, background: 'var(--accent)', color: 'white', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>1</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Essentiel</span>
          <span style={{ fontSize: 11, color: 'var(--soft)' }}>nom · quartier · statut · prix · surface</span>
        </div>

        {/* Catégorie */}
        <div style={{ marginBottom: 16 }}>
          <div className="label">Catégorie</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {(Object.entries(CATEGORIES_RIAD) as [CategorieRiad, typeof CATEGORIES_RIAD[CategorieRiad]][]).map(([k, v]) => (
              <button key={k} onClick={() => set('categorie', k)} style={{
                flex: 1, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                background: (r.categorie ?? 'portefeuille') === k ? v.bg : 'var(--bg)',
                border: `1px solid ${(r.categorie ?? 'portefeuille') === k ? v.color + '55' : 'var(--line)'}`,
                color: (r.categorie ?? 'portefeuille') === k ? v.color : 'var(--soft)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{v.label}</div>
                <div style={{ fontSize: 10, marginTop: 2 }}>{v.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <FieldInput label="Nom du bien *" value={r.nom} onChange={v => set('nom', v)} placeholder="Riad Almas…" />
          <div style={{ marginBottom: 16 }}>
            <div className="label">Type</div>
            <select className="field-input" value={r.typeBien ?? ''} onChange={e => set('typeBien', e.target.value as TypeBien)}>
              {Object.entries(TYPES_BIEN).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FieldSelect label="Quartier" value={r.quartier ?? ''} onChange={v => set('quartier', v)}
            options={QUARTIERS.map(q => [q, q || '— Quartier —'])} />
          <FieldSelect label="Statut" value={r.statut ?? ''} onChange={v => set('statut', v)}
            options={[['', '— Statut —'], ['visite', 'Visite'], ['negociation', 'Négociation'], ['proposition', 'Proposition'], ['signe', 'Signé'], ['archive', 'Archivé']]} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FieldInput label="Prix demandé (MAD)" value={r.prixD} onChange={v => set('prixD', v ? Number(v) : null)} type="number" placeholder="Ex: 8400000" />
          <FieldInput label="Surface totale (m²)" value={r.surface} onChange={v => set('surface', v ? Number(v) : null)} type="number" placeholder="Ex: 280" />
        </div>

        {(r.prixD || r.prixN) && r.surface && <PrixM2Block prix={r.prixN ?? r.prixD ?? null} surface={r.surface ?? null} />}

        {/* Équipements */}
        <div style={{ marginTop: 8 }}>
          <div className="label">Équipements</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            {(['titre', 'piscine', 'bassin', 'clim', 'meuble', 'enActivite'] as const).map(k => {
              const labels: Record<string, string> = { titre: 'Titré', meuble: 'Meublé', enActivite: 'En activité', piscine: 'Piscine', bassin: 'Bassin', clim: 'Climatisation' }
              return (
                <button key={k} onClick={() => toggle(k)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  background: r[k] ? 'var(--green-bg)' : 'var(--bg)',
                  color: r[k] ? 'var(--green)' : 'var(--soft)',
                  border: `1px solid ${r[k] ? 'rgba(58,125,92,0.3)' : 'var(--line)'}`,
                }}>
                  {r[k] ? '✓ ' : ''}{labels[k]}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* ════════════════════════════════════════
          SECTIONS ACCORDÉON
      ════════════════════════════════════════ */}

      <Section title="Localisation & GPS" badge={badgeLocalisation}>
        <div style={{ marginTop: 14 }}>
          <FieldInput label="Adresse / Derb" value={r.adresse} onChange={v => set('adresse', v)} placeholder="Derb Sidi Bouamar…" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldInput label="Proximité" value={r.proximite} onChange={v => set('proximite', v)} placeholder="5 min Jemaa el-Fna…" />
            <FieldInput label="Vue" value={r.vue} onChange={v => set('vue', v)} placeholder="Vue sur les toits…" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div className="label">Zone marché (analyse prix)</div>
            <select className="field-input" value={r.quartierMarche ?? ''} onChange={e => set('quartierMarche', e.target.value || null)}>
              <option value="">— Sélectionner —</option>
              {Object.entries(QUARTIERS_MARCHE_DEFAULT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          {marchePrix && r.quartierMarche && (r.prixD || r.prixN) && r.surface && (
            <div style={{ marginBottom: 14 }}>
              <AnalysePrix prix={r.prixN ?? r.prixD ?? null} surface={r.surface ?? null} quartierKey={r.quartierMarche ?? null} etat={r.etat ?? null} marchePrix={marchePrix} />
            </div>
          )}
          <div className="label" style={{ marginBottom: 6 }}>Coordonnées GPS</div>
          <input className="field-input" type="text" placeholder='Coller ici : 31°39′44.6″N 8°00′23.2″W' style={{ marginBottom: 8 }}
            onChange={ev => {
              const v = ev.target.value.trim(); if (!v) return
              const parseDMS = (str: string): number | null => {
                const dec = parseFloat(str); if (!isNaN(dec) && str.match(/^-?[\d.]+$/)) return dec
                const m = str.replace(/[°′']/g, ' ').replace(/[″"]/g, ' ').replace(/\s+/g, ' ').trim().match(/^(\d+)\s+(\d+)\s+([\d.]+)\s*([NSEW])$/i)
                if (!m) return null; const [, d, min, sec, dir] = m
                let dd = parseFloat(d) + parseFloat(min) / 60 + parseFloat(sec) / 3600
                if (dir.toUpperCase() === 'S' || dir.toUpperCase() === 'W') dd = -dd
                return Math.round(dd * 100000) / 100000
              }
              const parts = v.split(/\s+(?=\d)/)
              if (parts.length >= 2) { const lat = parseDMS(parts[0]); const lng = parseDMS(parts[1]); if (lat !== null && lng !== null) { set('lat', lat); set('lng', lng); ev.target.value = '' } }
            }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
            <input className="field-input" type="number" step="0.00001" value={r.lat ?? ''} onChange={ev => set('lat', ev.target.value ? Number(ev.target.value) : null)} placeholder="Lat. 31.6295" />
            <input className="field-input" type="number" step="0.00001" value={r.lng ?? ''} onChange={ev => set('lng', ev.target.value ? Number(ev.target.value) : null)} placeholder="Lng. -7.9811" />
            <button onClick={() => { if (!navigator.geolocation) return; navigator.geolocation.getCurrentPosition(pos => { set('lat', Math.round(pos.coords.latitude * 100000) / 100000); set('lng', Math.round(pos.coords.longitude * 100000) / 100000) }) }} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'pointer', fontSize: 16 }}>📍</button>
          </div>
          {r.lat && r.lng && <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}><BtnMaps lat={r.lat} lng={r.lng} nom={r.nom || 'Riad'} sm /><span style={{ fontSize: 10, color: 'var(--soft)' }}>{r.lat}, {r.lng}</span></div>}
        </div>
      </Section>

      <Section title="Structure & état" badge={badgeStructure}>
        <div style={{ marginTop: 14 }}>
          <FieldSelect label="État du bien" value={r.etat ?? ''} onChange={v => set('etat', v)}
            options={[['', '— État —'], ['tres_bon', 'Très bon état / rénové'], ['bon', 'Bon état'], ['moyen', 'État moyen'], ['mauvais', 'Mauvais état'], ['ruine', 'À rénover']]} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FieldInput label="Niveaux" value={r.niveaux} onChange={v => set('niveaux', v ? Number(v) : null)} type="number" placeholder="3" />
            <FieldInput label="Chambres" value={r.chambres} onChange={v => set('chambres', v ? Number(v) : null)} type="number" placeholder="4" />
            <FieldInput label="Salles de bain" value={r.sdb} onChange={v => set('sdb', v ? Number(v) : null)} type="number" placeholder="4" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FieldInput label="Terrasse (m²)" value={r.terrasse} onChange={v => set('terrasse', v ? Number(v) : null)} type="number" placeholder="25" />
            <FieldInput label="2ème terrasse (m²)" value={r.terrasse2} onChange={v => set('terrasse2', v ? Number(v) : null)} type="number" placeholder="—" />
            <FieldInput label="3ème terrasse (m²)" value={r.terrasse3} onChange={v => set('terrasse3', v ? Number(v) : null)} type="number" placeholder="—" />
          </div>
        </div>
      </Section>

      <Section title="Prix négocié & agence" badge={badgePrix}>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldInput label="Prix négocié (MAD)" value={r.prixN} onChange={v => set('prixN', v ? Number(v) : null)} type="number" placeholder="—" />
            <FieldInput label="Prix demandé (MAD)" value={r.prixD} onChange={v => set('prixD', v ? Number(v) : null)} type="number" placeholder="—" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldInput label="Référence agence" value={r.reference} onChange={v => set('reference', v)} placeholder="RR2171" />
            <div style={{ marginBottom: 16 }}>
              <div className="label">Agence source</div>
              <input className="field-input" list="agences-list" value={r.agenceSource ?? ''} onChange={e => set('agenceSource', e.target.value)} placeholder="Côté Médina…" />
              <datalist id="agences-list">
                <option value="Direct Propriétaire" /><option value="Côté Médina" /><option value="Barnes Marrakech" /><option value="MarrakechRealty" /><option value="Mubawab" /><option value="Avito Maroc" />
              </datalist>
            </div>
          </div>
          {r.lienSource && <div style={{ marginBottom: 10 }}><div className="label">Lien source</div><a href={r.lienSource} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--accent)', wordBreak: 'break-all' }}>{r.lienSource}</a></div>}
        </div>
      </Section>

      <Section title="Simulation locative" badge={badgeLocatif}>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <FieldInput label="Tarif nuit (MAD)" value={r.tarifNuit} onChange={v => set('tarifNuit', v ? Number(v) : null)} type="number" placeholder="1 500" />
            <FieldInput label="Taux occupation (%)" value={r.tauxOccupation} onChange={v => set('tauxOccupation', v ? Number(v) : null)} type="number" placeholder="65" />
          </div>
          {r.tarifNuit && r.tauxOccupation ? (() => {
            const nuits = Math.round(365 * r.tauxOccupation / 100)
            const caAnnuel = r.tarifNuit * nuits
            const netAnnuel = Math.round(caAnnuel * 0.6)
            return (
              <div style={{ background: 'var(--accent-bg)', border: '1px solid rgba(140,90,40,0.2)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div><div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 3 }}>CA BRUT / AN</div><div className="serif" style={{ fontSize: 18, color: 'var(--accent)', fontWeight: 300 }}>{fmtM(caAnnuel)}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 3 }}>NET ESTIMÉ (–40%)</div><div className="serif" style={{ fontSize: 18, color: 'var(--accent)', fontWeight: 300 }}>{fmtM(netAnnuel)}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 3 }}>NUITS / AN</div><div style={{ fontSize: 16, color: 'var(--mid)' }}>{nuits}</div></div>
                </div>
              </div>
            )
          })() : <div style={{ fontSize: 11, color: 'var(--soft)', fontStyle: 'italic' }}>Renseignez tarif et taux pour voir la simulation</div>}
        </div>
      </Section>

      <Section title="Potentiel & notes" badge={badgeNotes}>
        <div style={{ marginTop: 14 }}>
          <div style={{ marginBottom: 12 }}>
            <div className="label">Potentiel d&apos;aménagement</div>
            <textarea className="field-input" value={r.potentiel ?? ''} onChange={e => set('potentiel', e.target.value)} placeholder="Maison d'hôtes, piscine envisageable…" style={{ height: 60, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className="label">Contraintes</div>
            <textarea className="field-input" value={r.contraintes ?? ''} onChange={e => set('contraintes', e.target.value)} placeholder="Plomberie, mitoyenneté…" style={{ height: 48, resize: 'vertical' }} />
          </div>
          <div>
            <div className="label">Notes</div>
            <textarea className="field-input" value={r.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Contexte vendeur, points importants…" style={{ height: 60, resize: 'vertical' }} />
          </div>
        </div>
      </Section>

      <Section title="Photos" badge={badgePhotos}>
        <div style={{ marginTop: 14 }}>
          {r.id
            ? <PhotoGallery riadId={r.id} photos={r.photos ?? []} onPhotosChange={photos => set('photos', photos)} />
            : <div style={{ fontSize: 12, color: 'var(--soft)', fontStyle: 'italic' }}>Créez d&apos;abord la fiche pour pouvoir ajouter des photos</div>
          }
        </div>
      </Section>

      {/* Boutons bas de page */}
      <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
        <Btn label="Annuler" onClick={onCancel} />
        <Btn label={isNew ? 'Créer le riad' : 'Enregistrer'} onClick={() => { if (r.nom) onSave(r) }} primary />
      </div>
    </div>
  )
}

// ── ESTIMATEUR ──────────────────────────────────────────────────────────────
export function Estimateur({ riads, prestataires, estimation, onChange, onResults }: {
  riads: Riad[]; prestataires: import('@/types').Prestataire[]; estimation: Estimation; onChange: (e: Partial<Estimation>) => void; onResults: () => void
}) {
  const e = estimation
  const surfTotal = e.mode === 'rapide' ? Number(e.surface) || 0 : Object.values(e.zones).reduce((a, b) => a + (Number(b) || 0), 0)
  const lvl = LEVELS[e.niveau]
  const presta = prestataires.find(p => p.id === e.prestaId) ?? null
  const prestaPrixM2 = presta?.tarifs.find(t => t.type === 'm2')?.prix ?? null
  const prestaForfaits: Record<string, number> = {}
  if (presta) {
    presta.tarifs.forEach(t => {
      if (t.type === 'forfait') TRANSFORMATIONS.forEach(tr => { if (t.label.toLowerCase().includes(tr.l.toLowerCase().split(' ')[0])) prestaForfaits[tr.k] = t.prix })
    })
  }
  const pp = e.prixPerso ? Number(e.prixPerso) : prestaPrixM2
  const res = calcEstimation(e.niveau, surfTotal, e.transf, e.prixPerso)

  const handlePresta = (id: string) => {
    const pid = id ? Number(id) : null
    const p = prestataires.find(x => x.id === pid)
    const m2 = p?.tarifs.find(t => t.type === 'm2')?.prix
    onChange({ prestaId: pid, prixPerso: m2 ? String(m2) : '' })
  }

  return (
    <div>
      <PageHeader title="Estimation travaux" subtitle="Résultats en temps réel" />
      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Config */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <SectionLabel>Riad & prestataire</SectionLabel>
            <div style={{ marginBottom: 14 }}>
              <div className="label">Riad concerné</div>
              <select className="field-input" value={e.riadId ?? ''} onChange={ev => { const id = ev.target.value ? Number(ev.target.value) : null; const riad = riads.find(x => x.id === id); onChange({ riadId: id, ...(riad?.surface ? { surface: riad.surface } : {}) }) }}>
                <option value="">— Aucun riad —</option>
                {riads.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
              </select>
            </div>
            <div>
              <div className="label">Prestataire (optionnel)</div>
              <select className="field-input" value={e.prestaId ?? ''} onChange={ev => handlePresta(ev.target.value)}>
                <option value="">— Fourchettes marché —</option>
                {prestataires.map(p => <option key={p.id} value={p.id}>{p.nom}{p.tarifs.some(t => t.type === 'm2') ? ` · ${p.tarifs.find(t => t.type === 'm2')!.prix.toLocaleString()} MAD/m²` : ''}</option>)}
              </select>
              {presta && <div style={{ marginTop: 6, padding: '8px 10px', background: 'var(--green-bg)', borderRadius: 6, fontSize: 11, color: 'var(--green)' }}>✓ Tarifs de {presta.nom} appliqués</div>}
            </div>
          </Card>

          <Card>
            <SectionLabel>Niveau de rénovation</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(Object.entries(LEVELS) as [string, typeof LEVELS[keyof typeof LEVELS]][]).map(([k, v]) => (
                <button key={k} onClick={() => onChange({ niveau: k as Estimation['niveau'] })} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', background: e.niveau === k ? v.bg : 'var(--white)', border: `1px solid ${e.niveau === k ? v.color + '55' : 'var(--line)'}` }}>
                  <span style={{ fontSize: 12, color: e.niveau === k ? v.color : 'var(--mid)' }}>{v.label}</span>
                  <span style={{ fontSize: 11, color: e.niveau === k ? v.color : 'var(--soft)' }}>{Math.round(v.min / 1000)}–{Math.round(v.max / 1000)} K/m²{prestaPrixM2 && <span style={{ color: 'var(--green)', marginLeft: 6 }}>· {presta?.nom.split(' ')[0]}: {Math.round(prestaPrixM2 / 1000)}K</span>}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="label">Prix MAD/m² personnalisé</div>
              <input className="field-input" type="number" value={e.prixPerso} onChange={ev => onChange({ prixPerso: ev.target.value })} placeholder={prestaPrixM2 ? `${prestaPrixM2} (${presta?.nom})` : 'Optionnel'} />
            </div>
          </Card>

          <Card>
            <SectionLabel>Surface</SectionLabel>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {([['rapide', 'Rapide'], ['detaille', 'Détaillé']] as const).map(([m, ml]) => (
                <button key={m} onClick={() => onChange({ mode: m })} style={{ flex: 1, padding: 8, borderRadius: 6, fontSize: 12, cursor: 'pointer', background: e.mode === m ? 'var(--text)' : 'var(--white)', color: e.mode === m ? 'var(--white)' : 'var(--mid)', border: `1px solid ${e.mode === m ? 'var(--text)' : 'var(--line2)'}` }}>{ml}</button>
              ))}
            </div>
            {e.mode === 'rapide'
              ? <input className="field-input" type="number" value={e.surface} onChange={ev => onChange({ surface: Number(ev.target.value) })} placeholder="Surface en m²" />
              : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {ZONES.map(z => <div key={z.k}><div className="label">{z.l}</div><input className="field-input" type="number" value={e.zones[z.k] || 0} onChange={ev => onChange({ zones: { ...e.zones, [z.k]: Number(ev.target.value) } })} placeholder="0" style={{ padding: '7px 10px' }} /></div>)}
                <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 8 }}><span style={{ fontSize: 12, color: 'var(--mid)' }}>Total</span><span className="serif" style={{ fontSize: 16, fontWeight: 300 }}>{surfTotal} m²</span></div>
              </div>
            }
          </Card>
        </div>

        {/* Résultats temps réel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card style={{ background: 'var(--bg)' }}>
            <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 6 }}>Budget estimé</div>
            <div className="serif" style={{ fontSize: 42, color: 'var(--text)', fontWeight: 300, lineHeight: 1 }}>{fmtM(res.total)}</div>
            <div style={{ fontSize: 12, color: 'var(--soft)', marginTop: 6, marginBottom: 16 }}>Fourchette — {fmtM(res.tMin)} à {fmtM(res.tMax)}</div>
            <Divider />
            <StatRow label="Surface" value={surfTotal + ' m²'} />
            <StatRow label="Prix retenu" value={new Intl.NumberFormat('fr-MA').format(Math.round(res.pMoy)) + ' MAD/m²'} />
            {res.extras > 0 && <StatRow label="Transformations" value={fmtM(res.extras)} color="var(--accent)" />}
            <div style={{ marginTop: 14 }}>
              {(Object.entries(LEVELS) as [string, typeof LEVELS[keyof typeof LEVELS]][]).map(([k, v]) => {
                const tot = surfTotal * Math.round((v.min + v.max) / 2)
                const active = k === e.niveau
                const pct = surfTotal > 0 ? Math.round(tot / (surfTotal * LEVELS.luxe.max) * 100) : 0
                return <div key={k} style={{ marginBottom: 8, opacity: active ? 1 : 0.4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ fontSize: 11, color: active ? v.color : 'var(--mid)' }}>{v.label}</span><span className="serif" style={{ fontSize: 12, color: active ? v.color : 'var(--mid)', fontWeight: 300 }}>{fmtM(tot)}</span></div>
                  <div style={{ height: 3, background: 'var(--line)', borderRadius: 2 }}><div style={{ height: '100%', width: pct + '%', background: active ? v.color : 'var(--soft)', borderRadius: 2 }} /></div>
                </div>
              })}
            </div>
            <button onClick={onResults} style={{ width: '100%', marginTop: 12, padding: '12px', background: 'var(--text)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Présenter au client →</button>
          </Card>

          <Card>
            <SectionLabel>Transformations supplémentaires</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {TRANSFORMATIONS.map(t => {
                const checked = e.transf.includes(t.k)
                const prestaPrice = prestaForfaits[t.k]
                return <button key={t.k} onClick={() => { const tr = checked ? e.transf.filter(x => x !== t.k) : [...e.transf, t.k]; onChange({ transf: tr }) }} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 6, cursor: 'pointer', background: checked ? 'var(--accent-bg)' : 'var(--bg)', border: `1px solid ${checked ? 'rgba(140,90,40,0.35)' : 'var(--line)'}` }}>
                  <span style={{ fontSize: 12, color: checked ? 'var(--accent)' : 'var(--mid)' }}>{checked ? '✓ ' : ''}{t.l}</span>
                  <span style={{ fontSize: 11, color: prestaPrice ? 'var(--green)' : checked ? 'var(--accent)' : 'var(--soft)' }}>{prestaPrice ? prestaPrice.toLocaleString() + ' MAD' : fmtM(t.f)}</span>
                </button>
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── RESULTATS ───────────────────────────────────────────────────────────────
export function Resultats({ estimation, riads, onBack, onRiads, onPresent }: {
  estimation: Estimation; riads: Riad[]; onBack: () => void; onRiads: () => void; onPresent: () => void
}) {
  const e = estimation
  const surf = e.mode === 'rapide' ? Number(e.surface) || 0 : Object.values(e.zones).reduce((a, b) => a + (Number(b) || 0), 0)
  const res = calcEstimation(e.niveau, surf, e.transf, e.prixPerso)
  const riad = riads.find(r => r.id === e.riadId)
  const maxBudget = surf * LEVELS.luxe.max

  return (
    <div>
      <PageHeader title="Résultats travaux" subtitle={(riad ? riad.nom + ' — ' : '') + res.lvl.label}
        action={<div style={{ display: 'flex', gap: 8 }}><Btn label="← Modifier" onClick={onBack} /><Btn label="Présenter →" onClick={onPresent} primary sm /></div>}
      />
      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <div style={{ padding: '12px 0 18px' }}>
              <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 10 }}>Budget travaux estimé</div>
              <div className="serif" style={{ fontSize: 44, color: 'var(--text)', fontWeight: 300, lineHeight: 1 }}>{fmtM(res.total)}</div>
              <div style={{ fontSize: 12, color: 'var(--soft)', marginTop: 8 }}>Fourchette — {fmtM(res.tMin)} à {fmtM(res.tMax)}</div>
            </div>
            <Divider />
            <StatRow label="Surface" value={res.surf + ' m²'} />
            <StatRow label="Prix moyen retenu" value={new Intl.NumberFormat('fr-MA').format(Math.round(res.pMoy)) + ' MAD/m²'} />
            {res.extras > 0 && <StatRow label="Transformations" value={fmtM(res.extras)} color="var(--accent)" />}
          </Card>
          <Card style={{ padding: '14px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 4 }}>Coût au m²</div>
                <div className="serif" style={{ fontSize: 24, color: res.lvl.color, fontWeight: 300 }}>{new Intl.NumberFormat('fr-MA').format(Math.round(res.pMoy))} MAD</div>
                <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 2 }}>≈ {fmtEUR(Math.round(res.pMoy / 11))}/m²</div>
              </div>
              <Chip text={res.lvl.label} color={res.lvl.color} />
            </div>
          </Card>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {e.transf.length > 0 && (
            <Card>
              <SectionLabel>Transformations incluses</SectionLabel>
              {e.transf.map(k => { const t = TRANSFORMATIONS.find(x => x.k === k); return t ? <StatRow key={k} label={'✓ ' + t.l} value={fmtM(t.f)} color="var(--accent)" /> : null })}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 4, borderTop: '1px solid var(--line)' }}>
                <span style={{ fontSize: 12, color: 'var(--mid)' }}>Total transformations</span>
                <span className="serif" style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 300 }}>{fmtM(res.extras)}</span>
              </div>
            </Card>
          )}
          <Card>
            <SectionLabel>Comparatif niveaux</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(Object.entries(LEVELS) as [string, typeof LEVELS[keyof typeof LEVELS]][]).map(([k, v]) => {
                const tot = surf * Math.round((v.min + v.max) / 2); const active = k === e.niveau
                const pct = maxBudget > 0 ? Math.round(tot / maxBudget * 100) : 0
                return <div key={k} style={{ opacity: active ? 1 : 0.45 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 11, color: active ? v.color : 'var(--mid)' }}>{v.label}</span><span className="serif" style={{ fontSize: 13, color: active ? v.color : 'var(--mid)', fontWeight: 300 }}>{fmtM(tot)}</span></div>
                  <div style={{ height: 3, background: 'var(--line)', borderRadius: 2 }}><div style={{ height: '100%', width: pct + '%', background: active ? v.color : 'var(--soft)', borderRadius: 2 }} /></div>
                </div>
              })}
            </div>
          </Card>
          {riad && (
            <Card>
              <SectionLabel>Bien associé</SectionLabel>
              <div className="serif" style={{ fontSize: 18, color: 'var(--text)', fontStyle: 'italic', fontWeight: 300, marginBottom: 4 }}>{riad.nom}</div>
              <div style={{ fontSize: 12, color: 'var(--soft)', marginBottom: 10 }}>{riad.quartier ? riad.quartier + ' — ' : ''}{riad.adresse}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                {[riad.surface ? [riad.surface + ' m²', 'Surface'] as [string, string] : null, riad.chambres ? [riad.chambres + ' ch.', 'Chambres'] as [string, string] : null, (riad.prixN ?? riad.prixD) ? [fmtM(riad.prixN ?? riad.prixD), 'Prix'] as [string, string] : null].filter((x): x is [string, string] => x !== null).map(([v, l]) => (
                  <div key={l}><div style={{ fontSize: 10, color: 'var(--soft)' }}>{l}</div><div style={{ fontSize: 13, marginTop: 2 }}>{v}</div></div>
                ))}
              </div>
            </Card>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label="Modifier" onClick={onBack} style={{ flex: 1 }} /><Btn label="Mes riads" onClick={onRiads} ghost style={{ flex: 1 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── PRESENTATION CLIENT ──────────────────────────────────────────────────────
export function Presentation({ estimation, riads, onBack }: {
  estimation: Estimation; riads: Riad[]; onBack: () => void
}) {
  const [selectedRiadId, setSelectedRiadId] = useState<number | null>(estimation.riadId)
  const e = estimation
  const surf = e.mode === 'rapide' ? Number(e.surface) || 0 : Object.values(e.zones).reduce((a, b) => a + (Number(b) || 0), 0)
  const res = calcEstimation(e.niveau, surf, e.transf, e.prixPerso)
  const riad = riads.find(r => r.id === (selectedRiadId ?? e.riadId))
  const prix = riad ? (riad.prixN ?? riad.prixD) : null
  const hasRental = riad?.tarifNuit && riad?.tauxOccupation
  const nuits = hasRental ? Math.round(365 * riad!.tauxOccupation! / 100) : null
  const caAnnuel = hasRental ? riad!.tarifNuit! * nuits! : null
  const netAnnuel = caAnnuel ? Math.round(caAnnuel * 0.6) : null
  const projetTotal = prix ? prix + res.total : null
  const rendement = netAnnuel && projetTotal ? ((netAnnuel / projetTotal) * 100).toFixed(1) : null

  return (
    <>
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } }`}</style>
      <div className="no-print" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="serif" style={{ fontSize: 24, color: 'var(--text)', fontStyle: 'italic', fontWeight: 300 }}>Présentation client</div>
          <div style={{ fontSize: 12, color: 'var(--soft)', marginTop: 4 }}>Montrez cet écran ou imprimez en PDF</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={selectedRiadId ?? ''} onChange={e => setSelectedRiadId(e.target.value ? Number(e.target.value) : null)} className="field-input" style={{ minWidth: 200, fontSize: 13 }}>
            <option value="">— Choisir un riad —</option>
            {riads.map(r => <option key={r.id} value={r.id}>{r.nom}{r.quartier ? ' · ' + r.quartier : ''}</option>)}
          </select>
          <Btn label="← Retour" onClick={onBack} />
          <Btn label="Imprimer / PDF" onClick={() => window.print()} primary />
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '32px 0 24px', borderBottom: '1px solid var(--line)', marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: 'var(--soft)', letterSpacing: 2, marginBottom: 8 }}>ESTIMATION · RIAD VISION</div>
          <div className="serif" style={{ fontSize: 36, color: 'var(--text)', fontStyle: 'italic', fontWeight: 300, marginBottom: 6 }}>{riad?.nom || 'Estimation travaux'}</div>
          {riad && <div style={{ fontSize: 14, color: 'var(--soft)' }}>{riad.quartier ? riad.quartier + ' · ' : ''}{riad.adresse}{riad.proximite ? ' · ' + riad.proximite : ''}</div>}
        </div>

        {riad && (riad.titre || riad.piscine || riad.bassin || riad.clim || riad.meuble) && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
            {riad.titre && <Chip text="Titre foncier" color="var(--green)" />}
            {riad.piscine && <Chip text="Piscine" color="#185FA5" />}
            {riad.bassin && !riad.piscine && <Chip text="Bassin" color="#185FA5" />}
            {riad.clim && <Chip text="Climatisation" color="var(--mid)" />}
            {riad.meuble && <Chip text="Meublé & équipé" color="var(--mid)" />}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: prix ? '1fr 1fr 1fr' : '1fr 1fr', gap: 12, marginBottom: 28 }}>
          {prix && <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 8 }}>PRIX {riad?.prixN ? 'NÉGOCIÉ' : 'DEMANDÉ'}</div>
            <div className="serif" style={{ fontSize: 26, color: 'var(--accent)', fontWeight: 300 }}>{fmtM(prix)}</div>
            {riad?.surface && <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 4 }}>{new Intl.NumberFormat('fr-MA').format(Math.round(prix / riad.surface))} MAD/m²</div>}
          </div>}
          <div style={{ background: 'var(--white)', border: '2px solid var(--text)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 8 }}>BUDGET TRAVAUX</div>
            <div className="serif" style={{ fontSize: 26, color: 'var(--text)', fontWeight: 300 }}>{fmtM(res.total)}</div>
            <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 4 }}>{res.lvl.label}</div>
          </div>
          {projetTotal && <div style={{ background: 'var(--accent-bg)', border: '1px solid rgba(140,90,40,0.3)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 8 }}>PROJET TOTAL</div>
            <div className="serif" style={{ fontSize: 26, color: 'var(--accent)', fontWeight: 300 }}>{fmtM(projetTotal)}</div>
            <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 4 }}>achat + rénovation</div>
          </div>}
        </div>

        {riad && <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[riad.surface ? [riad.surface + ' m²', 'Surface'] : null, riad.niveaux ? [riad.niveaux + ' niveaux', 'Structure'] : null, riad.chambres ? [riad.chambres + ' chambres', 'Hébergement'] : null, riad.etat ? [ETATS[riad.etat], 'État actuel'] : null].filter((x): x is [string, string] => x !== null).map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div className="serif" style={{ fontSize: 20, fontWeight: 300, color: 'var(--text)' }}>{v}</div>
                <div style={{ fontSize: 10, color: 'var(--soft)', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>}

        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 16 }}>Fourchette budgétaire travaux</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[['Budget min', fmtM(res.tMin), 'var(--green)'], ['Budget estimé', fmtM(res.total), 'var(--text)'], ['Budget max', fmtM(res.tMax), 'var(--accent)']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center', padding: 12, background: 'var(--bg)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--soft)', marginBottom: 6 }}>{l}</div>
                <div className="serif" style={{ fontSize: 18, color: c, fontWeight: 300 }}>{v}</div>
              </div>
            ))}
          </div>
          {e.transf.length > 0 && <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}><div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 8 }}>Transformations incluses</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{e.transf.map(k => { const t = TRANSFORMATIONS.find(x => x.k === k); return t ? <Chip key={k} text={t.l} color="var(--accent)" /> : null })}</div></div>}
        </Card>

        {hasRental && netAnnuel && <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 16 }}>Simulation rentabilité locative</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[[riad!.tarifNuit + ' MAD', 'Tarif / nuit'], [riad!.tauxOccupation + '%', 'Taux occupation'], [fmtM(caAnnuel!), 'CA annuel brut'], [rendement ? rendement + '%' : '—', 'Rendement net']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center', padding: 12, background: 'var(--accent-bg)', borderRadius: 8 }}>
                <div className="serif" style={{ fontSize: 18, color: 'var(--accent)', fontWeight: 300 }}>{v}</div>
                <div style={{ fontSize: 10, color: 'var(--soft)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--soft)', fontStyle: 'italic' }}>Estimation basée sur {nuits} nuits/an · Net après charges estimées à 40%</div>
        </Card>}

        {riad?.potentiel && <div style={{ padding: '16px 20px', background: 'var(--sidebar)', borderRadius: 10, border: '1px solid var(--line)', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 6 }}>POTENTIEL DU BIEN</div>
          <div className="serif" style={{ fontSize: 18, color: 'var(--text)', fontStyle: 'italic', fontWeight: 300 }}>{riad.potentiel}</div>
        </div>}

        <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid var(--line)' }}>
          <div className="serif" style={{ fontSize: 13, color: 'var(--soft)', fontStyle: 'italic' }}>Riad Vision · Marrakech</div>
          <div style={{ fontSize: 10, color: 'var(--soft)', marginTop: 4 }}>Estimation indicative — prix et travaux à confirmer avec le maître d&apos;œuvre</div>
        </div>
      </div>
    </>
  )
}

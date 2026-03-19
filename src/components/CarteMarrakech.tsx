'use client'
import { useState, useEffect, useRef } from 'react'
import type { Riad } from '@/types'
import { STATUTS, CATEGORIES_RIAD, fmtM } from '@/lib/constants'

const MARRAKECH_CENTER = { lat: 31.6295, lng: -7.9811 }

function openMaps(lat: number, lng: number, app: 'google' | 'apple' | 'waze') {
  if (app === 'google') window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
  else if (app === 'apple') window.open(`maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`, '_blank')
  else window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank')
}

export function BtnMaps({ lat, lng, nom, sm }: { lat: number | null; lng: number | null; nom: string; sm?: boolean }) {
  if (!lat || !lng) return null
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      <button onClick={e => { e.stopPropagation(); openMaps(lat, lng, 'google') }} style={{ padding: sm ? '3px 7px' : '5px 10px', borderRadius: 5, fontSize: sm ? 10 : 11, cursor: 'pointer', background: '#4285F4', color: 'white', border: 'none' }}>Google</button>
      <button onClick={e => { e.stopPropagation(); openMaps(lat, lng, 'apple') }} style={{ padding: sm ? '3px 7px' : '5px 10px', borderRadius: 5, fontSize: sm ? 10 : 11, cursor: 'pointer', background: '#1A1814', color: 'white', border: 'none' }}>Plans</button>
      <button onClick={e => { e.stopPropagation(); openMaps(lat, lng, 'waze') }} style={{ padding: sm ? '3px 7px' : '5px 10px', borderRadius: 5, fontSize: sm ? 10 : 11, cursor: 'pointer', background: '#33CCFF', color: '#1A1814', border: 'none' }}>Waze</button>
    </div>
  )
}

function markerHtml(categorie: 'portefeuille' | 'prospection', statut: string) {
  const cat = CATEGORIES_RIAD[categorie]
  const isPros = categorie === 'prospection'

  if (isPros) {
    // Marqueur prospection : losange bleu
    return `<div style="
      width: 22px; height: 22px;
      background: ${cat.color};
      border: 2px solid white;
      border-radius: 4px;
      transform: rotate(45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>`
  } else {
    // Marqueur portefeuille : goutte ocre/verte selon statut
    const s = STATUTS[statut as keyof typeof STATUTS]
    const color = s?.c ?? cat.color
    return `<div style="
      background: ${color};
      border: 2px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      width: 24px; height: 24px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`
  }
}

export default function CarteMarrakech({ riads, onSelectRiad }: {
  riads: Riad[]
  onSelectRiad: (r: Riad) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [selected, setSelected] = useState<Riad | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [filterCat, setFilterCat] = useState<'tous' | 'portefeuille' | 'prospection'>('tous')

  const riadsWithGPS = riads.filter(r => r.lat && r.lng)
  const filtered = filterCat === 'tous' ? riadsWithGPS : riadsWithGPS.filter(r => (r.categorie ?? 'portefeuille') === filterCat)

  const countPortefeuille = riadsWithGPS.filter(r => (r.categorie ?? 'portefeuille') === 'portefeuille').length
  const countProspection = riadsWithGPS.filter(r => r.categorie === 'prospection').length

  useEffect(() => {
    if (!document.querySelector('#leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    if ((window as any).L) { initMap(); return }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => { setLoaded(true); initMap() }
    document.head.appendChild(script)
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null } }
  }, [])

  useEffect(() => { if (loaded || (window as any).L) updateMarkers() }, [filtered, loaded])

  function initMap() {
    if (!mapRef.current || mapInstanceRef.current) return
    const L = (window as any).L
    const map = L.map(mapRef.current, { zoomControl: true }).setView([MARRAKECH_CENTER.lat, MARRAKECH_CENTER.lng], 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map)
    mapInstanceRef.current = map
    setLoaded(true)
    updateMarkers()
  }

  function updateMarkers() {
    const L = (window as any).L
    if (!L || !mapInstanceRef.current) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    filtered.forEach(r => {
      if (!r.lat || !r.lng) return
      const cat = r.categorie ?? 'portefeuille'
      const catInfo = CATEGORIES_RIAD[cat]
      const prix = r.prixN ?? r.prixD
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const mapsUrl = isIOS
        ? `maps://maps.apple.com/?q=${encodeURIComponent(r.nom)}&ll=${r.lat},${r.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`

      const icon = L.divIcon({
        className: '',
        html: markerHtml(cat, r.statut),
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -28],
      })

      const popup = `
        <div style="font-family: Georgia, serif; min-width: 190px; padding: 4px 2px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
            <span style="font-size:9px;padding:2px 7px;border-radius:8px;background:${catInfo.bg};color:${catInfo.color};border:1px solid ${catInfo.color}33;font-weight:500;">${catInfo.label}</span>
          </div>
          <div style="font-size:15px;font-style:italic;color:#1A1814;margin-bottom:3px;">${r.nom}</div>
          <div style="font-size:11px;color:#6B6560;margin-bottom:6px;">${r.quartier || ''}${r.adresse ? ' · ' + r.adresse : ''}</div>
          ${prix ? `<div style="font-size:13px;color:${catInfo.color};font-weight:500;margin-bottom:3px;">${fmtM(prix)}</div>` : ''}
          ${r.surface ? `<div style="font-size:11px;color:#6B6560;margin-bottom:8px;">${r.surface} m²${r.chambres ? ' · ' + r.chambres + ' ch.' : ''}</div>` : ''}
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <a href="https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}" target="_blank"
              style="padding:5px 9px;background:#4285F4;color:white;border-radius:5px;font-size:10px;text-decoration:none;font-family:sans-serif;display:inline-flex;align-items:center;gap:3px;">
              🗺 Google
            </a>
            <a href="maps://maps.apple.com/?q=${encodeURIComponent(r.nom)}&ll=${r.lat},${r.lng}" target="_blank"
              style="padding:5px 9px;background:#000;color:white;border-radius:5px;font-size:10px;text-decoration:none;font-family:sans-serif;display:inline-flex;align-items:center;gap:3px;">
              🍎 Plans
            </a>
            <a href="https://waze.com/ul?ll=${r.lat},${r.lng}&navigate=yes" target="_blank"
              style="padding:5px 9px;background:#33CCFF;color:white;border-radius:5px;font-size:10px;text-decoration:none;font-family:sans-serif;display:inline-flex;align-items:center;gap:3px;">
              🚗 Waze
            </a>
          </div>
        </div>
      `

      const marker = L.marker([r.lat, r.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(popup)
        .on('click', () => setSelected(r))

      markersRef.current.push(marker)
    })
  }

  const riadsNoGPS = riads.filter(r => !r.lat || !r.lng)

  return (
    <div>
      {/* Filtres catégorie */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setFilterCat('tous')} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, cursor: 'pointer', background: filterCat === 'tous' ? 'var(--text)' : 'var(--white)', color: filterCat === 'tous' ? 'white' : 'var(--mid)', border: `1px solid ${filterCat === 'tous' ? 'var(--text)' : 'var(--line)'}` }}>
          Tous ({riadsWithGPS.length})
        </button>
        {/* Portefeuille */}
        <button onClick={() => setFilterCat(filterCat === 'portefeuille' ? 'tous' : 'portefeuille')} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, cursor: 'pointer', background: filterCat === 'portefeuille' ? CATEGORIES_RIAD.portefeuille.color : 'var(--white)', color: filterCat === 'portefeuille' ? 'white' : 'var(--mid)', border: `1px solid ${filterCat === 'portefeuille' ? CATEGORIES_RIAD.portefeuille.color : 'var(--line)'}`, display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, background: CATEGORIES_RIAD.portefeuille.color, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', border: '1.5px solid white' }} />
          Portefeuille ({countPortefeuille})
        </button>
        {/* Prospection */}
        <button onClick={() => setFilterCat(filterCat === 'prospection' ? 'tous' : 'prospection')} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, cursor: 'pointer', background: filterCat === 'prospection' ? CATEGORIES_RIAD.prospection.color : 'var(--white)', color: filterCat === 'prospection' ? 'white' : 'var(--mid)', border: `1px solid ${filterCat === 'prospection' ? CATEGORIES_RIAD.prospection.color : 'var(--line)'}`, display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, background: CATEGORIES_RIAD.prospection.color, borderRadius: 2, transform: 'rotate(45deg)', border: '1.5px solid white' }} />
          Prospection ({countProspection})
        </button>
        <div style={{ fontSize: 11, color: 'var(--soft)', marginLeft: 'auto' }}>{filtered.length} bien{filtered.length > 1 ? 's' : ''} sur la carte</div>
      </div>

      {/* Carte */}
      <div ref={mapRef} style={{ height: 480, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', zIndex: 0 }} />

      {/* Légende */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--soft)' }}>
          <div style={{ width: 12, height: 12, background: '#8C5A28', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', border: '1.5px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          Portefeuille — goutte ocre/verte
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--soft)' }}>
          <div style={{ width: 12, height: 12, background: '#185FA5', borderRadius: 2, transform: 'rotate(45deg)', border: '1.5px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          Prospection — losange bleu
        </div>
      </div>

      {/* Info selected */}
      {selected && (
        <div style={{ marginTop: 12, padding: '12px 16px', background: (selected.categorie ?? 'portefeuille') === 'prospection' ? '#E6F1FB' : 'var(--accent-bg)', borderRadius: 10, border: `1px solid ${(selected.categorie ?? 'portefeuille') === 'prospection' ? 'rgba(24,95,165,0.2)' : 'rgba(140,90,40,0.2)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: (selected.categorie ?? 'portefeuille') === 'prospection' ? '#185FA5' : 'var(--accent)', fontWeight: 500, marginBottom: 3 }}>
              {CATEGORIES_RIAD[selected.categorie ?? 'portefeuille'].label}
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontStyle: 'italic' }}>{selected.nom}</div>
            <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 2 }}>{selected.quartier} · {selected.adresse}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnMaps lat={selected.lat} lng={selected.lng} nom={selected.nom} />
            <button onClick={() => onSelectRiad(selected)} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: 'var(--text)', color: 'white', border: 'none' }}>Fiche →</button>
          </div>
        </div>
      )}

      {/* Riads sans GPS */}
      {riadsNoGPS.length > 0 && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--line)' }}>
          <div style={{ fontSize: 11, color: 'var(--soft)', marginBottom: 6 }}>{riadsNoGPS.length} bien{riadsNoGPS.length > 1 ? 's' : ''} sans GPS — cliquez pour ajouter :</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {riadsNoGPS.map(r => (
              <button key={r.id} onClick={() => onSelectRiad(r)} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: 'var(--white)', border: '1px solid var(--line)', cursor: 'pointer', color: 'var(--mid)' }}>
                {r.nom}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useState, useRef } from 'react'

const SUPABASE_URL = 'https://nsogcsmriufjcymlmatz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zb2djc21yaXVmamN5bWxtYXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NjgwMzUsImV4cCI6MjA4OTM0NDAzNX0.mrZwfKxmHv81SXd3Mc2TCaCeGZZVBACL2X-21nfuwEs'
const BUCKET = 'riad-photos'
const MAX_PHOTOS = 10

function photoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

async function uploadPhoto(riadId: number, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${riadId}/${Date.now()}.${ext}`
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': file.type,
      'x-upsert': 'true',
    },
    body: file,
  })
  if (!res.ok) { console.error('Upload failed', await res.text()); return null }
  return path
}

async function deletePhoto(path: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` },
  })
  return res.ok
}

export default function PhotoGallery({ riadId, photos, onPhotosChange }: {
  riadId: number
  photos: string[]
  onPhotosChange: (photos: string[]) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const remaining = MAX_PHOTOS - photos.length
    const toUpload = files.slice(0, remaining)
    setUploading(true)
    const newPaths: string[] = []
    for (const file of toUpload) {
      const path = await uploadPhoto(riadId, file)
      if (path) newPaths.push(path)
    }
    onPhotosChange([...photos, ...newPaths])
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDelete = async (path: string) => {
    setDeleting(path)
    await deletePhoto(path)
    onPhotosChange(photos.filter(p => p !== path))
    setDeleting(null)
    if (lightbox === path) setLightbox(null)
  }

  const mainPhoto = photos[0]
  const thumbnails = photos.slice(1)

  return (
    <div>
      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
        >
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'white', fontSize: 28, cursor: 'pointer', lineHeight: 1 }}>✕</button>
          {/* Navigation */}
          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); const i = photos.indexOf(lightbox); setLightbox(photos[(i - 1 + photos.length) % photos.length]) }}
                style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer', padding: '12px 16px', borderRadius: 8 }}>‹</button>
              <button onClick={e => { e.stopPropagation(); const i = photos.indexOf(lightbox); setLightbox(photos[(i + 1) % photos.length]) }}
                style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer', padding: '12px 16px', borderRadius: 8 }}>›</button>
            </>
          )}
          <img src={photoUrl(lightbox)} alt="" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 4 }} />
          <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
            {photos.indexOf(lightbox) + 1} / {photos.length}
          </div>
        </div>
      )}

      {/* Photo principale */}
      {mainPhoto && (
        <div style={{ position: 'relative', marginBottom: 10, borderRadius: 10, overflow: 'hidden', cursor: 'zoom-in', aspectRatio: '16/9' }}
          onClick={() => setLightbox(mainPhoto)}>
          <img src={photoUrl(mainPhoto)} alt="Photo principale"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3))', pointerEvents: 'none' }} />
          <button onClick={e => { e.stopPropagation(); handleDelete(mainPhoto) }}
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {deleting === mainPhoto ? '…' : '✕'}
          </button>
          <div style={{ position: 'absolute', bottom: 8, left: 10, color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
            🔍 {photos.length} photo{photos.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Grille miniatures */}
      {thumbnails.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
          {thumbnails.map(path => (
            <div key={path} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', cursor: 'zoom-in', aspectRatio: '4/3' }}
              onClick={() => setLightbox(path)}>
              <img src={photoUrl(path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={e => { e.stopPropagation(); handleDelete(path) }}
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {deleting === path ? '…' : '✕'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bouton upload */}
      {photos.length < MAX_PHOTOS && (
        <div>
          <input ref={inputRef} type="file" accept="image/*" multiple capture="environment"
            onChange={handleUpload} style={{ display: 'none' }} id={`photo-upload-${riadId}`} />
          <label htmlFor={`photo-upload-${riadId}`} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px', borderRadius: 8, cursor: uploading ? 'wait' : 'pointer',
            border: '2px dashed var(--line)', color: 'var(--soft)', fontSize: 12,
            background: 'var(--bg)', transition: 'all 0.15s',
          }}>
            {uploading ? '⏳ Upload en cours…' : `📷 Ajouter des photos (${photos.length}/${MAX_PHOTOS})`}
          </label>
        </div>
      )}

      {photos.length === 0 && !uploading && (
        <div style={{ fontSize: 11, color: 'var(--soft)', fontStyle: 'italic', marginTop: 4 }}>
          Prenez des photos directement depuis votre iPhone en terrain
        </div>
      )}
    </div>
  )
}

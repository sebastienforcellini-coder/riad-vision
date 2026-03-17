import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL manquante' }, { status: 400 })

    let html: string
    try {
      const pageRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(8000),
      })
      if (!pageRes.ok) {
        return NextResponse.json({
          error: pageRes.status === 403
            ? 'Ce site bloque les imports automatiques — saisissez les données manuellement'
            : 'Impossible de charger cette page'
        }, { status: 400 })
      }
      html = await pageRes.text()
    } catch {
      return NextResponse.json({ error: 'Site inaccessible ou délai dépassé' }, { status: 400 })
    }

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 8000)

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: `Extrait les informations de cette annonce immobilière à Marrakech. Retourne UNIQUEMENT un JSON valide, sans markdown ni explication.

Texte :
${text}

JSON (null si absent) :
{
  "nom": "titre annonce",
  "typeBien": "riad"|"douirya"|"maison_hotes"|"villa"|"appartement"|"autre",
  "reference": "ref agence",
  "agenceSource": "nom agence",
  "adresse": "adresse/derb",
  "quartier": "Mouassine"|"Kasbah"|"Dar El Bacha"|"Riad Zitoun"|"Ksour"|"Bab Doukkala"|"Mellah"|"Centre médina"|"Autre",
  "proximite": "ex: 5 min Jemaa el-Fna, tombeaux Saadiens",
  "vue": "ex: vue Palais Royal, jardins",
  "surface": number|null,
  "niveaux": number|null,
  "chambres": number|null,
  "sdb": number|null,
  "terrasse": number|null,
  "prixD": number|null,
  "etat": "bon"|"moyen"|"mauvais"|"ruine"|null,
  "titre": true|false,
  "meuble": true|false,
  "enActivite": true|false,
  "piscine": true|false,
  "bassin": true|false,
  "clim": true|false,
  "potentiel": "résumé potentiel",
  "notes": "résumé description et points clés"
}`
        }]
      })
    })

    const claudeData = await claudeRes.json()
    const rawText = claudeData.content?.[0]?.text || '{}'
    let extracted
    try {
      extracted = JSON.parse(rawText)
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/)
      extracted = match ? JSON.parse(match[0]) : {}
    }

    return NextResponse.json({ ok: true, data: extracted })
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'import" }, { status: 500 })
  }
}

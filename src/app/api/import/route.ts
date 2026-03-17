import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL manquante' }, { status: 400 })

    const pageRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RiadVision/1.0)' },
    })
    if (!pageRes.ok) return NextResponse.json({ error: 'Impossible de charger la page' }, { status: 400 })

    const html = await pageRes.text()
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
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Extrait les informations de cette annonce immobilière de riad à Marrakech et retourne UNIQUEMENT un JSON valide sans markdown ni explication.

Texte de l'annonce :
${text}

JSON attendu (null si absent) :
{
  "nom": "titre de l'annonce",
  "adresse": "adresse ou derb",
  "quartier": "Mouassine | Kasbah | Dar El Bacha | Riad Zitoun | Ksour | Bab Doukkala | Mellah | Autre",
  "surface": number|null,
  "niveaux": number|null,
  "chambres": number|null,
  "sdb": number|null,
  "terrasse": number|null,
  "prixD": number|null,
  "etat": "bon"|"moyen"|"mauvais"|"ruine"|null,
  "reference": "ref annonce"|null,
  "titre": true|false,
  "meuble": true|false,
  "enActivite": true|false,
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

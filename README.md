# Riad Vision

Application de gestion et d'estimation travaux de riads à Marrakech.

## Stack

- **Next.js 14** (App Router + TypeScript)
- **Vercel** (déploiement)
- **localStorage** (persistance bêta)
- **Middleware Next.js** (auth par mot de passe)

## Démarrage local

```bash
npm install
cp .env.example .env.local
# Modifier BETA_PASSWORD dans .env.local
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Déploiement Vercel

1. Importer le repo sur [vercel.com](https://vercel.com)
2. Ajouter la variable d'environnement :
   - `BETA_PASSWORD` → votre mot de passe choisi
3. Déployer

## Structure

```
src/
├── app/
│   ├── api/auth/route.ts   # API route authentification
│   ├── login/page.tsx      # Page de connexion
│   ├── page.tsx            # App principale
│   ├── layout.tsx          # Layout root + fonts
│   └── globals.css         # Design tokens CSS
├── components/
│   ├── Sidebar.tsx         # Navigation latérale
│   ├── Dashboard.tsx       # Tableau de bord
│   ├── views.tsx           # RiadsList, RiadFiche, Estimateur, Resultats
│   └── ui.tsx              # Composants UI partagés
├── lib/
│   ├── constants.ts        # Niveaux, zones, tarifs, formattage
│   └── useAppState.ts      # State global + persistance localStorage
├── middleware.ts            # Protection par mot de passe
└── types/index.ts           # Types TypeScript
```

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `BETA_PASSWORD` | Mot de passe accès bêta | `riad2025` |

## Roadmap bêta

- [ ] Génération PDF devis estimatif
- [ ] Base de données (Planetscale / Supabase)
- [ ] Authentification multi-utilisateurs
- [ ] Simulation rentabilité location courte durée
- [ ] Export fiche riad (PDF commercial)
- [ ] Comparateur de scénarios travaux

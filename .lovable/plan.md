
# Systeme de Pieces (Coins) pour Resoly

## Concept
Remplacer le systeme actuel de "valeur recompense en euros" par un systeme de **pieces (coins)** calcule selon la formule mathematique fournie. Les coins deviennent la monnaie interne de l'app, utilises pour debloquer les recompenses.

## Formule
```text
Coins = I x C(I) x (0.3 + 0.6 * M^1.5) x (S / 3)^1.1
```

Ou :
- **I** = mise investie (euros)
- **M** = nombre de mois (1 a 3)
- **S** = seances par semaine
- **C(I)** = coefficient strategique par palier :
  - 0 <= I <= 50 : 1 + 0.004 * I
  - 50 < I <= 75 : 1.2 + 0.012 * (I - 50)
  - 75 < I <= 100 : 1.5 + 0.02 * (I - 75)
  - 100 < I <= 300 : 2 - 0.0045 * (I - 100)
  - 300 < I <= 1000 : 1.1 - 0.000785 * (I - 300)
  - I > 1000 : max(0, 0.55 - 0.00055 * (I - 1000))

## Changements prevus

### 1. Nouveau fichier utilitaire : `src/lib/coins.ts`
- Fonction `calculateCoefficientMise(I)` implementant C(I)
- Fonction `calculateCoins(I, M, S)` implementant la formule complete
- Export des deux fonctions pour reutilisation

### 2. Modification de `ChallengeSetup.tsx`
- Remplacer le calcul `rewardValue = bet * odds` par `calculateCoins(bet, months, sessionsPerWeek)`
- Afficher les **coins** gagnes au lieu des euros dans le resume
- Remplacer la section "cote" par l'affichage des coins avec une icone de piece
- Conserver le systeme de difficulte existant (facile/moyen/difficile/extreme) base sur les odds actuels
- Sauvegarder les coins calcules dans la base de donnees (nouveau champ)

### 3. Migration base de donnees
- Ajouter une colonne `coins_reward INTEGER DEFAULT 0` a la table `challenges`

### 4. Modification de `Dashboard.tsx`
- Afficher les coins au lieu de la "valeur recompense" en euros dans la carte stats
- Recalculer ou lire les coins depuis la base de donnees

### 5. Modification de `Rewards.tsx`
- Convertir les paliers de recompenses de valeurs en euros vers des valeurs en coins
- Adapter la barre de progression pour utiliser les coins
- Les paliers seront recalibres (par exemple : 50, 100, 200, 400, 800, 1500 coins au lieu de 30, 50, 80, 120, 200, 350 euros)

### 6. Modification de `Profile.tsx`
- Ajouter l'affichage du total de coins accumules dans les statistiques

## Details techniques

La formule C(I) est une fonction par morceaux qui favorise les mises moyennes (le coefficient monte jusqu'a I=100 puis redescend), ce qui encourage un investissement modere plutot qu'excessif.

Le facteur `(0.3 + 0.6 * M^1.5)` recompense fortement la duree d'engagement (croissance exponentielle).

Le facteur `(S/3)^1.1` normalise autour de 3 seances/semaine, avec un bonus leger au-dessus.

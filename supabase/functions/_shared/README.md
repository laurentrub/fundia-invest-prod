# Rate Limiting pour Edge Functions

Ce dossier contient des utilitaires partagés pour les Edge Functions Supabase.

## Rate Limiter

Le module `rateLimiter.ts` fournit un système de limitation de débit simple mais efficace pour protéger vos Edge Functions contre les abus.

### Utilisation

1. **Importer le module dans votre Edge Function :**

```typescript
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIdentifier,
  getRateLimitHeaders
} from "../_shared/rateLimiter.ts";
```

2. **Ajouter la vérification de rate limit :**

```typescript
// Obtenir l'identifiant du client (email ou IP)
const clientId = getClientIdentifier(req, userEmail);

// Vérifier le rate limit (10 requêtes par minute par défaut)
const rateLimitResult = checkRateLimit(clientId, {
  maxRequests: 10,  // Nombre maximum de requêtes
  windowMs: 60000   // Fenêtre de temps en ms (1 minute)
});

// Si limite dépassée, retourner une erreur 429
if (!rateLimitResult.allowed) {
  return createRateLimitResponse(rateLimitResult, corsHeaders);
}
```

3. **Ajouter les headers de rate limit à la réponse :**

```typescript
return new Response(
  JSON.stringify({ success: true }),
  {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...getRateLimitHeaders(rateLimitResult)  // Ajoute X-RateLimit-* headers
    }
  }
);
```

### Configuration recommandée par fonction

- **send-custom-email**: 10 requêtes/minute
- **send-document-request**: 20 requêtes/minute
- **send-status-notification**: 30 requêtes/minute
- **send-welcome-email**: 5 requêtes/minute (utilisateurs nouveaux)
- **send-contract**: 10 requêtes/minute

### Headers retournés

- `X-RateLimit-Limit`: Limite maximale de requêtes
- `X-RateLimit-Remaining`: Nombre de requêtes restantes
- `X-RateLimit-Reset`: Date de réinitialisation du compteur
- `Retry-After`: (si limite dépassée) Nombre de secondes avant de réessayer

### Note importante

Ce rate limiter utilise une mémoire in-memory qui sera réinitialisée lors des "cold starts" des Edge Functions. Pour une solution production à grande échelle, considérez :

- Upstash Redis (recommandé pour Supabase Edge Functions)
- Supabase Database avec des tables de rate limiting
- Services externes comme Cloudflare Rate Limiting

## Exemple complet

Voir `send-custom-email/index.ts` pour un exemple d'implémentation complète.

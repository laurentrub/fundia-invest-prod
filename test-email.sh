#!/bin/bash

# Script de test pour l'API d'envoi d'email
# Usage: ./test-email.sh [email] [nom]

EMAIL="${1:-test@example.com}"
FIRSTNAME="${2:-John}"

echo "📧 Test d'envoi d'email via l'API Fundia Invest"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Destinataire: $EMAIL"
echo "Prénom: $FIRSTNAME"
echo ""

# Choix de l'environnement
echo "Choisissez l'environnement :"
echo "1) Production (https://fundia-invest.com/api/send)"
echo "2) URL personnalisée"
read -p "Votre choix [1]: " CHOICE
CHOICE=${CHOICE:-1}

if [ "$CHOICE" = "1" ]; then
    API_URL="https://fundia-invest.com/api/send"
else
    read -p "Entrez l'URL de l'API : " API_URL
fi

echo ""
echo "🚀 Envoi de la requête à : $API_URL"
echo ""

# Envoi de la requête
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"to\": \"$EMAIL\",
    \"firstName\": \"$FIRSTNAME\"
  }" \
  -w "\n\n📊 Status HTTP: %{http_code}\n" \
  -v

echo ""
echo "✅ Test terminé !"

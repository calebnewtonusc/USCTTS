#!/usr/bin/env bash
# Google Workspace DNS for usctts.com, written through the GoDaddy API.
#
#   scripts/email-dns.sh status              show every mail-related record
#   scripts/email-dns.sh verify <token>      add google-site-verification TXT
#   scripts/email-dns.sh dkim "<v=DKIM1...>" publish google._domainkey
#   scripts/email-dns.sh dmarc <report-addr> loosen DMARC to p=none
#
# Credentials come from ~/.config/godaddy/credentials (GODADDY_API_KEY,
# GODADDY_API_SECRET). The order is fixed, see docs/EMAIL.md.
set -euo pipefail

DOMAIN=usctts.com
API="https://api.godaddy.com/v1/domains/$DOMAIN/records"

# shellcheck disable=SC1090
set -a; . "$HOME/.config/godaddy/credentials"; set +a
AUTH="Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET"

# PUT on type+name replaces the whole record set, so every write here is
# idempotent: rerunning with a new value overwrites instead of stacking.
put() {
  local type=$1 name=$2 data=$3
  local body
  body=$(python3 -c 'import json,sys; print(json.dumps([{"data": sys.argv[1], "ttl": 3600}]))' "$data")
  curl -sf -X PUT -H "$AUTH" -H "Content-Type: application/json" \
    "$API/$type/$name" -d "$body" >/dev/null
  echo "set $type $name"
}

case "${1:-status}" in
  status)
    for q in "MX $DOMAIN" "TXT $DOMAIN" "TXT google._domainkey.$DOMAIN" "TXT _dmarc.$DOMAIN"; do
      set -- $q
      printf '%-4s %-28s %s\n' "$1" "$2" "$(dig +short "$1" "$2" @ns51.domaincontrol.com | tr '\n' ' ')"
    done
    ;;
  verify)
    # The apex TXT set also holds SPF, and PUT replaces the set, so keep it.
    token=${2:?usage: verify <google-site-verification=...>}
    body=$(python3 -c 'import json,sys; print(json.dumps([{"data": "v=spf1 include:_spf.google.com ~all", "ttl": 3600}, {"data": sys.argv[1], "ttl": 3600}]))' "$token")
    curl -sf -X PUT -H "$AUTH" -H "Content-Type: application/json" "$API/TXT/@" -d "$body" >/dev/null
    echo "set TXT @ (SPF + verification)"
    ;;
  dkim)
    put TXT google._domainkey "${2:?usage: dkim \"v=DKIM1; k=rsa; p=...\"}"
    ;;
  dmarc)
    addr=${2:?usage: dmarc <address that someone actually reads>}
    put TXT _dmarc "v=DMARC1; p=none; rua=mailto:$addr"
    ;;
  *)
    sed -n '2,9p' "$0"; exit 1
    ;;
esac

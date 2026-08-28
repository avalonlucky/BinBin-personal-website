#!/usr/bin/env bash
set -euo pipefail

# Publish one committed revision to Cloudflare Pages without ever placing the
# Cloudflare API token in the repository or in a plaintext .env file.
# Usage: ./scripts/deploy-pages.sh [git-ref]

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
deploy_ref="${1:-HEAD}"
keychain_service="chaoshanai-cloudflare-pages"
keychain_account="$(id -un)"
raw_film_path="assets/work/culture-wall/showroom-film.mp4"

commit_hash="$(git -C "$project_root" rev-parse --verify "${deploy_ref}^{commit}")"
commit_message="$(git -C "$project_root" log -1 --format=%s "$commit_hash")"
cloudflare_token="$(security find-generic-password -a "$keychain_account" -s "$keychain_service" -w 2>/dev/null || true)"

if [ -z "$cloudflare_token" ]; then
  echo "Cloudflare API token is not available in the macOS Keychain." >&2
  echo "Add it under service: $keychain_service, account: $keychain_account." >&2
  exit 1
fi

deploy_dir="$(mktemp -d /tmp/binbin-pages-release.XXXXXX)"
cleanup() {
  rm -rf -- "$deploy_dir"
}
trap cleanup EXIT

# Cloudflare Pages has a 25 MiB single-file limit. The case-study player uses
# the three committed byte-identical parts, so the local archival source file
# must never be included in the upload bundle.
git -C "$project_root" archive "$commit_hash" -- . ":(exclude)$raw_film_path" | tar -x -C "$deploy_dir"

(
  cd "$deploy_dir"
  env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy \
    CLOUDFLARE_API_TOKEN="$cloudflare_token" \
    npx wrangler pages deploy "$deploy_dir" \
      --project-name binbin-personal-website \
      --branch main \
      --commit-hash "$commit_hash" \
      --commit-message "$commit_message"
)

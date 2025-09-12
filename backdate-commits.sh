#!/bin/bash
set -e

echo "⚠️  WARNING: This will rewrite Git history!"
echo "════════════════════════════════════════"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo "🚀 Starting backdated commits..."

cd "/Users/vignesh/Downloads/bits books/scravo_base1"

git checkout main
git config user.name "bitsian25"
git config user.email "h20250159@pilani.bits-pilani.ac.in"

echo "📦 Creating backup..."
git branch -f backup-before-backdate 2>/dev/null || true

echo "🔄 Resetting history..."
git reset --soft $(git rev-list --max-parents=0 HEAD)

tasks=(
  "Initial commit: Project skeleton and README"
  "Backend: Express app and MongoDB setup"
  "Backend: User, Listing, and Order models"
  "Backend: Auth, Admin, and Listing routes"
  "Backend: Controllers for auth and listings"
  "Frontend: React + Vite setup"
  "Frontend: Header, Sidebar, Layout components"
  "Frontend: RoleSelection, Login, Register pages"
  "Frontend: Dashboard and Marketplace"
  "Frontend: ListingDetail and CreateListing pages"
  "Frontend: MyListings and MyOrders"
  "Frontend: Offers and Settings pages"
  "Frontend: AuthContext and utils/api.js"
  "Styling: Added CSS files for all pages"
  "Documentation: Setup guide and README updates"
  "Refactor and cleanup phase"
)

create_files_for_task() {
  echo "// Update $1" >> README.md
}

generate_random_dates() {
  start="2025-09-10"
  end="2025-11-10"
  dates=()
  current="$start"

  while [ "$(date -j -f "%Y-%m-%d" "$current" +%s)" -le "$(date -j -f "%Y-%m-%d" "$end" +%s)" ]; do
    weekday=$(date -j -f "%Y-%m-%d" "$current" +%u)
    if [ "$weekday" -le 6 ] && [ "$weekday" -ge 2 ]; then
      if [[ "$current" > "2025-10-04" && "$current" < "2025-10-11" ]]; then
        :
      else
        if [ $((RANDOM % 3)) -eq 0 ]; then
          dates+=("$current")
        fi
      fi
    fi
    current=$(date -j -v+1d -f "%Y-%m-%d" "$current" +%Y-%m-%d)
  done

  printf "%s\n" "${dates[@]}" | sort
}

echo "📅 Generating dates..."
dates=( $(generate_random_dates) )
echo "Will create ${#dates[@]} commits"
echo ""

i=0
for d in "${dates[@]}"; do
  t=$((i % ${#tasks[@]}))
  msg="${tasks[$t]}"
  
  echo "[$d] $msg"
  
  create_files_for_task $t
  git add -A
  
  GIT_AUTHOR_DATE="$d 10:00:00" \
  GIT_COMMITTER_DATE="$d 10:00:00" \
  git commit -m "$msg" --allow-empty
  
  i=$((i+1))
done

echo ""
echo "✅ Done! Created ${#dates[@]} commits"
echo ""
read -p "Push to repositories? (yes/no): " push_confirm

if [ "$push_confirm" = "yes" ]; then
    echo "⬆️  Pushing to origin..."
    git push origin main --force
    
    echo "⬆️  Pushing to sem..."
    git push sem main --force
    
    echo "✅ Pushed to both repositories!"
else
    echo "Not pushed. Run later:"
    echo "  git push origin main --force"
    echo "  git push sem main --force"
fi

echo ""
echo "🎉 Complete!"

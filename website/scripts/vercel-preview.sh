#!/bin/sh
# Vercel's Ignored Build Step (`ignoreCommand` in vercel.json), for the previews: Vercel builds nothing from Git for
# main, whose deploys come from .github/workflows/website.yml. Exit 0 skips the build and 1 builds it: a branch gets
# a preview only when it changes the website or vercel.json, compared with main. When that can't be told, it builds.
repo="https://github.com/${VERCEL_GIT_REPO_OWNER:-diecodev}/${VERCEL_GIT_REPO_SLUG:-qwik-date}.git"
git fetch --quiet --depth=50 "$repo" main || exit 1
base=$(git merge-base HEAD FETCH_HEAD) || exit 1
git diff --quiet "$base" HEAD -- website vercel.json && exit 0
exit 1

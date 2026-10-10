#!/bin/sh
# Renders the three logo variants one after another (one Blender at a time).
cd "$(dirname "$0")/.." || exit 1
for v in arch glyph stack; do
  nice -n 19 /Applications/Nalana.app/Contents/MacOS/Nalana -b --factory-startup -P blender/logo.py -- "$v" "$PWD/blender/logo-out/$v.png" || exit 1
done

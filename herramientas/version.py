#!/usr/bin/env python3
"""Pone una versión nueva en todas las referencias a estilos, scripts e imágenes (?v=...).

Correlo antes de cada commit que cambie la tarjeta o el emisor:
    python3 herramientas/version.py
Así el navegador baja los archivos nuevos en vez de usar los que tenía guardados.
"""
import pathlib, re, time

ROOT = pathlib.Path(__file__).resolve().parent.parent
FILES = ["index.html", "emitir.html", "herramientas/og.html", "assets/comodin.css", "assets/comodin.js"]
version = time.strftime("%Y%m%d%H%M%S")
for name in FILES:
    path = ROOT / name
    text = path.read_text(encoding="utf-8")
    new = re.sub(r"\?v=[0-9A-Za-z]+", "?v=" + version, text)
    path.write_text(new, encoding="utf-8")
print("Versión", version)

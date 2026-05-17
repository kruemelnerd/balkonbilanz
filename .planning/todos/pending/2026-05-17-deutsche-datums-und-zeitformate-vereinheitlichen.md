---
created: 2026-05-17T17:26:06.100Z
title: Deutsche Datums- und Zeitformate vereinheitlichen
area: general
files: []
---

## Problem

Die App soll Datumseintraege und Datumsanzeigen konsistent im deutschen Format darstellen. Aktuell ist nicht abgesichert, dass ueberall dasselbe Format verwendet wird, insbesondere fuer Datumsfelder und angezeigte Datumseintraege. Dadurch koennen gemischte Darstellungen wie ISO-Formate, uneinheitliche Tages-/Monatsreihenfolge oder abweichende Uhrzeitformate entstehen.

Ziel ist, dass Datumswerte ueberall ordentlich formatiert und immer im gleichen Format `dd.MM.yyyy` erscheinen. Uhrzeiten sollen durchgaengig im 24-Stunden-Format angezeigt werden.

## Solution

Bestehende Formatierungs- und Anzeigewege fuer Datum und Uhrzeit im UI pruefen und vereinheitlichen. Falls noetig, zentrale Helfer fuer Parsing und Ausgabe verwenden oder einfuehren, damit Formulare, Listen, Detailansichten und sonstige Datumsausgaben konsequent `dd.MM.yyyy` sowie 24h-Uhrzeiten nutzen.

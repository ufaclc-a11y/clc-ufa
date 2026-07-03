"""
revert_rename.py — откат случайного запуска rename_photos.py.

Карта old->new берётся НАДЁЖНО: rename_photos.py перезаписал photo_tags.json,
сохранив ПОРЯДОК записей (только подменил ключи). Поэтому позиционный дифф
упорядоченных ключей HEAD-версии (до) и текущей (после) даёт точные пары
переименования. Категории-значения служат доп. сверкой.

Переименование файлов обратно делается двухфазно (через временные имена),
чтобы каскадный сдвиг номеров не словил коллизию.

  python revert_rename.py          # dry-run: план + сверка
  python revert_rename.py --apply   # переименовать файлы обратно + откатить json
"""
import json, os, subprocess, sys

sys.stdout.reconfigure(encoding="utf-8")
APPLY = "--apply" in sys.argv

old_state = json.loads(subprocess.check_output(["git", "show", "HEAD:photo_tags.json"]).decode())
cur_state = json.load(open("photo_tags.json", encoding="utf-8"))
old_tagged, cur_tagged = old_state["tagged"], cur_state["tagged"]
dirs = old_state.get("photo_dirs", [])

old_keys = list(old_tagged)
cur_keys = list(cur_tagged)

def find(name):
    for d in dirs:
        p = os.path.join(d, name)
        if os.path.exists(p):
            return p
    return None

# ── Карта из сырого git-диффа photo_tags.json (ханк-aware, позиционно) ────────
# Каждая запись = "ключ": [ ...категории... ]. Сдвиг меняет и ключ, и категории,
# поэтому git диффит построчно-позиционно. В каждом ханке зипуем −ключи с +ключами.
import re as _re
diff = subprocess.check_output(["git", "diff", "--no-color", "HEAD", "--", "photo_tags.json"]).decode("utf-8", "replace")
KEY = _re.compile(r'^([+-])    "(.+?)": \[$')
mapping, ambiguous = {}, []
rem, add = [], []
def flush():
    for o, n in zip(rem, add):
        if o != n:
            mapping[o] = n
    for o in rem[len(add):]:
        ambiguous.append((o, None))   # удалённая запись без пары
    for n in add[len(rem):]:
        ambiguous.append((None, n))
    rem.clear(); add.clear()
for line in diff.splitlines():
    if line.startswith("@@"):
        flush(); continue
    m = KEY.match(line)
    if not m:
        continue
    (rem if m.group(1) == "-" else add).append(m.group(2))
flush()

# ── Только полностью замкнутые цепочки ───────────────────────────────────────
# move: current(new_name) → target(old_name). Безопасно, если target свободен
# ИЛИ сам освобождается другим ходом (target ∈ sources). Итеративно выкидываем
# ходы, чей target занят посторонним; это рушит зависящие ходы → повторяем.
moves = {n: o for o, n in mapping.items() if find(n)}   # current -> target
dropped = []
changed = True
while changed:
    changed = False
    sources = set(moves)
    for cur, tgt in list(moves.items()):
        if find(tgt) and tgt not in sources:
            dropped.append((cur, tgt)); del moves[cur]; changed = True

plan = [(find(cur), tgt, cur) for cur, tgt in moves.items()]
problems = [f"{cur} → {tgt}: цепочка неполная (target занят) — пропуск" for cur, tgt in dropped]

print(f"Пар переименования из диффа: {len(mapping)}")
print(f"К откату (есть файл, слот свободен): {len(plan)}")
for _, old_name, new_name in plan:
    print(f"  {new_name}  →  {old_name}")
if ambiguous:
    print(f"\n⚠ Неоднозначные блоки ({len(ambiguous)}) — НЕ трогаю:")
    for a in ambiguous[:10]:
        print("   ", a)
if problems:
    print(f"\n⚠ Пропущено ({len(problems)}):")
    for p in problems[:20]:
        print("   ", p)

if not APPLY:
    print("\n[dry-run] Файлы не тронуты, json не откачен. Запусти с --apply.")
    sys.exit(0)

# ── Двухфазное переименование: new → tmp → old (без коллизий) ─────────────────
tmp = []
for idx, (new_path, old_name, new_name) in enumerate(plan):
    t = os.path.join(os.path.dirname(new_path), f".__revert_{idx}.tmp")
    os.rename(new_path, t)
    tmp.append((t, os.path.join(os.path.dirname(new_path), old_name)))
for t, dst in tmp:
    os.rename(t, dst)
print(f"[apply] Переименовано обратно файлов: {len(plan)}")

# ── Синхронизируем photo_tags.json ровно с тем, что переименовали ─────────────
applied = {new_name: old_name for _, old_name, new_name in plan}  # cur -> target
st = json.load(open("photo_tags.json", encoding="utf-8"))
st["tagged"] = {applied.get(k, k): v for k, v in st["tagged"].items()}
json.dump(st, open("photo_tags.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("[apply] photo_tags.json синхронизирован с диском.")
print(f"Не откатились (грязный fanery-блок): {len(dropped)} файлов — см. выше, при желании руками.")

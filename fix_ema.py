import json

with open("notebooks/train_colab_v2.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

# Fix 1: Lower EMA decay from 0.9999 to 0.999 in CONFIG (Cell 1)
# Fix 2: Lower EMA decay in Cell 7 instantiation
# Fix 3: In Cell 11, only use EMA for validation after epoch 10

for cell in nb["cells"]:
    if cell["cell_type"] != "code":
        continue
    src = "".join(cell["source"])

    # Fix CONFIG ema_decay
    if "'ema_decay': 0.9999" in src:
        cell["source"] = [line.replace("'ema_decay': 0.9999", "'ema_decay': 0.999") for line in cell["source"]]

    # Fix EMA instantiation display
    if "ema = EMA(model, CONFIG['ema_decay'])" in src:
        cell["source"] = [line.replace("'ema_decay': 0.9999", "'ema_decay': 0.999") for line in cell["source"]]

    # Fix Cell 11 validation block
    if "# ── Validate with EMA ──" in src:
        new_source = []
        skip_lines = 0
        for line in cell["source"]:
            if skip_lines > 0:
                skip_lines -= 1
                continue
            if "# ── Validate with EMA ──" in line:
                new_source.append("    # ── Validate (EMA only after epoch 10) ──\\n")
                new_source.append("    use_ema_val = (epoch >= 10)\\n")
                new_source.append("    if use_ema_val:\\n")
                new_source.append("        ema.apply_shadow(model)\\n")
                new_source.append("    val_iou, val_dice, val_mae = validate(model, val_loader, criterion, device)\\n")
                new_source.append("    if use_ema_val:\\n")
                new_source.append("        ema.restore(model)\\n")
                skip_lines = 3  # skip old 3 lines
                continue
            new_source.append(line)
        cell["source"] = new_source

with open("notebooks/train_colab_v2.ipynb", "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=2)

print("Fixed EMA decay + validation gating")

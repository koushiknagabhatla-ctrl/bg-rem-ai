import json

with open("notebooks/train_colab_v2.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    if cell["cell_type"] != "code":
        continue
    src = "".join(cell["source"])
    if "Validate (EMA only after epoch 10)" in src:
        new_source = []
        i = 0
        lines = cell["source"]
        while i < len(lines):
            line = lines[i]
            if "Validate (EMA only after epoch 10)" in line:
                # Replace the broken 7 lines with correct ones
                new_source.append("    # \u2500\u2500 Validate (EMA only after epoch 10) \u2500\u2500\n")
                new_source.append("    use_ema_val = (epoch >= 10)\n")
                new_source.append("    if use_ema_val:\n")
                new_source.append("        ema.apply_shadow(model)\n")
                new_source.append("    val_iou, val_dice, val_mae = validate(model, val_loader, criterion, device)\n")
                new_source.append("    if use_ema_val:\n")
                new_source.append("        ema.restore(model)\n")
                # Skip the broken lines (count how many to skip)
                i += 1
                while i < len(lines):
                    if "Schedule" in lines[i] or "# \u2500\u2500 Schedule" in lines[i]:
                        break
                    i += 1
                continue
            else:
                new_source.append(line)
                i += 1
        cell["source"] = new_source
        print(f"Fixed Cell 11 EMA validation block ({len(new_source)} lines)")
        break

with open("notebooks/train_colab_v2.ipynb", "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=2)

print("Done")

import json, os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

nb_path = r"c:\Users\koush\OneDrive\Desktop\bg rem ai\notebooks\train_kaggle.ipynb"
nb = json.load(open(nb_path, encoding="utf-8"))

code_cells = [c for c in nb["cells"] if c["cell_type"] == "code"]
md_cells = [c for c in nb["cells"] if c["cell_type"] == "markdown"]
print(f"Total cells: {len(nb['cells'])} ({len(code_cells)} code, {len(md_cells)} markdown)")

# Get all code text
code_text = ""
for cell in code_cells:
    code_text += "".join(cell["source"])

full_text = "".join("".join(c["source"]) for c in nb["cells"])

print("\n=== BANNED PATTERN CHECKS ===")
v = 0

# A: total_mem (not total_memory)
if re.search(r'total_mem(?!ory)', code_text):
    print("  FAIL A: total_mem"); v+=1
else:
    print("  PASS A: total_memory")

# B: autocast with args
if "autocast(device_type" in code_text:
    print("  FAIL B: autocast(device_type)"); v+=1
else:
    print("  PASS B: autocast()")

# C1: bare BCE
if re.search(r'F\.binary_cross_entropy\([^_]', code_text):
    print("  FAIL C1: bare BCE"); v+=1
else:
    print("  PASS C1: with_logits only")

# C2: nn.BCELoss
if "nn.BCELoss()" in code_text:
    print("  FAIL C2: nn.BCELoss"); v+=1
else:
    print("  PASS C2: no nn.BCELoss")

# C3: nn.Sigmoid
if "nn.Sigmoid()" in code_text:
    print("  FAIL C3: nn.Sigmoid()"); v+=1
else:
    print("  PASS C3: no nn.Sigmoid()")

# D1: num_workers
if re.search(r'num_workers=[1-9]', code_text):
    print("  FAIL D1: num_workers>0"); v+=1
else:
    print("  PASS D1: num_workers=0")

# D2: pin_memory
if "pin_memory=True" in code_text:
    print("  FAIL D2: pin_memory=True"); v+=1
else:
    print("  PASS D2: pin_memory=False")

# D3: persistent_workers
if "persistent_workers" in code_text:
    print("  FAIL D3: persistent_workers"); v+=1
else:
    print("  PASS D3: no persistent_workers")

# D4: prefetch_factor
if "prefetch_factor" in code_text:
    print("  FAIL D4: prefetch_factor"); v+=1
else:
    print("  PASS D4: no prefetch_factor")

# E1: batch > 4
if "batch_size=8" in code_text:
    print("  FAIL E1: batch_size=8"); v+=1
else:
    print("  PASS E1: batch<=4")

# E2: INPUT_SIZE
if "INPUT_SIZE = 320" in code_text and "INPUT_SIZE = 256" in code_text:
    print("  FAIL E2: Hardcoded constant size"); v+=1
else:
    print("  PASS E2: Progressive sizing logic enabled")

print(f"\n=== REQUIRED PATTERNS ===")
m = 0
reqs = [
    ("total_memory", "A"),
    ("autocast()", "B1"),
    ("GradScaler()", "B2"),
    ("binary_cross_entropy_with_logits", "C"),
    ("num_workers=0", "D"),
    ("pin_memory=False", "D"),
    ("INPUT_SIZE = 256", "E"),
    ("BATCH_SIZE", "E"),
    ("ACCUM_STEPS = 8", "E"),
    ("torch.cuda.empty_cache()", "E"),
    ("torch.isnan(loss)", "I"),
    ("get_pred", "G"),
    ("deep_supervision_loss", "G"),
    ("ExportWrapper", "H"),
    ("best_model.pth", "F"),
    ("PATIENCE", "F"),
    ("[:-2]", "F"),
    ("scheduler_state", "F"),
    ("torch.sigmoid(", "C"),
    ("dynamic_axes", "H"),
]

for pat, err in reqs:
    if pat in full_text:
        print(f"  PASS {err}: '{pat}'")
    else:
        print(f"  FAIL {err}: '{pat}' NOT FOUND"); m+=1

print(f"\n{'='*50}")
print(f"BANNED violations: {v}")
print(f"MISSING required:  {m}")
if v == 0 and m == 0:
    print(">>> ALL CHECKS PASSED <<<")
else:
    print(">>> ISSUES FOUND <<<")
print(f"{'='*50}")
print(f"File: {os.path.getsize(nb_path)/1024:.1f} KB, {nb['nbformat']}.{nb['nbformat_minor']}")

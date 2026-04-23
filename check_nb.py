import json

with open("notebooks/train_colab_v2.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

print(f"nbformat: {nb['nbformat']}")
print(f"Total cells: {len(nb['cells'])}")

code_cells = [c for c in nb["cells"] if c["cell_type"] == "code"]
print(f"Code cells: {len(code_cells)}")

for i, c in enumerate(code_cells):
    src = c["source"]
    if src:
        first = src[0][:60].replace("\n","")
        print(f"  Code {i}: {len(src)} lines | {first}")
    else:
        print(f"  Code {i}: EMPTY!")

md_cells = [c for c in nb["cells"] if c["cell_type"] == "markdown"]
print(f"Markdown cells: {len(md_cells)}")
for i, c in enumerate(md_cells):
    src = c["source"]
    if src:
        first = src[0][:60].replace("\n","")
        print(f"  Md {i}: {first}")
    else:
        print(f"  Md {i}: EMPTY!")

import json

def update_notebook(path):
    with open(path, "r", encoding="utf-8") as f:
        nb = json.load(f)
    
    modified = False
    for cell in nb["cells"]:
        if cell["cell_type"] == "markdown":
            source = "".join(cell["source"])
            if "Target" in source and "0.85" in source:
                cell["source"] = [line.replace("0.85", "0.95") for line in cell["source"]]
                modified = True
            if "0.85-0.90" in source:
                cell["source"] = [line.replace("0.85-0.90", "0.90-0.95") for line in cell["source"]]
                modified = True
            
        elif cell["cell_type"] == "code":
            source = "".join(cell["source"])
            if "0.85" in source and "Target" in source:
                cell["source"] = [line.replace("0.85", "0.95") for line in cell["source"]]
                modified = True

    if modified:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(nb, f, indent=2)
        print(f"Updated {path}")
    else:
        print(f"No changes for {path}")

update_notebook("notebooks/train_kaggle.ipynb")
update_notebook("notebooks/train_colab.ipynb")

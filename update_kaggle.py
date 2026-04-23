import json

def update_kaggle_iou(path):
    with open(path, "r", encoding="utf-8") as f:
        nb = json.load(f)
    
    modified = False
    for cell in nb["cells"]:
        if cell["cell_type"] == "code" or cell["cell_type"] == "markdown":
            source = "".join(cell["source"])
            if "0.90" in source:
                new_source = [line.replace("0.90", "0.95") for line in cell["source"]]
                cell["source"] = new_source
                modified = True
                
    if modified:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(nb, f, indent=2)
        print(f"Updated {path}")
    else:
        print(f"No changes for {path}")

update_kaggle_iou("notebooks/train_kaggle.ipynb")

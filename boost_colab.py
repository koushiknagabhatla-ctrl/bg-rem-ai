import json

def boost_training(path):
    with open(path, "r", encoding="utf-8") as f:
        nb = json.load(f)
    
    modified = False
    for cell in nb["cells"]:
        if cell["cell_type"] == "code":
            source = "".join(cell["source"])
            if "total_epochs" in source:
                new_source = []
                for line in cell["source"]:
                    if "'total_epochs': 70" in line:
                        new_source.append(line.replace("70", "150"))
                        modified = True
                    elif "'early_stopping_patience': 15" in line:
                        new_source.append(line.replace("15", "30"))
                        modified = True
                    else:
                        new_source.append(line)
                cell["source"] = new_source

    if modified:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(nb, f, indent=2)
        print(f"Updated {path}")
    else:
        print(f"No changes for {path}")

boost_training("notebooks/train_colab.ipynb")

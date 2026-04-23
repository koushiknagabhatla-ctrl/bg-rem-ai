import json

with open("notebooks/train_colab.ipynb", "r") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    if cell["cell_type"] == "code":
        source = "".join(cell["source"])
        if "export_to_onnx(model, onnx_path" in source:
            new_source = []
            for line in cell["source"]:
                new_source.append(line)
                if "export_to_onnx(model, onnx_path" in line:
                    new_source.append("\nprint('Merging external data into a single ONNX file...')\n")
                    new_source.append("import onnx\n")
                    new_source.append("m = onnx.load(onnx_path, load_external_data=True)\n")
                    new_source.append("onnx.save(m, onnx_path, save_as_external_data=False)\n")
                    new_source.append("size_mb = os.path.getsize(onnx_path)/1024/1024\n")
                    new_source.append("print(f'Single-file merge SUCCESS! {size_mb:.1f}MB')\n")
            cell["source"] = new_source

with open("notebooks/train_colab.ipynb", "w") as f:
    json.dump(nb, f, indent=2)

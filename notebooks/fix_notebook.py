import json

notebook_path = r"c:\Users\koush\OneDrive\Desktop\bg rem ai\notebooks\train_kaggle.ipynb"

with open(notebook_path, 'r', encoding='utf-8') as f:
    notebook = json.load(f)

# Look for the export cell
for cell in notebook['cells']:
    if cell['cell_type'] == 'code':
        for i, line in enumerate(cell['source']):
            if "onnx.checker.check_model(onnx.load(fp32_path))" in line:
                # We need to insert the merge logic BEFORE this line
                merge_code = [
                    "model_onnx = onnx.load(fp32_path, load_external_data=True)\n",
                    "onnx.save(model_onnx, fp32_path, save_as_external_data=False)\n",
                    "print('Merged to single file')\n"
                ]
                # Avoid inserting multiple times
                if cell['source'][i-1] != merge_code[-1]:
                    cell['source'] = cell['source'][:i] + merge_code + cell['source'][i:]
                    print("Patched notebook cell successfully!")
                break

with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=2)

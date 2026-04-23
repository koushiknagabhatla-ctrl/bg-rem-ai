import json

with open("notebooks/train_colab_v2.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    if cell["cell_type"] != "code":
        continue
    src = "".join(cell["source"])

    # Fix Cell 1: Restore Colab paths
    if "'drive_dir':" in src and "teamspace" in src:
        cell["source"] = [
            line.replace(
                "'drive_dir': '/teamspace/studios/this_studio/bg_removal_ai'",
                "'drive_dir': '/content/drive/MyDrive/bg_removal_ai'"
            ).replace(
                "'local_ckpt_dir': '/teamspace/studios/this_studio/checkpoints'",
                "'local_ckpt_dir': '/content/checkpoints'"
            )
            for line in cell["source"]
        ]

    # Fix Cell 2: Restore pure Colab Drive mount
    if "Persistent Storage Setup" in src or ("Lightning AI" in src and "DRIVE_MOUNTED" in src):
        cell["source"] = [
            "# ================================================================\n",
            "# CELL 2 \u2014 Google Drive Mount\n",
            "# ================================================================\n",
            "DRIVE_MOUNTED = False\n",
            "DRIVE_DIR = CONFIG['drive_dir']\n",
            "\n",
            "try:\n",
            "    from google.colab import drive\n",
            "    drive.mount('/content/drive')\n",
            "    os.makedirs(f'{DRIVE_DIR}/checkpoints', exist_ok=True)\n",
            "    os.makedirs(f'{DRIVE_DIR}/exports', exist_ok=True)\n",
            "    DRIVE_MOUNTED = True\n",
            "    print(f'Drive mounted at {DRIVE_DIR}')\n",
            "    print(f'  Checkpoints: {DRIVE_DIR}/checkpoints/')\n",
            "    print(f'  Exports:     {DRIVE_DIR}/exports/')\n",
            "except Exception as e:\n",
            "    print(f'Drive mount failed: {e}')\n",
            "    print('Checkpoints will be saved locally only.')\n",
            "    DRIVE_MOUNTED = False\n",
        ]

    # Fix Cell 12: Restore Colab paths
    if "_EfficientUNetPP" in src and "teamspace" in src:
        cell["source"] = [
            line.replace(
                "DRIVE_DIR = '/teamspace/studios/this_studio/bg_removal_ai' if os.path.isdir('/teamspace/studios/this_studio') else '/content/drive/MyDrive/bg_removal_ai'",
                "DRIVE_DIR = '/content/drive/MyDrive/bg_removal_ai'"
            ).replace(
                "'/teamspace/studios/this_studio/checkpoints/best_model.pth'",
                "'/content/checkpoints/best_model.pth'"
            ).replace(
                "'/teamspace/studios/this_studio/checkpoints/last_checkpoint.pth'",
                "'/content/checkpoints/last_checkpoint.pth'"
            )
            for line in cell["source"]
        ]

with open("notebooks/train_colab_v2.ipynb", "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=2)

print("Restored to pure Google Colab paths")

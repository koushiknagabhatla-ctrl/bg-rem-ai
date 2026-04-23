import json

with open("notebooks/train_colab_v2.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    if cell["cell_type"] != "code":
        continue
    src = "".join(cell["source"])

    # Fix Cell 1: Change paths
    if "'drive_dir': '/content/drive/MyDrive/bg_removal_ai'" in src:
        cell["source"] = [
            line.replace(
                "'drive_dir': '/content/drive/MyDrive/bg_removal_ai'",
                "'drive_dir': '/teamspace/studios/this_studio/bg_removal_ai'"
            ).replace(
                "'local_ckpt_dir': '/content/checkpoints'",
                "'local_ckpt_dir': '/teamspace/studios/this_studio/checkpoints'"
            )
            for line in cell["source"]
        ]

    # Fix Cell 2: Universal storage (Colab + Lightning + local)
    if "from google.colab import drive" in src and "drive.mount" in src:
        cell["source"] = [
            "# ================================================================\n",
            "# CELL 2 \u2014 Persistent Storage Setup (Colab + Lightning AI + local)\n",
            "# ================================================================\n",
            "\n",
            "DRIVE_MOUNTED = False\n",
            "DRIVE_DIR = CONFIG['drive_dir']\n",
            "\n",
            "# Try Google Colab Drive\n",
            "try:\n",
            "    from google.colab import drive\n",
            "    drive.mount('/content/drive')\n",
            "    DRIVE_DIR = '/content/drive/MyDrive/bg_removal_ai'\n",
            "    DRIVE_MOUNTED = True\n",
            "    print(f'Colab Drive mounted at {DRIVE_DIR}')\n",
            "except Exception:\n",
            "    pass\n",
            "\n",
            "# Try Lightning AI persistent storage\n",
            "if not DRIVE_MOUNTED and os.path.isdir('/teamspace/studios/this_studio'):\n",
            "    DRIVE_DIR = '/teamspace/studios/this_studio/bg_removal_ai'\n",
            "    DRIVE_MOUNTED = True\n",
            "    print(f'Lightning AI storage: {DRIVE_DIR}')\n",
            "\n",
            "# Fallback to local directory\n",
            "if not DRIVE_MOUNTED:\n",
            "    DRIVE_DIR = './bg_removal_ai'\n",
            "    DRIVE_MOUNTED = True\n",
            "    print(f'Using local storage: {DRIVE_DIR}')\n",
            "\n",
            "os.makedirs(f'{DRIVE_DIR}/checkpoints', exist_ok=True)\n",
            "os.makedirs(f'{DRIVE_DIR}/exports', exist_ok=True)\n",
            "print(f'  Checkpoints: {DRIVE_DIR}/checkpoints/')\n",
            "print(f'  Exports:     {DRIVE_DIR}/exports/')\n",
        ]

# Fix Cell 12 DRIVE_DIR default
for cell in nb["cells"]:
    if cell["cell_type"] != "code":
        continue
    src = "".join(cell["source"])
    if "DRIVE_DIR = '/content/drive/MyDrive/bg_removal_ai'" in src and "_EfficientUNetPP" in src:
        cell["source"] = [
            line.replace(
                "DRIVE_DIR = '/content/drive/MyDrive/bg_removal_ai'",
                "DRIVE_DIR = '/teamspace/studios/this_studio/bg_removal_ai' if os.path.isdir('/teamspace/studios/this_studio') else '/content/drive/MyDrive/bg_removal_ai'"
            ).replace(
                "'/content/checkpoints/best_model.pth'",
                "'/teamspace/studios/this_studio/checkpoints/best_model.pth'"
            ).replace(
                "'/content/checkpoints/last_checkpoint.pth'",
                "'/teamspace/studios/this_studio/checkpoints/last_checkpoint.pth'"
            )
            for line in cell["source"]
        ]

with open("notebooks/train_colab_v2.ipynb", "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=2)

print("Done - notebook now works on Lightning AI + Colab + local")

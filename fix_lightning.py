import json

with open("notebooks/train_colab_v2.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    if cell["cell_type"] != "code":
        continue
    src = "".join(cell["source"])

    # Fix Cell 1: Change drive_dir default to Lightning path
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

    # Fix Cell 2: Replace Drive mount with Lightning AI persistent storage
    if "from google.colab import drive" in src:
        cell["source"] = [
            "# ================================================================\n",
            "# CELL 2 \u2014 Persistent Storage Setup\n",
            "# ================================================================\n",
            "# Works on: Google Colab (Drive), Lightning AI, or local\n",
            "\n",
            "DRIVE_MOUNTED = False\n",
            "DRIVE_DIR = CONFIG['drive_dir']\n",
            "\n",
            "# Try Google Colab Drive first\n",
            "try:\n",
            "    from google.colab import drive\n",
            "    drive.mount('/content/drive')\n",
            "    DRIVE_DIR = '/content/drive/MyDrive/bg_removal_ai'\n",
            "    DRIVE_MOUNTED = True\n",
            "    print(f'\\u2713 Colab Drive mounted at {DRIVE_DIR}')\n",
            "except Exception:\n",
            "    pass\n",
            "\n",
            "# Try Lightning AI persistent storage\n",
            "if not DRIVE_MOUNTED:\n",
            "    lightning_dir = '/teamspace/studios/this_studio/bg_removal_ai'\n",
            "    if os.path.isdir('/teamspace/studios/this_studio'):\n",
            "        DRIVE_DIR = lightning_dir\n",
            "        DRIVE_MOUNTED = True\n",
            "        print(f'\\u2713 Lightning AI storage: {DRIVE_DIR}')\n",
            "\n",
            "# Fallback to local\n",
            "if not DRIVE_MOUNTED:\n",
            "    DRIVE_DIR = CONFIG['drive_dir']\n",
            "    print(f'No cloud storage found. Using local: {DRIVE_DIR}')\n",
            "    DRIVE_MOUNTED = True  # treat local as mounted\n",
            "\n",
            "os.makedirs(f'{DRIVE_DIR}/checkpoints', exist_ok=True)\n",
            "os.makedirs(f'{DRIVE_DIR}/exports', exist_ok=True)\n",
            "print(f'  Checkpoints: {DRIVE_DIR}/checkpoints/')\n",
            "print(f'  Exports:     {DRIVE_DIR}/exports/')\n",
        ]

    # Fix Cell 12: Replace google.colab files.download with universal download
    if "from google.colab import files" in src:
        cell["source"] = [
            line.replace(
                "try:\n",
                "try:\n"
            ) for line in cell["source"]
        ]
        # Find and replace the download section
        new_source = []
        skip = False
        for line in cell["source"]:
            if "try:" in line and i_next_has_colab(cell["source"], line):
                pass
            if "from google.colab import files" in line:
                new_source.append("try:\n")
                new_source.append("    from google.colab import files\n")
                new_source.append("    files.download(final_path)\n")
                new_source.append("except Exception:\n")
                new_source.append("    print(f'Download the model from: {final_path}')\n")
                new_source.append("    if os.path.isdir(DRIVE_DIR):\n")
                new_source.append("        print(f'Or from: {DRIVE_DIR}/exports/model_FINAL.onnx')\n")
                skip = True
                continue
            if skip:
                if line.strip() == "" or not line.startswith(" "):
                    skip = False
                    new_source.append(line)
                continue
            new_source.append(line)

with open("notebooks/train_colab_v2.ipynb", "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=2)

print("Updated for Lightning AI + Colab compatibility")

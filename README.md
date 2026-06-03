# 🔥 Forest Fire Detection using EfficientNet-B1

![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0-red?logo=pytorch)
![EfficientNet](https://img.shields.io/badge/Model-EfficientNet--B1-orange)
![Accuracy](https://img.shields.io/badge/Accuracy-high-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)

A deep learning project for **automatic forest fire detection** from images using **EfficientNet-B1** and **PyTorch**, with Grad-CAM explainability and advanced evaluation metrics.

> 🎓 Master's project — Computer Science, Visual Computing

---

## 📌 Table of Contents
- [Overview](#overview)
- [Demo](#demo)
- [Architecture](#architecture)
- [Dataset](#dataset)
- [Results](#results)
- [How to Run](#how-to-run)
- [Project Structure](#project-structure)
- [Future Work](#future-work)
- [Author](#author)

---

## 🌍 Overview

Wildfires cause devastating damage to ecosystems and human lives every year.
This project builds an **automated fire detection system** that classifies images into:

| Class | Description |
|---|---|
| 🔥 **Fire** | Image contains visible fire or smoke |
| 🌲 **No Fire** | Normal forest/environment image |

The system leverages **transfer learning** on EfficientNet-B1 pretrained on ImageNet,
fine-tuned for binary fire classification — enabling high accuracy with limited data.

---

## 🏗️ Model Architecture

```
Input Image (240×240)
        │
        ▼
┌─────────────────────────┐
│   EfficientNet-B1        │  ← Pretrained on ImageNet
│   (frozen early layers)  │
│   (fine-tuned last blocks)│
└────────────┬────────────┘
             │
        ▼
┌─────────────────────────┐
│   Custom Classifier      │
│   Linear → ReLU          │
│   Dropout                │
│   Linear → Output (2)    │
└────────────┬────────────┘
             │
        ▼
   Fire / No Fire
```

### Fine-tuning Strategy
- ✅ Pretrained **ImageNet** weights
- 🔒 Frozen early EfficientNet layers
- 🔓 Fine-tuned last EfficientNet blocks
- 🧠 Custom classification head with Dropout + FC layers

---

## 📊 Dataset

> The dataset is **not included** in this repository due to its size.

### 📥 Download
🔗 **[DeepFire Dataset — Google Drive](https://drive.google.com/drive/folders/1OVrm-tAjK_ifwEoiK45EtGXOq3fegwOK)**

### 📁 Expected Structure
After downloading, place the data as follows:

```
data/
└── Forest Fire Dataset/
    ├── Train/
    │   ├── Fire/
    │   └── No_Fire/
    ├── Validation/
    │   ├── Fire/
    │   └── No_Fire/
    └── Test/
        ├── Fire/
        └── No_Fire/
```

### 🔄 Data Preprocessing & Augmentation
| Technique | Details |
|---|---|
| Resize | 240 × 240 pixels |
| Normalization | ImageNet mean & std |
| Random Horizontal Flip | Training only |
| Rotation | Random angle |
| Zoom / Crop | Random resized crop |

---

## ⚙️ Training Configuration

| Parameter | Value |
|---|---|
| Epochs | 10 |
| Batch Size | 32 |
| Learning Rate | 1e-4 |
| Optimizer | Adam |
| Loss Function | CrossEntropyLoss |
| Hardware | GPU (Google Colab) |
| Input Size | 240 × 240 |

---

## 📈 Results

The model was evaluated using the following metrics:

- ✅ Accuracy
- ✅ Precision / Recall / F1-Score
- ✅ ROC Curve & AUC
- ✅ Precision-Recall Curve
- ✅ Confusion Matrix

### 🔍 Grad-CAM Explainability

**Grad-CAM** (Gradient-weighted Class Activation Mapping) was used to visualize
which regions of the image most influenced the model's prediction —
making the model interpretable and trustworthy.

> 🔥 Red/warm zones = regions detected as fire-related features

---

## 🛠️ Technologies Used

![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white&style=flat)
![PyTorch](https://img.shields.io/badge/-PyTorch-EE4C2C?logo=pytorch&logoColor=white&style=flat)
![OpenCV](https://img.shields.io/badge/-OpenCV-5C3EE8?logo=opencv&logoColor=white&style=flat)
![NumPy](https://img.shields.io/badge/-NumPy-013243?logo=numpy&logoColor=white&style=flat)
![Scikit--learn](https://img.shields.io/badge/-Scikit--learn-F7931E?logo=scikit-learn&logoColor=white&style=flat)
![Colab](https://img.shields.io/badge/-Google%20Colab-F9AB00?logo=googlecolab&logoColor=white&style=flat)

---

## 🚀 How to Run

### 1. Clone the repository
```bash
git clone https://github.com/your-username/forest-fire-detection.git
cd forest-fire-detection
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Download the dataset
🔗 [Download from Google Drive](https://drive.google.com/drive/folders/1OVrm-tAjK_ifwEoiK45EtGXOq3fegwOK)
Place the data in the `data/` folder as shown above.

### 4. Run the notebook
Open with **Jupyter Notebook** or **Google Colab**:
```bash
jupyter notebook fire_detection.ipynb
```

---

## 📂 Project Structure

```
forest-fire-detection/
│
├── 📓 fire_detection.ipynb     # Main notebook
├── 📄 requirements.txt         # Dependencies
├── 📄 README.md                # This file
│
├── 📁 data/                    # Dataset (not included — see link above)
│   └── Forest Fire Dataset/
│       ├── Train/
│       ├── Validation/
│       └── Test/
│
└── 📁 outputs/                 # Results, plots, saved model
    ├── confusion_matrix.png
    ├── roc_curve.png
    ├── gradcam_examples.png
    └── model_efficientnet_b1.pth
```

---

## 🔮 Future Work

- [ ] 🎥 Real-time fire detection from video streams
- [ ] 🌐 Web deployment using **Streamlit** or **Flask**
- [ ] 📱 Mobile application integration
- [ ] 🧪 Testing other architectures: ResNet, EfficientNetV2, Vision Transformers
- [ ] 🛰️ Integration with satellite or drone imagery

---

## 👩‍💻 Author

**[Wissal benkouider]**
Master's in Computer Science — Visual Computing, USTHB
🔗 [LinkedIn](https://www.linkedin.com/in/benkouider-wissal-59a7172b7/) · 🐙

---

> ⭐ If you find this project useful, feel free to star the repository!

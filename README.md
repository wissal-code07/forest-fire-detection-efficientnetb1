# forest-fire-detection-efficientnetb1
Forest fire image classification using EfficientNet-B1, PyTorch, transfer learning, and Grad-CAM visualization.
# Forest Fire Detection using EfficientNet-B1

Deep learning project for forest fire image classification using EfficientNet-B1 and PyTorch.

## Project Overview

This project focuses on automatic forest fire detection from images using a Convolutional Neural Network (CNN) based on the EfficientNet-B1 architecture.

The objective is to classify images into two categories:

- Fire
- Non-Fire

This type of system can contribute to early wildfire detection and environmental monitoring applications.

## Technologies Used

- Python
- PyTorch
- TorchVision
- NumPy
- OpenCV
- Matplotlib
- Scikit-learn
- Google Colab

## Model Architecture

The project uses a pre-trained EfficientNet-B1 model with transfer learning.

### Fine-tuning Strategy

- Pretrained ImageNet weights
- Frozen early layers
- Fine-tuning of the last EfficientNet blocks
- Custom classification head

The final classifier contains:

- Dropout layers
- Fully connected layers
- ReLU activation
- Binary classification output

## Data Preprocessing

The following preprocessing and augmentation techniques were applied:

- Image resizing
- Normalization using ImageNet statistics
- Random horizontal flip
- Rotation
- Zoom / crop transformations
- Data augmentation

Input image size:

```python
240 x 240
```

## Training Configuration

| Parameter | Value |
|---|---|
| Epochs | 10 |
| Batch Size | 32 |
| Learning Rate | 1e-4 |
| Optimizer | Adam |
| Loss Function | CrossEntropyLoss |

## Evaluation Metrics

The model was evaluated using:

- Accuracy
- Precision
- Recall
- F1-Score
- ROC Curve
- PR Curve
- Confusion Matrix

## Visualization and Explainability

The project includes several visualization techniques:

- Training and validation accuracy/loss curves
- Confusion matrix
- ROC and Precision-Recall curves
- Prediction visualization
- Grad-CAM heatmaps for model interpretability

Grad-CAM was used to visualize the regions of the image that influenced the model predictions.

## Dataset

The dataset is stored on Google Drive.

Dataset Link:

(Add your Google Drive dataset link here)

Dataset structure:

```text
Forest Fire Dataset/
│
├── Train/
├── Validation/
└── Test/
```

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repository-name.git
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Open the notebook

Run the notebook using:

- Jupyter Notebook
- Google Colab

## Project Features

- Transfer Learning with EfficientNet-B1
- Forest fire image classification
- Advanced evaluation metrics
- Grad-CAM visualization
- GPU acceleration with PyTorch
- Data augmentation techniques

## Future Improvements

Possible future improvements include:

- Real-time wildfire detection
- Video-based fire detection
- Deployment using Streamlit or Flask
- Mobile application integration
- Testing other architectures (ResNet, EfficientNetV2, Vision Transformers)

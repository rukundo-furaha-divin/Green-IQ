# Waste Classifier AI

## Dataset Structure

Place your dataset in a directory like:

```
waste_dataset/
├── biodegradable/
│   ├── img1.jpg
│   └── ...
└── non_biodegradable/
    ├── img2.jpg
    └── ...
```

## Training the Model

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
2. Run the training script:
   ```
   python train_waste_classifier.py
   ```
   This will save the model and processor to `models/waste_classifier_model/`.

## Running the API

1. Start the Flask API:
   ```
   python waste_classification_api.py
   ```
2. The API will be available at `http://localhost:5000/classify`.

## API Usage

- **Endpoint:** `/classify` (POST)
- **Payload:** Multipart form with one or more images (field name: `images`)
- **Response:**
  ```json
  {
    "results": [
      {
        "label": "biodegradable",
        "confidence": 0.94,
        "description": "Easily breaks down naturally. Good for composting.",
        "recyclable": false,
        "disposal": "Use compost or organic bin",
        "example_items": ["banana peel", "food waste", "paper"]
      },
      ...
    ]
  }
  ```

## Frontend Integration

- The React Native frontend can POST images to `/classify` and display the results using the modal.
- No changes are needed to the modal if it expects the above JSON structure.

## Notes
- If your dataset folders are named differently (e.g., `R` and `O`), update the LABEL2INFO mapping and class names in the training script.
- The model is based on `google/vit-base-patch16-224` and fine-tuned for binary classification. 
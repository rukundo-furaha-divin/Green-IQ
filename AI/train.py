import os
import logging
from datasets import load_dataset, DatasetDict
from transformers import AutoImageProcessor, AutoModelForImageClassification, TrainingArguments, Trainer
from torchvision import transforms
import torch
from PIL import Image
import numpy as np
import sys

# --- Logging setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("waste_classifier_train")

# --- Config ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(SCRIPT_DIR, "data")
MODEL_SAVE_PATH = os.path.join(SCRIPT_DIR, "waste_classifier")

# Print paths for debugging
logger.info(f"Script directory: {SCRIPT_DIR}")
logger.info(f"Dataset path: {DATASET_PATH}")
logger.info(f"Model save path: {MODEL_SAVE_PATH}")

# Check if dataset path exists
if not os.path.exists(DATASET_PATH):
    logger.error(f"Dataset path does not exist: {DATASET_PATH}")
    logger.info("Please ensure your dataset is structured as:")
    logger.info("  data/")
    logger.info("    biodegradable/")
    logger.info("      image1.jpg")
    logger.info("      image2.jpg")
    logger.info("    non_biodegradable/")
    logger.info("      image3.jpg")
    logger.info("      image4.jpg")
    sys.exit(1)

LABEL2INFO = {
    0: {
        "label": "biodegradable",
        "description": "Easily breaks down naturally. Good for composting.",
        "recyclable": False,
        "disposal": "Use compost or organic bin",
        "example_items": ["banana peel", "food waste", "paper"],
        "environmental_benefit": "Composting biodegradable waste returns nutrients to the soil, reduces landfill use, and lowers greenhouse gas emissions.",
        "protection_tip": "Compost at home or use municipal organic waste bins. Avoid mixing with plastics or hazardous waste.",
        "poor_disposal_effects": "If disposed of improperly, biodegradable waste can cause methane emissions in landfills and contribute to water pollution and eutrophication."
    },
    1: {
        "label": "non_biodegradable",
        "description": "Does not break down easily. Should be disposed of carefully.",
        "recyclable": False,
        "disposal": "Use general waste bin or recycling if possible",
        "example_items": ["plastic bag", "styrofoam", "metal can"],
        "environmental_benefit": "Proper disposal and recycling of non-biodegradable waste reduces pollution, conserves resources, and protects wildlife.",
        "protection_tip": "Reduce use, reuse items, and recycle whenever possible. Never burn or dump in nature.",
        "poor_disposal_effects": "Improper disposal leads to soil and water pollution, harms wildlife, and causes long-term environmental damage. Plastics can persist for hundreds of years."
    }
}

# --- Dataset loading ---
logger.info(f"Loading dataset from {DATASET_PATH}")
try:
    # Load dataset with O/R folder structure
    dataset = load_dataset("imagefolder", data_dir=DATASET_PATH)
    logger.info(f"Dataset loaded successfully. Features: {dataset['train'].features}")
    logger.info(f"Number of training examples: {len(dataset['train'])}")
    
    try:
        logger.info(f"Original label names: {dataset['train'].features['label'].names}")
    except KeyError:
        logger.warning("No label feature found")
        
    # Print some sample labels to understand the mapping
    for i in range(min(3, len(dataset['train']))):
        sample = dataset['train'][i]
        logger.info(f"Sample {i}: label={sample['label']}")
        
except Exception as e:
    logger.error(f"Failed to load dataset: {e}")
    sys.exit(1)

# --- Split train/val/test ---
logger.info("Splitting dataset (80% train, 10% val, 10% test)")
split = dataset["train"].train_test_split(test_size=0.2, seed=42)
val_test = split["test"].train_test_split(test_size=0.5, seed=42)
dataset = DatasetDict({
    "train": split["train"],
    "val": val_test["train"],
    "test": val_test["test"]
})

logger.info(f"Train samples: {len(dataset['train'])}")
logger.info(f"Val samples: {len(dataset['val'])}")
logger.info(f"Test samples: {len(dataset['test'])}")

# --- Preprocessing ---
logger.info("Setting up transforms and processor")
image_processor = AutoImageProcessor.from_pretrained("google/vit-base-patch16-224", use_fast=True)

# Updated preprocessing function that's compatible with the trainer
def transform_images(examples):
    """Transform a batch of images"""
    images = [image.convert("RGB") if image.mode != "RGB" else image for image in examples["image"]]
    # Use the image processor directly instead of manual transforms
    inputs = image_processor(images, return_tensors="pt")
    examples["pixel_values"] = inputs["pixel_values"]
    return examples

# --- Relabel O/R folders to biodegradable/non_biodegradable ---
def relabel_OR_to_standard(example):
    """Convert O/R labels to 0/1 (biodegradable/non_biodegradable)"""
    # The imagefolder loader assigns labels based on alphabetical order
    # So if your folders are O, R then: O=0, R=1
    # But we want: O (organic) = 0 (biodegradable), R (recyclable) = 1 (non_biodegradable)
    
    # Check current label names
    original_labels = dataset["train"].features['label'].names
    logger.info(f"Original folder-based labels: {original_labels}")
    
    # If folders are in alphabetical order [O, R], labels are already correct
    # If folders are [R, O], we need to flip them
    if original_labels == ['O', 'R']:
        # O=0 (biodegradable), R=1 (non_biodegradable) - already correct
        return example
    elif original_labels == ['R', 'O']:
        # R=0, O=1 - need to flip
        example['label'] = 1 - example['label']  # flip 0->1, 1->0
        return example
    else:
        # Labels are already correct or use default mapping
        return example

# Apply relabeling first
logger.info("Applying O/R to biodegradable/non_biodegradable relabeling...")
dataset["train"] = dataset["train"].map(relabel_OR_to_standard)
dataset["val"] = dataset["val"].map(relabel_OR_to_standard)
dataset["test"] = dataset["test"].map(relabel_OR_to_standard)

# Apply transforms
logger.info("Applying transforms...")
dataset["train"] = dataset["train"].map(transform_images, batched=True, batch_size=32)
dataset["val"] = dataset["val"].map(transform_images, batched=True, batch_size=32)
dataset["test"] = dataset["test"].map(transform_images, batched=True, batch_size=32)

# Set format for PyTorch
dataset["train"].set_format("torch", columns=["pixel_values", "label"])
dataset["val"].set_format("torch", columns=["pixel_values", "label"])
dataset["test"].set_format("torch", columns=["pixel_values", "label"])

# Updated collate function
def collate_fn(batch):
    pixel_values = torch.stack([item["pixel_values"] for item in batch])
    labels = torch.tensor([item["label"] for item in batch], dtype=torch.long)
    return {"pixel_values": pixel_values, "labels": labels}

# --- Model ---
id2label = {0: "biodegradable", 1: "non_biodegradable"}
label2id = {v: k for k, v in id2label.items()}
logger.info("Loading ViT model")
model = AutoModelForImageClassification.from_pretrained(
    "google/vit-base-patch16-224",
    num_labels=2,
    id2label=id2label,
    label2id=label2id,
    ignore_mismatched_sizes=True
)

# --- Training ---
logger.info("Setting up Trainer and TrainingArguments")
training_args = TrainingArguments(
    output_dir=os.path.join(SCRIPT_DIR, "vit_trainer_output"),
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    eval_strategy="epoch",  # Fixed parameter name
    save_strategy="epoch",
    num_train_epochs=3,
    learning_rate=2e-5,
    logging_dir=os.path.join(SCRIPT_DIR, "vit_logs"),
    logging_steps=10,
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    save_total_limit=1,
    report_to=[],
    dataloader_pin_memory=False,  # Disable pin memory to avoid the warning
    remove_unused_columns=False,  # Keep all columns
)

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=1)
    acc = (preds == labels).mean()
    return {"accuracy": acc}

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["val"],
    data_collator=collate_fn,
    compute_metrics=compute_metrics,
)

logger.info("Starting training...")
try:
    trainer.train()
    logger.info("Training completed successfully!")
except Exception as e:
    logger.error(f"Training failed: {e}")
    sys.exit(1)

# --- Save model and processor ---
logger.info(f"Saving model to {MODEL_SAVE_PATH}")
try:
    # Create directory if it doesn't exist
    os.makedirs(MODEL_SAVE_PATH, exist_ok=True)
    
    model.save_pretrained(MODEL_SAVE_PATH)
    image_processor.save_pretrained(MODEL_SAVE_PATH)
    
    # Verify files were saved
    required_files = ["config.json", "pytorch_model.bin", "preprocessor_config.json"]
    missing_files = []
    for file in required_files:
        if not os.path.exists(os.path.join(MODEL_SAVE_PATH, file)):
            missing_files.append(file)
    
    if missing_files:
        logger.warning(f"Some expected files are missing: {missing_files}")
    else:
        logger.info("All model files saved successfully!")
    
    logger.info(f"Model saved to: {os.path.abspath(MODEL_SAVE_PATH)}")
    logger.info("Training complete and model saved.")
    
except Exception as e:
    logger.error(f"Failed to save model: {e}")
    sys.exit(1)

# --- Test the saved model ---
logger.info("Testing saved model...")
try:
    from transformers import AutoModelForImageClassification, AutoImageProcessor
    test_model = AutoModelForImageClassification.from_pretrained(MODEL_SAVE_PATH, local_files_only=True)
    test_processor = AutoImageProcessor.from_pretrained(MODEL_SAVE_PATH, local_files_only=True)
    logger.info("✅ Model can be loaded successfully!")
except Exception as e:
    logger.error(f"❌ Failed to load saved model: {e}")
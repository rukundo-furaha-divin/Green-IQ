import os
import requests
from datetime import datetime
from flask import Flask, request, jsonify

# ===============================
# Configuration
# ===============================

HF_API_URL = "https://api-inference.huggingface.co/models/Claudineuwa/waste_classifier_Isaac"

HF_API_TOKEN = os.environ.get("HF_API_TOKEN")
if not HF_API_TOKEN:
    raise RuntimeError("HF_API_TOKEN environment variable is not set")

HF_HEADERS = {
    "Authorization": f"Bearer {HF_API_TOKEN}"
}

BACKEND_URL = os.environ.get(
    "BACKEND_URL",
    "https://green-iq-backend-xsui.onrender.com/wasteSubmission"
)

# ===============================
# Flask App
# ===============================

app = Flask(__name__)

# ===============================
# Root Route
# ===============================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Waste Classification API is running",
        "inference_mode": "Hugging Face Inference API (remote)",
        "model": "Claudineuwa/waste_classifier_Isaac",
        "backend_url": BACKEND_URL,
        "routes": {
            "GET /": "Server status",
            "GET /health": "Health check",
            "POST /predict": "Image classification"
        }
    })

# ===============================
# Health Check
# ===============================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model": "remote (huggingface)",
        "timestamp": datetime.utcnow().isoformat()
    })

# ===============================
# Prediction Route
# ===============================

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({
            "success": False,
            "error": "No image uploaded"
        }), 400

    image_file = request.files["image"]

    try:
        # -------------------------------
        # Call Hugging Face Inference API
        # -------------------------------
        hf_response = requests.post(
            HF_API_URL,
            headers=HF_HEADERS,
            files={"file": image_file.read()},
            timeout=30
        )

        if hf_response.status_code != 200:
            return jsonify({
                "success": False,
                "error": "Hugging Face inference failed",
                "details": hf_response.text
            }), 500

        predictions = hf_response.json()

        if not isinstance(predictions, list) or not predictions:
            return jsonify({
                "success": False,
                "error": "Invalid inference response",
                "raw_response": predictions
            }), 500

        top_prediction = max(predictions, key=lambda x: x["score"])

        label = top_prediction["label"]
        confidence = float(top_prediction["score"])

        # -------------------------------
        # Send to backend
        # -------------------------------
        classification_data = {
            "prediction": label,
            "confidence": f"{confidence:.4f}",
            "timestamp": datetime.utcnow().isoformat(),
            "image_filename": image_file.filename,
            "model_version": "Claudineuwa/waste_classifier_Isaac",
            "inference": "huggingface-api"
        }

        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({
                "success": False,
                "error": "Missing Authorization header"
            }), 401

        backend_response = requests.post(
            BACKEND_URL,
            json=classification_data,
            headers={
                "Content-Type": "application/json",
                "Authorization": auth_header
            },
            timeout=10
        )

        backend_result = (
            backend_response.json()
            if backend_response.status_code == 200
            else {
                "status": "backend_error",
                "http_status": backend_response.status_code
            }
        )

        return jsonify({
            "success": True,
            "prediction": label,
            "confidence": f"{confidence:.4f}",
            "backend_response": backend_result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===============================
# Error Handlers
# ===============================

@app.errorhandler(404)
def not_found(_):
    return jsonify({
        "error": "Route not found",
        "available_routes": ["/", "/health", "/predict"]
    }), 404

@app.errorhandler(405)
def method_not_allowed(_):
    return jsonify({
        "error": "Method not allowed"
    }), 405

# ===============================
# CORS (Optional)
# ===============================


@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

# ===============================
# App Runner
# ===============================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
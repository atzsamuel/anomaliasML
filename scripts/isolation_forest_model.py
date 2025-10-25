import json
import sys
from sklearn.ensemble import IsolationForest
import numpy as np
import pickle
import os

def train_model(training_data):
    """
    Train Isolation Forest model with the provided training data
    
    Args:
        training_data: List of feature vectors [requests_per_minute, error_ratio, avg_time_between_requests, total_requests]
    
    Returns:
        Trained model
    """
    if len(training_data) == 0:
        print(json.dumps({"error": "No training data provided"}))
        sys.exit(1)
    
    # Convert to numpy array
    X = np.array(training_data)
    
    # Train Isolation Forest
    # contamination: expected proportion of outliers (10-20% is typical)
    # n_estimators: number of trees
    # max_samples: number of samples to draw to train each tree
    # random_state: for reproducibility
    model = IsolationForest(
        contamination=0.15,
        n_estimators=100,
        max_samples='auto',
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X)
    
    # Save model to file
    model_path = os.path.join(os.path.dirname(__file__), 'isolation_forest_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    return model

def predict_anomalies(model, test_data):
    """
    Predict anomalies using the trained model
    
    Args:
        model: Trained Isolation Forest model
        test_data: List of feature vectors to predict
    
    Returns:
        List of predictions (-1 for anomaly, 1 for normal) and anomaly scores
    """
    if len(test_data) == 0:
        return [], []
    
    X = np.array(test_data)
    
    # Predict: -1 for anomalies, 1 for normal
    predictions = model.predict(X)
    
    # Get anomaly scores (lower scores = more anomalous)
    scores = model.score_samples(X)
    
    # Normalize scores to 0-1 range (higher = more anomalous)
    # Invert and normalize
    min_score = scores.min()
    max_score = scores.max()
    if max_score - min_score > 0:
        normalized_scores = 1 - (scores - min_score) / (max_score - min_score)
    else:
        normalized_scores = np.zeros_like(scores)
    
    return predictions.tolist(), normalized_scores.tolist()

def load_model():
    """Load the trained model from file"""
    model_path = os.path.join(os.path.dirname(__file__), 'isolation_forest_model.pkl')
    
    if not os.path.exists(model_path):
        return None
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    return model

def main():
    """Main function to handle training and prediction"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided. Use 'train' or 'predict'"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "train":
        # Read training data from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        training_data = data.get("training_data", [])
        
        if len(training_data) < 10:
            print(json.dumps({
                "error": "Insufficient training data. Need at least 10 samples.",
                "received": len(training_data)
            }))
            sys.exit(1)
        
        # Train model
        model = train_model(training_data)
        
        # Return success
        print(json.dumps({
            "success": True,
            "message": "Model trained successfully",
            "samples_trained": len(training_data)
        }))
    
    elif command == "predict":
        # Load model
        model = load_model()
        
        if model is None:
            print(json.dumps({"error": "Model not found. Please train the model first."}))
            sys.exit(1)
        
        # Read test data from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        test_data = data.get("test_data", [])
        
        if len(test_data) == 0:
            print(json.dumps({
                "success": True,
                "predictions": [],
                "scores": []
            }))
            sys.exit(0)
        
        # Predict
        predictions, scores = predict_anomalies(model, test_data)
        
        # Return results
        print(json.dumps({
            "success": True,
            "predictions": predictions,
            "scores": scores
        }))
    
    else:
        print(json.dumps({"error": f"Unknown command: {command}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()

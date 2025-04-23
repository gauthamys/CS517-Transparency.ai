import os
import csv
import json
import re
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from lime.lime_text import LimeTextExplainer

app = Flask(__name__)
CORS(app)

# Configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "llama3.2"
CSV_PATH = "candidates.csv"

# Load candidates data
def load_candidates():
    if not os.path.exists(CSV_PATH):
        return []
    
    with open(CSV_PATH, 'r') as file:
        reader = csv.DictReader(file)
        return list(reader)

# Function to generate response from Ollama
def get_ollama_response(prompt, model=DEFAULT_MODEL):
    response = requests.post(
        OLLAMA_API_URL,
        json={
            "model": model,
            "prompt": prompt,
            "stream": False
        }
    )
    if response.status_code == 200:
        return response.json()["response"]
    else:
        return f"Error: {response.status_code}, {response.text}"

# Basic endpoint that just forwards to Ollama
@app.route('/api/basic_hiring', methods=['POST'])
def basic_hiring():
    data = request.json
    
    if not data or 'job_description' not in data:
        return jsonify({"error": "Job description is required"}), 400
    
    job_description = data['job_description']
    model = data.get('model', DEFAULT_MODEL)
    
    # Load candidates
    candidates = load_candidates()
    if not candidates:
        return jsonify({"error": "No candidates found in CSV file"}), 404
    
    results = []
    
    for candidate in candidates:
        # Construct prompt
        prompt = f"""
        Job Description:
        {job_description}
        
        Candidate Information:
        {json.dumps(candidate, indent=2)}
        
        Evaluate if this candidate is suitable for the position based on the job description.
        Provide a yes/no recommendation and brief explanation.
        """
        
        response = get_ollama_response(prompt, model)
        
        results.append({
            "candidate": candidate,
            "evaluation": response
        })
        
    return jsonify({"results": results})

# Advanced endpoint with self-prompting and LIME explanations
@app.route('/api/advanced_hiring', methods=['POST'])
def advanced_hiring():
    data = request.json
    
    if not data or 'job_description' not in data:
        return jsonify({"error": "Job description is required"}), 400
    
    job_description = data['job_description']
    model = data.get('model', DEFAULT_MODEL)
    
    # Load candidates
    candidates = load_candidates()
    if not candidates:
        return jsonify({"error": "No candidates found in CSV file"}), 404
    
    results = []
    
    for candidate in candidates:
        # Self-prompting to mitigate bias
        unbiased_prompt = f"""
        I need to make an unbiased hiring decision. I will use a multi-step process:
        
        Step 1: Let me identify and set aside potential sources of bias in hiring such as:
        - Age bias
        - Gender bias
        - Name-based bias
        - Cultural or ethnic bias
        
        Step 2: I will focus exclusively on relevant qualifications, skills, and experience:
        - Job-specific skills and technical abilities
        - Relevant education and certifications
        - Work experience and achievements
        - Problem-solving abilities
        
        Step 3: Now, given the job description and candidate information below, I will evaluate only the relevant qualifications:
        
        Job Description:
        {job_description}
        
        Candidate Information:
        {json.dumps(candidate, indent=2)}
        
        Step 4: I will provide a final recommendation with three components:
        1. A yes/no decision based only on relevant qualifications
        2. A confidence score from 0-100%
        3. A brief explanation referencing specific qualifications that match or don't match the job requirements
        
        Structure your response as:
        
        DECISION: [yes/no]
        CONFIDENCE: [0-100]%
        EXPLANATION: [Your explanation here]
        """
        
        response = get_ollama_response(unbiased_prompt, model)
        
        # Try to extract structured information from the response
        try:
            decision_match = re.search(r'DECISION:\s*(yes|no)', response, re.IGNORECASE)
            confidence_match = re.search(r'CONFIDENCE:\s*(\d+)', response, re.IGNORECASE)
            explanation_match = re.search(r'EXPLANATION:\s*(.*?)(?=$|\n\n)', response, re.IGNORECASE | re.DOTALL)
            
            decision = decision_match.group(1).lower() if decision_match else "unknown"
            confidence = int(confidence_match.group(1)) if confidence_match else 0
            explanation = explanation_match.group(1).strip() if explanation_match else response
            
            evaluation = {
                "decision": decision,
                "confidence": confidence,
                "explanation": explanation
            }
        except Exception as e:
            # If extraction fails, use the raw response
            evaluation = {
                "raw_response": response,
                "error": str(e)
            }
        
        # Generate LIME explanation
        lime_explainer = LimeTextExplainer(class_names=["Not Suitable", "Suitable"])
        
        # Function for LIME to predict probabilities - this is a simplified approximation
        def predict_proba(texts):
            results = []
            for text in texts:
                # Create a more concise prompt for LIME that returns a more structured response
                assessment_prompt = f"""
                Job Description: {job_description[:200]}...
                
                Candidate Information: {text}
                
                Rate how suitable this candidate is for the job on a scale of 0 to 1, where 0 is completely unsuitable and 1 is perfectly suitable.
                
                Respond with ONLY a single number between 0 and 1. Do not include any explanation or additional text.
                """
                
                response_text = get_ollama_response(assessment_prompt, model)
                
                # Try to extract a probability value
                prob_match = re.search(r'0\.\d+', response_text)
                if prob_match:
                    prob = float(prob_match.group(0))
                elif "1.0" in response_text or "1" == response_text.strip():
                    prob = 1.0
                elif "0.0" in response_text or "0" == response_text.strip():
                    prob = 0.0
                else:
                    # Default to middle value if no clear probability
                    prob = 0.5
                    
                results.append([1-prob, prob])  # [Not Suitable, Suitable]
            
            return np.array(results)
        
        # Create a concise candidate text for LIME analysis
        relevant_info = []
        if 'skills' in candidate:
            relevant_info.append(f"Skills: {candidate['skills']}")
        if 'experience' in candidate:
            relevant_info.append(f"Experience: {candidate['experience']}")
        if 'education' in candidate:
            relevant_info.append(f"Education: {candidate['education']}")
        if 'years_of_experience' in candidate:
            relevant_info.append(f"Years of experience: {candidate['years_of_experience']}")
            
        candidate_text = ". ".join(relevant_info)
        
        # Generate LIME explanation
        try:
            # Use fewer features and samples for efficiency
            exp = lime_explainer.explain_instance(
                candidate_text,
                predict_proba,
                num_features=4,
                num_samples=50  # Reduced for speed
            )
            
            # Extract features and their weights
            lime_explanation = []
            for feature, weight in exp.as_list():
                lime_explanation.append({
                    "feature": feature,
                    "importance": round(weight, 3),
                    "supports_hiring": weight > 0
                })
                
        except Exception as e:
            lime_explanation = [{"error": str(e)}]
        
        results.append({
            "candidate": candidate,
            "evaluation": evaluation,
            "lime_explanation": lime_explanation
        })
        
    return jsonify({"results": results})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
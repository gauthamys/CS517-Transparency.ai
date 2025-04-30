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
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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

# Function to identify and highlight matching phrases between explanation and candidate data
def highlight_matching_phrases(explanation, candidate):
    """
    Identifies and highlights words/phrases in the explanation that match the candidate description.
    Returns both the highlighted explanation and detailed match information.
    """
    # Create a lowercase version of the explanation for matching
    explanation_lower = explanation.lower()
    
    # Store all matches found
    all_matches = []
    
    # Collection of all candidate attributes for flat matching
    all_candidate_attributes = []
    
    # Key fields to check for matches
    key_fields = ['skills', 'experience', 'education', 'years_of_experience', 
                'job_title', 'certifications', 'achievements', 'languages', 
                'tools', 'projects', 'name', 'location']
    
    # Process each field in candidate data
    for field in key_fields:
        if field in candidate and candidate[field]:
            # Convert to string if it's not already
            attr_value = str(candidate[field])
            
            # Add to flat list of all attributes
            all_candidate_attributes.append(attr_value)
            
            # Extract meaningful keywords/phrases
            # First try comma/semicolon separated lists
            keywords = [kw.strip() for kw in re.split(r'[,;]', attr_value) if len(kw.strip()) > 2]
            
            # If no keywords found via separators, use the whole field
            if not keywords:
                keywords = [attr_value]
            
            # Check for each keyword in the explanation
            for keyword in keywords:
                keyword_lower = keyword.lower()
                
                # Skip very short or common words
                if len(keyword_lower) <= 2 or keyword_lower in ['and', 'the', 'has', 'with', 'for', 'are', 'not']:
                    continue
                
                # Check if keyword exists in explanation (case insensitive)
                if keyword_lower in explanation_lower:
                    # Find all occurrences
                    for match in re.finditer(re.escape(keyword_lower), explanation_lower):
                        start, end = match.span()
                        
                        all_matches.append({
                            "field": field,
                            "keyword": keyword,
                            "start_pos": start,
                            "end_pos": end
                        })
    
    # Combine text from all candidate fields for more thorough matching
    combined_text = " ".join(all_candidate_attributes).lower()
    
    # Look for longer phrases (3+ words) from candidate that might be in explanation
    phrases = re.findall(r'\b(\w+\s+\w+\s+\w+(\s+\w+)*)\b', combined_text)
    for phrase_tuple in phrases:
        phrase = phrase_tuple[0]
        if len(phrase) > 10:  # Only consider substantial phrases
            phrase_lower = phrase.lower()
            if phrase_lower in explanation_lower:
                for match in re.finditer(re.escape(phrase_lower), explanation_lower):
                    start, end = match.span()
                    all_matches.append({
                        "field": "multi_field_phrase",
                        "keyword": phrase,
                        "start_pos": start,
                        "end_pos": end
                    })
    
    # Sort matches by start position
    all_matches.sort(key=lambda x: x["start_pos"])
    
    # Create HTML-highlighted version of the explanation
    highlighted_explanation = explanation
    offset = 0  # Track offset from added HTML tags
    
    for match in all_matches:
        start_pos = match["start_pos"] + offset
        end_pos = match["end_pos"] + offset
        
        # Insert HTML highlighting
        highlight_start = f'<span style="background-color: #FFFF99;" title="{match["field"]}: {match["keyword"]}">'
        highlight_end = '</span>'
        
        # Insert tags
        highlighted_explanation = (
            highlighted_explanation[:start_pos] + 
            highlight_start + 
            highlighted_explanation[start_pos:end_pos] + 
            highlight_end + 
            highlighted_explanation[end_pos:]
        )
        
        # Update offset
        offset += len(highlight_start) + len(highlight_end)
    
    # Create a plain text version with markdown highlighting
    marked_explanation = explanation
    offset = 0
    
    for match in all_matches:
        start_pos = match["start_pos"] + offset
        end_pos = match["end_pos"] + offset
        
        # Insert markdown highlighting
        highlight_start = '**'
        highlight_end = '**'
        
        # Insert tags
        marked_explanation = (
            marked_explanation[:start_pos] + 
            highlight_start + 
            marked_explanation[start_pos:end_pos] + 
            highlight_end + 
            marked_explanation[end_pos:]
        )
        
        # Update offset
        offset += len(highlight_start) + len(highlight_end)
    
    return {
        "original_explanation": explanation,
        "highlighted_explanation_html": highlighted_explanation,
        "highlighted_explanation_markdown": marked_explanation,
        "matches": all_matches,
        "match_count": len(all_matches)
    }

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
        
        # Highlight matching phrases
        phrase_matches = highlight_matching_phrases(response, candidate)
        
        results.append({
            "candidate": candidate,
            "evaluation": response,
            "phrase_matches": phrase_matches
        })
        
    return jsonify({"results": results})

# Advanced endpoint with self-prompting, LIME explanations, and phrase matching
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
            
            # Apply phrase matching to explanation
            phrase_matches = highlight_matching_phrases(explanation, candidate)
            
            evaluation = {
                "decision": decision,
                "confidence": confidence,
                "explanation": explanation,
                "phrase_matches": phrase_matches
            }
            
            # Calculate relevance metrics
            matches_count = phrase_matches["match_count"]
            total_words = len(explanation.split())
            relevance_ratio = round(matches_count / max(total_words, 1) * 100, 2)
            
            # Add relevance metrics to the evaluation
            evaluation["relevance_metrics"] = {
                "matches_count": matches_count,
                "total_words": total_words,
                "relevance_ratio": relevance_ratio
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
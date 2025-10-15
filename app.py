import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai

# Load .env variables
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return "Grammar & Sentence Structure Checker API is running!"

@app.route("/correct", methods=["POST"])
def correct_text():
    data = request.json
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "No text provided"}), 400

    instruction = (
        "You are an expert grammar assistant. If the input sentence has any grammar or structure errors, rewrite it with perfect grammar. If it's fine, return the same sentence."
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=text,
            config=genai.types.GenerateContentConfig(system_instruction=instruction)
        )
        return jsonify({"corrected": response.text.strip()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

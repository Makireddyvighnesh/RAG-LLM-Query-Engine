import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from llama_index.core import Settings, VectorStoreIndex, SimpleDirectoryReader
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.replicate import Replicate
from transformers import AutoTokenizer

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Global variable to hold the index
index = None

# Function to initialize LLM and other settings
def initialize_llm():
    # Set the LLM
    llama2_7b_chat = "meta/llama-2-7b-chat:8e6975e5ed6174911a6ff3d60540dfd4844201974602551e10e9e87ab143d81e"
    Settings.llm = Replicate(
        model=llama2_7b_chat,
        temperature=0.01,
        additional_kwargs={"top_p": 1, "max_new_tokens": 300},
    )

    # Set tokenizer to match LLM
    Settings.tokenizer = AutoTokenizer.from_pretrained(
        "NousResearch/Llama-2-7b-chat-hf"
    )

    # Set the embed model
    Settings.embed_model = HuggingFaceEmbedding(
        model_name="BAAI/bge-small-en-v1.5"
    )

# Route to process the uploaded file
@app.route('/process_file', methods=['POST'])
def process_file():
    global index

    try:
        data = request.get_json()
        file_path = data.get('filePath')
        absolute_file_path = os.path.abspath(file_path)

        print(f"Received file path: {file_path}")  # Debug log
        print(f"Absolute file path: {absolute_file_path}")  # Debug log

        if not file_path or not os.path.exists(absolute_file_path):
            print("File path does not exist")  # Debug log
            return jsonify({"error": "Invalid file path"}), 400

        # Initialize the LLM and settings
        initialize_llm()

        # Load documents from the file path
        documents = SimpleDirectoryReader(input_files=[absolute_file_path]).load_data()

        # Create the index
        index = VectorStoreIndex.from_documents(documents)

        return jsonify({"message": "File processed successfully"}), 200

    except Exception as e:
        print(f"Exception: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500

# Route to handle the query
@app.route('/query', methods=['POST'])
def query_llm():
    global index

    try:
        if index is None:
            return jsonify({"error": "No file processed yet"}), 400

        data = request.get_json()
        query = data.get('query')

        if not query:
            return jsonify({"error": "Invalid query"}), 400

        # Create a query engine
        query_engine = index.as_query_engine()

        # Perform the query
        result = query_engine.query(query)
        print(result)

        # Serialize the result
        response = {
            "response": serialize_result(result)
        }

        return jsonify(response)

    except Exception as e:
        print(f"Exception: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500

def serialize_result(result):
    if isinstance(result, list):
        return [serialize_result(item) for item in result]
    elif hasattr(result, '__dict__'):
        return {key: serialize_result(value) for key, value in result.__dict__.items()}
    else:
        return str(result)

if __name__ == "__main__":
    app.run(port=5000, debug=False)  # Set debug=False to avoid automatic reloading

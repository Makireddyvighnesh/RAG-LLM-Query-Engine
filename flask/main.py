import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify

from llama_index.storage.docstore.mongodb import MongoDocumentStore
from llama_index.storage.index_store.mongodb import MongoIndexStore

from llama_index.core import Settings, VectorStoreIndex, SimpleDirectoryReader, StorageContext
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.replicate import Replicate
from transformers import AutoTokenizer
import pymongo
# from llama_index import SimpleMongoReader
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core import load_index_from_storage
# import lmql
import re

# Load environment variables from .env file
load_dotenv()
# MongoDB URI


mongo_uri="mongodb+srv://makireddyvighnesh:7eROawxrJ8odKnVU@cluster0.gb2dypq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
# os.environ['REPLICATE_API_TOKEN'] = 'r8_4E0QB2LxRJfGn8kL3XYoroyRd25LYGd3fPLbT' #r8_Bf2AqabLn3BY2SUJcov2Uk22032UQoD1Afz6x'
os.environ['REPLICATE_API_TOKEN'] = 'r8_S0eFonwbMvDVDrzsBg97vPPwDecgH8V0AnxX6'
# os.environ['REPLICATE_API_TOKEN'] = 'r8_YyzEYDSOcXR4twAAGIgei46MfucDSb21lVgJQ'

# Initialize Flask app
app = Flask(__name__)
index = None

# Initialize MongoDB client
mongodb_client = pymongo.MongoClient(mongo_uri)

# Function to initialize LLM and other settings
def initialize_llm():
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

    Settings.chink_size=100
    Settings.chunk_overlap=10

# Route to process the uploaded file
@app.route('/process_file', methods=['POST'])
def process_file():
    global index
    print("flask")
    try:
        data = request.get_json()
        file_path = data.get('filePath')
        db_name=data.get('dbName')
        print(file_path)
        absolute_file_path = os.path.abspath(file_path)

        # if not file_path or not os.path.exists(absolute_file_path):
        #     return jsonify({"error": "Invalid file path"}), 400

        # Initialize the LLM and settings
        initialize_llm()
        print("Initialized llms")

        documents = SimpleDirectoryReader(input_files=[absolute_file_path]).load_data()

        print("loaded documents")
        
        nodes = SentenceSplitter().get_nodes_from_documents(documents)
        print("text splitted into small nodes")

        pattern = r"([a-zA-Z0-9]+_db)"
        db_name = re.search(pattern,db_name).group(1)
        print(db_name)

        storage_context = StorageContext.from_defaults(
            docstore=MongoDocumentStore.from_uri(uri=mongo_uri, db_name=db_name),
            index_store=MongoIndexStore.from_uri(uri=mongo_uri, db_name=db_name),
        )

        storage_context.docstore.add_documents(nodes)
        index = VectorStoreIndex(nodes, storage_context=storage_context)
        return jsonify({"message": "File processed successfully", "dbName":db_name}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    
@app.route('/index', methods=['POST'])
def index_doc():
    global index
    try:
        initialize_llm()
        data = request.get_json()
        dbName = data.get('dbName')
        pattern = r"([a-zA-Z0-9]+_db)"
        dbName = re.search(pattern,dbName).group(1)
        print(dbName)
        print(mongo_uri)
        docstore = MongoDocumentStore.from_uri(uri=mongo_uri, db_name=dbName)
        print("loaded docs")
        nodes = list(docstore.docs.values())
        print("loaded nodes")
        index = VectorStoreIndex(nodes)
        print("indexed docs")
        return jsonify({"message": "Successfully indexed!"}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    

# @app.route('/llm/query/', methods=['POST'])
# def chat_llm():
#     pass
    
@app.route('/document/query', methods=['POST'])
def query_doc_llm():
    global index
    try:
        print("query: ")
        data = request.get_json()
        query = data.get('query')
        # collectionName=data.get('collectionName')
        dbName = data.get('dbName')
        print('Query ', query)

        # if not index:
        query_engine = index.as_query_engine()
        response = query_engine.query(query)
        print(response.response)
        # response.print_response_stream()
        response = {
            "response": serialize_result(response.response)#.response
        }
        print(response)
        print("response")

        return jsonify(response)
    
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/queryLLM', methods=['POST'])
def queryLLM():
    pass

def serialize_result(result):
    if isinstance(result, list):
        return [serialize_result(item) for item in result]
    elif hasattr(result, '__dict__'):
        return {key: serialize_result(value) for key, value in result.__dict__.items()}
    else:
        return str(result)

if __name__ == "__main__":
    app.run(port=5000, debug=False)

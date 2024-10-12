import os
from dotenv import load_dotenv

from flask import Flask, request, jsonify

from llama_index.storage.docstore.mongodb import MongoDocumentStore
from llama_index.storage.index_store.mongodb import MongoIndexStore
from llama_index.core import load_index_from_storage
from llama_index.core import Settings, VectorStoreIndex, SimpleDirectoryReader, StorageContext
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.replicate import Replicate

from transformers import AutoTokenizer
import pymongo
# from llama_index import SimpleMongoReader
from llama_index.core.node_parser import SentenceSplitter
# from llama_index.core import load_index_from_storage
# import lmql
from llama_index.llms.cleanlab import CleanlabTLM

import re

# Load environment variables from .env file
load_dotenv()
# MongoDB URI
print(os.getenv("PORT"))
from flask_cors import CORS
import json

mongo_uri= os.getenv('MONGO_ATLAS_URI')
print(mongo_uri)
os.environ['REPLICATE_API_TOKEN'] = os.getenv('REPLICATE_API_TOKEN')
# tlm = CleanlabTLM(api_key="b8b3002708b64d7d8d618fe73a091f46")



# Initialize Flask app
app = Flask(__name__)
index = None
CORS(app)
# Initialize MongoDB client
mongodb_client = pymongo.MongoClient(mongo_uri)


from typing import Dict, List, ClassVar
from llama_index.core.instrumentation.events import BaseEvent
from llama_index.core.instrumentation.event_handlers import BaseEventHandler
from llama_index.core.instrumentation import get_dispatcher
from llama_index.core.instrumentation.events.llm import LLMCompletionEndEvent


class GetTrustworthinessScore(BaseEventHandler):
    events: ClassVar[List[BaseEvent]] = []
    trustworthiness_score: float = 0.0

    @classmethod
    def class_name(cls) -> str:
        """Class name."""
        return "GetTrustworthinessScore"

    def handle(self, event: BaseEvent) -> Dict:
        if isinstance(event, LLMCompletionEndEvent):
            self.trustworthiness_score = event.response.additional_kwargs[
                "trustworthiness_score"
            ]
            self.events.append(event)


# Root dispatcher
root_dispatcher = get_dispatcher()

# Register event handler
event_handler = GetTrustworthinessScore()
root_dispatcher.add_event_handler(event_handler)

# Function to initialize LLM and other settings
def initialize_llm():
    
    llama2_7b_chat = "meta/llama-2-7b-chat:8e6975e5ed6174911a6ff3d60540dfd4844201974602551e10e9e87ab143d81e"
    options = {
        "model": 'gpt-4',
        "max_tokens": 128,
    }
    llm = CleanlabTLM(api_key="b8b3002708b64d7d8d618fe73a091f46", options=options)

    Settings.llm = llm

    # Settings.llm = Replicate(
    #     model=llama2_7b_chat,
    #     temperature=0.01,
    #     additional_kwargs={"top_p": 1,"max_new_tokens": 1000},
    # )

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
        print("Loading Indexes ")
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

        # storage_context = StorageContext.from_defaults(
        #     docstore=MongoDocumentStore.from_uri(uri=mongo_uri, db_name=dbName),
        #     index_store=MongoIndexStore.from_uri(uri=mongo_uri, db_name=dbName),
        # )

        # index = load_index_from_storage(storage_context=storage_context)
        
        print("indexed docs", index)
        return jsonify({"message": "Successfully indexed!"}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    

# @app.route('/llm/query/', methods=['POST'])
# def chat_llm():
#     pass

# Optional: Define `display_response` helper function


# This method presents formatted responses from our TLM-based RAG pipeline. It parses the output to display both the text response itself and the corresponding trustworthiness score.
def display_response(response):
    response_str = response.response
    trustworthiness_score = event_handler.trustworthiness_score
    print(f"Response: {response_str}")
    print(f"Trustworthiness score: {round(trustworthiness_score, 2)}")
    return response_str, trustworthiness_score
    
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
       
        response_str, trustworthiness_score = display_response(response)

        return jsonify(response_str)
    
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




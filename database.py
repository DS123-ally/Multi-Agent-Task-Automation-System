from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import ServerSelectionTimeoutError
from datetime import datetime
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env", override=True)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = "multi_agent_db"
COLLECTION_NAME = "tasks"

class MongoDatabase:
    def __init__(self):
        self.client = None
        self.db = None
        self.collection = None
    
    def connect(self):
        """Initialize MongoDB connection"""
        try:
            self.client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
            # Verify connection
            self.client.admin.command('ping')
            self.db = self.client[DB_NAME]
            self.collection = self.db[COLLECTION_NAME]
            print(f"Connected to MongoDB: {MONGODB_URL}")
        except ServerSelectionTimeoutError as e:
            print(f"Failed to connect to MongoDB: {e}")
            print(f"Make sure MongoDB is running at {MONGODB_URL}")
            raise
    
    def disconnect(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")
    
    def save_task(self, task_data: Dict[str, Any]) -> str:
        """Save task execution to MongoDB"""
        task_data["timestamp"] = datetime.utcnow()
        result = self.collection.insert_one(task_data)
        return str(result.inserted_id)
    
    def get_task(self, task_id: str) -> Dict[str, Any]:
        """Retrieve a single task by ID"""
        from bson.objectid import ObjectId
        try:
            task = self.collection.find_one({"_id": ObjectId(task_id)})
            if task:
                task["id"] = str(task["_id"])
                del task["_id"]
            return task
        except Exception as e:
            print(f"Error retrieving task: {e}")
            return None
    
    def get_history(self, skip: int = 0, limit: int = 50) -> tuple[List[Dict[str, Any]], int]:
        """Retrieve task history with pagination"""
        total = self.collection.count_documents({})
        tasks = list(self.collection.find({}).sort("timestamp", -1).skip(skip).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for task in tasks:
            task["id"] = str(task["_id"])
            del task["_id"]
        
        return tasks, total
    
    def delete_task(self, task_id: str) -> bool:
        """Delete a task by ID"""
        from bson.objectid import ObjectId
        try:
            result = self.collection.delete_one({"_id": ObjectId(task_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting task: {e}")
            return False
    
    def clear_history(self) -> int:
        """Clear all tasks from history"""
        result = self.collection.delete_many({})
        return result.deleted_count


# Global database instance
db = MongoDatabase()

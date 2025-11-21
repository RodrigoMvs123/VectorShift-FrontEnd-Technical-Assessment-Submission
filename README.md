# VectorShift Pipeline Builder

A modern, drag-and-drop node editor built with **React Flow** for designing, abstracting, and analyzing logic pipelines.

## 🚀 Features

- **Visual Editor**: Intuitive drag-and-drop interface for building complex workflows.
- **Dynamic Nodes**:
  - **Text Node**: Automatically resizes and creates handles for variables defined in `{{ double_curly_braces }}`.
  - **Logic Nodes**: Conditionals, Loops (simulated), and Delays.
  - **Integration Nodes**: API calls, Database queries, and LLM connectors.
- **Pipeline Analysis**:
  - Calculates the number of nodes and edges.
  - Verifies if the pipeline is a **Directed Acyclic Graph (DAG)**.
- **Robust Architecture**:
  - Separation of concerns between UI (React) and Logic (Python).
  - Fallback simulation mode for frontend-only testing.

---

## 🛠️ Installation & Setup

To run the full application with the real Python analysis backend, follow these steps:

### 1. Backend Setup (Python / FastAPI)

The backend processes the graph structure to check for cycles (DAG property).

```bash
# Navigate to backend folder
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# Mac/Linux:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```
The server will start at `http://127.0.0.1:8000`.

### 2. Frontend Setup (React)

```bash
# Install dependencies
npm install

# Start the development server
npm start
```
The application will open at `http://localhost:3000`.

---

## 📦 Project Structure

- **`/src`**: Frontend source code.
  - **`components/nodes`**: Custom node definitions (Text, LLM, API, etc.).
  - **`services`**: API integration logic.
  - **`App.tsx`**: Main editor canvas and layout.
- **`/backend`**: Python backend.
  - **`main.py`**: FastAPI application and graph processing logic.

## 🧪 How to Test

1. **Add Nodes**: Use the dropdown in the top-right or the "Add Component" selector to add nodes like "Input", "LLM", or "Text".
2. **Connect Nodes**: Drag connections between the handles (dots) on the sides of the nodes.
3. **Use Variables**: In a "Text Node", type `{{myVar}}` to dynamically create a new input handle for that variable.
4. **Run Pipeline**: Click the **"Run Pipeline"** button in the header.
   - If the backend is running, it processes the graph.
   - If the backend is off, the frontend simulates the result (useful for demos).

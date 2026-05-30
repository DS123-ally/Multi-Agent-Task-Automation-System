# Use an official lightweight Python image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Render dynamically assigns a port via the $PORT environment variable.
# We set a default of 8000 for local testing, but use the dynamic $PORT in the start command.
ENV PORT=8000
EXPOSE $PORT

# Start the FastAPI application using Uvicorn
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]

FROM python:3.12

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    git \
    wget \
    libhdf5-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

# Use CMD to run the commands instead of entrypoint
CMD bash -c "python manage.py makemigrations && python manage.py migrate && gunicorn app.wsgi:application --bind 0.0.0.0:8000"

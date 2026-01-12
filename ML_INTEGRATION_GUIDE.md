# AI/ML Model Integration Guide

## 📋 For Machine Learning Engineers

This guide explains how to integrate your AI/ML models with the recruitment platform to provide intelligent resume screening and candidate matching capabilities.

---

## 🎯 Overview

### What You Need to Build

Your ML model should provide **4 main capabilities**:

1. **Resume Analysis** - Extract skills, experience, education from resumes
2. **Candidate-Job Matching** - Score how well candidates match job requirements
3. **Job Recommendations** - Rank candidates for a specific job
4. **Bulk Analysis** - Analyze multiple applications efficiently

### Integration Architecture

```
Frontend (React)
     ↓ HTTP Request
Backend (Django REST API)
     ↓ HTTP Request / Function Call
Your AI/ML Service
     ↓ Response
Backend processes result
     ↓ JSON Response
Frontend displays results
```

---

## 🔌 Integration Options

### Option 1: REST API Microservice (Recommended)

**Best for**: Separate ML service, scalability, language flexibility

**Architecture**:
```
Django Backend ←→ Your ML API Service (Flask/FastAPI)
```

**Pros**:
- Use any language (Python, Go, etc.)
- Independent scaling
- Easy deployment (Docker, K8s)
- Technology flexibility

**Cons**:
- Additional infrastructure
- Network latency

### Option 2: Django App Integration

**Best for**: Simple deployment, same language stack

**Architecture**:
```
Django Backend → AI Module (Python package)
```

**Pros**:
- Single deployment unit
- No network overhead
- Simpler architecture

**Cons**:
- Must use Python
- Harder to scale ML separately
- Can slow down API if model is heavy

### Option 3: Celery Background Tasks

**Best for**: Long-running ML processes, async analysis

**Architecture**:
```
Django API → Celery Task Queue → ML Worker
```

**Pros**:
- Non-blocking API responses
- Great for bulk analysis
- Scalable workers

**Cons**:
- Requires Redis/RabbitMQ
- More complex setup
- Results need polling or webhooks

---

## 📡 Required API Endpoints

### 1. Analyze Resume

**Endpoint**: `POST /api/v1/ai/analyze-resume/`

**Purpose**: Extract structured data from uploaded resume

**Request**:
```http
POST /api/v1/ai/analyze-resume/
Content-Type: multipart/form-data

resume: [PDF/DOC/DOCX File]
```

**Response**:
```json
{
  "skills": [
    "Python",
    "Django",
    "Machine Learning",
    "PostgreSQL",
    "AWS"
  ],
  "experience_years": 5,
  "education": [
    {
      "degree": "Bachelor of Science",
      "major": "Computer Science",
      "institution": "University Name",
      "year": 2018
    }
  ],
  "certifications": [
    "AWS Certified Developer",
    "Google Cloud Professional"
  ],
  "strengths": [
    "Strong backend development skills",
    "Excellent problem-solving abilities",
    "5+ years of Python experience"
  ],
  "weaknesses": [
    "Limited cloud infrastructure experience",
    "No mention of mobile development",
    "Lacks leadership roles"
  ],
  "summary": "Experienced full-stack developer with strong Python and Django skills. Well-suited for senior backend roles.",
  "recommendation": "Strong candidate for senior backend positions"
}
```

**Technical Requirements**:
- Accept file formats: PDF, DOC, DOCX
- Maximum file size: 5MB
- Response time: < 5 seconds
- Extract text from files (PDF parsing, OCR if needed)
- Use NLP for skill extraction
- Identify experience duration
- Parse education section

---

### 2. Match Candidate to Job

**Endpoint**: `POST /api/v1/ai/match-candidate/<application_id>/`

**Purpose**: Score compatibility between candidate and job

**Request**:
```http
POST /api/v1/ai/match-candidate/123/
Content-Type: application/json
```

**Backend Process**:
1. Fetch application ID 123
2. Get candidate resume data
3. Get job requirements
4. Send both to ML model
5. Return matching score

**Response**:
```json
{
  "match_score": 85,
  "confidence": "high",
  "matched_skills": [
    "Python",
    "Django", 
    "PostgreSQL"
  ],
  "missing_skills": [
    "AWS",
    "Docker",
    "Kubernetes"
  ],
  "experience_match": {
    "required_years": 3,
    "candidate_years": 5,
    "verdict": "exceeds"
  },
  "education_match": {
    "required": "Bachelor's degree",
    "candidate": "Bachelor of Science in CS",
    "verdict": "matches"
  },
  "strengths": [
    "Exceeds experience requirements by 2 years",
    "Strong technical skill match (75%)",
    "Relevant education background"
  ],
  "weaknesses": [
    "Missing cloud deployment skills",
    "No container orchestration experience"
  ],
  "recommendation": "Strong match - Recommend for interview",
  "next_steps": "Schedule technical interview focusing on cloud skills",
  "score_breakdown": {
    "skills": 75,
    "experience": 95,
    "education": 90,
    "overall": 85
  }
}
```

**Scoring Algorithm**:
```python
def calculate_match_score(candidate, job):
    # Skills matching (40% weight)
    skill_match = len(matched_skills) / len(required_skills) * 100
    skills_score = skill_match * 0.4
    
    # Experience matching (30% weight)
    exp_score = min(candidate_years / required_years, 1.5) * 100
    experience_score = exp_score * 0.3
    
    # Education matching (20% weight)
    edu_score = education_match_score * 0.2
    
    # Other factors (10% weight)
    other_score = certifications_score * 0.1
    
    final_score = skills_score + experience_score + edu_score + other_score
    return round(final_score)
```

---

### 3. Get Job Recommendations

**Endpoint**: `GET /api/v1/ai/job-recommendations/<job_id>/`

**Purpose**: Rank all candidates for a job position

**Request**:
```http
GET /api/v1/ai/job-recommendations/456/
```

**Response**:
```json
{
  "job_id": 456,
  "job_title": "Senior Backend Developer",
  "total_applications": 50,
  "analyzed_count": 50,
  "top_candidates": [
    {
      "application_id": 123,
      "candidate_id": 789,
      "candidate_name": "John Doe",
      "match_score": 92,
      "rank": 1,
      "key_strengths": [
        "10+ years Python experience",
        "Django expert",
        "Proven leadership"
      ],
      "status": "submitted",
      "resume_url": "/media/resumes/john_doe.pdf"
    },
    {
      "application_id": 124,
      "candidate_id": 790,
      "candidate_name": "Jane Smith",
      "match_score": 88,
      "rank": 2,
      "key_strengths": [
        "Strong cloud skills",
        "Full-stack experience",
        "Great culture fit"
      ],
      "status": "under_review",
      "resume_url": "/media/resumes/jane_smith.pdf"
    }
  ],
  "statistics": {
    "average_score": 67,
    "median_score": 65,
    "highly_qualified": 5,
    "qualified": 15,
    "somewhat_qualified": 20,
    "not_qualified": 10
  },
  "recommendations": {
    "interview_immediately": 5,
    "review_further": 10,
    "reject": 35
  }
}
```

---

### 4. Bulk Analyze Applications

**Endpoint**: `POST /api/v1/ai/bulk-analyze/<job_id>/`

**Purpose**: Analyze all applications for a job at once

**Request**:
```http
POST /api/v1/ai/bulk-analyze/456/
Content-Type: application/json

{
  "analyze_all": true,
  "reanalyze": false  // Skip already analyzed
}
```

**Response** (if sync):
```json
{
  "job_id": 456,
  "analyzed_count": 50,
  "status": "completed",
  "processing_time": "45 seconds",
  "results": [
    {
      "application_id": 123,
      "match_score": 92,
      "recommendation": "Strong hire - Interview ASAP"
    }
  ],
  "summary": {
    "top_5_candidates": [...],
    "average_match_score": 67,
    "distribution": {
      "90-100": 5,
      "80-89": 10,
      "70-79": 15,
      "60-69": 12,
      "below_60": 8
    }
  }
}
```

**Response** (if async):
```json
{
  "task_id": "abc-123-def",
  "status": "processing",
  "message": "Analysis in progress. Use task_id to check status",
  "poll_url": "/api/v1/ai/task-status/abc-123-def/",
  "estimated_time": "60 seconds"
}
```

---

## 🛠️ Implementation Guide

### Option 1: Flask/FastAPI Microservice

#### Step 1: Create ML Service

**File: `ml_service/app.py`**
```python
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import your_ml_model

app = FastAPI()

# Load your trained model
model = your_ml_model.load_model('path/to/model')

@app.post("/api/v1/ai/analyze-resume/")
async def analyze_resume(resume: UploadFile = File(...)):
    # Extract text from file
    text = extract_text_from_file(resume.file)
    
    # Run ML analysis
    skills = model.extract_skills(text)
    experience = model.extract_experience(text)
    education = model.parse_education(text)
    
    return {
        "skills": skills,
        "experience_years": experience,
        "education": education,
        "strengths": generate_strengths(skills, experience),
        "weaknesses": identify_gaps(skills),
        "recommendation": generate_recommendation(skills, experience)
    }

@app.post("/api/v1/ai/match-candidate/{application_id}/")
async def match_candidate(application_id: int):
    # Fetch application data from Django
    application_data = fetch_from_django(application_id)
    
    # Run matching algorithm
    score = model.calculate_match(
        candidate_skills=application_data['skills'],
        job_requirements=application_data['job']['requirements']
    )
    
    return {
        "match_score": score,
        "matched_skills": [...],
        "missing_skills": [...],
        "recommendation": generate_recommendation(score)
    }
```

#### Step 2: Deploy ML Service

**Docker**:
```dockerfile
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Run**:
```bash
docker build -t ml-service .
docker run -p 8001:8001 ml-service
```

#### Step 3: Connect Django to ML Service

**File: `recruitment_platform/ai_integration.py`**
```python
import requests
from django.conf import settings

ML_SERVICE_URL = settings.ML_SERVICE_URL  # http://localhost:8001

def analyze_resume(resume_file):
    """Call ML service to analyze resume"""
    files = {'resume': resume_file}
    response = requests.post(
        f"{ML_SERVICE_URL}/api/v1/ai/analyze-resume/",
        files=files,
        timeout=30
    )
    return response.json()

def match_candidate(application_id):
    """Call ML service to match candidate to job"""
    response = requests.post(
        f"{ML_SERVICE_URL}/api/v1/ai/match-candidate/{application_id}/",
        timeout=10
    )
    return response.json()
```

#### Step 4: Create Django Views

**File: `applications/ai_views.py`**
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import JobSeekerApplication
from recruitment_platform.ai_integration import analyze_resume, match_candidate

@api_view(['POST'])
def ai_analyze_resume(request):
    resume_file = request.FILES.get('resume')
    if not resume_file:
        return Response({'error': 'No resume provided'}, status=400)
    
    try:
        result = analyze_resume(resume_file)
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def ai_match_candidate(request, application_id):
    try:
        # Verify application exists
        application = JobSeekerApplication.objects.get(id=application_id)
        
        # Call ML service
        result = match_candidate(application_id)
        
        return Response(result)
    except JobSeekerApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
```

#### Step 5: Add URLs

**File: `applications/urls.py`**
```python
from django.urls import path
from . import ai_views

urlpatterns = [
    # ... existing routes ...
    
    # AI endpoints
    path('ai/analyze-resume/', ai_views.ai_analyze_resume),
    path('ai/match-candidate/<int:application_id>/', ai_views.ai_match_candidate),
    path('ai/job-recommendations/<int:job_id>/', ai_views.ai_job_recommendations),
    path('ai/bulk-analyze/<int:job_id>/', ai_views.ai_bulk_analyze),
]
```

---

### Option 2: Django App Integration

#### Step 1: Create AI App

```bash
cd recruitment_platform
python manage.py startapp ai_analyzer
```

#### Step 2: Add Your ML Model

**File: `ai_analyzer/model.py`**
```python
import spacy
from transformers import pipeline
import pickle

class ResumeAnalyzer:
    def __init__(self):
        # Load your trained model
        self.nlp = spacy.load("en_core_web_lg")
        self.skill_extractor = self.load_skill_model()
    
    def analyze(self, resume_text):
        """Analyze resume and extract information"""
        doc = self.nlp(resume_text)
        
        skills = self.extract_skills(doc)
        experience = self.extract_experience(doc)
        education = self.parse_education(doc)
        
        return {
            'skills': skills,
            'experience_years': experience,
            'education': education
        }
    
    def extract_skills(self, doc):
        # Your skill extraction logic
        skills = []
        for ent in doc.ents:
            if ent.label_ == "SKILL":
                skills.append(ent.text)
        return skills
    
    def calculate_match(self, candidate_data, job_requirements):
        """Calculate match score between candidate and job"""
        # Your matching algorithm
        score = 0
        # ... your logic ...
        return score
```

#### Step 3: Create Views

**File: `ai_analyzer/views.py`**
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .model import ResumeAnalyzer
from .utils import extract_text_from_pdf

# Initialize model once
analyzer = ResumeAnalyzer()

@api_view(['POST'])
def analyze_resume(request):
    resume_file = request.FILES.get('resume')
    
    # Extract text
    text = extract_text_from_pdf(resume_file)
    
    # Analyze
    result = analyzer.analyze(text)
    
    return Response(result)
```

---

## 📦 Required Python Packages

### For Resume Analysis

```txt
# Text extraction
PyPDF2==3.0.1
python-docx==1.1.0
pdfplumber==0.10.3

# NLP
spacy==3.7.2
en-core-web-lg @ https://github.com/explosion/spacy-models/releases/download/en_core_web_lg-3.7.0/en_core_web_lg-3.7.0-py3-none-any.whl

# Skill extraction
skillNer==1.0.2

# ML models (choose based on your needs)
transformers==4.36.2
torch==2.1.2
scikit-learn==1.3.2

# Web framework (if microservice)
fastapi==0.109.0
uvicorn==0.26.0
```

### Installation

```bash
pip install -r ml_requirements.txt
python -m spacy download en_core_web_lg
```

---

## 🧪 Testing Your Integration

### 1. Test Resume Analysis

```bash
curl -X POST http://localhost:8001/api/v1/ai/analyze-resume/ \
  -F "resume=@sample_resume.pdf"
```

**Expected Response**:
```json
{
  "skills": ["Python", "Django", "React"],
  "experience_years": 5,
  ...
}
```

### 2. Test Candidate Matching

```bash
curl -X POST http://localhost:8000/access/ai/match-candidate/123/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test from Frontend

```javascript
// In browser console
const formData = new FormData();
formData.append('resume', fileInput.files[0]);

fetch('http://localhost:8000/access/ai/analyze-resume/', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 🚀 Deployment Options

### Option A: Separate ML Service (Recommended)

**Infrastructure**:
```
- Django Backend: Render/Railway/Heroku
- ML Service: Docker container on:
  - Google Cloud Run
  - AWS ECS/Fargate
  - DigitalOcean App Platform
  - Azure Container Instances
```

**Benefits**:
- Independent scaling
- Use GPU instances for ML
- Technology flexibility

### Option B: Combined Deployment

**Infrastructure**:
```
- Single server with both Django + ML
- Heroku/Render with Python buildpack
- Add ML dependencies to requirements.txt
```

**Benefits**:
- Simpler deployment
- Lower cost for small scale
- Single deployment pipeline

### Option C: Serverless

**Infrastructure**:
```
- Django on server
- ML functions on:
  - AWS Lambda
  - Google Cloud Functions
  - Azure Functions
```

**Benefits**:
- Pay per use
- Auto-scaling
- No server management

---

## 💡 Best Practices

### 1. Caching

Cache expensive AI computations:

```python
from django.core.cache import cache

def analyze_resume_cached(application_id):
    cache_key = f'ai_analysis_{application_id}'
    
    # Check cache
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    # Compute if not cached
    result = analyze_resume(application_id)
    
    # Cache for 1 hour
    cache.set(cache_key, result, 3600)
    
    return result
```

### 2. Async Processing

For bulk operations:

```python
from celery import shared_task

@shared_task
def analyze_all_applications(job_id):
    applications = JobSeekerApplication.objects.filter(job_id=job_id)
    
    for app in applications:
        result = analyzer.analyze(app.resume)
        # Save result to database
        app.ai_score = result['match_score']
        app.save()
```

### 3. Error Handling

```python
def safe_ai_call(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except requests.exceptions.Timeout:
            return {'error': 'AI service timeout'}
        except requests.exceptions.ConnectionError:
            return {'error': 'AI service unavailable'}
        except Exception as e:
            logger.error(f"AI error: {e}")
            return {'error': 'AI analysis failed'}
    return wrapper
```

### 4. Monitoring

```python
import time
import logging

def log_ai_performance(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start
        
        logging.info(f"AI call: {func.__name__} took {duration:.2f}s")
        return result
    return wrapper
```

---

## 📝 Integration Checklist

- [ ] Choose integration option (microservice/django app/serverless)
- [ ] Set up ML model/service
- [ ] Implement 4 required endpoints
- [ ] Test each endpoint individually
- [ ] Add error handling
- [ ] Implement caching strategy
- [ ] Set up monitoring/logging
- [ ] Test with frontend
- [ ] Deploy ML service
- [ ] Configure environment variables
- [ ] Load test
- [ ] Document API contract
- [ ] Train team on maintenance

---

## 🔗 Additional Resources

- [Existing AI Integration Doc](file:///home/enock/recruitment_platform/AI_ANALYZER_INTEGRATION.md)
- [API Endpoints Doc](file:///home/enock/recruitment_platform/API_ENDPOINTS.md)
- Django REST Framework: https://www.django-rest-framework.org/
- FastAPI: https://fastapi.tiangolo.com/
- spaCy: https://spacy.io/

---

## 📞 Support

If you need help with integration:
1. Check Swagger docs: `http://localhost:8000/swagger/`
2. Test endpoints with Postman
3. Review error logs
4. Verify model output format

The frontend is ready and waiting for your ML service! Good luck! 🚀

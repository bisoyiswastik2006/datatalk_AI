import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import ElasticNet
from sklearn.metrics import (
    r2_score,
    mean_squared_error,
    mean_absolute_error
)

from xgboost import XGBRegressor
from statsmodels.tsa.arima.model import ARIMA
import re
import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from pwdlib import PasswordHash
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from datetime import datetime, timedelta, timezone

from services.dataset_service import load_dataset
from services.schema_reader import get_table_schema
from services.preview_service import get_table_preview
from services.datatalk_engine import ask_datatalk
from sqlalchemy import inspect, text
from database import engine
import pandas as pd

# --------------------------------------------------
# FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="DataTalk AI Backend",
    description="Ask questions about your uploaded datasets using AI.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# DATASET REGISTRY
# --------------------------------------------------

datasets = {}
PREDEFINED_DATASETS = {
    "dataset-retail-01": {
        "id": "dataset-retail-01",
        "name": "sales_orders.csv",
        "format": "csv",
        "size_bytes": 0,
        "status": "ready",
        "tables": ["sales_orders"],
        "total_rows": 8,
        "total_columns": 8,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "table_name": "sales_orders"
    }
}
# --------------------------------------------------
# AUTHENTICATION CONFIGURATION
# --------------------------------------------------

password_hash = PasswordHash.recommended()

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing from backend .env file.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

security = HTTPBearer()
# --------------------------------------------------
# CREATE USERS TABLE IN MYSQL
# --------------------------------------------------

def ensure_users_table():

    create_table_query = text("""
        CREATE TABLE IF NOT EXISTS users (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(30) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    with engine.begin() as connection:
        connection.execute(create_table_query)


@app.on_event("startup")
def initialize_authentication():
    ensure_users_table()

    # Register predefined datasets
    datasets.update(PREDEFINED_DATASETS)

# --------------------------------------------------
# QUERY REQUEST MODEL
# --------------------------------------------------

class QueryRequest(BaseModel):
    dataset_id: str
    question: str
# --------------------------------------------------
# AUTHENTICATION REQUEST MODELS
# --------------------------------------------------

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str
class InsightsRequest(BaseModel):
    dataset_id: str
class WhatIfRequest(BaseModel):
    dataset_id: str
    price_change: float
    discount_cap: float
    ad_spend: float
    churn_delta: float
class PredictiveRequest(BaseModel):
    dataset_id: str
    model: str
    features: list[str]

# --------------------------------------------------
# USER REGISTRATION API
# --------------------------------------------------

@app.post("/auth/register")
def register_user(request: RegisterRequest):

    name = request.name.strip()
    email = request.email.strip().lower()
    password = request.password

    # Validate input
    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required."
        )

    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid email address."
        )

    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters."
        )

    # Check whether email already exists
    with engine.connect() as connection:

        existing_user = connection.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": email}
        ).fetchone()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists."
        )

    # Securely hash password
    hashed_password = password_hash.hash(password)

    # Insert user into MySQL
    with engine.begin() as connection:

        result = connection.execute(
            text("""
                INSERT INTO users (name, email, password_hash, role)
                VALUES (:name, :email, :password_hash, :role)
            """),
            {
                "name": name,
                "email": email,
                "password_hash": hashed_password,
                "role": "user"
            }
        )

        user_id = result.lastrowid
    access_token = create_access_token(user_id)
    return {
    "success": True,
    "message": "Account created successfully!",
    "access_token": access_token,
    "token_type": "bearer",
    "user": {
        "id": user_id,
        "name": name,
        "email": email,
        "role": "user"
    }
}
# --------------------------------------------------
# JWT ACCESS TOKEN
# --------------------------------------------------

def create_access_token(user_id: int):

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token."
        )

    with engine.connect() as connection:
        user = connection.execute(
            text("""
                SELECT id, name, email, role
                FROM users
                WHERE id = :user_id
            """),
            {"user_id": int(user_id)}
        ).mappings().first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found."
        )

    return dict(user)
# --------------------------------------------------
# USER LOGIN API
# --------------------------------------------------

@app.post("/auth/login")
def login_user(request: LoginRequest):

    email = request.email.strip().lower()
    password = request.password

    # Find user in MySQL
    with engine.connect() as connection:

        user = connection.execute(
            text("""
                SELECT id, name, email, password_hash, role
                FROM users
                WHERE email = :email
            """),
            {"email": email}
        ).fetchone()

    # Check user existence
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    user = user._mapping

    # Verify password
    if not password_hash.verify(password, user["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    # Generate JWT token
    access_token = create_access_token(user["id"])

    return {
        "success": True,
        "message": "Login successful!",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "success": True,
        "message": "Welcome to DataTalk AI Backend!"
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "DataTalk AI backend is running."
    }


# --------------------------------------------------
# CREATE SAFE MYSQL TABLE NAME
# --------------------------------------------------

def create_table_name(filename: str) -> str:

    name = filename.rsplit(".", 1)[0].lower()

    name = re.sub(r"[^a-z0-9_]", "_", name)

    name = re.sub(r"_+", "_", name)

    name = name.strip("_")

    if not name:
        name = "dataset"

    if name[0].isdigit():
        name = f"dataset_{name}"

    return name[:60]


# --------------------------------------------------
# GET DATASET OR RETURN 404
# --------------------------------------------------

def get_dataset_or_404(dataset_id: str):

    dataset = datasets.get(dataset_id)

    if not dataset:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found. Please upload the dataset again."
        )

    return dataset


# --------------------------------------------------
# UPLOAD DATASET
# --------------------------------------------------

@app.post("/datasets")
async def upload_dataset(file: UploadFile = File(...)):


    filename = file.filename or ""

    if not filename:
        raise HTTPException(
            status_code=400,
            detail="Please select a file."
        )

    file_format = filename.rsplit(".", 1)[-1].lower()

    if file_format not in ["csv", "xlsx"]:
        raise HTTPException(
            status_code=400,
            detail="Only CSV and XLSX files are supported."
        )

    file_content = await file.read()

    if not file_content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    table_name = create_table_name(filename)
   
    # Prevent duplicate filenames
    for existing_dataset in datasets.values():
        if existing_dataset.get("name", "").strip().lower() == filename.strip().lower():
            raise HTTPException(
                status_code=409,
                detail=f"A dataset named '{filename}' already exists. Please choose another file."
            )

    try:



        inspector = inspect(engine)

        # CASE 1: Table already exists in MySQL
        if inspector.has_table(table_name):

            with engine.connect() as connection:
                total_rows = connection.execute(
                    text(f"SELECT COUNT(*) FROM `{table_name}`")
                ).scalar_one()

            columns = inspector.get_columns(table_name)
            total_columns = len(columns)

            print(f"Existing MySQL table registered: {table_name}")

        # CASE 2: New table - import dataset
        else:
            await file.seek(0)

            result = load_dataset(file, table_name)

            if not result.get("success"):
                raise HTTPException(
                    status_code=400,
                    detail=result.get("message", "Dataset import failed.")
                )

            total_rows = result["rows"]
            total_columns = result["columns"]

        # Register dataset in memory
        dataset_id = str(uuid.uuid4())

        datasets[dataset_id] = {
            "id": dataset_id,
            "name": filename,
            "format": file_format,
            "size_bytes": len(file_content),
            "status": "ready",
            "tables": [table_name],
            "total_rows": total_rows,
            "total_columns": total_columns,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "table_name": table_name
        }

        return {
            "dataset_id": dataset_id,
            "status": "ready",
            "message": "Dataset registered successfully.",
            "rows": total_rows,
            "columns": total_columns
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Dataset registration failed: {str(error)}"
        )
# --------------------------------------------------
# GET ALL DATASETS
# --------------------------------------------------

@app.get("/datasets")
def get_datasets():

    result = []

    for dataset in datasets.values():

        public_dataset = {
            key: value
            for key, value in dataset.items()
            if key != "table_name"
        }

        result.append(public_dataset)

    return result

@app.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: str):
    dataset = get_dataset_or_404(dataset_id)

    # Protect predefined datasets
    if dataset_id in PREDEFINED_DATASETS:
        raise HTTPException(
            status_code=403,
            detail="Predefined datasets cannot be deleted."
        )

    table_name = dataset.get("table_name")
    
    # Remove the dataset from the backend registry
    datasets.pop(dataset_id, None)

    # Drop its MySQL table if no other dataset uses it
    if table_name:
        table_is_shared = any(
            item.get("table_name") == table_name
            for item in datasets.values()
        )

        if not table_is_shared:
            with engine.begin() as connection:
                connection.execute(
                    text(f"DROP TABLE IF EXISTS `{table_name}`")
                )

    return {
        "success": True,
        "message": "Dataset deleted successfully."
    }
# --------------------------------------------------
# GET ONE DATASET
# --------------------------------------------------

@app.get("/datasets/{dataset_id}")
def get_dataset(dataset_id: str):

    dataset = get_dataset_or_404(dataset_id)

    return {
        key: value
        for key, value in dataset.items()
        if key != "table_name"
    }


# --------------------------------------------------
# GET DATASET SCHEMA
# --------------------------------------------------

@app.get("/datasets/{dataset_id}/schema")
def get_dataset_schema(dataset_id: str):

    dataset = get_dataset_or_404(dataset_id)

    table_name = dataset["table_name"]

    try:

        schema = get_table_schema(table_name)

        return {
            "dataset_id": dataset_id,
            "tables": [
                {
                    "name": table_name,
                    "row_count": schema["row_count"],
                    "column_count": schema["column_count"],
                    "columns": schema["columns"]
                }
            ],
            "relationships": [],
            "verified": True
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to read dataset schema: {str(error)}"
        )


# --------------------------------------------------
# GET DATASET PREVIEW
# --------------------------------------------------

@app.get("/datasets/{dataset_id}/preview")
def get_dataset_preview(
    dataset_id: str,
    table: str = None,
    limit: int = 10
):

    dataset = get_dataset_or_404(dataset_id)

    table_name = table or dataset["table_name"]

    if table_name not in dataset["tables"]:
        raise HTTPException(
            status_code=400,
            detail="The requested table does not belong to this dataset."
        )

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400,
            detail="Preview limit must be between 1 and 100."
        )

    try:

        preview = get_table_preview(
            table_name,
            limit
        )

        return {
            "dataset_id": dataset_id,
            "table_name": table_name,
            "columns": preview["columns"],
            "rows": preview["rows"],
            "total_rows": preview["total_rows"],
            "preview_limit": preview["preview_limit"]
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to load dataset preview: {str(error)}"
        )


# --------------------------------------------------
# LEGACY UPLOAD ENDPOINT
# --------------------------------------------------

@app.post("/upload")
async def legacy_upload_dataset(
    file: UploadFile = File(...),
    table_name: str = Form(...)
):

    return load_dataset(
        file,
        table_name
    )


# --------------------------------------------------
# DATATALK AI - NATURAL LANGUAGE QUERY ENDPOINT
# --------------------------------------------------

@app.post("/queries")
def execute_ai_query(request: QueryRequest):

    # STEP 1: Verify selected dataset

    dataset = get_dataset_or_404(
        request.dataset_id
    )

    table_name = dataset["table_name"]

    # STEP 2: Validate question

    if not request.question.strip():

        raise HTTPException(
            status_code=400,
            detail="Please enter a question."
        )

    # STEP 3: Run DataTalk AI pipeline

    try:

        result = ask_datatalk(
            request.question,
            table_name
        )

        # STEP 4: Handle pipeline errors

        if not result["success"]:

            return {
                "status": "error",
                "message": result["message"],
                "stage": result.get("stage"),
                "sql": result.get("sql"),
                "columns": [],
                "rows": [],
                "row_count": 0
            }

        # STEP 5: Convert DataFrame into JSON

        dataframe = result["data"]

        rows = dataframe.astype(object).where(
            dataframe.notna(),
            None
        ).to_dict(orient="records")

        rows = jsonable_encoder(rows)

        # STEP 6: Return actual query results

        return {
            "status": "success",
            "message": result["message"],
            "answer": result["message"],
            "query_id": str(uuid.uuid4()),
            "dataset_id": request.dataset_id,
            "question": request.question,
            "sql": result["generated_sql"],
            "columns": result["columns"],
            "rows": rows,
            "row_count": result["row_count"],
            "warnings": [],
            "chart": None
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Query execution failed: {str(error)}"
        )

    # --------------------------------------------------
# AI INSIGHTS - DATASET ANALYTICS ENDPOINT
# --------------------------------------------------

@app.post("/analytics/insights")
def generate_dataset_insights(request: InsightsRequest):

    # STEP 1: Verify selected dataset

    dataset = get_dataset_or_404(request.dataset_id)

    table_name = dataset["table_name"]

    try:

        # STEP 2: Read actual dataset from MySQL

        if not re.fullmatch(r"[a-zA-Z0-9_]+", table_name):
            raise HTTPException(
                status_code=400,
                detail="Invalid dataset table name."
            )

        with engine.connect() as connection:

            dataframe = pd.read_sql(
                text(f"SELECT * FROM `{table_name}`"),
                connection
            )

        if dataframe.empty:

            return {
                "success": True,
                "dataset_name": dataset["name"],
                "row_count": 0,
                "findings": [],
                "trend": None,
                "correlations": [],
                "outliers": []
            }

        # STEP 3: Identify numeric and categorical columns

        numeric_columns = dataframe.select_dtypes(
            include=["number"]
        ).columns.tolist()

        categorical_columns = dataframe.select_dtypes(
            include=["object", "category"]
        ).columns.tolist()

        # Try to identify additional numeric columns stored as text.
        # Only convert a column when at least 70% of its non-empty
        # values can safely be interpreted as numbers.

        for column in categorical_columns.copy():

            cleaned = (
                dataframe[column]
                .astype(str)
                .str.replace(r"[$,₹%]", "", regex=True)
                .str.strip()
            )

            converted = pd.to_numeric(
                cleaned,
                errors="coerce"
            )

            non_empty = dataframe[column].notna().sum()

            if non_empty > 0 and converted.notna().sum() / non_empty >= 0.7:

                dataframe[column] = converted
                numeric_columns.append(column)
                categorical_columns.remove(column)

        findings = []

        # STEP 4: Generate dataset summary insights

        findings.append({
            "id": "ins-1",
            "category": "revenue",
            "title": "Dataset Overview",
            "impact": f"{len(dataframe)} Records",
            "confidence": "100% Data Coverage",
            "type": "positive",
            "summary": (
                f"The uploaded dataset contains {len(dataframe)} records "
                f"and {len(dataframe.columns)} columns. "
                f"It contains {len(numeric_columns)} numeric columns "
                f"and {len(categorical_columns)} categorical columns."
            ),
            "recommendation": (
                "Explore the numeric metrics and categorical dimensions "
                "to identify important patterns."
            )
        })

        # STEP 5: Analyze numeric columns

        if numeric_columns:

            metric = numeric_columns[0]

            series = dataframe[metric].dropna()

            if not series.empty:

                total = float(series.sum())
                average = float(series.mean())
                highest = float(series.max())
                lowest = float(series.min())

                findings.append({
                    "id": "ins-2",
                    "category": "revenue",
                    "title": f"{metric} Statistical Summary",
                    "impact": f"Average: {average:.2f}",
                    "confidence": f"{len(series)} Valid Values",
                    "type": "positive",
                    "summary": (
                        f"The total {metric} is {total:.2f}. "
                        f"The average is {average:.2f}, "
                        f"the maximum is {highest:.2f}, "
                        f"and the minimum is {lowest:.2f}."
                    ),
                    "recommendation": (
                        f"Monitor {metric} regularly and investigate "
                        "significant changes in its values."
                    )
                })

        # STEP 6: Analyze categorical columns

        if categorical_columns and numeric_columns:

            category_column = categorical_columns[0]
            metric = numeric_columns[0]

            grouped = (
                dataframe.groupby(category_column)[metric]
                .sum()
                .dropna()
                .sort_values(ascending=False)
            )

            if not grouped.empty:

                best_category = str(grouped.index[0])
                best_value = float(grouped.iloc[0])

                findings.append({
                    "id": "ins-3",
                    "category": "revenue",
                    "title": f"Top Performing {category_column}",
                    "impact": f"{best_value:.2f}",
                    "confidence": f"{len(grouped)} Groups Analyzed",
                    "type": "positive",
                    "summary": (
                        f"{best_category} has the highest total "
                        f"{metric}, with a value of {best_value:.2f}."
                    ),
                    "recommendation": (
                        f"Investigate why {best_category} performs well "
                        "and compare it with other categories."
                    )
                })

        # STEP 7: Generate trend chart data

        trend = None

        if numeric_columns:

            metric = numeric_columns[0]

            date_column = None

            for column in dataframe.columns:

                if column == metric:
                    continue

                converted_dates = pd.to_datetime(
                    dataframe[column],
                    errors="coerce"
                )

                if (
                    converted_dates.notna().sum() >= 2
                    and converted_dates.notna().sum()
                    / max(dataframe[column].notna().sum(), 1) >= 0.7
                ):
                    date_column = column
                    dataframe[column] = converted_dates
                    break

            if date_column:

                trend_data = dataframe[
                    [date_column, metric]
                ].dropna().copy()

                trend_data["Period"] = (
                    trend_data[date_column]
                    .dt.to_period("M")
                    .astype(str)
                )

                grouped_trend = (
                    trend_data.groupby("Period")[metric]
                    .sum()
                    .reset_index()
                    .sort_values("Period")
                )

                if not grouped_trend.empty:

                    trend = {
                        "columns": [
                            "Period",
                            metric
                        ],
                        "rows": grouped_trend.values.tolist(),
                        "chartHint": {
                            "type": "line",
                            "x": "Period",
                            "y": metric,
                            "title": f"{metric} Trend Over Time"
                        }
                    }

            else:

                trend_data = dataframe[metric].dropna().reset_index(drop=True)

                if len(trend_data) >= 2:

                    trend = {
                        "columns": [
                            "Record",
                            metric
                        ],
                        "rows": [
                            [index + 1, float(value)]
                            for index, value in enumerate(trend_data)
                        ],
                        "chartHint": {
                            "type": "line",
                            "x": "Record",
                            "y": metric,
                            "title": f"{metric} Distribution Across Records"
                        }
                    }

        # STEP 8: Calculate Pearson correlations

        correlations = []

        if len(numeric_columns) >= 2:

            correlation_matrix = dataframe[
                numeric_columns
            ].corr(method="pearson")

            for i in range(len(numeric_columns)):

                for j in range(i + 1, len(numeric_columns)):

                    column_a = numeric_columns[i]
                    column_b = numeric_columns[j]

                    score = correlation_matrix.loc[
                        column_a,
                        column_b
                    ]

                    if pd.isna(score):
                        continue

                    if abs(score) >= 0.7:
                        strength = "Strong"
                    elif abs(score) >= 0.4:
                        strength = "Moderate"
                    else:
                        strength = "Weak"

                    direction = (
                        "Positive" if score >= 0
                        else "Negative"
                    )

                    correlations.append({
                        "metricA": column_a,
                        "metricB": column_b,
                        "score": f"{score:+.2f}",
                        "strength": f"{strength} {direction}",
                        "color": (
                            "text-cyan-400 bg-cyan-500/10"
                            if score >= 0
                            else "text-amber-400 bg-amber-500/10"
                        )
                    })

        # STEP 9: Detect statistical outliers using Z-score

        outliers = []

        identifier_column = dataframe.columns[0]

        for metric in numeric_columns:

            series = dataframe[metric]

            mean = series.mean()
            std = series.std()

            if pd.isna(std) or std == 0:
                continue

            z_scores = (series - mean) / std

            unusual_rows = dataframe[
                z_scores.abs() > 3
            ]

            for index, row in unusual_rows.head(20).iterrows():

                z_score = float(z_scores.loc[index])

                outliers.append({
                    "id": str(row[identifier_column]),
                    "metric": metric,
                    "value": f"{float(row[metric]):.2f}",
                    "normalRange": (
                        f"{mean - 2 * std:.2f} - "
                        f"{mean + 2 * std:.2f}"
                    ),
                    "score": f"{abs(z_score):.2f}σ",
                    "status": "Requires Review"
                })

        # STEP 10: Return actual analytics

        return {
            "success": True,
            "dataset_name": dataset["name"],
            "row_count": len(dataframe),
            "numeric_columns": numeric_columns,
            "categorical_columns": categorical_columns,
            "findings": findings,
            "trend": trend,
            "correlations": correlations,
            "outliers": outliers
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Analytics generation failed: {str(error)}"
        )
# --------------------------------------------------
# WHAT-IF SIMULATOR - DATASET SCENARIO ANALYSIS
# --------------------------------------------------

@app.post("/analytics/what-if")
def generate_what_if_analysis(request: WhatIfRequest):

    # STEP 1: Verify selected dataset

    dataset = get_dataset_or_404(request.dataset_id)
    table_name = dataset["table_name"]

    # STEP 2: Validate slider values

    if not -20 <= request.price_change <= 40:
        raise HTTPException(
            status_code=400,
            detail="Price change must be between -20 and 40."
        )

    if not 0 <= request.discount_cap <= 35:
        raise HTTPException(
            status_code=400,
            detail="Discount cap must be between 0 and 35."
        )

    if not 10 <= request.ad_spend <= 100:
        raise HTTPException(
            status_code=400,
            detail="Ad spend must be between 10 and 100."
        )

    if not -8 <= request.churn_delta <= 8:
        raise HTTPException(
            status_code=400,
            detail="Churn delta must be between -8 and 8."
        )

    try:

        # STEP 3: Read actual dataset from MySQL

        if not re.fullmatch(r"[a-zA-Z0-9_]+", table_name):
            raise HTTPException(
                status_code=400,
                detail="Invalid dataset table name."
            )

        with engine.connect() as connection:

            dataframe = pd.read_sql(
                text(f"SELECT * FROM `{table_name}`"),
                connection
            )

        if dataframe.empty:
            raise HTTPException(
                status_code=400,
                detail="The selected dataset contains no records."
            )

        # STEP 4: Identify revenue and order columns

        numeric_columns = dataframe.select_dtypes(
            include=["number"]
        ).columns.tolist()

        revenue_column = None

        preferred_revenue_columns = [
            "sales_amount",
            "revenue",
            "total_sales",
            "amount",
            "total_amount",
            "sales",
            "price"
        ]

        for column in preferred_revenue_columns:

            matching = [
                col for col in dataframe.columns
                if col.lower() == column
            ]

            if matching:
                revenue_column = matching[0]
                break

        # Try converting a text-based revenue column if necessary

        if revenue_column is None:

            for column in dataframe.columns:

                if any(
                    word in column.lower()
                    for word in ["sales", "revenue", "amount"]
                ):

                    cleaned = (
                        dataframe[column]
                        .astype(str)
                        .str.replace(
                            r"[$,₹]",
                            "",
                            regex=True
                        )
                        .str.strip()
                    )

                    converted = pd.to_numeric(
                        cleaned,
                        errors="coerce"
                    )

                    if converted.notna().sum() >= 2:

                        dataframe[column] = converted
                        revenue_column = column
                        numeric_columns.append(column)
                        break

        if revenue_column is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "This simulator requires a numeric revenue, "
                    "sales, or amount column in the dataset."
                )
            )

        # STEP 5: Calculate actual baseline metrics

        revenue_series = pd.to_numeric(
            dataframe[revenue_column],
            errors="coerce"
        ).dropna()

        baseline_revenue = float(revenue_series.sum())

        order_column = next(
            (
                col for col in dataframe.columns
                if col.lower() in [
                    "order_id",
                    "transaction_id",
                    "invoice_id"
                ]
            ),
            None
        )

        if order_column:
            baseline_orders = int(
                dataframe[order_column].nunique()
            )
        else:
            baseline_orders = len(dataframe)

        if baseline_orders <= 0:
            baseline_orders = len(dataframe)

        average_order_value = (
            baseline_revenue / baseline_orders
            if baseline_orders else 0
        )

        # STEP 6: Calculate scenario assumptions

        # Price increase can affect demand.
        # Assumed price elasticity: -1.2

        price_factor = 1 + (request.price_change / 100)

        demand_from_price = (
            1 - (1.2 * request.price_change / 100)
        )

        # Discount cap:
        # Assumed 0.5% demand response per percentage point
        # relative to a reference discount cap of 15%.

        discount_demand = (
            1 + ((request.discount_cap - 15) * 0.005)
        )

        # Marketing budget:
        # Assumed 0.5% demand response per $10k
        # relative to the default $45k budget.

        marketing_demand = (
            1 + ((request.ad_spend - 45) / 10 * 0.005)
        )

        # Retention:
        # A reduction in churn is assumed to increase demand.
        # Assumed 0.8% response per percentage point.

        retention_demand = (
            1 - (request.churn_delta * 0.008)
        )

        # STEP 7: Calculate simulated performance

        demand_factor = (
            demand_from_price
            * discount_demand
            * marketing_demand
            * retention_demand
        )

        demand_factor = max(0, demand_factor)

        simulated_orders = max(
            0,
            round(baseline_orders * demand_factor)
        )

        simulated_revenue = (
            baseline_revenue
            * price_factor
            * demand_factor
        )

        revenue_change = (
            simulated_revenue - baseline_revenue
        )

        revenue_change_pct = (
            (revenue_change / baseline_revenue) * 100
            if baseline_revenue else 0
        )

        orders_change_pct = (
            ((simulated_orders - baseline_orders)
             / baseline_orders) * 100
            if baseline_orders else 0
        )

        simulated_average_order_value = (
            simulated_revenue / simulated_orders
            if simulated_orders else 0
        )

        # STEP 8: Generate six-period scenario trajectory

        chart_columns = [
            "Period",
            "Baseline Revenue",
            "Projected Revenue"
        ]

        chart_rows = []

        for month in range(1, 7):

            baseline_projection = (
                baseline_revenue
                * (1 + (0.02 * month))
            )

            scenario_projection = (
                baseline_projection
                * price_factor
                * demand_factor
            )

            chart_rows.append([
                f"Month {month}",
                round(baseline_projection, 2),
                round(scenario_projection, 2)
            ])

        # STEP 9: Calculate scenario assessment

        if revenue_change_pct > 5:
            risk_level = "Low"
            assessment = "Positive Growth Opportunity"

        elif revenue_change_pct >= 0:
            risk_level = "Moderate"
            assessment = "Stable Scenario"

        elif revenue_change_pct >= -5:
            risk_level = "Moderate"
            assessment = "Minor Revenue Decline"

        else:
            risk_level = "High"
            assessment = "High Revenue Risk"

        # STEP 10: Return actual and simulated metrics

        return {
            "success": True,

            "dataset_name": dataset["name"],

            "baseline": {
                "revenue": round(baseline_revenue, 2),
                "orders": baseline_orders,
                "average_order_value": round(
                    average_order_value, 2
                )
            },

            "simulation": {
                "revenue": round(simulated_revenue, 2),
                "orders": simulated_orders,
                "average_order_value": round(
                    simulated_average_order_value, 2
                ),
                "revenue_change": round(revenue_change, 2),
                "revenue_change_pct": round(
                    revenue_change_pct, 2
                ),
                "orders_change_pct": round(
                    orders_change_pct, 2
                )
            },

            "scenario": {
                "price_change": request.price_change,
                "discount_cap": request.discount_cap,
                "ad_spend": request.ad_spend,
                "churn_delta": request.churn_delta
            },

            "chart": {
                "columns": chart_columns,
                "rows": chart_rows,
                "chartHint": {
                    "type": "line",
                    "x": "Period",
                    "y": "Projected Revenue",
                    "title": "Baseline vs Projected Revenue"
                }
            },

            "assessment": {
                "risk_level": risk_level,
                "summary": assessment
            },

            "assumptions": [
                "Price elasticity is assumed to be -1.2.",
                "Discount demand response is assumed to be 0.5% per percentage point.",
                "Marketing demand response is assumed to be 0.5% per $10k budget change.",
                "Retention response is assumed to be 0.8% per churn percentage point.",
                "Marketing spend and churn are scenario assumptions, not measured dataset values.",
                "Revenue and order baselines are calculated from the uploaded dataset."
            ],

            "unsupported_metrics": [
                "Profit margin",
                "Customer lifetime value"
            ]
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"What-If analysis failed: {str(error)}"
        )
# --------------------------------------------------
# PREDICTIVE ANALYTICS - MACHINE LEARNING ENDPOINT
# --------------------------------------------------

@app.post("/analytics/predict")
def train_predictive_model(request: PredictiveRequest):

    # STEP 1: Verify dataset

    dataset = get_dataset_or_404(request.dataset_id)
    table_name = dataset["table_name"]

    # STEP 2: Validate model

    allowed_models = [
        "xgboost",
        "randomforest",
        "arima",
        "elasticnet"
    ]

    if request.model not in allowed_models:
        raise HTTPException(
            status_code=400,
            detail="Unsupported prediction model."
        )

    try:

        # STEP 3: Load actual MySQL dataset

        if not re.fullmatch(r"[a-zA-Z0-9_]+", table_name):
            raise HTTPException(
                status_code=400,
                detail="Invalid dataset table name."
            )

        with engine.connect() as connection:
            dataframe = pd.read_sql(
                text(f"SELECT * FROM `{table_name}`"),
                connection
            )

        if len(dataframe) < 6:
            raise HTTPException(
                status_code=400,
                detail="At least 6 records are required for model training."
            )

        # STEP 4: Identify prediction target

        target_candidates = [
            "sales_amount",
            "revenue",
            "total_sales",
            "amount",
            "total_amount",
            "sales",
            "price"
        ]

        target_column = next(
            (
                column for candidate in target_candidates
                for column in dataframe.columns
                if column.lower() == candidate
            ),
            None
        )

        if target_column is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "No supported prediction target found. "
                    "Add a sales, revenue, amount, or price column."
                )
            )

        # Convert target to numeric if necessary

        cleaned_target = (
            dataframe[target_column]
            .astype(str)
            .str.replace(r"[$,₹]", "", regex=True)
            .str.strip()
        )

        dataframe[target_column] = pd.to_numeric(
            cleaned_target,
            errors="coerce"
        )

        dataframe = dataframe.dropna(
            subset=[target_column]
        ).reset_index(drop=True)

        if len(dataframe) < 6:
            raise HTTPException(
                status_code=400,
                detail="Not enough valid numeric target values."
            )

        # STEP 5: Prepare selected features

        selected_features = [
            feature for feature in request.features
            if feature in dataframe.columns
            and feature != target_column
        ]

        if not selected_features:
            selected_features = [
                column for column in dataframe.columns
                if column != target_column
                and not column.lower().endswith("_id")
            ]

        if not selected_features:
            raise HTTPException(
                status_code=400,
                detail="No usable prediction features were selected."
            )

        X = dataframe[selected_features].copy()
        y = dataframe[target_column].copy()

        # Remove columns that contain no useful information

        X = X.dropna(axis=1, how="all")

        selected_features = X.columns.tolist()

        if X.empty or not selected_features:
            raise HTTPException(
                status_code=400,
                detail="Selected features contain no usable data."
            )

        # STEP 6: Separate numerical and categorical features

        numeric_features = X.select_dtypes(
            include=["number"]
        ).columns.tolist()

        categorical_features = [
            column for column in X.columns
            if column not in numeric_features
        ]

        numeric_pipeline = Pipeline([
            (
                "imputer",
                SimpleImputer(strategy="median")
            )
        ])

        categorical_pipeline = Pipeline([
            (
                "imputer",
                SimpleImputer(strategy="most_frequent")
            ),
            (
                "encoder",
                OneHotEncoder(handle_unknown="ignore")
            )
        ])

        transformers = []

        if numeric_features:
            transformers.append((
                "numeric",
                numeric_pipeline,
                numeric_features
            ))

        if categorical_features:
            transformers.append((
                "categorical",
                categorical_pipeline,
                categorical_features
            ))

        preprocessor = ColumnTransformer(
            transformers=transformers
        )

        # STEP 7: Train/test split

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.25,
            random_state=42
        )

        training_started = datetime.now(timezone.utc)

        # STEP 8: Select and train model

        if request.model == "xgboost":

            model = XGBRegressor(
                n_estimators=100,
                max_depth=3,
                learning_rate=0.05,
                objective="reg:squarederror",
                random_state=42,
                n_jobs=1
            )

        elif request.model == "randomforest":

            model = RandomForestRegressor(
                n_estimators=100,
                max_depth=5,
                random_state=42,
                n_jobs=1
            )

        elif request.model == "elasticnet":

            model = ElasticNet(
                alpha=0.1,
                l1_ratio=0.5,
                max_iter=10000
            )

        else:
            model = None

        # STEP 9: ARIMA time-series model

        if request.model == "arima":

            date_column = next(
                (
                    column for column in dataframe.columns
                    if column.lower() in [
                        "order_date",
                        "date",
                        "timestamp",
                        "created_at"
                    ]
                ),
                None
            )

            if date_column is None:
                raise HTTPException(
                    status_code=400,
                    detail="ARIMA requires a date or timestamp column."
                )

            time_data = dataframe[
                [date_column, target_column]
            ].copy()

            time_data[date_column] = pd.to_datetime(
                time_data[date_column],
                errors="coerce"
            )

            time_data = (
                time_data.dropna()
                .sort_values(date_column)
            )

            time_series = time_data[target_column].reset_index(
                drop=True
            )

            if len(time_series) < 6:
                raise HTTPException(
                    status_code=400,
                    detail="ARIMA requires at least 6 valid dated records."
                )

            split_index = max(
                3,
                int(len(time_series) * 0.75)
            )

            train_series = time_series.iloc[:split_index]
            test_series = time_series.iloc[split_index:]

            if len(test_series) < 2:
                raise HTTPException(
                    status_code=400,
                    detail="Not enough holdout records for ARIMA evaluation."
                )

            arima_model = ARIMA(
                train_series,
                order=(1, 1, 0)
            )

            fitted_model = arima_model.fit()

            predictions = fitted_model.forecast(
                steps=len(test_series)
            )

            actual_values = test_series.to_numpy()
            predicted_values = np.asarray(predictions)

        else:

            # Train preprocessing only on training records

            X_train_processed = preprocessor.fit_transform(
                X_train
            )

            X_test_processed = preprocessor.transform(
                X_test
            )

            model.fit(
                X_train_processed,
                y_train
            )

            predictions = model.predict(
                X_test_processed
            )

            actual_values = y_test.to_numpy()
            predicted_values = np.asarray(predictions)

        # STEP 10: Calculate genuine evaluation metrics

        r2 = (
            float(r2_score(actual_values, predicted_values))
            if len(actual_values) >= 2
            else None
        )

        rmse = float(
            np.sqrt(
                mean_squared_error(
                    actual_values,
                    predicted_values
                )
            )
        )

        mae = float(
            mean_absolute_error(
                actual_values,
                predicted_values
            )
        )

        training_time = (
            datetime.now(timezone.utc) - training_started
        ).total_seconds() * 1000

        # STEP 11: Generate feature importance

        feature_importance = []

        if request.model != "arima":

            transformed_names = preprocessor.get_feature_names_out()

            if hasattr(model, "feature_importances_"):
                importance_values = model.feature_importances_

            elif hasattr(model, "coef_"):
                importance_values = np.abs(model.coef_)

            else:
                importance_values = np.zeros(
                    len(transformed_names)
                )

            total_importance = float(
                np.sum(importance_values)
            )

            for name, value in zip(
                transformed_names,
                importance_values
            ):

                percentage = (
                    float(value) / total_importance * 100
                    if total_importance > 0
                    else 0
                )

                feature_importance.append({
                    "name": str(name),
                    "weight": round(percentage, 2)
                })

            feature_importance.sort(
                key=lambda item: item["weight"],
                reverse=True
            )

        # STEP 12: Prepare prediction results

        identifier_column = next(
            (
                column for column in dataframe.columns
                if column.lower() in [
                    "order_id",
                    "transaction_id",
                    "invoice_id",
                    "id"
                ]
            ),
            None
        )

        prediction_rows = []

        residuals = actual_values - predicted_values

        confidence_bound = float(
            np.std(residuals)
        )

        for index, (actual, predicted) in enumerate(
            zip(actual_values, predicted_values)
        ):

            actual = float(actual)
            predicted = float(predicted)

            error = abs(actual - predicted)

            error_percentage = (
                error / abs(actual) * 100
                if actual != 0
                else None
            )

            if request.model == "arima":
                record_id = f"FORECAST-{index + 1:03d}"
            else:
                original_index = X_test.index[index]

                record_id = (
                    str(dataframe.loc[original_index, identifier_column])
                    if identifier_column
                    else f"RECORD-{original_index + 1}"
                )

            prediction_rows.append({
                "id": record_id,
                "actual": round(actual, 2),
                "predicted": round(predicted, 2),
                "difference": round(predicted - actual, 2),
                "absolute_error": round(error, 2),
                "error_percentage": (
                    round(error_percentage, 2)
                    if error_percentage is not None
                    else None
                ),
                "confidence_bound": round(
                    confidence_bound, 2
                )
            })

        # STEP 13: Prepare chart data

        chart_rows = [
            [
                f"#{index + 1:02d}",
                round(float(actual), 2),
                round(float(predicted), 2)
            ]
            for index, (actual, predicted) in enumerate(
                zip(actual_values, predicted_values)
            )
        ]

        # STEP 14: Return actual model results

        return {
            "success": True,
            "dataset_name": dataset["name"],
            "model": request.model,
            "target": target_column,
            "features": selected_features,
            "training_records": len(y_train) if request.model != "arima" else len(train_series),
            "testing_records": len(actual_values),
            "metrics": {
                "r2": round(r2, 4) if r2 is not None else None,
                "rmse": round(rmse, 4),
                "mae": round(mae, 4),
                "training_time_ms": round(training_time, 2)
            },
            "feature_importance": feature_importance,
            "predictions": prediction_rows,
            "chart": {
                "columns": [
                    "Sample Index",
                    "Actual",
                    "Predicted"
                ],
                "rows": chart_rows,
                "chartHint": {
                    "type": "line",
                    "x": "Sample Index",
                    "y": "Predicted",
                    "title": "Actual vs Predicted Values"
                }
            },
            "message": "Model trained and evaluated successfully."
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Predictive model training failed: {str(error)}"
        )
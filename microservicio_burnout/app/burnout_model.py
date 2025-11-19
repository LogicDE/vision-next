"""
Modelo de predicción de burnout basado en Gradient Boosting
Implementado basándose en el notebook P P2 601270.ipynb
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
import os
from typing import Dict, Any, Tuple

class BurnoutPredictor:
    def __init__(self, data_path: str = "data/"):
        self.data_path = data_path
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.metrics = {}
        
    def load_and_preprocess_data(self) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Carga y preprocesa los datos de burnout
        """
        # Cargar datos de burnout
        burnout_df = pd.read_csv(os.path.join(self.data_path, "burnout.csv"))
        stress_df = pd.read_csv(os.path.join(self.data_path, "stress.csv"))
        summary_df = pd.read_csv(os.path.join(self.data_path, "summary.csv"))
        
        # Combinar datos
        combined_df = pd.concat([
            burnout_df[['time_to_recover', 'burnout_risk_score', 'high_stress_prevalence_perc', 
                       'median_hrv', 'avg_pulse', 'sleep_score']],
            stress_df[['media_hrv', 'eda_peaks', 'time_to_recover_hrv', 'weekly_hours_in_meetings', 
                      'time_on_focus_blocks']],
            summary_df[['absenteesim_days', 'high_stress_prevalence', 'nps_score', 'intervention_acceptance_rate']]
        ], axis=1)
        
        # Crear variable objetivo binaria (burnout: 1 si burnout_risk_score > 0.5, 0 en caso contrario)
        combined_df['burnout'] = (combined_df['burnout_risk_score'] > 0.5).astype(int)
        
        # Seleccionar características para el modelo
        feature_columns = [
            'time_to_recover', 'high_stress_prevalence_perc', 'median_hrv', 'avg_pulse', 'sleep_score',
            'media_hrv', 'eda_peaks', 'time_to_recover_hrv', 'weekly_hours_in_meetings', 
            'time_on_focus_blocks', 'absenteesim_days', 'high_stress_prevalence', 'nps_score', 
            'intervention_acceptance_rate'
        ]
        
        self.feature_columns = feature_columns
        X = combined_df[feature_columns]
        y = combined_df['burnout']
        
        return X, y
    
    def train_model(self) -> Dict[str, Any]:
        """
        Entrena el modelo de Gradient Boosting basado en el notebook
        """
        # Cargar y preprocesar datos
        X, y = self.load_and_preprocess_data()
        
        # Normalizar características
        X_scaled = self.scaler.fit_transform(X)
        
        # Crear modelo de Gradient Boosting (mejor modelo según el notebook)
        self.model = GradientBoostingClassifier(
            n_estimators=100, 
            learning_rate=0.1, 
            max_depth=5, 
            random_state=42
        )
        
        # Configurar validación cruzada
        kfold = KFold(n_splits=10, shuffle=True, random_state=42)
        
        # Evaluar con validación cruzada
        cv_scores = cross_val_score(self.model, X_scaled, y, cv=kfold, scoring='accuracy')
        
        # Dividir datos para evaluación final
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
        
        # Normalizar conjuntos de entrenamiento y prueba
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Entrenar modelo
        self.model.fit(X_train_scaled, y_train)
        
        # Hacer predicciones
        y_pred = self.model.predict(X_test_scaled)
        y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
        
        # Calcular métricas
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        self.metrics = {
            'cv_accuracy_mean': cv_scores.mean(),
            'cv_accuracy_std': cv_scores.std(),
            'test_accuracy': accuracy,
            'test_precision': precision,
            'test_recall': recall,
            'test_f1': f1,
            'cv_scores': cv_scores.tolist()
        }
        
        return self.metrics
    
    def predict_burnout(self, user_data: Dict[str, float]) -> Dict[str, Any]:
        """
        Predice la probabilidad de burnout para un usuario
        """
        if self.model is None:
            raise ValueError("Modelo no entrenado. Llama a train_model() primero.")
        
        # Convertir datos del usuario a DataFrame
        user_df = pd.DataFrame([user_data])
        
        # Asegurar que todas las columnas necesarias estén presentes
        for col in self.feature_columns:
            if col not in user_df.columns:
                user_df[col] = 0.0  # Valor por defecto
        
        # Reordenar columnas según el orden de entrenamiento
        user_df = user_df[self.feature_columns]
        
        # Normalizar datos
        user_scaled = self.scaler.transform(user_df)
        
        # Hacer predicción
        prediction = self.model.predict(user_scaled)[0]
        probability = self.model.predict_proba(user_scaled)[0][1]
        
        return {
            'burnout_prediction': int(prediction),
            'burnout_probability': float(probability),
            'model_used': 'GradientBoostingClassifier'
        }
    
    def save_model(self, model_path: str = "models/burnout_model.pkl"):
        """
        Guarda el modelo entrenado
        """
        if self.model is None:
            raise ValueError("Modelo no entrenado.")
        
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'metrics': self.metrics
        }
        
        joblib.dump(model_data, model_path)
        print(f"Modelo guardado en: {model_path}")
    
    def load_model(self, model_path: str = "models/burnout_model.pkl"):
        """
        Carga un modelo previamente entrenado
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Modelo no encontrado en: {model_path}")
        
        model_data = joblib.load(model_path)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_columns = model_data['feature_columns']
        self.metrics = model_data.get('metrics', {})
        
        print(f"Modelo cargado desde: {model_path}")
    
    def get_model_metrics(self) -> Dict[str, Any]:
        """
        Retorna las métricas del modelo
        """
        return self.metrics

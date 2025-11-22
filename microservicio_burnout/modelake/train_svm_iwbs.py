"""
Script para entrenar un modelo SVM de clasificación multiclase
para predecir la variable objetivo IWBS.

Autor: Generado automáticamente
Fecha: 2024
"""

import pandas as pd
import numpy as np
import pickle
import sys
from pathlib import Path

# Librerías de scikit-learn
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    classification_report,
    ConfusionMatrixDisplay
)

# Configuración de warnings
import warnings
warnings.filterwarnings('ignore')


def load_data(filepath):
    """
    Carga el archivo CSV desde la ruta especificada.
    
    Args:
        filepath (str): Ruta al archivo CSV
        
    Returns:
        pandas.DataFrame: DataFrame con los datos cargados
        
    Raises:
        FileNotFoundError: Si el archivo no existe
    """
    try:
        df = pd.read_csv(filepath)
        print(f"✓ Archivo cargado exitosamente: {filepath}")
        print(f"✓ Dimensiones del dataset: {df.shape[0]} filas, {df.shape[1]} columnas")
        return df
    except FileNotFoundError:
        print(f"✗ Error: No se encontró el archivo {filepath}")
        print("✗ Por favor, verifica que el archivo exista en la ruta especificada.")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Error al cargar el archivo: {str(e)}")
        sys.exit(1)


def prepare_features_target(df):
    """
    Separa las features (todas las columnas excepto IWBS) y el target (columna IWBS).
    
    Args:
        df (pandas.DataFrame): DataFrame con los datos
        
    Returns:
        tuple: (X, y) donde X son las features e y es el target
        
    Raises:
        KeyError: Si la columna IWBS no existe
    """
    try:
        # Verificar que la columna IWBS existe
        if 'IWBS' not in df.columns:
            raise KeyError("La columna 'IWBS' no se encuentra en el dataset")
        
        # Separar features (todas las columnas excepto IWBS)
        X = df.drop(columns=['IWBS'])
        
        # Separar target (columna IWBS)
        y = df['IWBS']
        
        print(f"\n✓ Features preparadas: {X.shape[1]} características")
        print(f"✓ Target preparado: {y.shape[0]} muestras")
        print(f"✓ Clases en IWBS: {sorted(y.unique())}")
        print(f"✓ Distribución de clases:\n{y.value_counts().sort_index()}")
        
        return X, y
    except KeyError as e:
        print(f"✗ Error: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Error al preparar features y target: {str(e)}")
        sys.exit(1)


def split_data(X, y, test_size=0.2, random_state=42):
    """
    Divide los datos en conjuntos de entrenamiento y prueba.
    
    Args:
        X (pandas.DataFrame o numpy.ndarray): Features
        y (pandas.Series o numpy.ndarray): Target
        test_size (float): Proporción del conjunto de prueba (default: 0.2)
        random_state (int): Semilla para reproducibilidad (default: 42)
        
    Returns:
        tuple: (X_train, X_test, y_train, y_test)
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    print(f"\n✓ División de datos completada:")
    print(f"  - Conjunto de entrenamiento: {X_train.shape[0]} muestras ({100*(1-test_size):.0f}%)")
    print(f"  - Conjunto de prueba: {X_test.shape[0]} muestras ({100*test_size:.0f}%)")
    print(f"  - random_state: {random_state}")
    
    return X_train, X_test, y_train, y_test


def normalize_data(X_train, X_test):
    """
    Normaliza los datos utilizando StandardScaler.
    
    Args:
        X_train: Features de entrenamiento
        X_test: Features de prueba
        
    Returns:
        tuple: (X_train_scaled, X_test_scaled, scaler)
    """
    scaler = StandardScaler()
    
    # Ajustar el scaler solo con datos de entrenamiento
    X_train_scaled = scaler.fit_transform(X_train)
    
    # Transformar datos de prueba usando el mismo scaler
    X_test_scaled = scaler.transform(X_test)
    
    print(f"\n✓ Normalización completada usando StandardScaler")
    print(f"  - Media de X_train (después de normalizar): {X_train_scaled.mean():.6f}")
    print(f"  - Desviación estándar de X_train (después de normalizar): {X_train_scaled.std():.6f}")
    
    return X_train_scaled, X_test_scaled, scaler


def train_svm_with_gridsearch(X_train, y_train):
    """
    Entrena un modelo SVM con búsqueda de hiperparámetros usando GridSearchCV.
    
    Args:
        X_train: Features de entrenamiento normalizadas
        y_train: Target de entrenamiento
        
    Returns:
        sklearn.model_selection.GridSearchCV: Modelo entrenado con mejor configuración
    """
    print("\n" + "="*60)
    print("INICIANDO BÚSQUEDA DE HIPERPARÁMETROS CON GRIDSEARCHCV")
    print("="*60)
    
    # Definir el modelo base SVM para clasificación multiclase
    svm_model = SVC(random_state=42)
    
    # Definir la grilla de hiperparámetros a buscar
    param_grid = {
        'C': [0.1, 1, 10],
        'kernel': ['rbf', 'linear'],
        'gamma': ['scale', 'auto']
    }
    
    print(f"\nParámetros a evaluar:")
    print(f"  - C: {param_grid['C']}")
    print(f"  - kernel: {param_grid['kernel']}")
    print(f"  - gamma: {param_grid['gamma']}")
    print(f"  - Total de combinaciones: {len(param_grid['C']) * len(param_grid['kernel']) * len(param_grid['gamma'])}")
    
    # Configurar GridSearchCV con validación cruzada de 5 folds
    grid_search = GridSearchCV(
        estimator=svm_model,
        param_grid=param_grid,
        cv=5,  # 5-fold cross-validation
        scoring='accuracy',
        n_jobs=-1,  # Usar todos los cores disponibles
        verbose=1
    )
    
    # Realizar la búsqueda de hiperparámetros
    print("\n⏳ Entrenando modelo con GridSearchCV...")
    grid_search.fit(X_train, y_train)
    
    print("\n" + "="*60)
    print("BÚSQUEDA DE HIPERPARÁMETROS COMPLETADA")
    print("="*60)
    print(f"\n✓ Mejor puntuación de validación cruzada: {grid_search.best_score_:.4f}")
    print(f"\n✓ Mejores hiperparámetros encontrados:")
    for param, value in grid_search.best_params_.items():
        print(f"  - {param}: {value}")
    
    return grid_search


def evaluate_model(model, X_test, y_test):
    """
    Evalúa el modelo con métricas completas.
    
    Args:
        model: Modelo entrenado
        X_test: Features de prueba
        y_test: Target de prueba
    """
    print("\n" + "="*60)
    print("EVALUACIÓN DEL MODELO")
    print("="*60)
    
    # Realizar predicciones
    y_pred = model.predict(X_test)
    
    # Calcular accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n✓ Accuracy (Precisión): {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    # Matriz de confusión
    print("\n✓ Matriz de confusión:")
    cm = confusion_matrix(y_test, y_pred)
    
    # Obtener las clases únicas ordenadas
    classes = sorted(np.unique(np.concatenate([y_test, y_pred])))
    
    # Crear un DataFrame para mejor visualización
    cm_df = pd.DataFrame(cm, index=classes, columns=classes)
    print("\n", cm_df)
    print("\nNota: Las filas representan las clases reales, las columnas las predicciones")
    
    # Classification report
    print("\n✓ Classification Report:")
    print("\n", classification_report(y_test, y_pred))
    
    return accuracy, cm, y_pred


def save_model(model, scaler, filepath='svm_iwbs_model.pkl'):
    """
    Guarda el modelo entrenado y el scaler en un archivo pickle.
    
    Args:
        model: Modelo entrenado
        scaler: Scaler utilizado para normalizar los datos
        filepath (str): Ruta donde guardar el modelo
    """
    try:
        # Guardar tanto el modelo como el scaler para poder predecir en el futuro
        model_data = {
            'model': model,
            'scaler': scaler
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"\n✓ Modelo guardado exitosamente en: {filepath}")
        print(f"  - Modelo: {type(model.best_estimator_).__name__}")
        print(f"  - Scaler: {type(scaler).__name__}")
    except Exception as e:
        print(f"\n✗ Error al guardar el modelo: {str(e)}")
        sys.exit(1)


def main():
    """
    Función principal que ejecuta el pipeline completo de entrenamiento.
    """
    print("="*60)
    print("ENTRENAMIENTO DE MODELO SVM PARA CLASIFICACIÓN IWBS")
    print("="*60)
    
    # 1. Cargar los datos
    print("\n[1/8] Cargando datos...")
    filepath = Path(__file__).parent / 'model_data.csv'
    df = load_data(filepath)
    
    # 2. Preparar features y target
    print("\n[2/8] Preparando features y target...")
    X, y = prepare_features_target(df)
    
    # 3. Dividir datos en entrenamiento y prueba
    print("\n[3/8] Dividiendo datos en entrenamiento y prueba...")
    X_train, X_test, y_train, y_test = split_data(X, y, test_size=0.2, random_state=42)
    
    # 4. Normalizar datos
    print("\n[4/8] Normalizando datos...")
    X_train_scaled, X_test_scaled, scaler = normalize_data(X_train, X_test)
    
    # 5. Entrenar modelo SVM con búsqueda de hiperparámetros
    print("\n[5/8] Entrenando modelo SVM con GridSearchCV...")
    grid_search = train_svm_with_gridsearch(X_train_scaled, y_train)
    
    # 6. Evaluar el modelo
    print("\n[6/8] Evaluando modelo...")
    accuracy, cm, y_pred = evaluate_model(grid_search, X_test_scaled, y_test)
    
    # 7. Guardar modelo
    print("\n[7/8] Guardando modelo...")
    model_filepath = Path(__file__).parent / 'svm_iwbs_model.pkl'
    save_model(grid_search, scaler, model_filepath)
    
    # 8. Resumen final
    print("\n" + "="*60)
    print("RESUMEN FINAL")
    print("="*60)
    print(f"✓ Proceso completado exitosamente")
    print(f"✓ Mejor accuracy en validación cruzada: {grid_search.best_score_:.4f}")
    print(f"✓ Accuracy en conjunto de prueba: {accuracy:.4f}")
    print(f"✓ Modelo guardado en: {model_filepath}")
    print("="*60)


if __name__ == "__main__":
    main()


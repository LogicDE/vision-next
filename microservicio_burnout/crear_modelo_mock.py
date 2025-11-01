"""
Crea un modelo mock (simulado) para testing

Este script genera un modelo simplificado que permite probar
el microservicio sin necesidad de datos de entrenamiento reales.
"""

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler

def create_mock_model():
    """Crea un modelo mock basado en reglas simples"""
    
    print("="*70)
    print("  CREANDO MODELO MOCK PARA TESTING")
    print("="*70)
    
    # Características que espera el modelo
    feature_columns = [
        'time_to_recover', 'high_stress_prevalence_perc', 'median_hrv', 
        'avg_pulse', 'sleep_score', 'media_hrv', 'eda_peaks', 
        'time_to_recover_hrv', 'weekly_hours_in_meetings', 
        'time_on_focus_blocks', 'absenteesim_days', 'high_stress_prevalence', 
        'nps_score', 'intervention_acceptance_rate'
    ]
    
    # Crear datos sintéticos para entrenamiento rápido
    np.random.seed(42)
    n_samples = 100
    
    # Generar características sintéticas
    X_train = np.random.rand(n_samples, len(feature_columns))
    
    # Generar etiquetas basadas en reglas simples
    # Alta probabilidad de burnout si:
    # - Alto estrés (feature 1)
    # - Baja calidad de sueño (feature 4)
    # - Muchas reuniones (feature 8)
    y_train = ((X_train[:, 1] > 0.6) | 
               (X_train[:, 4] < 0.4) | 
               (X_train[:, 8] > 0.7)).astype(int)
    
    print("\n📊 Datos sintéticos generados:")
    print(f"   Muestras: {n_samples}")
    print(f"   Características: {len(feature_columns)}")
    print(f"   Casos de burnout: {y_train.sum()}/{n_samples}")
    
    # Crear y entrenar scaler
    print("\n⚙️  Creando StandardScaler...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train)
    
    # Crear y entrenar modelo
    print("⚙️  Entrenando GradientBoostingClassifier...")
    model = GradientBoostingClassifier(
        n_estimators=50,
        learning_rate=0.1,
        max_depth=3,
        random_state=42
    )
    model.fit(X_scaled, y_train)
    
    # Calcular métricas básicas
    train_score = model.score(X_scaled, y_train)
    
    print(f"\n✅ Modelo entrenado")
    print(f"   Accuracy en entrenamiento: {train_score:.4f}")
    
    # Crear estructura del modelo
    model_data = {
        'model': model,
        'scaler': scaler,
        'feature_columns': feature_columns,
        'metrics': {
            'cv_accuracy_mean': 0.85,
            'cv_accuracy_std': 0.05,
            'test_accuracy': train_score,
            'test_precision': 0.83,
            'test_recall': 0.81,
            'test_f1': 0.82,
            'note': 'Modelo mock para testing - No usar en producción'
        }
    }
    
    # Guardar modelo
    print("\n💾 Guardando modelo en models/burnout_model.pkl...")
    joblib.dump(model_data, 'models/burnout_model.pkl')
    
    import os
    file_size = os.path.getsize('models/burnout_model.pkl')
    print(f"✅ Modelo guardado ({file_size} bytes)")
    
    # Probar el modelo
    print("\n🧪 Probando el modelo...")
    test_data = {
        'time_to_recover': 40.0,
        'high_stress_prevalence_perc': 30.0,
        'median_hrv': 35.0,
        'avg_pulse': 80.0,
        'sleep_score': 60.0,
        'media_hrv': 35.0,
        'eda_peaks': 18.0,
        'time_to_recover_hrv': 40.0,
        'weekly_hours_in_meetings': 28.0,
        'time_on_focus_blocks': 3.0,
        'absenteesim_days': 1.5,
        'high_stress_prevalence': 0.30,
        'nps_score': 6.5,
        'intervention_acceptance_rate': 0.45
    }
    
    from app.burnout_model import BurnoutPredictor
    predictor = BurnoutPredictor()
    predictor.load_model('models/burnout_model.pkl')
    
    result = predictor.predict_burnout(test_data)
    
    print(f"   Predicción: {result['burnout_prediction']}")
    print(f"   Probabilidad: {result['burnout_probability']:.4f}")
    print(f"   Modelo: {result['model_used']}")
    
    print("\n" + "="*70)
    print("✅ MODELO MOCK CREADO EXITOSAMENTE")
    print("="*70)
    print("\n⚠️  IMPORTANTE:")
    print("   Este es un modelo simplificado para testing.")
    print("   Para producción, entrena con datos reales usando entrenar_modelo.py")
    print("\n🚀 Ahora puedes iniciar el servicio y todos los tests funcionarán.")
    print("   python verificar_funcionalidad.py")
    print()

if __name__ == "__main__":
    try:
        create_mock_model()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)

